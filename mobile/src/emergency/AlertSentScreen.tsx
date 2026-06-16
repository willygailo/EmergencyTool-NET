import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { getEmergencyTypeById } from '../constants/emergencyTypes';

export const AlertSentScreen = ({ navigation, route }: any) => {
  const { type, reportId } = route.params || {};
  const { location } = useLocation();
  const [progress] = useState(new Animated.Value(0));
  const [sent, setSent] = useState(false);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      setSent(true);
    });
  }, []);

  const getEmergencyInfo = () => {
    const emergency = getEmergencyTypeById(type);
    return {
      icon: emergency.icon,
      label: emergency.label,
      color: emergency.color,
    };
  };

  const emergencyInfo = getEmergencyInfo();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {!sent ? (
          <>
            <View style={[styles.iconContainer, { backgroundColor: emergencyInfo.color + '20' }]}>
              <Text style={styles.icon}>{emergencyInfo.icon}</Text>
            </View>
            
            <Text style={styles.title}>Sending Alert...</Text>
            <Text style={styles.subtitle}>
              Connecting to emergency responders
            </Text>

            <View style={styles.progressContainer}>
              <Animated.View 
                style={[
                  styles.progressBar, 
                  { 
                    backgroundColor: emergencyInfo.color,
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]} 
              />
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Alert Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type:</Text>
                <Text style={styles.infoValue}>{emergencyInfo.label}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {location?.address || 'Getting location...'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Coordinates:</Text>
                <Text style={styles.infoValue}>
                  {location ? `${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}` : '...'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.successIconContainer, { backgroundColor: '#22c55e20' }]}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            
            <Text style={styles.successTitle}>Alert Sent!</Text>
            <Text style={styles.successSubtitle}>
              Emergency responders have been notified
            </Text>

            <View style={styles.responseCard}>
              <Text style={styles.responseTitle}>What happens next?</Text>
              <View style={styles.responseItem}>
                <Text style={styles.responseNumber}>1</Text>
                <Text style={styles.responseText}>Responders are being dispatched to your location</Text>
              </View>
              <View style={styles.responseItem}>
                <Text style={styles.responseNumber}>2</Text>
                <Text style={styles.responseText}>Stay on the line if you received a call</Text>
              </View>
              <View style={styles.responseItem}>
                <Text style={styles.responseNumber}>3</Text>
                <Text style={styles.responseText}>Track responder arrival in real-time</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.trackButton}
              onPress={() => navigation.navigate('ResponderTracking', { reportId })}
            >
              <Text style={styles.trackButtonText}>📍 Track Responders</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.homeButton}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.homeButtonText}>← Back to Home</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  iconContainer: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  icon: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 32 },
  progressContainer: { width: '100%', height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 32, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  infoCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, width: '100%', elevation: 2 },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#6b7280' },
  infoValue: { fontSize: 14, color: '#1f2937', fontWeight: '500', flex: 1, textAlign: 'right' },
  successIconContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successIcon: { fontSize: 40, color: '#22c55e' },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  successSubtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  responseCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, width: '100%', marginBottom: 24, elevation: 2 },
  responseTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 16 },
  responseItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  responseNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#3b82f6', color: '#fff', textAlign: 'center', lineHeight: 24, fontSize: 14, fontWeight: 'bold', marginRight: 12 },
  responseText: { flex: 1, fontSize: 14, color: '#374151' },
  trackButton: { backgroundColor: '#3b82f6', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
  trackButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  homeButton: { paddingVertical: 12 },
  homeButtonText: { color: '#6b7280', fontSize: 16 },
});

export default AlertSentScreen;
