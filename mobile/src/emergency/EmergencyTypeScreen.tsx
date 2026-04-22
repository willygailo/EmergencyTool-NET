import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { EMERGENCY_TYPES } from '../constants/emergencyTypes';

export const EmergencyTypeScreen = ({ navigation }: any) => {
  const handleSelect = (type: string) => {
    navigation.navigate('VideoReport', { type });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What type of emergency?</Text>
        <Text style={styles.subtitle}>Select the emergency type</Text>

        <View style={styles.grid}>
          {EMERGENCY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.card, { borderColor: type.color }]}
              onPress={() => handleSelect(type.id)}
            >
              <Text style={styles.icon}>{type.icon}</Text>
              <Text style={[styles.label, { color: type.color }]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 24 },
  card: { width: '47%', backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 2, elevation: 2 },
  icon: { fontSize: 32, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
