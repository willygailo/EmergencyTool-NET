import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateUser } from '../store/authSlice';
import { authApi } from '../auth/authApi';
import { useNotifications } from '../hooks/useNotifications';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { loadProfileAvatar } from './profileAvatarStorage';
import { APP_VERSION } from './profileContent';

export const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const { unreadCount } = useNotifications();
  const { isOnline, pendingCount } = useOfflineStorage();
  const [storedAvatar, setStoredAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatar = async () => {
      const avatarUri = await loadProfileAvatar();
      setStoredAvatar(avatarUri);
      if (avatarUri && user && !user.avatarUri) {
        dispatch(updateUser({ avatarUri }));
      }
    };

    loadAvatar();
  }, [dispatch, user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await authApi.logout();
            dispatch(logout());
          }
        }
      ]
    );
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: '⚙️', label: 'Profile Settings', screen: 'ProfileSettings', badge: null },
        { icon: '🏠', label: 'Household Info', screen: 'HouseholdInfo', badge: null },
        { icon: '👨‍👩‍👧', label: 'Family Members', screen: 'FamilySafety', badge: null },
      ]
    },
    {
      title: 'Settings',
      items: [
        { icon: '🔔', label: 'Notifications', screen: 'NotificationsCenter', badge: unreadCount > 0 ? unreadCount : null },
        { icon: '🔒', label: 'Privacy & Security', screen: 'PrivacySecurity', badge: null },
        { icon: '📶', label: isOnline ? 'Connection: Online' : 'Connection: Offline', screen: 'ConnectionStatus', badge: null },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: '❓', label: 'Help & FAQ', screen: 'HelpFaq', badge: null },
        { icon: '📞', label: 'Contact Support', screen: 'ContactSupport', badge: null },
        { icon: 'ℹ️', label: 'About', screen: 'AboutApp', badge: null },
      ]
    },
  ];

  const userInitials = user?.firstName 
    ? `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase() 
    : 'U';
  const avatarUri = user?.avatarUri || storedAvatar;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.userCard}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.firstName || 'User'} {user?.lastName || ''}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.userStatus}>
              <View style={[styles.statusDot, { backgroundColor: isOnline ? '#22c55e' : '#f59e0b' }]} />
              <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
              {pendingCount > 0 && (
                <Text style={styles.pendingText}>• {pendingCount} pending</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.familyMembers?.length || 0}</Text>
            <Text style={styles.statLabel}>Family</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.emergenciesReported || 0}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.alertsReceived || 0}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>

        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex} 
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && styles.menuItemBorder
                  ]}
                  onPress={() => {
                    if (item.screen) {
                      navigation.navigate(item.screen);
                    }
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Text style={styles.menuArrow}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>EmergencyTool v{APP_VERSION}</Text>
          <Text style={styles.footerText}>Emergency support, family safety, and preparedness in one app.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 32, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  userCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, elevation: 2 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarImage: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  userEmail: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  userStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: '#6b7280' },
  pendingText: { fontSize: 12, color: '#f59e0b', marginLeft: 4 },
  statsRow: { backgroundColor: '#fff', padding: 16, borderRadius: 16, flexDirection: 'row', marginBottom: 20, elevation: 2 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#e5e7eb' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8, marginLeft: 4 },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { fontSize: 16, color: '#1f2937' },
  menuItemRight: { flexDirection: 'row', alignItems: 'center' },
  badge: { backgroundColor: '#ef4444', minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8, paddingHorizontal: 6 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  menuArrow: { fontSize: 20, color: '#9ca3af' },
  logoutButton: { backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9ca3af' },
});

export default ProfileScreen;
