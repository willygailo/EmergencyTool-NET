import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { locationApi } from './locationApi';

export const LocationShareScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<any>(null);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        alert('Location permission required');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation(pos.coords);
      await locationApi.shareLocation(
        pos.coords.latitude,
        pos.coords.longitude,
        pos.coords.accuracy ?? 0
      );
    } catch (error) {
      alert('Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Share Location</Text>
        <Text style={styles.subtitle}>Share your current location with family or responders</Text>

        {location ? (
          <View style={styles.locationCard}>
            <Text style={styles.coordLabel}>Coordinates</Text>
            <Text style={styles.coords}>Lat: {location.latitude.toFixed(6)}</Text>
            <Text style={styles.coords}>Lng: {location.longitude.toFixed(6)}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.getButton} onPress={getCurrentLocation} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.getButtonText}>Get My Location</Text>}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.shareButton} onPress={() => navigation.navigate('LiveLocationMap')}>
          <Text style={styles.shareButtonText}>Open Live Map</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 32 },
  locationCard: { backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center' },
  coordLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  coords: { fontSize: 16, fontFamily: 'monospace', color: '#1f2937' },
  getButton: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  getButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  shareButton: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#ddd' },
  shareButtonText: { color: '#333', fontSize: 16, fontWeight: '600' },
});
export default LocationShareScreen;
