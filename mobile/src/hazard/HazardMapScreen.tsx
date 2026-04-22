import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { hazardApi } from './hazardApi';

interface Hazard {
  id: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
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
      const data = await hazardApi.getHazards(
        location?.latitude,
        location?.longitude,
        10
      );
      setHazards(data);
    } catch (error) {
      console.log('Failed to load hazards');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (hazardId: string) => {
    try {
      await hazardApi.voteHazard(hazardId);
      Alert.alert('Thank you!', 'Your vote has been recorded.');
      loadHazards();
    } catch (error) {
      Alert.alert('Error', 'Failed to vote');
    }
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
        <Text style={styles.title}>Hazard Map</Text>
        <TouchableOpacity style={styles.reportButton} onPress={() => navigation.navigate('HazardReport')}>
          <Text style={styles.reportButtonText}>+ Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location?.latitude || 6.5014,
            longitude: location?.longitude || 124.8372,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {hazards.map((hazard) => (
            <Marker
              key={hazard.id}
              coordinate={{ latitude: hazard.latitude, longitude: hazard.longitude }}
              onPress={() => setSelectedHazard(hazard)}
            >
              <View style={[styles.marker, hazard.verified && styles.verifiedMarker]}>
                <Text style={styles.markerText}>{getHazardIcon(hazard.type)}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {selectedHazard && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailIcon}>{getHazardIcon(selectedHazard.type)}</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailType}>{selectedHazard.type.replace('_', ' ').toUpperCase()}</Text>
              <Text style={styles.detailVotes}>✓ {selectedHazard.votes} votes</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedHazard(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.detailDesc}>{selectedHazard.description}</Text>
          <TouchableOpacity style={styles.voteButton} onPress={() => handleVote(selectedHazard.id)}>
            <Text style={styles.voteButtonText}>✓ Vote - "Totoo Ito"</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}><Text>🌊</Text><Text style={styles.legendText}>Flood</Text></View>
          <View style={styles.legendItem}><Text>🔥</Text><Text style={styles.legendText}>Fire</Text></View>
          <View style={styles.legendItem}><Text>⛰️</Text><Text style={styles.legendText}>Landslide</Text></View>
          <View style={styles.legendItem}><Text>🛣️</Text><Text style={styles.legendText}>Road Damage</Text></View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  reportButton: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  reportButtonText: { color: '#fff', fontWeight: '600' },
  mapContainer: { flex: 1 },
  map: { width: '100%', height: '100%' },
  marker: { width: 36, height: 36, backgroundColor: '#f59e0b', borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  markerText: { fontSize: 16 },
  verifiedMarker: { backgroundColor: '#22c55e' },
  detailCard: { position: 'absolute', bottom: 100, left: 16, right: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 4 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailIcon: { fontSize: 24, marginRight: 12 },
  detailInfo: { flex: 1 },
  detailType: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  detailVotes: { fontSize: 12, color: '#22c55e' },
  closeButton: { fontSize: 20, color: '#666' },
  detailDesc: { fontSize: 14, color: '#666', marginBottom: 12 },
  voteButton: { backgroundColor: '#22c55e', padding: 12, borderRadius: 8, alignItems: 'center' },
  voteButtonText: { color: '#fff', fontWeight: '600' },
  legend: { position: 'absolute', top: 70, right: 16, backgroundColor: '#fff', borderRadius: 8, padding: 12, elevation: 4 },
  legendTitle: { fontSize: 12, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  legendItems: { gap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendText: { fontSize: 11, color: '#666' },
});

export default HazardMapScreen;