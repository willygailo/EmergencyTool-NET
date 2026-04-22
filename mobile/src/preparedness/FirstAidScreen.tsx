import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const FIRST_AID_GUIDES = [
  {
    id: 'bleeding',
    title: 'Bleeding & Wounds',
    icon: '🩸',
    steps: [
      'Apply direct pressure with a clean cloth',
      'Elevate the injured area above the heart',
      'Do not remove the cloth if blood soaks through',
      'Apply antibiotic ointment if available',
      'Cover with a sterile bandage',
      'Seek medical help for deep wounds',
    ],
  },
  {
    id: 'burns',
    title: 'Burns',
    icon: '🔥',
    steps: [
      'Cool the burn under running water for 10-20 minutes',
      'Do not use ice or very cold water',
      'Remove jewelry or tight items before swelling',
      'Cover with a sterile, non-stick bandage',
      'Do not pop blisters',
      'Seek medical help for serious burns',
    ],
  },
  {
    id: 'cpr',
    title: 'CPR (Cardiopulmonary Resuscitation)',
    icon: '💓',
    steps: [
      'Check if the person is responsive',
      'Call emergency services (911)',
      'Place person on their back',
      'Place heel of hand on center of chest',
      'Push hard and fast (2 inches deep, 100-120 compressions/min)',
      'Give 2 rescue breaths after 30 compressions',
      'Continue until help arrives',
    ],
  },
  {
    id: 'choking',
    title: 'Choking',
    icon: '😰',
    steps: [
      'Ask "Are you choking?" - if they cannot speak, cough, or breathe',
      'Stand behind the person',
      'Make a fist with one hand',
      'Place fist above the navel, below the ribcage',
      'Grasp fist with other hand',
      'Give quick upward thrusts',
      'Repeat until object is expelled or person becomes unconscious',
    ],
  },
  {
    id: 'fracture',
    title: 'Fractures & Broken Bones',
    icon: '🦴',
    steps: [
      'Do not move the injured area',
      'Immobilize the broken bone with a splint',
      'Apply ice wrapped in cloth to reduce swelling',
      'Do not try to realign the bone',
      'Seek immediate medical attention',
      'Keep person warm and comfortable',
    ],
  },
  {
    id: 'shock',
    title: 'Shock',
    icon: '⚡',
    steps: [
      'Call emergency services immediately',
      'Lay person on their back',
      'Elevate legs about 12 inches (if no spinal injury)',
      'Keep person warm with a blanket',
      'Do not give food or drink',
      'Monitor breathing and be ready for CPR',
    ],
  },
];

export const FirstAidScreen = ({ navigation }: any) => {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const activeGuide = FIRST_AID_GUIDES.find(g => g.id === selectedGuide);

  if (activeGuide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guideHeader}>
          <TouchableOpacity onPress={() => setSelectedGuide(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.guideTitle}>{activeGuide.icon} {activeGuide.title}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.guideContent}>
          {activeGuide.steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>First Aid Guide</Text>
        <Text style={styles.subtitle}>Step-by-step emergency instructions</Text>

        {FIRST_AID_GUIDES.map((guide) => (
          <TouchableOpacity
            key={guide.id}
            style={styles.guideCard}
            onPress={() => setSelectedGuide(guide.id)}
          >
            <Text style={styles.guideIcon}>{guide.icon}</Text>
            <View style={styles.guideInfo}>
              <Text style={styles.guideName}>{guide.title}</Text>
              <Text style={styles.guideDesc}>{guide.steps.length} steps</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  guideCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  guideIcon: { fontSize: 32, marginRight: 16 },
  guideInfo: { flex: 1 },
  guideName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  guideDesc: { fontSize: 14, color: '#666' },
  arrow: { fontSize: 20, color: '#666' },
  guideHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { color: '#3b82f6', fontSize: 16, marginRight: 16 },
  guideTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', flex: 1 },
  guideContent: { padding: 16 },
  stepCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepNumberText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  stepText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
});

export default FirstAidScreen;