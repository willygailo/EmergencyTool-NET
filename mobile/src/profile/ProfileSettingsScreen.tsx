import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { authApi } from '../auth/authApi';
import { getApiErrorMessage } from '../services/apiErrors';
import { logout, updateUser } from '../store/authSlice';
import type { RootState } from '../store/store';
import { useNotifications } from '../hooks/useNotifications';
import { useOfflineStorage } from '../hooks/useOfflineStorage';
import { loadProfileAvatar, removeProfileAvatar, saveProfileAvatar } from './profileAvatarStorage';

const normalizeProfile = (profile: any, avatarUri?: string | null) => ({
  id: profile?.id,
  email: profile?.email || '',
  firstName: profile?.firstName || profile?.first_name || '',
  lastName: profile?.lastName || profile?.last_name || '',
  phone: profile?.phone || '',
  barangay: profile?.barangay || '',
  role: profile?.role || 'user',
  avatarUri: avatarUri ?? profile?.avatarUri ?? null,
});

export const ProfileSettingsScreen = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { permissionStatus, expoPushToken, unreadCount } = useNotifications();
  const { isOnline, pendingCount, isSyncing, clearAllPending } = useOfflineStorage();

  const [profileForm, setProfileForm] = useState(() => normalizeProfile(authUser));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const storedAvatar = await loadProfileAvatar();
        const data = await authApi.getProfile();
        const normalized = normalizeProfile(data, storedAvatar || authUser?.avatarUri);
        setProfileForm(normalized);
        dispatch(updateUser(normalized));
      } catch {
        const storedAvatar = await loadProfileAvatar();
        const normalized = normalizeProfile(authUser, storedAvatar || authUser?.avatarUri);
        setProfileForm(normalized);
        dispatch(updateUser(normalized));
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [authUser, dispatch]);

  const updateProfileField = (field: string, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const updatePasswordField = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!profileForm.firstName || !profileForm.lastName) {
      Alert.alert('Missing fields', 'First name and last name are required.');
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await authApi.updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        barangay: profileForm.barangay,
      });
      const normalized = normalizeProfile(updated, profileForm.avatarUri);
      setProfileForm(normalized);
      dispatch(updateUser(normalized));
      Alert.alert('Saved', 'Your profile settings have been updated.');
    } catch (error) {
      Alert.alert('Update failed', getApiErrorMessage(error, 'Failed to update profile.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePickAvatar = async () => {
    setSavingAvatar(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo access to choose a custom profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';
      const isSupportedFormat = /image\/(jpeg|jpg|png)/i.test(mimeType);

      if (!isSupportedFormat) {
        Alert.alert('Unsupported file', 'Please choose a PNG or JPG image.');
        return;
      }

      const avatarUri = asset.base64
        ? `data:${mimeType};base64,${asset.base64}`
        : asset.uri;

      await saveProfileAvatar(avatarUri);
      setProfileForm((prev) => ({ ...prev, avatarUri }));
      dispatch(updateUser({ avatarUri }));
      Alert.alert('Updated', 'Your profile picture has been updated.');
    } catch (error) {
      Alert.alert('Avatar update failed', getApiErrorMessage(error, 'Failed to update profile picture.'));
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profileForm.avatarUri) {
      return;
    }

    Alert.alert('Remove picture', 'Remove your current profile picture?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeProfileAvatar();
          setProfileForm((prev) => ({ ...prev, avatarUri: null }));
          dispatch(updateUser({ avatarUri: null }));
        },
      },
    ]);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Missing fields', 'Complete all password fields first.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      Alert.alert('Weak password', 'New password must be at least 8 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      Alert.alert('Success', 'Password changed successfully.');
    } catch (error) {
      Alert.alert('Password update failed', getApiErrorMessage(error, 'Failed to change password.'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleClearPending = async () => {
    Alert.alert('Clear offline queue', 'Remove all pending offline items?', [
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

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@emergencytool.local?subject=EmergencyTool%20Support').catch(() => {
      Alert.alert('Support', 'Support email client is not available on this device.');
    });
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authApi.logout();
          dispatch(logout());
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            {profileForm.avatarUri ? (
              <Image source={{ uri: profileForm.avatarUri }} style={styles.heroAvatarImage} />
            ) : (
              <View style={styles.heroAvatarFallback}>
                <Text style={styles.heroAvatarText}>
                  {`${profileForm.firstName?.[0] || 'U'}${profileForm.lastName?.[0] || ''}`.toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Profile Settings</Text>
              <Text style={styles.heroSubtitle}>
                Manage your picture, account details, security, app status, and support options.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            {loadingProfile ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <>
                <Text style={styles.label}>Profile Picture</Text>
                <View style={styles.avatarEditor}>
                  {profileForm.avatarUri ? (
                    <Image source={{ uri: profileForm.avatarUri }} style={styles.avatarPreview} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarPlaceholderText}>
                        {`${profileForm.firstName?.[0] || 'U'}${profileForm.lastName?.[0] || ''}`.toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.avatarActions}>
                    <TouchableOpacity
                      style={[styles.primaryButton, styles.avatarButton, savingAvatar && styles.buttonDisabled]}
                      onPress={handlePickAvatar}
                      disabled={savingAvatar}
                    >
                      <Text style={styles.primaryButtonText}>
                        {savingAvatar ? 'Opening...' : 'Choose PNG / JPG'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.secondaryButton, styles.avatarButton, !profileForm.avatarUri && styles.buttonDisabled]}
                      onPress={handleRemoveAvatar}
                      disabled={!profileForm.avatarUri}
                    >
                      <Text style={styles.secondaryButtonText}>Remove Picture</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={profileForm.firstName}
                  onChangeText={(value) => updateProfileField('firstName', value)}
                  placeholder="First name"
                />

                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={profileForm.lastName}
                  onChangeText={(value) => updateProfileField('lastName', value)}
                  placeholder="Last name"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={profileForm.email}
                  editable={false}
                  placeholder="Email"
                />

                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={profileForm.phone}
                  onChangeText={(value) => updateProfileField('phone', value)}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                />

                <Text style={styles.label}>Barangay</Text>
                <TextInput
                  style={styles.input}
                  value={profileForm.barangay}
                  onChangeText={(value) => updateProfileField('barangay', value)}
                  placeholder="Barangay"
                />

                <TouchableOpacity
                  style={[styles.primaryButton, savingProfile && styles.buttonDisabled]}
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                >
                  <Text style={styles.primaryButtonText}>
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={passwordForm.currentPassword}
              onChangeText={(value) => updatePasswordField('currentPassword', value)}
              placeholder="Current password"
              secureTextEntry
            />

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={passwordForm.newPassword}
              onChangeText={(value) => updatePasswordField('newPassword', value)}
              placeholder="New password"
              secureTextEntry
            />

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={passwordForm.confirmPassword}
              onChangeText={(value) => updatePasswordField('confirmPassword', value)}
              placeholder="Confirm new password"
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryButton, savingPassword && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={savingPassword}
            >
              <Text style={styles.primaryButtonText}>
                {savingPassword ? 'Updating...' : 'Change Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Status</Text>
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Notifications</Text>
              <Text style={styles.statusValue}>{permissionStatus}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Unread Alerts</Text>
              <Text style={styles.statusValue}>{unreadCount}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Connection</Text>
              <Text style={styles.statusValue}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Offline Queue</Text>
              <Text style={styles.statusValue}>
                {isSyncing ? 'Syncing...' : `${pendingCount} pending`}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Push Token</Text>
              <Text style={styles.statusValue}>{expoPushToken ? 'Registered' : 'Unavailable'}</Text>
            </View>

            {pendingCount > 0 ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleClearPending}>
                <Text style={styles.secondaryButtonText}>Clear Offline Queue</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & About</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoTitle}>EmergencyTool</Text>
              <Text style={styles.infoDescription}>Version 1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoTitle}>Privacy & Security</Text>
              <Text style={styles.infoDescription}>
                Your profile changes are saved to the secured backend account service.
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoTitle}>Help</Text>
              <Text style={styles.infoDescription}>
                Use this screen to update account info, change password, and review app status.
              </Text>
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleContactSupport}>
              <Text style={styles.secondaryButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 32 },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    elevation: 2,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroTextWrap: { flex: 1 },
  heroAvatarImage: { width: 72, height: 72, borderRadius: 36, marginRight: 16 },
  heroAvatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarText: { color: '#fff', fontSize: 26, fontWeight: '700' },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#1f2937' },
  heroSubtitle: { marginTop: 6, fontSize: 14, color: '#6b7280', lineHeight: 20 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2 },
  label: { fontSize: 13, fontWeight: '600', color: '#4b5563', marginBottom: 6, marginTop: 10 },
  avatarEditor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  avatarPreview: { width: 88, height: 88, borderRadius: 44, marginRight: 14 },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginRight: 14,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  avatarActions: { flex: 1, gap: 10 },
  avatarButton: { marginTop: 0 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  readOnlyInput: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  primaryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  secondaryButtonText: { color: '#b91c1c', fontSize: 15, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statusLabel: { fontSize: 15, color: '#374151' },
  statusValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  infoRow: { marginBottom: 14 },
  infoTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  infoDescription: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
  logoutButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ProfileSettingsScreen;
