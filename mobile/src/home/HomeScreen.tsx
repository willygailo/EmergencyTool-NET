import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useLocation } from '../hooks/useLocation';
import { useFamilySafety } from '../hooks/useFamilySafety';
import { useNotifications } from '../hooks/useNotifications';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const Skeleton = ({ width, height, borderRadius = 8, style }: { width: string | number; height: number; borderRadius?: number; style?: any }) => {
  const fadeAnim = React.useRef(new Animated.Value(0.3)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[typeof width === 'string' ? { flex: 0, width } : { width }, { height, borderRadius, backgroundColor: '#e5e7eb', opacity: fadeAnim }, style]} />;
};

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
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handlePanic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'EMERGENCY ALERT',
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
    { id: 'location', icon: 'location', label: 'My Location', color: '#3b82f6', screen: 'LocationShare' },
    { id: 'hazard', icon: 'alert-circle', label: 'Hazard Map', color: '#f59e0b', screen: 'HazardMap' },
    { id: 'optimizer', icon: 'game-controller', label: 'Game Optimizer', color: '#8b5cf6', screen: 'AIGameOptimizer' },
  ];

  if (user?.role === 'responder' || user?.role === 'admin') {
    quickActions.unshift({ id: 'responder', icon: 'shield-checkmark', label: 'Responder Dash', color: '#10b981', screen: 'ResponderHome' });
  }

  const preparednessCards = [
    { id: 'kit', icon: 'briefcase', label: 'Emergency Kit', screen: 'EmergencyKit' },
    { id: 'firstaid', icon: 'medical', label: 'First Aid', screen: 'FirstAid' },
    { id: 'evacuation', icon: 'map', label: 'Evacuation Routes', screen: 'EvacuationRoute' },
    { id: 'aichat', icon: 'chatbubbles', label: 'AI Safety Chat', screen: 'AIChat' },
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
              <Text style={styles.greeting}>Mabuhay, {user?.firstName || 'Kaibigan'}!</Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {!isOnline && (
                <View style={styles.offlineBadge}>
                  <Text style={styles.offlineText}>Offline</Text>
                </View>
              )}
              {pendingCount > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>{pendingCount} pending</Text>
                </View>
              )}
            </View>
          </View>
          
          {isInitialLoad || locationLoading ? (
            <View style={styles.locationBar}>
              <Skeleton width={16} height={16} borderRadius={8} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Skeleton width="70%" height={14} borderRadius={4} />
              </View>
            </View>
          ) : location ? (
            <TouchableOpacity style={styles.locationBar} onPress={() => navigation.navigate('LiveLocationMap')}>
              <Ionicons name="location" size={16} color="#6b7280" style={styles.locationIcon} />
              <Text style={styles.locationText} numberOfLines={1}>
                {location.address || `Lat: ${location.latitude?.toFixed(4)}, Lng: ${location.longitude?.toFixed(4)}`}
              </Text>
              <Text style={styles.locationRefresh}>Refresh</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity style={styles.panicButton} onPress={handlePanic}>
          <Ionicons name="warning" size={40} color="#fff" style={styles.panicIcon} />
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
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
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
              <Ionicons name="notifications" size={24} color="#b45309" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Barangay Alerts</Text>
              <Text style={styles.alertDesc}>View latest alerts from your barangay</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" style={styles.alertArrow} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Safety</Text>
          {isInitialLoad ? (
            <>
              <View style={styles.familyCard}>
                <Skeleton width="60%" height={16} borderRadius={4} />
                <Skeleton width="40%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
              </View>
              <Skeleton width="100%" height={48} borderRadius={16} style={{ marginTop: 12 }} />
            </>
          ) : (
            <>
              <View style={styles.familyCard}>
                <View style={styles.familyStatusRow}>
                  <View style={[styles.statusDot, { backgroundColor: checkInStatus === 'all_safe' ? '#22c55e' : checkInStatus === 'pending' ? '#f59e0b' : '#ef4444' }]} />
                  <Text style={styles.familyStatusText}>
                    {checkInStatus === 'all_safe' ? 'All members safe' : checkInStatus === 'pending' ? 'Check-in pending' : 'Some need attention'}
                  </Text>
                </View>
                <Text style={styles.familyCount}>
                  {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.familyButton} 
                onPress={() => navigation.navigate('Family')}
              >
                <Text style={styles.familyButtonText}>View Family</Text>
                <Text style={styles.familyButtonArrow}>›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparedness</Text>
          {isInitialLoad ? (
            <View style={styles.preparednessGrid}>
              {[1, 2, 3].map(i => (
                <View key={i} style={styles.preparednessCard}>
                  <Skeleton width={28} height={28} borderRadius={14} />
                  <Skeleton width="60%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.preparednessGrid}>
              {preparednessCards.map(card => (
                <TouchableOpacity 
                  key={card.id} 
                  style={styles.preparednessCard}
                  onPress={() => navigation.navigate(card.screen)}
                >
                  <Ionicons name={card.icon as any} size={28} color="#6b7280" style={styles.preparednessIcon} />
                  <Text style={styles.preparednessLabel}>{card.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            v1.0 | {isOnline ? 'Online' : 'Offline'}
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
  locationIcon: { marginRight: 8 },
  locationText: { flex: 1, fontSize: 14, color: '#6b7280' },
  locationRefresh: { fontSize: 12, color: '#3b82f6', fontWeight: '500' },
  panicButton: { backgroundColor: '#ef4444', padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 24, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  panicIcon: { marginBottom: 8 },
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
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#374151' },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  badge: { backgroundColor: '#ef4444', minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 2 },
  alertIconBg: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  alertDesc: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  alertArrow: { marginLeft: 8 },
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
  preparednessIcon: { marginBottom: 8 },
  preparednessLabel: { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: 16 },
  footerText: { fontSize: 12, color: '#9ca3af' },
});

export default HomeScreen;
