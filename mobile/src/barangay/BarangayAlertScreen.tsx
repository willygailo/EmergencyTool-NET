import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { broadcastApi } from './broadcastApi';

export const BarangayAlertScreen = ({ navigation }: any) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await broadcastApi.getAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Failed to fetch alerts');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getTypeColor = (type: string) => {
    const colors: any = { alert: '#ef4444', warning: '#f59e0b', info: '#3b82f6', evacuation: '#dc2626' };
    return colors[type] || '#6b7280';
  };

  const renderAlert = ({ item }: any) => (
    <TouchableOpacity style={styles.alertCard} onPress={() => {}}>
      <View style={[styles.alertBadge, { backgroundColor: getTypeColor(item.type) }]}>
        <Text style={styles.alertBadgeText}>{item.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.alertTitle}>{item.title}</Text>
      <Text style={styles.alertMessage} numberOfLines={2}>{item.message}</Text>
      <Text style={styles.alertTime}>{new Date(item.created_at).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.header}>Barangay Alerts</Text>
      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : alerts.length === 0 ? (
        <Text style={styles.empty}>No active alerts</Text>
      ) : (
        <FlatList data={alerts} renderItem={renderAlert} keyExtractor={item => item.id} contentContainerStyle={styles.list} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { fontSize: 24, fontWeight: 'bold', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', width: '100%', maxWidth: 560, alignSelf: 'center' },
  list: { padding: 16, width: '100%', maxWidth: 560, alignSelf: 'center' },
  alertCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  alertBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
  alertBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  alertTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  alertMessage: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  alertTime: { fontSize: 12, color: '#9ca3af' },
  loading: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
  empty: { textAlign: 'center', marginTop: 40, color: '#9ca3af' },
});

export default BarangayAlertScreen;
