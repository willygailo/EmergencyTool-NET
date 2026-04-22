import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { BroadcastAlert } from './broadcastApi';
import { useBarangayAlerts } from './useBarangayAlerts';

export const BarangayAlertScreen = ({ navigation }: any) => {
  const userBarangay = useSelector((state: RootState) => state.auth.user?.barangay);
  const {
    alerts,
    error,
    hasBarangay,
    latestAlert,
    loading,
    refreshing,
    refreshAlerts,
    reloadAlerts,
    barangayLabel,
  } = useBarangayAlerts({
    barangay: userBarangay,
    autoLoad: true,
    refreshOnFocus: true,
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      alert: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      evacuation: '#dc2626',
    };

    return colors[type] || '#6b7280';
  };

  const formatAlertTime = (value: string) =>
    new Date(value).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const renderAlert = ({ item }: { item: BroadcastAlert }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertTopRow}>
        <View style={[styles.alertBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Text style={styles.alertBadgeText}>{item.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.alertBarangayText}>
          {item.targetAll ? 'All barangays' : item.barangay || barangayLabel}
        </Text>
      </View>
      <Text style={styles.alertTitle}>{item.title}</Text>
      <Text style={styles.alertMessage}>{item.message}</Text>
      <Text style={styles.alertTime}>{formatAlertTime(item.createdAt)}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Text style={styles.header}>Barangay Alerts</Text>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Latest active alerts</Text>
        <Text style={styles.heroTitle}>
          {hasBarangay ? `For ${barangayLabel}` : 'General community alerts'}
        </Text>
        <Text style={styles.heroBody}>
          {hasBarangay
            ? 'You are seeing the newest active alerts for your barangay, including community-wide notices.'
            : 'Your profile has no barangay yet, so the app is showing active fallback alerts. Set your barangay for exact matching.'}
        </Text>

        {!hasBarangay ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ProfileSettings')}>
            <Text style={styles.primaryButtonText}>Set My Barangay</Text>
          </TouchableOpacity>
        ) : null}

        {latestAlert ? (
          <View style={styles.latestCard}>
            <View style={[styles.alertBadge, { backgroundColor: getTypeColor(latestAlert.type) }]}>
              <Text style={styles.alertBadgeText}>LATEST</Text>
            </View>
            <Text style={styles.latestTitle}>{latestAlert.title}</Text>
            <Text style={styles.latestBody}>{latestAlert.message}</Text>
            <Text style={styles.latestMeta}>
              {formatAlertTime(latestAlert.createdAt)} • {latestAlert.targetAll ? 'All barangays' : latestAlert.barangay || barangayLabel}
            </Text>
          </View>
        ) : !loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No active alerts right now</Text>
            <Text style={styles.emptyText}>
              Pull to refresh anytime to check for new announcements from your barangay.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Could not load alerts</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={reloadAlerts}>
              <Text style={styles.secondaryButtonText}>Retry Loading Alerts</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (loading && alerts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loading}>Loading latest alerts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyListSpacer}>
              <Text style={styles.emptyMuted}>No active alerts to list yet.</Text>
            </View>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAlerts} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  headerContent: { marginBottom: 8 },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  heroBody: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 21,
    marginTop: 8,
  },
  list: { padding: 16, paddingBottom: 32, width: '100%', maxWidth: 560, alignSelf: 'center' },
  latestCard: {
    marginTop: 16,
    backgroundColor: '#fff7f7',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  latestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 10,
  },
  latestBody: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 21,
    marginTop: 8,
  },
  latestMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 10,
  },
  alertCard: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 12, elevation: 2 },
  alertTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  alertBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  alertBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  alertBarangayText: { flex: 1, textAlign: 'right', fontSize: 12, color: '#6b7280' },
  alertTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 6 },
  alertMessage: { fontSize: 14, color: '#4b5563', lineHeight: 21 },
  alertTime: { fontSize: 12, color: '#9ca3af', marginTop: 10 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  loading: { textAlign: 'center', marginTop: 14, color: '#6b7280' },
  emptyCard: {
    marginTop: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  emptyText: { marginTop: 8, fontSize: 14, color: '#6b7280', lineHeight: 20 },
  emptyListSpacer: { paddingBottom: 16 },
  emptyMuted: { textAlign: 'center', color: '#9ca3af', fontSize: 13 },
  errorCard: {
    marginTop: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#991b1b' },
  errorText: { marginTop: 8, fontSize: 14, color: '#7f1d1d', lineHeight: 20 },
  primaryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: '#ef4444',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  secondaryButtonText: { color: '#b91c1c', fontSize: 15, fontWeight: '600' },
});

export default BarangayAlertScreen;
