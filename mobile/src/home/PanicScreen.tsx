import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

export const PanicScreen = ({ navigation }: any) => {
  const [sending, setSending] = React.useState(false);

  const handlePanic = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSending(true);
    try {
      navigation.replace('EmergencyType');
    } catch (error) {
      Alert.alert('Error', 'Failed to send alert');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PANIC MODE</Text>
        <Text style={styles.subtitle}>Press the button below to send an emergency alert immediately</Text>
        
        <TouchableOpacity 
          style={[styles.panicButton, sending && styles.buttonDisabled]} 
          onPress={handlePanic}
          disabled={sending}
          activeOpacity={0.7}
        >
          <Text style={styles.panicText}>SEND ALERT</Text>
        </TouchableOpacity>

        <Text style={styles.note}>Your location will be automatically included</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ef4444' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 4 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 16, marginBottom: 48 },
  panicButton: { backgroundColor: '#fff', width: 200, height: 200, borderRadius: 100, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  buttonDisabled: { opacity: 0.6 },
  panicText: { fontSize: 20, fontWeight: 'bold', color: '#ef4444', letterSpacing: 2 },
  note: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 32 },
});