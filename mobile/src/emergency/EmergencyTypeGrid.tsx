import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EMERGENCY_TYPES } from '../constants/emergencyTypes';

export const EmergencyTypeGrid = ({ selected, onSelect }: { selected?: string; onSelect: (id: string) => void }) => {
  return (
    <View style={styles.grid}>
      {EMERGENCY_TYPES.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[styles.item, selected === type.id && styles.selected]}
          onPress={() => onSelect(type.id)}
        >
          <Text style={styles.icon}>{type.icon}</Text>
          <Text style={[styles.label, selected === type.id && styles.selectedLabel]}>{type.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { width: '47%', padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#f3f4f6' },
  selected: { backgroundColor: '#fef2f2', borderWidth: 2, borderColor: '#ef4444' },
  icon: { fontSize: 28, marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', textAlign: 'center' },
  selectedLabel: { color: '#ef4444' },
});
export default EmergencyTypeGrid;
