import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import api from '../services/api';

interface Assignment {
  id: string;
  emergency: {
    type: string;
    description: string;
    location: { lat: number; lng: number; address: string };
    caller: { name: string; phone: string };
    household?: { hasElderly: boolean; hasChildren: boolean; hasPWD: boolean };
  };
  status: string;
  createdAt: string;
}

export const AssignmentScreen = ({ route, navigation }: any) => {
  const { assignmentId } = route.params || {};
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      const { data } = await api.get(`/responder/assignments/${assignmentId || '1'}`);
      setAssignment(data);
    } catch (error) {
      setAssignment({
        id: '1',
        emergency: {
          type: 'fire',
          description: 'Two-story residential house on fire',
          location: { lat: 6.5014, lng: 124.8372, address: 'Poblacion, Koronadal' },
          caller: { name: 'Juan Dela Cruz', phone: '09123456789' },
          household: { hasElderly: true, hasChildren: false, hasPWD: false },
        },
        status: 'accepted',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await api.put(`/responder/assignments/${assignmentId}/status`, { status: newStatus });
      Alert.alert('Success', `Status updated to ${newStatus.replace('_', ' ')}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const openNavigation = () => {
    if (assignment?.emergency.location) {
      const { lat, lng } = assignment.emergency.location;
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    }
  };

  const callCaller = () => {
    if (assignment?.emergency.caller.phone) {
      Linking.openURL(`tel:${assignment.emergency.caller.phone}`);
    }
  };

  if (!assignment) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.typeIcon}>
            {assignment.emergency.type === 'fire' ? '🔥' : 
             assignment.emergency.type === 'medical' ? '🏥' : '🚨'}
          </Text>
          <Text style={styles.typeText}>{assignment.emergency.type.toUpperCase()} EMERGENCY</Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: assignment.emergency.location.lat,
              longitude: assignment.emergency.location.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: assignment.emergency.location.lat, longitude: assignment.emergency.location.lng }}
              title="Emergency Location"
            />
          </MapView>
          <TouchableOpacity style={styles.navigateButton} onPress={openNavigation}>
            <Text style={styles.navigateButtonText}>🧭 Navigate</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.address}>📍 {assignment.emergency.location.address}</Text>
          <Text style={styles.coords}>
            {assignment.emergency.location.lat.toFixed(6)}, {assignment.emergency.location.lng.toFixed(6)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caller Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{assignment.emergency.caller.name}</Text>
          </View>
          <TouchableOpacity onPress={callCaller}>
            <Text style={styles.phoneButton}>📞 {assignment.emergency.caller.phone}</Text>
          </TouchableOpacity>
        </View>

        {assignment.emergency.household && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Household Info</Text>
            <View style={styles.warningRow}>
              {assignment.emergency.household.hasElderly && <Text style={styles.warning}>👴 Elderly</Text>}
              {assignment.emergency.household.hasChildren && <Text style={styles.warning}>👶 Children</Text>}
              {assignment.emergency.household.hasPWD && <Text style={styles.warning}>♿ PWD</Text>}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{assignment.emergency.description}</Text>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.statusButtons}>
            {['en_route', 'on_scene', 'resolved'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.statusButton, status === 'resolved' && styles.resolveButton]}
                onPress={() => handleUpdateStatus(status)}
              >
                <Text style={styles.statusButtonText}>
                  {status === 'en_route' ? '🚒 En Route' : 
                   status === 'on_scene' ? '🏠 On Scene' : '✓ Resolved'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 16 },
  typeIcon: { fontSize: 48 },
  typeText: { fontSize: 20, fontWeight: 'bold', color: '#ef4444', marginTop: 8 },
  mapContainer: { height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  map: { width: '100%', height: '100%' },
  navigateButton: { position: 'absolute', bottom: 12, right: 12, backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  navigateButtonText: { color: '#fff', fontWeight: '600' },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  address: { fontSize: 16, color: '#1f2937' },
  coords: { fontSize: 12, color: '#666', marginTop: 4 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { color: '#666', marginRight: 8 },
  infoValue: { color: '#1f2937', fontWeight: '500' },
  phoneButton: { color: '#3b82f6', fontSize: 16, fontWeight: '500' },
  warningRow: { flexDirection: 'row', gap: 8 },
  warning: { backgroundColor: '#fef3c7', color: '#92400e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, fontSize: 14 },
  description: { fontSize: 14, color: '#374151' },
  statusSection: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 24 },
  statusButtons: { flexDirection: 'row', gap: 8 },
  statusButton: { flex: 1, backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, alignItems: 'center' },
  resolveButton: { backgroundColor: '#22c55e' },
  statusButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});

export default AssignmentScreen;