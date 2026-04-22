import React from 'react';
import { Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SUPPORT_EMAIL, SUPPORT_PHONE } from './profileContent';

const openExternalLink = async (url: string, errorTitle: string, errorMessage: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      throw new Error('Unsupported URL');
    }

    await Linking.openURL(url);
  } catch {
    Alert.alert(errorTitle, errorMessage);
  }
};

export const ContactSupportScreen = ({ navigation }: any) => {
  const handleEmailSupport = async () => {
    await openExternalLink(
      `mailto:${SUPPORT_EMAIL}?subject=EmergencyTool%20Support`,
      'Email unavailable',
      'No email app is available on this device right now.'
    );
  };

  const handleCallHotline = async () => {
    await openExternalLink(
      `tel:${SUPPORT_PHONE}`,
      'Call unavailable',
      'Phone calling is not available on this device.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Support</Text>
          <Text style={styles.heroTitle}>Contact Support</Text>
          <Text style={styles.heroDescription}>
            Reach support by email for account and app questions, or use the hotline immediately if this is an active emergency.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Email Support</Text>
          <Text style={styles.bodyText}>{SUPPORT_EMAIL}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleEmailSupport}>
            <Text style={styles.primaryButtonText}>Open Email App</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emergency Hotline</Text>
          <Text style={styles.bodyText}>
            If you need urgent real-world assistance right now, use your local emergency hotline instead of waiting for email support.
          </Text>
          <Text style={styles.hotlineText}>{SUPPORT_PHONE}</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleCallHotline}>
            <Text style={styles.secondaryButtonText}>Call Hotline</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Self-service Options</Text>
          <Text style={styles.bodyText}>
            You can also review answers in Help & FAQ or check About for build and environment details.
          </Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('HelpFaq')}>
            <Text style={styles.secondaryButtonText}>Open Help & FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('AboutApp')}>
            <Text style={styles.secondaryButtonText}>Open About</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 32 },
  heroCard: { backgroundColor: '#fff', borderRadius: 18, padding: 20, marginBottom: 18, elevation: 2 },
  eyebrow: { fontSize: 12, fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#111827', marginTop: 6 },
  heroDescription: { marginTop: 8, fontSize: 14, lineHeight: 21, color: '#6b7280' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  bodyText: { fontSize: 14, lineHeight: 21, color: '#4b5563', marginTop: 8 },
  hotlineText: { fontSize: 24, fontWeight: '700', color: '#b91c1c', marginTop: 10 },
  primaryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: '#b91c1c', fontSize: 15, fontWeight: '600' },
});

export default ContactSupportScreen;
