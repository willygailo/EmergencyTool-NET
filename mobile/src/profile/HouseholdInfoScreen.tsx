import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { householdApi } from './householdApi';
import { getApiErrorMessage } from '../services/apiErrors';

const createDefaultForm = () => ({
  address: '',
  members: '1',
  hasPwd: false,
  hasSenior: false,
  hasPregnant: false,
});

export const HouseholdInfoScreen = () => {
  const [form, setForm] = useState(createDefaultForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const loadHousehold = async () => {
      setLoading(true);
      try {
        const household = await householdApi.getHousehold();
        if (household) {
          setForm({
            address: household.address,
            members: String(household.members || 1),
            hasPwd: household.hasPwd,
            hasSenior: household.hasSenior,
            hasPregnant: household.hasPregnant,
          });
          setLastUpdatedAt(household.updatedAt || household.createdAt || null);
        } else {
          setForm(createDefaultForm());
          setLastUpdatedAt(null);
        }
      } catch (error) {
        Alert.alert('Load failed', getApiErrorMessage(error, 'Unable to load household details right now.'));
      } finally {
        setLoading(false);
      }
    };

    void loadHousehold();
  }, []);

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const parsedMembers = Number.parseInt(form.members, 10);

    if (!form.address.trim()) {
      Alert.alert('Missing address', 'Please enter your household address.');
      return;
    }

    if (!Number.isFinite(parsedMembers) || parsedMembers < 1) {
      Alert.alert('Invalid members', 'Number of household members must be at least 1.');
      return;
    }

    setSaving(true);
    try {
      const updatedHousehold = await householdApi.updateHousehold({
        address: form.address.trim(),
        members: parsedMembers,
        hasPwd: form.hasPwd,
        hasSenior: form.hasSenior,
        hasPregnant: form.hasPregnant,
      });

      setForm({
        address: updatedHousehold?.address || form.address.trim(),
        members: String(updatedHousehold?.members || parsedMembers),
        hasPwd: Boolean(updatedHousehold?.hasPwd),
        hasSenior: Boolean(updatedHousehold?.hasSenior),
        hasPregnant: Boolean(updatedHousehold?.hasPregnant),
      });
      setLastUpdatedAt(updatedHousehold?.updatedAt || updatedHousehold?.createdAt || new Date().toISOString());
      Alert.alert('Saved', 'Your household information has been updated.');
    } catch (error) {
      Alert.alert('Save failed', getApiErrorMessage(error, 'Failed to update household information.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Preparedness</Text>
          <Text style={styles.title}>Household Information</Text>
          <Text style={styles.subtitle}>
            Keep this updated so responders can understand your home setup during emergencies.
          </Text>
          {lastUpdatedAt ? (
            <Text style={styles.metaText}>
              Last updated: {new Date(lastUpdatedAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </Text>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#ef4444" />
            <Text style={styles.loadingText}>Loading household details...</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(value) => updateField('address', value)}
                placeholder="Complete address"
                multiline
              />

              <Text style={styles.label}>Number of Members</Text>
              <TextInput
                style={styles.input}
                value={form.members}
                onChangeText={(value) => updateField('members', value.replace(/[^\d]/g, ''))}
                keyboardType="number-pad"
                placeholder="1"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Household Risk Flags</Text>
              <View style={styles.card}>
                <View style={styles.switchRow}>
                  <View style={styles.switchTextWrap}>
                    <Text style={styles.switchLabel}>Has PWD member</Text>
                    <Text style={styles.switchHint}>Important for accessible evacuation and response planning.</Text>
                  </View>
                  <Switch value={form.hasPwd} onValueChange={(value) => updateField('hasPwd', value)} />
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchTextWrap}>
                    <Text style={styles.switchLabel}>Has senior citizen</Text>
                    <Text style={styles.switchHint}>Helps responders prepare mobility and medical support faster.</Text>
                  </View>
                  <Switch value={form.hasSenior} onValueChange={(value) => updateField('hasSenior', value)} />
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchTextWrap}>
                    <Text style={styles.switchLabel}>Has pregnant member</Text>
                    <Text style={styles.switchHint}>Used for priority medical attention if an emergency happens.</Text>
                  </View>
                  <Switch value={form.hasPregnant} onValueChange={(value) => updateField('hasPregnant', value)} />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Household Info'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 32 },
  heroCard: { backgroundColor: '#fff', borderRadius: 18, padding: 20, marginBottom: 18, elevation: 2 },
  eyebrow: { fontSize: 12, fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginTop: 6 },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 21, color: '#6b7280' },
  metaText: { marginTop: 10, fontSize: 12, color: '#9ca3af' },
  loadingCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', elevation: 2 },
  loadingText: { fontSize: 14, color: '#6b7280', marginTop: 12 },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2 },
  label: { fontSize: 13, fontWeight: '600', color: '#4b5563', marginBottom: 6, marginTop: 10 },
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  switchTextWrap: { flex: 1, paddingRight: 12 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  switchHint: { fontSize: 13, lineHeight: 19, color: '#6b7280', marginTop: 4 },
  saveButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default HouseholdInfoScreen;
