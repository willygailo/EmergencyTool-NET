import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { locationApi } from './locationApi';

const { width, height } = Dimensions.get('window');

export const LiveLocationMap = ({ navigation }: any) => {
  const [location, setLocation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const startTracking = async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.granted) {
        const pos = await Location.getCurrentPositionAsync({});
        setLocation(pos.coords);
        setHistory([{ latitude: pos.coords.latitude, longitude: pos.coords.longitude }]);
      }
    };
    startTracking();
  }, []);

  const initialRegion = location ? {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : {
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {location && (
          <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
            <View style={styles.marker}><Text>📍</Text></View>
          </Marker>
        )}
        {history.length > 1 && (
          <Polyline coordinates={history} strokeColor="#3b82f6" strokeWidth={3} />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: { backgroundColor: '#fff', padding: 4, borderRadius: 20, elevation: 4 },
});

export default LiveLocationMap;