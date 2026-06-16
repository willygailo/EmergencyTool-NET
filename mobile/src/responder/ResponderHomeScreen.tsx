import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { authApi } from '../auth/authApi';
import api from '../services/api';

interface Assignment {
  id: string;
  emergencyType: string;
  type?: string;
  location: string;
  address?: string;
  status: string;
  createdAt: string;
}

export const ResponderHomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAssignments = useCallback(async () => {
    try {
      const { data } = await api.get('/responders/assignments');
      // Normalize fields from backend (type vs emergencyType, address vs location)
      const normalized = (Array.isArray(data) ? data : []).map((a: any) => ({
        id: a.id,
        emergencyType: a.type || a.emergencyType || 'unknown',
        location: a.address || a.location || 'Unknown location',
        status: a.status,
        createdAt: a.createdAt || a.created_at,
      }));
      setAssignments(normalized);
    } catch (error) {
      console.log('Failed to load assignments', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
    // Poll every 10s for new assignments
    const interval = setInterval(loadAssignments, 10000);
    return () => clearInterval(interval);
  }, [loadAssignments]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

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
      {
        text: 'Accept', onPress: async () => {
          try {
            await api.put(`/responders/assignments/${id}/status`, { status: 'accepted' });
            setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: 'accepted' } : a));
          } catch (error) {
            Alert.alert('Error', 'Could not accept assignment. Please try again.');
          }
        }
      }
    ]);
  };

  const handleLogout = async () => {
    await authApi.logout();
    dispatch(logout());
  };

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const activeCount = assignments.filter(a => ['accepted', 'en_route', 'on_scene'].includes(a.status)).length;
  const resolvedCount = assignments.filter(a => a.status === 'resolved').length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={{ color: '#666', marginTop: 12 }}>Loading assignments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Responder Dashboard</Text>
            <Text style={styles.subtitle}>Pull down to refresh</Text>
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
            <Text style={styles.statNumber}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{resolvedCount}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Assignments</Text>
        {assignments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No assignments at this time</Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 6 }}>Pull down to refresh</Text>
          </View>
        ) : (
          assignments.map((assignment) => (
            <View key={assignment.id} style={styles.assignmentCard}>
              <View style={styles.assignmentHeader}>
                <Text style={styles.emergencyType}>
                  {assignment.emergencyType === 'fire' ? '🔥 Fire' :
                   assignment.emergencyType === 'medical' ? '🏥 Medical' :
                   assignment.emergencyType === 'flood' ? '🌊 Flood' :
                   assignment.emergencyType === 'crime' ? '🚔 Crime' : '🚨 Emergency'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(assignment.status) }]}>
                    {assignment.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.assignmentLocation}>📍 {assignment.location}</Text>
              <Text style={styles.assignmentTime}>
                {assignment.createdAt ? new Date(assignment.createdAt).toLocaleString() : ''}
              </Text>

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

              {['accepted', 'en_route', 'on_scene'].includes(assignment.status) && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#8b5cf6', marginTop: 12, flex: 0 }]}
                  onPress={() => navigation.navigate('Assignment', { assignmentId: assignment.id })}
                >
                  <Text style={styles.actionButtonText}>Manage Assignment →</Text>
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
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  logoutButton: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  emptyCard: { backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center', elevation: 2 },
  emptyText: { color: '#374151', fontWeight: '500' },
  assignmentCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  assignmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  emergencyType: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },
  assignmentLocation: { fontSize: 14, color: '#374151', marginBottom: 4 },
  assignmentTime: { fontSize: 12, color: '#666' },
  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: '600' },
});

export default ResponderHomeScreen;
