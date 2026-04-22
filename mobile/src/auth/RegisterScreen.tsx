import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login } from '../store/authSlice';
import { authApi } from './authApi';
import { getApiErrorMessage } from '../services/apiErrors';

export const RegisterScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    barangay: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showLoginSuggestion, setShowLoginSuggestion] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { email, password, confirmPassword, firstName, lastName, phone, barangay } = formData;
    if (!email || !password || !firstName || !lastName) {
      setFormError('Please fill in required fields');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setFormError('');
    setShowLoginSuggestion(false);
    setLoading(true);
    try {
      const response = await authApi.register(formData);
      dispatch(login(response.user));
    } catch (error: any) {
      const message = getApiErrorMessage(error, 'Registration failed');
      const emailExists = /email already exists/i.test(message);
      const phoneExists = /phone number already exists/i.test(message);

      setFormError(
        emailExists
          ? 'This email already has an account. Sign in instead or use a different email.'
          : phoneExists
            ? 'This phone number is already linked to another account. Use a different number.'
            : message
      );
      setShowLoginSuggestion(emailExists);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.contentInner}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Fill in your details</Text>

            <View style={styles.formCard}>
              <View style={styles.form}>
                {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

                <TextInput style={styles.input} placeholder="First Name *" value={formData.firstName} onChangeText={v => updateField('firstName', v)} />
                <TextInput style={styles.input} placeholder="Last Name *" value={formData.lastName} onChangeText={v => updateField('lastName', v)} />
                <TextInput style={styles.input} placeholder="Email *" value={formData.email} onChangeText={v => updateField('email', v)} keyboardType="email-address" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Phone Number" value={formData.phone} onChangeText={v => updateField('phone', v)} keyboardType="phone-pad" autoComplete="tel" />
                <TextInput style={styles.input} placeholder="Barangay" value={formData.barangay} onChangeText={v => updateField('barangay', v)} />
                <TextInput style={styles.input} placeholder="Password *" value={formData.password} onChangeText={v => updateField('password', v)} secureTextEntry />
                <TextInput style={styles.input} placeholder="Confirm Password *" value={formData.confirmPassword} onChangeText={v => updateField('confirmPassword', v)} secureTextEntry />

                <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
                  <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
                </TouchableOpacity>

                {showLoginSuggestion ? (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() =>
                      navigation.navigate('Login', {
                        prefillEmail: formData.email,
                        message: 'This email already exists. Enter your password to sign in.',
                      })
                    }
                  >
                    <Text style={styles.secondaryButtonText}>Go To Sign In</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkHighlight}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  keyboard: { flex: 1 },
  content: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  contentInner: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', color: '#1f2937' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#64748b', marginTop: 8, marginBottom: 20 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  form: { gap: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f9fafb' },
  button: { backgroundColor: '#ef4444', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#fff5f5', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#fecaca' },
  secondaryButtonText: { color: '#b91c1c', fontSize: 15, fontWeight: '600' },
  linkButton: { marginTop: 18, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#64748b' },
  linkHighlight: { color: '#ef4444', fontWeight: '600' },
  errorText: {
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
});
