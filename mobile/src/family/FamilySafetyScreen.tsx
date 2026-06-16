import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFamilySafety } from '../hooks/useFamilySafety';
import { familyApi } from './familyApi';

export const FamilySafetyScreen = ({ navigation }: any) => {
  const { familyMembers, checkInStatus, checkIn, refreshFamily } = useFamilySafety();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', relationship: '' });

  const handleFamilyMembersPress = () => {
    setIsAddingMember(true);
  };

  const handleQuickCheckIn = () => {
    if (familyMembers.length === 0) {
      Alert.alert('No family members', 'Add a family member first before using quick check-in.');
      return;
    }

    const memberToCheckIn = familyMembers.find((member) => member.status === 'unknown') || familyMembers[0];
    setSelectedMember(memberToCheckIn.id);
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.phone || !newMember.relationship) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    try {
      await familyApi.addMember(newMember);
      setIsAddingMember(false);
      setNewMember({ name: '', phone: '', relationship: '' });
      refreshFamily();
    } catch (error) {
      Alert.alert('Error', 'Failed to add family member.');
    }
  };

  const handleRemoveMember = (id: string, name: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${name} from your family circle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
            try {
              await familyApi.removeMember(id);
              refreshFamily();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member.');
            }
        }}
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return '#22c55e';
      case 'unsafe': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe': return '✓ Safe';
      case 'unsafe': return '⚠ Need Help';
      default: return '⏳ Unknown';
    }
  };

  const handleCheckIn = (memberId: string, status: 'safe' | 'unsafe' | 'unknown') => {
    Alert.alert(
      'Check In',
      `Mark as ${status === 'safe' ? 'SAFE' : status === 'unsafe' ? 'NEED HELP' : 'UNKNOWN'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
          checkIn(memberId, status);
          setSelectedMember(null);
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Family Safety</Text>
          <Text style={styles.subtitle}>Keep your family safe during emergencies</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Family Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: checkInStatus === 'all_safe' ? '#22c55e' : checkInStatus === 'pending' ? '#f59e0b' : '#ef4444' }]} />
            <Text style={styles.statusText}>
              {checkInStatus === 'all_safe' ? 'All members safe' : checkInStatus === 'pending' ? 'Check-in pending' : 'Some members need attention'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Family Members</Text>
            {familyMembers.length > 0 && (
              <TouchableOpacity onPress={handleFamilyMembersPress}>
                <Text style={styles.addText}>+ Add</Text>
              </TouchableOpacity>
            )}
          </View>
          {familyMembers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No family members added yet</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleFamilyMembersPress}>
                <Text style={styles.addButtonText}>+ Add Family Member</Text>
              </TouchableOpacity>
            </View>
          ) : (
            familyMembers.map((member) => (
              <TouchableOpacity 
                key={member.id} 
                style={styles.memberCard}
                onLongPress={() => handleRemoveMember(member.id, member.name)}
                delayLongPress={500}
              >
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRelation}>{member.relationship}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(member.status) + '20' }]}
                  onPress={() => setSelectedMember(member.id)}
                >
                  <Text style={[styles.statusBadgeText, { color: getStatusColor(member.status) }]}>
                    {getStatusText(member.status)}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
          {familyMembers.length > 0 && (
            <Text style={styles.hintText}>Long press a member to remove them</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionCard} onPress={handleFamilyMembersPress}>
            <Text style={styles.actionIcon}>👨‍👩‍👧‍👦</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Add Family Member</Text>
              <Text style={styles.actionDesc}>Add someone to your circle</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={handleQuickCheckIn}>
            <Text style={styles.actionIcon}>✓</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Check In</Text>
              <Text style={styles.actionDesc}>Update safety status</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {selectedMember && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#22c55e' }]} onPress={() => handleCheckIn(selectedMember, 'safe')}>
              <Text style={styles.modalButtonText}>✓ Safe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ef4444' }]} onPress={() => handleCheckIn(selectedMember, 'unsafe')}>
              <Text style={styles.modalButtonText}>⚠ Need Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setSelectedMember(null)}>
              <Text style={styles.modalButtonCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isAddingMember && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Family Member</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newMember.name}
              onChangeText={(text) => setNewMember({...newMember, name: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Relationship (e.g. Mother, Son)"
              value={newMember.relationship}
              onChangeText={(text) => setNewMember({...newMember, relationship: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={newMember.phone}
              onChangeText={(text) => setNewMember({...newMember, phone: text})}
            />
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#3b82f6', marginTop: 16 }]} onPress={handleAddMember}>
              <Text style={styles.modalButtonText}>Add Member</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setIsAddingMember(false)}>
              <Text style={styles.modalButtonCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  statusCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 24 },
  statusTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { fontSize: 14, color: '#666' },
  section: { marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  addText: { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
  hintText: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 8 },
  emptyCard: { backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center' },
  emptyText: { color: '#666', marginBottom: 12 },
  addButton: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  memberCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  memberRelation: { fontSize: 14, color: '#666' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8 },
  actionIcon: { fontSize: 24, marginRight: 12 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  actionDesc: { fontSize: 14, color: '#666' },
  modal: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  modalButton: { padding: 16, borderRadius: 12, marginBottom: 8 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  modalButtonCancel: { padding: 16, alignItems: 'center' },
  modalButtonCancelText: { color: '#666', fontSize: 16 },
});

export default FamilySafetyScreen;
