import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';

type Coordinates = {
  latitude: number;
  longitude: number;
};

export const LiveLocationMap = () => {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLocation = async () => {
      setLoading(true);
      setError(null);

      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          setError('Location permission is required to display your live position.');
          return;
        }

        const position = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch {
        setError('Unable to retrieve your location in this browser session.');
      } finally {
        setLoading(false);
      }
    };

    loadLocation();
  }, []);

  const openInMaps = () => {
    if (!location) {
      return;
    }

    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Live Location</Text>
        <Text style={styles.subtitle}>Web mode uses a lightweight map fallback.</Text>

        <View style={styles.card}>
          {loading && <ActivityIndicator size="small" color="#3b82f6" />}

          {!loading && error && <Text style={styles.errorText}>{error}</Text>}

          {!loading && !error && location && (
            <>
              <Text style={styles.label}>Current Coordinates</Text>
              <Text style={styles.coords}>Lat: {location.latitude.toFixed(6)}</Text>
              <Text style={styles.coords}>Lng: {location.longitude.toFixed(6)}</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !location && styles.disabledButton]}
          onPress={openInMaps}
          disabled={!location}
        >
          <Text style={styles.primaryButtonText}>Open in Google Maps</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Tip: For full in-app maps, use the Android/iOS build where `react-native-maps` is available.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  coords: { fontSize: 16, color: '#0f172a', fontFamily: 'monospace' },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  primaryButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: { opacity: 0.5 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  note: { marginTop: 16, fontSize: 12, color: '#64748b', textAlign: 'center' },
});

export default LiveLocationMap;
