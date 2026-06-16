import React from 'react';
import { TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

export const PanicButton = ({ onPress, size = 80 }: { onPress?: () => void; size?: number }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Emergency', 'Send emergency alert?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send', style: 'destructive', onPress: onPress }
    ]);
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.Text style={styles.text}>SOS</Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { elevation: 8, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  button: { backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
});

export default PanicButton;