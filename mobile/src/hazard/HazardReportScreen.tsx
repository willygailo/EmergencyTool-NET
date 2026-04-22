import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocation } from '../hooks/useLocation';
import { hazardApi } from './hazardApi';

const HAZARD_TYPES = [
  { id: 'flood', label: 'Flood', icon: '🌊' },
  { id: 'fire', label: 'Fire', icon: '🔥' },
  { id: 'landslide', label: 'Landslide', icon: '⛰️' },
  { id: 'road_damage', label: 'Road Damage', icon: '🛣️' },
  { id: 'downed_power', label: 'Downed Power', icon: '⚡' },
  { id: 'other', label: 'Other', icon: '⚠️' },
];

export const HazardReportScreen = ({ navigation }: any) => {
  const { location } = useLocation();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!type) {
      Alert.alert('Error', 'Please select a hazard type');
      return;
    }
    if (!description) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    setLoading(true);
    try {
      await hazardApi.reportHazard({
        type,
        description,
        latitude: location.latitude,
        longitude: location.longitude,
        photoUri: photoUri || undefined,
      });
      Alert.alert('Success', 'Hazard reported successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to report hazard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Report Hazard</Text>
        <Text style={styles.subtitle}>Help your community by reporting hazards</Text>

        <Text style={styles.label}>Hazard Type</Text>
        <View style={styles.typeGrid}>
          {HAZARD_TYPES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.typeButton, type === item.id && styles.typeButtonSelected]}
              onPress={() => setType(item.id)}
            >
              <Text style={styles.typeIcon}>{item.icon}</Text>
              <Text style={[styles.typeLabel, type === item.id && styles.typeLabelSelected]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the hazard in detail..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Photo (Optional)</Text>
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          {photoUri ? (
            <Text style={styles.photoSelected}>✓ Photo attached</Text>
          ) : (
            <Text style={styles.photoPlaceholder}>📷 Take Photo</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Submit Report'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  typeButton: { width: '31%', backgroundColor: '#fff', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  typeButtonSelected: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  typeIcon: { fontSize: 24, marginBottom: 4 },
  typeLabel: { fontSize: 12, color: '#666' },
  typeLabelSelected: { color: '#ef4444', fontWeight: '600' },
  textArea: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', height: 120, textAlignVertical: 'top', marginBottom: 16 },
  photoButton: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', alignItems: 'center', marginBottom: 24 },
  photoPlaceholder: { color: '#666' },
  photoSelected: { color: '#22c55e', fontWeight: '600' },
  submitButton: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default HazardReportScreen;