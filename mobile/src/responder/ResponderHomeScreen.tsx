import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { authApi } from '../auth/authApi';

interface Assignment {
  id: string;
  emergencyType: string;
  location: string;
  status: string;
  createdAt: string;
}

export const ResponderHomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: '1', emergencyType: 'fire', location: 'Poblacion, Koronadal', status: 'pending', createdAt: new Date().toISOString() },
    { id: '2', emergencyType: 'medical', location: 'Mabini, Koronadal', status: 'accepted', createdAt: new Date().toISOString() },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#3b82f6';
      case 'en_route': return '#8b5cf6';
      case 'on_scene': return '#ef4444';
      case 'resolved': return '#22c55e';
      default: return '#666';
    }
  };

  const handleAccept = (id: string) => {
    Alert.alert('Accept Assignment', 'Accept this emergency assignment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => {
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: 'accepted' } : a));
      }}
    ]);
  };

  const handleLogout = async () => {
    await authApi.logout();
    dispatch(logout());
  };

  const pendingCount = assignments.filter(a => a.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Responder Dashboard</Text>
            <Text style={styles.subtitle}>BFP Unit 1 - Engine 1</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutButton}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{assignments.filter(a => a.status === 'accepted').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{assignments.filter(a => a.status === 'resolved').length}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Assignments</Text>
        {assignments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No assignments</Text>
          </View>
        ) : (
          assignments.map((assignment) => (
            <View key={assignment.id} style={styles.assignmentCard}>
              <View style={styles.assignmentHeader}>
                <Text style={styles.emergencyType}>
                  {assignment.emergencyType === 'fire' ? '🔥 Fire' : 
                   assignment.emergencyType === 'medical' ? '🏥 Medical' : '🚨 Emergency'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(assignment.status) }]}>
                    {assignment.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.assignmentLocation}>📍 {assignment.location}</Text>
              <Text style={styles.assignmentTime}>{new Date(assignment.createdAt).toLocaleString()}</Text>
              
              {assignment.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#22c55e' }]}
                    onPress={() => handleAccept(assignment.id)}
                  >
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
                    onPress={() => navigation.navigate('Assignment', { assignmentId: assignment.id })}
                  >
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {assignment.status === 'accepted' && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#8b5cf6', marginTop: 12 }]}
                  onPress={() => navigation.navigate('Navigation', { assignmentId: assignment.id })}
                >
                  <Text style={styles.actionButtonText}>Navigate →</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  logoutButton: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  emptyCard: { backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center' },
  emptyText: { color: '#666' },
  assignmentCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  assignmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  emergencyType: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },
  assignmentLocation: { fontSize: 14, color: '#374151', marginBottom: 4 },
  assignmentTime: { fontSize: 12, color: '#666' },
  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: '600' },
});

export default ResponderHomeScreen;
