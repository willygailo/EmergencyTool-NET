import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export const ResponderTrackingScreen = ({ route }: any) => {
  const { reportId } = route?.params || {};
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Responder Tracking</Text>
        <Text style={styles.subtitle}>Report: {reportId}</Text>
        <View style={styles.trackingCard}>
          <Text style={styles.status}>Searching for responders...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  trackingCard: { marginTop: 24, backgroundColor: '#fff', padding: 24, borderRadius: 12 },
  status: { fontSize: 16, color: '#666', textAlign: 'center' },
});
export default ResponderTrackingScreen;