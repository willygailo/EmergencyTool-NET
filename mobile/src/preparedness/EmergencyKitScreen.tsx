import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const EMERGENCY_KIT_ITEMS = [
  { category: 'Documents', items: ['Valid IDs', 'Birth Certificate', 'Marriage Contract', 'Insurance Papers'] },
  { category: 'Food & Water', items: ['3-day supply of water (3L per person)', 'Canned goods & dried food', 'Water purification tablets', 'Can opener'] },
  { category: 'First Aid', items: ['First aid kit', 'Prescription medicines', 'Antiseptic', 'Bandages & gauze', 'Pain relievers'] },
  { category: 'Tools', items: ['Flashlight & extra batteries', 'Portable radio', 'Multi-tool/knife', 'Whistle', 'Duct tape'] },
  { category: 'Hygiene', items: ['Toilet paper', 'Wet wipes', 'Hand sanitizer', 'Face masks', 'Soap'] },
  { category: 'Special Needs', items: ['Infant formula & diapers', 'Elderly medications', 'Pet supplies', 'Cash'] },
];

export const EmergencyKitScreen = ({ navigation }: any) => {
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({});

  const toggleItem = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const progress = Object.values(checkedItems).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Emergency Kit</Text>
        <Text style={styles.subtitle}>Prepare your family's emergency supply kit</Text>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Your Kit Readiness</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(progress / 20) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}/20 items prepared</Text>
        </View>

        {EMERGENCY_KIT_ITEMS.map((category) => (
          <View key={category.category} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.category}</Text>
            {category.items.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.itemRow}
                onPress={() => toggleItem(item)}
              >
                <View style={[styles.checkbox, checkedItems[item] && styles.checkboxChecked]}>
                  {checkedItems[item] && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.itemText, checkedItems[item] && styles.itemTextChecked]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  progressCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 24 },
  progressLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 4 },
  progressText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  category: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  categoryTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#d1d5db', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  itemText: { fontSize: 14, color: '#374151', flex: 1 },
  itemTextChecked: { textDecorationLine: 'line-through', color: '#9ca3af' },
});

export default EmergencyKitScreen;