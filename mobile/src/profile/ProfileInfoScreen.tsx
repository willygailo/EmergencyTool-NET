import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { API_URL } from '../services/apiConfig';
import { useNotifications } from '../hooks/useNotifications';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { APP_VERSION, aboutHighlights, helpFaqItems, privacyHighlights } from './profileContent';

const notificationStatusLabels: Record<string, string> = {
  granted: 'Enabled',
  denied: 'Denied',
  unavailable: 'Unavailable',
  undetermined: 'Not yet requested',
  unsupported_in_expo_go: 'Expo Go limitation',
};

const formatNotificationStatus = (status: string) => notificationStatusLabels[status] || status;

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const ProfileInfoScreen = ({ navigation, route }: any) => {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const {
    notifications,
    unreadCount,
    permissionStatus,
    expoPushToken,
    sendLocalNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    refreshNotificationStatus,
  } = useNotifications();
  const { isOnline, pendingCount, isSyncing, syncPendingItems, clearAllPending } = useOfflineStorage();

  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(helpFaqItems[0]?.id || null);
  const [healthStatus, setHealthStatus] = useState<'idle' | 'checking' | 'healthy' | 'unavailable'>('idle');
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  const section = route.name;

  const headerCopy = useMemo(() => {
    switch (section) {
      case 'NotificationsCenter':
        return {
          eyebrow: 'App Alerts',
          title: 'Notifications',
          description: 'Review in-app alerts, permission status, and test your notification flow safely in Expo Go.',
        };
      case 'PrivacySecurity':
        return {
          eyebrow: 'Privacy',
          title: 'Privacy & Security',
          description: 'See how your data is used and jump straight to secure account actions like changing your password.',
        };
      case 'ConnectionStatus':
        return {
          eyebrow: 'Connectivity',
          title: 'Connection Status',
          description: 'Monitor online state, queue health, and API reachability from the device you are using now.',
        };
      case 'HelpFaq':
        return {
          eyebrow: 'Support',
          title: 'Help & FAQ',
          description: 'Quick answers for profile, household, notification, and offline workflow questions.',
        };
      default:
        return {
          eyebrow: 'App Info',
          title: 'About EmergencyTool',
          description: 'See app version, platform details, and the core safety features available in this build.',
        };
    }
  }, [section]);

  useEffect(() => {
    if (section === 'ConnectionStatus') {
      void handleCheckHealth();
    }
  }, [section]);

  const handleCheckHealth = async () => {
    setHealthStatus('checking');

    try {
      const response = await fetch(`${API_URL.replace(/\/api$/, '')}/health`);
      setHealthStatus(response.ok ? 'healthy' : 'unavailable');
    } catch {
      setHealthStatus('unavailable');
    } finally {
      setLastCheckedAt(new Date().toISOString());
    }
  };

  const handleClearQueue = () => {
    Alert.alert('Clear offline queue', 'Remove all queued offline items from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearAllPending();
          Alert.alert('Cleared', 'Offline queue has been cleared.');
        },
      },
    ]);
  };

  const renderNotifications = () => (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notification Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Permission</Text>
          <Text style={styles.statusValue}>{formatNotificationStatus(permissionStatus)}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Unread Alerts</Text>
          <Text style={styles.statusValue}>{unreadCount}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Push Token</Text>
          <Text style={styles.statusValue}>{expoPushToken ? 'Registered' : 'Unavailable'}</Text>
        </View>

        {permissionStatus === 'unsupported_in_expo_go' ? (
          <Text style={styles.helperText}>
            Expo Go on SDK 54 blocks Android remote push registration. We still keep an in-app notification center working inside the app.
          </Text>
        ) : null}

        <TouchableOpacity style={styles.primaryButton} onPress={() => sendLocalNotification('EmergencyTool test', 'Your notification center is working.', 'info')}>
          <Text style={styles.primaryButtonText}>Create Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={refreshNotificationStatus}>
          <Text style={styles.secondaryButtonText}>Refresh Notification Status</Text>
        </TouchableOpacity>

        {notifications.length > 0 ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={markAllAsRead}>
            <Text style={styles.secondaryButtonText}>Mark All As Read</Text>
          </TouchableOpacity>
        ) : null}

        {notifications.length > 0 ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={clearAll}>
            <Text style={styles.secondaryButtonText}>Clear All Notifications</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Messages</Text>
        {notifications.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>Create a test notification above to confirm this screen is working on your device.</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, !item.read && styles.highlightCard]}
              onPress={() => markAsRead(item.id)}
            >
              <View style={styles.listHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.metaText}>{item.read ? 'Read' : 'Unread'}</Text>
              </View>
              <Text style={styles.bodyText}>{item.body}</Text>
              <Text style={styles.metaText}>{formatTimestamp(item.timestamp)}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </>
  );

  const renderPrivacy = () => (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Security</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Signed in as</Text>
          <Text style={styles.statusValue}>{authUser?.email || 'Unknown'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Phone</Text>
          <Text style={styles.statusValue}>{authUser?.phone || 'Not set'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Barangay</Text>
          <Text style={styles.statusValue}>{authUser?.barangay || 'Not set'}</Text>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ProfileSettings')}>
          <Text style={styles.primaryButtonText}>Open Password & Profile Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How your data is handled</Text>
        {privacyHighlights.map((item) => (
          <View key={item} style={styles.card}>
            <Text style={styles.bodyText}>{item}</Text>
          </View>
        ))}
      </View>
    </>
  );

  const renderConnection = () => (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Connection Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Device Network</Text>
          <Text style={styles.statusValue}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Server Health</Text>
          <Text style={styles.statusValue}>
            {healthStatus === 'checking'
              ? 'Checking'
              : healthStatus === 'healthy'
                ? 'Healthy'
                : healthStatus === 'unavailable'
                  ? 'Unavailable'
                  : 'Not checked'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Offline Queue</Text>
          <Text style={styles.statusValue}>{isSyncing ? 'Syncing' : `${pendingCount} pending`}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>API URL</Text>
          <Text style={styles.statusValue}>{API_URL}</Text>
        </View>
        {lastCheckedAt ? <Text style={styles.metaText}>Last checked: {formatTimestamp(lastCheckedAt)}</Text> : null}

        <TouchableOpacity style={styles.primaryButton} onPress={handleCheckHealth}>
          <Text style={styles.primaryButtonText}>Check Server Health</Text>
        </TouchableOpacity>

        {pendingCount > 0 ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={syncPendingItems}>
            <Text style={styles.secondaryButtonText}>Retry Pending Sync</Text>
          </TouchableOpacity>
        ) : null}

        {pendingCount > 0 ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleClearQueue}>
            <Text style={styles.secondaryButtonText}>Clear Offline Queue</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );

  const renderHelp = () => (
    <>
      {helpFaqItems.map((item) => {
        const isExpanded = expandedFaqId === item.id;

        return (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => setExpandedFaqId(isExpanded ? null : item.id)}
          >
            <View style={styles.listHeader}>
              <Text style={styles.cardTitle}>{item.question}</Text>
              <Text style={styles.metaText}>{isExpanded ? 'Hide' : 'Open'}</Text>
            </View>
            {isExpanded ? <Text style={styles.bodyText}>{item.answer}</Text> : null}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('ContactSupport')}>
        <Text style={styles.secondaryButtonText}>Contact Support</Text>
      </TouchableOpacity>
    </>
  );

  const renderAbout = () => (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Build Details</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Version</Text>
          <Text style={styles.statusValue}>{APP_VERSION}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Platform</Text>
          <Text style={styles.statusValue}>{Platform.OS}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>API</Text>
          <Text style={styles.statusValue}>{API_URL}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What this app can do</Text>
        {aboutHighlights.map((item) => (
          <View key={item} style={styles.card}>
            <Text style={styles.bodyText}>{item}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('HelpFaq')}>
        <Text style={styles.secondaryButtonText}>Open Help & FAQ</Text>
      </TouchableOpacity>
    </>
  );

  const renderContent = () => {
    switch (section) {
      case 'NotificationsCenter':
        return renderNotifications();
      case 'PrivacySecurity':
        return renderPrivacy();
      case 'ConnectionStatus':
        return renderConnection();
      case 'HelpFaq':
        return renderHelp();
      default:
        return renderAbout();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{headerCopy.eyebrow}</Text>
          <Text style={styles.heroTitle}>{headerCopy.title}</Text>
          <Text style={styles.heroDescription}>{headerCopy.description}</Text>
        </View>

        {healthStatus === 'checking' ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#ef4444" />
            <Text style={styles.loadingText}>Checking live status...</Text>
          </View>
        ) : null}

        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 32 },
  heroCard: { backgroundColor: '#fff', borderRadius: 18, padding: 20, marginBottom: 18, elevation: 2 },
  eyebrow: { fontSize: 12, fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#111827', marginTop: 6 },
  heroDescription: { marginTop: 8, fontSize: 14, lineHeight: 21, color: '#6b7280' },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  highlightCard: { borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fff7f7' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  bodyText: { fontSize: 14, lineHeight: 21, color: '#4b5563', marginTop: 8 },
  helperText: { fontSize: 13, lineHeight: 19, color: '#6b7280', marginTop: 12 },
  metaText: { fontSize: 12, color: '#6b7280', marginTop: 8 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statusLabel: { flex: 1, fontSize: 14, color: '#4b5563', paddingRight: 12 },
  statusValue: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'right' },
  primaryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: '#b91c1c', fontSize: 15, fontWeight: '600' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  emptyText: { fontSize: 14, lineHeight: 21, color: '#6b7280', marginTop: 8 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, paddingHorizontal: 4 },
  loadingText: { fontSize: 13, color: '#6b7280' },
});

export default ProfileInfoScreen;
