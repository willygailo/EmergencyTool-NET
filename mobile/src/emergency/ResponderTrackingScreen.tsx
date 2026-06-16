import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { emergencyApi } from './emergencyApi';

export const ResponderTrackingScreen = ({ route }: any) => {
  const { reportId } = route?.params || {};
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reportId) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const data = await emergencyApi.getById(reportId);
        setReport(data);
      } catch (error) {
        console.log('Failed to fetch report status', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [reportId]);

  const getStatusText = () => {
    if (!report) return "Searching for responders...";
    switch (report.status) {
      case 'pending': return "Searching for responders...";
      case 'accepted': return "A responder has accepted your alert.";
      case 'en_route': return "Responder is en route to your location.";
      case 'on_scene': return "Responder is on scene.";
      case 'resolved': return "Emergency resolved.";
      case 'cancelled': return "Emergency cancelled.";
      default: return `Status: ${report.status}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Responder Tracking</Text>
        <Text style={styles.subtitle}>Report ID: {reportId || 'Unknown'}</Text>
        
        <View style={styles.trackingCard}>
          {loading && !report ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : (
            <>
              <Text style={styles.status}>{getStatusText()}</Text>
              {report?.responder && (
                <View style={styles.responderInfo}>
                  <Text style={styles.responderName}>Responder Assigned!</Text>
                </View>
              )}
            </>
          )}
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
  trackingCard: { marginTop: 24, backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 150 },
  status: { fontSize: 18, fontWeight: '600', color: '#3b82f6', textAlign: 'center' },
  responderInfo: { marginTop: 16, padding: 12, backgroundColor: '#eff6ff', borderRadius: 8, width: '100%' },
  responderName: { fontSize: 16, fontWeight: '600', color: '#1e3a8a', textAlign: 'center' },
});

export default ResponderTrackingScreen;