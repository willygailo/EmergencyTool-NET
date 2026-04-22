import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Switch } from 'react-native';

export const HouseholdInfoScreen = ({ navigation }: any) => {
  const [form, setForm] = useState({ address: '', members: '1', hasPwd: false, hasSenior: false, hasPregnant: false });

  const handleSave = async () => {
    alert('Saved successfully');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Household Information</Text>
        
        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={form.address} onChangeText={v => setForm({ ...form, address: v })} placeholder="Complete address" />
        
        <Text style={styles.label}>Number of Members</Text>
        <TextInput style={styles.input} value={form.members} onChangeText={v => setForm({ ...form, members: v })} keyboardType="numeric" />
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Has PWD Member</Text>
          <Switch value={form.hasPwd} onValueChange={v => setForm({ ...form, hasPwd: v })} />
        </View>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Has Senior Citizen</Text>
          <Switch value={form.hasSenior} onValueChange={v => setForm({ ...form, hasSenior: v })} />
        </View>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Has Pregnant Member</Text>
          <Switch value={form.hasPregnant} onValueChange={v => setForm({ ...form, hasPregnant: v })} />
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#d1d5db' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 8, marginTop: 12 },
  switchLabel: { fontSize: 16, color: '#374151' },
  saveButton: { backgroundColor: '#ef4444', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default HouseholdInfoScreen;