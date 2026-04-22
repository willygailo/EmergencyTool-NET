import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { hazardApi } from './hazardApi';

interface Hazard {
  id: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  votes: number;
  verified: boolean;
  createdAt: string;
}

export const HazardMapScreen = ({ navigation }: any) => {
  const { location } = useLocation();
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHazards();
  }, []);

  const loadHazards = async () => {
    setLoading(true);
    try {
      const data = await hazardApi.getHazards(location?.latitude, location?.longitude, 10);
      setHazards(data);
    } catch {
      setHazards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (hazardId: string) => {
    try {
      await hazardApi.voteHazard(hazardId);
      Alert.alert('Thank you!', 'Your vote has been recorded.');
      loadHazards();
    } catch {
      Alert.alert('Error', 'Failed to vote');
    }
  };

  const openInMaps = (hazard: Hazard) => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${hazard.latitude},${hazard.longitude}`
    );
  };

  const getHazardIcon = (type: string) => {
    const icons: Record<string, string> = {
      flood: '🌊',
      fire: '🔥',
      landslide: '⛰️',
      road_damage: '🛣️',
      downed_power: '⚡',
      other: '⚠️',
    };
    return icons[type] || '⚠️';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hazard Map (Web)</Text>
        <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('HazardReport')}>
          <Text style={styles.reportButtonText}>+ Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.webNotice}>
        <Text style={styles.webNoticeText}>
          In-browser mode shows a list view. Tap "Open Map" to view exact coordinates.
        </Text>
      </View>

      <FlatList
        data={hazards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{loading ? 'Loading hazards...' : 'No hazards found'}</Text>
            <Text style={styles.emptySubtitle}>Try refreshing or reporting a new hazard.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.hazardCard} onPress={() => setSelectedHazard(item)}>
            <View style={styles.cardHeader}>
              <Text style={styles.hazardIcon}>{getHazardIcon(item.type)}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.hazardType}>{item.type.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.hazardVotes}>{item.votes} votes {item.verified ? '• Verified' : ''}</Text>
              </View>
            </View>
            <Text style={styles.hazardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
      />

      {selectedHazard && (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>{selectedHazard.type.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.detailDesc}>{selectedHazard.description}</Text>
          <Text style={styles.detailCoords}>
            {selectedHazard.latitude.toFixed(6)}, {selectedHazard.longitude.toFixed(6)}
          </Text>

          <View style={styles.detailActions}>
            <TouchableOpacity style={styles.mapButton} onPress={() => openInMaps(selectedHazard)}>
              <Text style={styles.mapButtonText}>Open Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.voteButton} onPress={() => handleVote(selectedHazard.id)}>
              <Text style={styles.voteButtonText}>Vote</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedHazard(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  reportButton: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  reportButtonText: { color: '#fff', fontWeight: '600' },
  webNotice: {
    margin: 16,
    marginTop: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 12,
  },
  webNoticeText: { color: '#1e3a8a', fontSize: 13 },
  listContent: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  emptyState: { backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  emptySubtitle: { marginTop: 6, color: '#64748b', textAlign: 'center' },
  hazardCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  hazardIcon: { fontSize: 24, marginRight: 10 },
  cardMeta: { flex: 1 },
  hazardType: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  hazardVotes: { marginTop: 2, fontSize: 12, color: '#22c55e' },
  hazardDescription: { marginTop: 8, color: '#475569', fontSize: 13 },
  detailCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailTitle: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  detailDesc: { marginTop: 6, fontSize: 13, color: '#475569' },
  detailCoords: { marginTop: 6, fontSize: 12, color: '#64748b' },
  detailActions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  mapButton: { flex: 1, backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center' },
  mapButtonText: { color: '#fff', fontWeight: '600' },
  voteButton: { flex: 1, backgroundColor: '#16a34a', padding: 10, borderRadius: 8, alignItems: 'center' },
  voteButtonText: { color: '#fff', fontWeight: '600' },
  closeButton: { flex: 1, backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, alignItems: 'center' },
  closeButtonText: { color: '#1f2937', fontWeight: '600' },
});

export default HazardMapScreen;
