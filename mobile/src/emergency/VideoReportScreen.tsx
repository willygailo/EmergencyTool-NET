import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useLocation } from '../hooks/useLocation';
import { getApiErrorMessage } from '../services/apiErrors';
import { getEmergencyTypeById } from '../constants/emergencyTypes';
import { emergencyApi } from './emergencyApi';
import { useOfflineDetector } from '../offline/OfflineDetector';
import { queueEmergency } from '../offline/SyncQueue';
import * as SMS from 'expo-sms';
type MediaAsset = {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
};

const isWeb = Platform.OS === 'web';

export const VideoReportScreen = ({ navigation, route }: any) => {
  const { type } = route?.params || {};
  const emergencyType = useMemo(() => getEmergencyTypeById(type), [type]);
  const { location, loading: loadingLocation, error: locationError, refreshLocation } = useLocation();
  const [photo, setPhoto] = useState<MediaAsset | null>(null);
  const [video, setVideo] = useState<MediaAsset | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const { isOnline } = useOfflineDetector();

  const requestCameraAccess = async () => {
    if (isWeb) {
      return true;
    }

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to capture evidence.');
      return false;
    }

    return true;
  };

  const pickMedia = async (kind: 'photo' | 'video') => {
    try {
      const canOpenCamera = await requestCameraAccess();
      if (!canOpenCamera) {
        return;
      }

      const picker = isWeb ? ImagePicker.launchImageLibraryAsync : ImagePicker.launchCameraAsync;
      const result = await picker({
        mediaTypes:
          kind === 'photo'
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: kind === 'photo',
        quality: 0.7,
        videoMaxDuration: 30,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const nextAsset = {
        uri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
      };

      if (kind === 'photo') {
        setPhoto(nextAsset);
        return;
      }

      setVideo(nextAsset);
    } catch (error) {
      Alert.alert('Capture failed', 'Failed to capture media. Please try again.');
    }
  };

  const handleSendReport = async () => {
    if (!photo && !video) {
      Alert.alert('Add evidence', 'Capture at least one photo or video before sending.');
      return;
    }

    if (!location) {
      Alert.alert('Location required', 'Please wait for your location, then try again.');
      return;
    }

    setUploading(true);
    try {
      const payload = {
        type: emergencyType.id,
        description: description.trim() || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        photoUri: photo?.uri,
        photoName: photo?.fileName || 'emergency_photo.jpg',
        photoType: photo?.mimeType || 'image/jpeg',
        videoUri: video?.uri,
        videoName: video?.fileName || 'emergency_video.mp4',
        videoType: video?.mimeType || 'video/mp4',
      };

      if (!isOnline) {
        // Handle Offline Flow
        await queueEmergency('EMERGENCY_REPORT', payload);
        
        // SMS Fallback
        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
          Alert.alert(
            'Offline Mode',
            'Your report is saved and will auto-sync when internet is restored. Do you want to send an emergency SMS now?',
            [
              { text: 'No', style: 'cancel', onPress: () => navigateToSent() },
              { text: 'Yes, Send SMS', onPress: async () => {
                  await SMS.sendSMSAsync(
                    ['911'], // Replace with actual emergency number or contact
                    `EMERGENCY [${emergencyType.label}]: I need help! My location: https://maps.google.com/?q=${location.latitude},${location.longitude} ${description ? ' - ' + description : ''}`
                  );
                  navigateToSent();
                } 
              }
            ]
          );
        } else {
          Alert.alert('Offline Mode', 'Your report is saved locally and will auto-sync when internet is restored.');
          navigateToSent();
        }
      } else {
        // Handle Online Flow
        const result = await emergencyApi.report(payload);
        navigateToSent(result?.id);
      }
    } catch (error) {
      Alert.alert('Send failed', getApiErrorMessage(error, 'Failed to submit report.'));
    } finally {
      setUploading(false);
    }
  };

  const navigateToSent = (reportId?: string) => {
    navigation.replace('AlertSent', {
      type: emergencyType.id,
      reportId: reportId,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={[styles.heroIcon, { color: emergencyType.color }]}>{emergencyType.icon}</Text>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>{emergencyType.label}</Text>
            <Text style={styles.heroSubtitle}>
              Capture photo or video evidence, then tap send to notify the admin dashboard immediately.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Capture Evidence</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.captureButton, { borderColor: emergencyType.color }]} onPress={() => pickMedia('photo')}>
              <Text style={styles.captureTitle}>{isWeb ? 'Choose Photo' : 'Capture Photo'}</Text>
              <Text style={styles.captureSubtitle}>PNG or JPG evidence</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.captureButton, { borderColor: emergencyType.color }]} onPress={() => pickMedia('video')}>
              <Text style={styles.captureTitle}>{isWeb ? 'Choose Video' : 'Capture Video'}</Text>
              <Text style={styles.captureSubtitle}>Up to 30 seconds</Text>
            </TouchableOpacity>
          </View>

          {photo && (
            <View style={styles.mediaCard}>
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
              <View style={styles.mediaTextWrap}>
                <Text style={styles.mediaTitle}>Photo ready</Text>
                <Text style={styles.mediaSubtitle}>{photo.fileName || 'Captured image evidence'}</Text>
              </View>
              <TouchableOpacity onPress={() => setPhoto(null)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {video && (
            <View style={styles.mediaCard}>
              <View style={[styles.videoBadge, { backgroundColor: `${emergencyType.color}18` }]}>
                <Text style={styles.videoBadgeText}>VIDEO</Text>
              </View>
              <View style={styles.mediaTextWrap}>
                <Text style={styles.mediaTitle}>Video ready</Text>
                <Text style={styles.mediaSubtitle}>{video.fileName || 'Captured video evidence'}</Text>
              </View>
              <TouchableOpacity onPress={() => setVideo(null)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          {loadingLocation ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color={emergencyType.color} />
              <Text style={styles.locationLoadingText}>Getting your current location...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.locationLabel}>Address</Text>
              <Text style={styles.locationValue}>{location?.address || 'Location not available yet.'}</Text>
              <Text style={styles.locationLabel}>Coordinates</Text>
              <Text style={styles.locationValue}>
                {location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Waiting for GPS...'}
              </Text>
              {(locationError || !location) && (
                <TouchableOpacity style={styles.refreshLocationButton} onPress={refreshLocation}>
                  <Text style={styles.refreshLocationText}>Refresh Location</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Optional: tell the admin what happened..."
            multiline
            numberOfLines={4}
            style={styles.descriptionInput}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, uploading && styles.sendButtonDisabled]}
          onPress={handleSendReport}
          disabled={uploading}
        >
          {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.sendButtonText}>Send Report Now</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 32, gap: 16, width: '100%', maxWidth: 560, alignSelf: 'center' },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  heroIcon: { fontSize: 42 },
  heroTextWrap: { flex: 1 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 14 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  captureButton: {
    flex: 1,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: '#f8fafc',
  },
  captureTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  captureSubtitle: { fontSize: 12, color: '#64748b' },
  mediaCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoPreview: { width: 68, height: 68, borderRadius: 12, backgroundColor: '#e2e8f0' },
  mediaTextWrap: { flex: 1 },
  mediaTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  mediaSubtitle: { fontSize: 12, color: '#64748b' },
  removeText: { fontSize: 12, fontWeight: '700', color: '#dc2626' },
  videoBadge: {
    width: 68,
    height: 68,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBadgeText: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  locationLoading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationLoadingText: { fontSize: 14, color: '#64748b' },
  locationLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  locationValue: { fontSize: 14, color: '#0f172a', marginBottom: 10, lineHeight: 20 },
  refreshLocationButton: { alignSelf: 'flex-start', marginTop: 4 },
  refreshLocationText: { color: '#2563eb', fontSize: 13, fontWeight: '700' },
  descriptionInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  sendButton: {
    backgroundColor: '#dc2626',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  sendButtonDisabled: { opacity: 0.75 },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default VideoReportScreen;
