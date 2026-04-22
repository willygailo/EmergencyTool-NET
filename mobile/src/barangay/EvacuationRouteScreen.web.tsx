import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';

type UserLocation = {
  latitude: number;
  longitude: number;
};

export const EvacuationRouteScreen = () => {
  const [evacuationCenter] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    name: 'Barangay Hall',
  });
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState('Detecting your location...');

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          setLocationStatus('Location permission denied. You can still open directions manually.');
          return;
        }
        const position = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus('Location detected successfully.');
      } catch {
        setLocationStatus('Unable to fetch your location from browser.');
      }
    };

    getUserLocation();
  }, []);

  const openDirections = () => {
    const destination = `${evacuationCenter.latitude},${evacuationCenter.longitude}`;
    const origin = userLocation
      ? `&origin=${userLocation.latitude},${userLocation.longitude}`
      : '';

    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}${origin}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Evacuation Route (Web)</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nearest Evacuation Center</Text>
        <Text style={styles.centerName}>🏠 {evacuationCenter.name}</Text>
        <Text style={styles.coords}>
          {evacuationCenter.latitude.toFixed(6)}, {evacuationCenter.longitude.toFixed(6)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Status</Text>
        <Text style={styles.status}>{locationStatus}</Text>
        {userLocation && (
          <Text style={styles.coords}>
            Current: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={openDirections}>
        <Text style={styles.primaryButtonText}>Open Route in Google Maps</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Web fallback is active. Mobile app still provides the in-app route map view.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  centerName: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  status: { fontSize: 14, color: '#334155' },
  coords: { marginTop: 6, fontSize: 13, color: '#475569', fontFamily: 'monospace' },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  note: { marginTop: 12, color: '#64748b', fontSize: 12, textAlign: 'center' },
});

export default EvacuationRouteScreen;
