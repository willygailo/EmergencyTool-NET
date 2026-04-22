import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export const EvacuationRouteScreen = ({ navigation }: any) => {
  const [evacuationCenter, setEvacuationCenter] = useState({ latitude: 14.5995, longitude: 120.9842, name: 'Barangay Hall' });
  const [userLocation, setUserLocation] = useState<any>(null);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          return;
        }
        const position = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch (error) {
        console.error('Failed to get location');
      }
    };
    getUserLocation();
  }, []);

  const initialRegion = {
    latitude: (userLocation?.latitude + evacuationCenter.latitude) / 2 || 14.5995,
    longitude: (userLocation?.longitude + evacuationCenter.longitude) / 2 || 120.9842,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Evacuation Route</Text>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {userLocation && (
          <Marker coordinate={userLocation} title="You" description="Current location">
            <View style={styles.userPin}><Text>📍</Text></View>
          </Marker>
        )}
        <Marker coordinate={evacuationCenter} title={evacuationCenter.name} description="Evacuation Center">
          <View style={styles.centerPin}><Text>🏠</Text></View>
        </Marker>
        {userLocation && (
          <Polyline coordinates={[userLocation, evacuationCenter]} strokeColor="#3b82f6" strokeWidth={3} />
        )}
      </MapView>
      <View style={styles.info}>
        <Text style={styles.infoText}>🏠 Nearest: {evacuationCenter.name}</Text>
        <Text style={styles.infoText}>📍 Your location detected</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, fontWeight: 'bold', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  map: { flex: 1 },
  userPin: { backgroundColor: '#fff', padding: 4, borderRadius: 20, elevation: 4 },
  centerPin: { backgroundColor: '#fff', padding: 4, borderRadius: 20, elevation: 4 },
  info: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  infoText: { fontSize: 14, color: '#374151' },
});

export default EvacuationRouteScreen;
