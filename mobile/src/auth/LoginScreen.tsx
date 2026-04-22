import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { authApi } from './authApi';
import { getApiErrorMessage } from '../services/apiErrors';

export const LoginScreen = ({ navigation, route }: any) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState(route?.params?.prefillEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(route?.params?.message || '');
  const [rememberedNotice, setRememberedNotice] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadRememberedCredentials = async () => {
      const rememberedCredentials = await authApi.getRememberedCredentials();

      if (!isMounted || !rememberedCredentials) {
        return;
      }

      setEmail((currentEmail: string) => currentEmail || rememberedCredentials.email);
      setPassword((currentPassword: string) => currentPassword || rememberedCredentials.password);
      setRememberedNotice('Saved credentials were loaded securely on this device.');
    };

    loadRememberedCredentials();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (route?.params?.prefillEmail) {
      setEmail(route.params.prefillEmail);
    }

    if (route?.params?.message) {
      setFormError(route.params.message);
    }
  }, [route?.params?.message, route?.params?.prefillEmail]);

  const handleLogin = async () => {
    if (!email || !password) {
      setFormError('Please enter email and password');
      return;
    }

    setFormError('');
    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      dispatch(login(response.user));
    } catch (error: any) {
      setFormError(getApiErrorMessage(error, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={styles.title}>EmergencyTool</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.formCard}>
              <View style={styles.form}>
                {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
                {rememberedNotice ? <Text style={styles.savedInfoText}>{rememberedNotice}</Text> : null}

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="current-password"
                />

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.linkHighlight}>Register</Text>
              </Text>
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
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  title: { fontSize: 34, fontWeight: '800', textAlign: 'center', color: '#ef4444' },
  subtitle: { fontSize: 15, textAlign: 'center', color: '#64748b', marginTop: 8, marginBottom: 24 },
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
  form: { gap: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkButton: { marginTop: 18, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#64748b' },
  linkHighlight: { color: '#ef4444', fontWeight: '700' },
  errorText: {
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  savedInfoText: {
    color: '#065f46',
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
});
