import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useLocation } from '../hooks/useLocation';
import { useFamilySafety } from '../hooks/useFamilySafety';
import { useNotifications } from '../hooks/useNotifications';
import { useOfflineStorage } from '../hooks/useOfflineStorage';

const communityHighlights = [
  'Columbio, Sultan Kudarat',
  'Koronadal, South Cotabato',
  'Offline and SMS fallback',
  '72-hour auto-delete',
];

const trustPromises = [
  'Location only during emergencies',
  'No background tracking',
  'AI first-aid guidance while waiting',
];

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: any) => state.auth);
  const { location, loading: locationLoading } = useLocation();
  const { familyMembers, checkInStatus } = useFamilySafety();
  const { unreadCount } = useNotifications();
  const { isOnline, pendingCount } = useOfflineStorage();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handlePanic = () => {
    Alert.alert(
      '🚨 EMERGENCY ALERT',
      'Send emergency alert now? Your exact location will be shared with responders and can also be queued for offline sending.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'SEND ALERT', 
          style: 'destructive', 
          onPress: () => {
            if (!isOnline) {
              Alert.alert('Offline Mode', 'You are offline. Your alert will be sent when you reconnect.');
            }
            navigation.navigate('EmergencyType');
          }
        }
      ]
    );
  };

  const quickActions = [
    { id: 'report', icon: '🚨', label: 'Panic Alert', color: '#ef4444', screen: 'EmergencyType' },
    { id: 'location', icon: '📍', label: 'My Location', color: '#3b82f6', screen: 'LocationShare' },
    { id: 'family', icon: '👨‍👩‍👧', label: 'Check-In', color: '#22c55e', screen: 'FamilySafety' },
    { id: 'hazard', icon: '⚠️', label: 'Hazard Map', color: '#f59e0b', screen: 'HazardMap' },
  ];

  const preparednessCards = [
    { id: 'kit', icon: '🎒', label: 'Emergency Kit', screen: 'EmergencyKit' },
    { id: 'firstaid', icon: '🩹', label: 'First Aid', screen: 'FirstAid' },
    { id: 'evacuation', icon: '🛣️', label: 'Evacuation Routes', screen: 'EvacuationRoute' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Mabuhay, {user?.firstName || 'Kaibigan'}! 👋</Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {!isOnline && (
                <View style={styles.offlineBadge}>
                  <Text style={styles.offlineText}>📴 Offline</Text>
                </View>
              )}
              {pendingCount > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>🔄 {pendingCount}</Text>
                </View>
              )}
            </View>
          </View>
          
          {location && (
            <TouchableOpacity style={styles.locationBar} onPress={() => navigation.navigate('LiveLocationMap')}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {locationLoading
                  ? 'Refreshing your current location...'
                  : location.address || `Lat: ${location.latitude?.toFixed(4)}, Lng: ${location.longitude?.toFixed(4)}`}
              </Text>
              <Text style={styles.locationRefresh}>Refresh</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.communityCard}>
          <Text style={styles.communityEyebrow}>EmergencyTool-NET</Text>
          <Text style={styles.communityTitle}>Technology para sa Kaligtasan ng Bawat Barangay</Text>
          <Text style={styles.communityDesc}>
            Built for residents, families, PWDs, seniors, barangay officials, and responders in Columbio and Koronadal.
            One tap can trigger location sharing, emergency routing, and faster community response.
          </Text>

          <View style={styles.communityChipWrap}>
            {communityHighlights.map((item) => (
              <View key={item} style={styles.communityChip}>
                <Text style={styles.communityChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.panicButton} onPress={handlePanic}>
          <Text style={styles.panicIcon}>🚨</Text>
          <Text style={styles.panicText}>PANIC</Text>
          <Text style={styles.panicSubtext}>Tap to send emergency alert with your location</Text>
        </TouchableOpacity>

        <View style={styles.promiseCard}>
          <Text style={styles.promiseTitle}>Your safety, your privacy</Text>
          {trustPromises.map((item) => (
            <View key={item} style={styles.promiseRow}>
              <Text style={styles.promiseBullet}>•</Text>
              <Text style={styles.promiseText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map(action => (
              <TouchableOpacity 
                key={action.id} 
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={[styles.actionIconBg, { backgroundColor: action.color + '20' }]}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Barangay Alerts</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.alertCard} 
            onPress={() => navigation.navigate('BarangayAlert')}
          >
            <View style={styles.alertIconBg}>
              <Text style={styles.alertIcon}>📢</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Barangay Alerts</Text>
              <Text style={styles.alertDesc}>View latest alerts from your barangay</Text>
            </View>
            <Text style={styles.alertArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Safety</Text>
          <View style={styles.familyCard}>
            <View style={styles.familyStatusRow}>
              <View style={[styles.statusDot, { backgroundColor: checkInStatus === 'all_safe' ? '#22c55e' : checkInStatus === 'pending' ? '#f59e0b' : '#ef4444' }]} />
              <Text style={styles.familyStatusText}>
                {checkInStatus === 'all_safe' ? '✓ All members safe' : checkInStatus === 'pending' ? '⏳ Check-in pending' : '⚠ Some need attention'}
              </Text>
            </View>
            <Text style={styles.familyCount}>
              {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.familyButton} 
            onPress={() => navigation.navigate('FamilySafety')}
          >
            <Text style={styles.familyButtonText}>View Family</Text>
            <Text style={styles.familyButtonArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparedness</Text>
          <View style={styles.preparednessGrid}>
            {preparednessCards.map(card => (
              <TouchableOpacity 
                key={card.id} 
                style={styles.preparednessCard}
                onPress={() => navigation.navigate(card.screen)}
              >
                <Text style={styles.preparednessIcon}>{card.icon}</Text>
                <Text style={styles.preparednessLabel}>{card.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.developerNoteCard}>
            <Text style={styles.developerNoteTitle}>Developer's Note</Text>
            <Text style={styles.developerNoteText}>
              App is still under development. GPS and location improvements are ongoing while the team completes key emergency flows.
            </Text>
            <Text style={styles.developerContactText}>Willy Jr. Carnasa Gailo • 0970-309-2060 • willygailo45@gmail.com</Text>
          </View>
          <Text style={styles.footerText}>
            EmergencyTool-NET v1.0 | {isOnline ? '🟢 Online' : '📴 Offline'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 32, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerRight: { flexDirection: 'row', gap: 8 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  date: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  offlineBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  offlineText: { fontSize: 12, color: '#b45309', fontWeight: '500' },
  pendingBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pendingText: { fontSize: 12, color: '#1d4ed8', fontWeight: '500' },
  locationBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginTop: 12 },
  locationIcon: { fontSize: 16, marginRight: 8 },
  locationText: { flex: 1, fontSize: 14, color: '#6b7280' },
  locationRefresh: { fontSize: 12, color: '#3b82f6', fontWeight: '500' },
  communityCard: { backgroundColor: '#0f172a', borderRadius: 20, padding: 18, marginBottom: 18 },
  communityEyebrow: { fontSize: 12, fontWeight: '700', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: 1.2 },
  communityTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 8 },
  communityDesc: { fontSize: 14, lineHeight: 21, color: '#cbd5e1', marginTop: 10 },
  communityChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  communityChip: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  communityChipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  panicButton: { backgroundColor: '#ef4444', padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 24, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  panicIcon: { fontSize: 40, marginBottom: 8 },
  panicText: { color: '#fff', fontSize: 32, fontWeight: 'bold', letterSpacing: 4 },
  panicSubtext: { color: '#fecaca', fontSize: 12, marginTop: 4 },
  promiseCard: { backgroundColor: '#fff', padding: 18, borderRadius: 18, marginBottom: 20, elevation: 2 },
  promiseTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  promiseRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  promiseBullet: { color: '#ef4444', fontSize: 18, lineHeight: 18, marginRight: 8 },
  promiseText: { flex: 1, fontSize: 14, color: '#4b5563', lineHeight: 20 },
  quickActionsSection: { marginBottom: 20 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 12 },
  actionCard: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  actionIconBg: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#374151' },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  badge: { backgroundColor: '#ef4444', minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 2 },
  alertIconBg: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  alertIcon: { fontSize: 24 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  alertDesc: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  alertArrow: { fontSize: 24, color: '#9ca3af' },
  familyCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 2, marginBottom: 12 },
  familyStatusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  familyStatusText: { fontSize: 16, fontWeight: '500', color: '#374151' },
  familyCount: { fontSize: 14, color: '#6b7280' },
  familyButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 2 },
  familyButtonText: { fontSize: 16, fontWeight: '600', color: '#3b82f6' },
  familyButtonArrow: { fontSize: 20, color: '#3b82f6' },
  preparednessGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  preparednessCard: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  preparednessIcon: { fontSize: 28, marginBottom: 8 },
  preparednessLabel: { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: 16 },
  developerNoteCard: { width: '100%', backgroundColor: '#fff7ed', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#fdba74' },
  developerNoteTitle: { fontSize: 14, fontWeight: '700', color: '#9a3412', marginBottom: 6 },
  developerNoteText: { fontSize: 13, lineHeight: 19, color: '#7c2d12' },
  developerContactText: { fontSize: 12, lineHeight: 18, color: '#9a3412', marginTop: 8, fontWeight: '600' },
  footerText: { fontSize: 12, color: '#9ca3af' },
});

export default HomeScreen;
