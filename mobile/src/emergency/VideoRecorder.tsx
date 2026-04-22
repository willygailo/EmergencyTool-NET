import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import {
  Camera,
  CameraView,
} from 'expo-camera';

export const VideoRecorder = ({ onRecordingComplete }: { onRecordingComplete: (uri: string) => void }) => {
  const cameraRef = useRef<CameraView | null>(null);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const ensurePermissions = async () => {
      try {
        const [cameraPermission, microphonePermission] = await Promise.all([
          Camera.getCameraPermissionsAsync(),
          Camera.getMicrophonePermissionsAsync(),
        ]);

        let cameraGranted = cameraPermission.granted;
        let microphoneGranted = microphonePermission.granted;

        if (!cameraGranted) {
          const result = await Camera.requestCameraPermissionsAsync();
          cameraGranted = result.granted;
        }

        if (!microphoneGranted) {
          const result = await Camera.requestMicrophonePermissionsAsync();
          microphoneGranted = result.granted;
        }

        setHasPermissions(cameraGranted && microphoneGranted);
      } catch (error) {
        setHasPermissions(false);
      }
    };

    ensurePermissions();
  }, []);

  const requestPermissions = async () => {
    const [cameraPermission, microphonePermission] = await Promise.all([
      Camera.requestCameraPermissionsAsync(),
      Camera.requestMicrophonePermissionsAsync(),
    ]);
    setHasPermissions(cameraPermission.granted && microphonePermission.granted);
  };

  const startRecording = async () => {
    if (!cameraRef.current || recording) return;
    setRecording(true);
    try {
      const video = await cameraRef.current.recordAsync();
      if (video?.uri) {
        onRecordingComplete(video.uri);
      }
    } catch (error) {
      console.log('Recording error:', error);
    } finally {
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && recording) {
      cameraRef.current.stopRecording();
      setRecording(false);
    }
  };

  if (hasPermissions === null) {
    return <View style={styles.container}><Text>Loading camera...</Text></View>;
  }

  if (!hasPermissions) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.recordButton, recording && styles.recording]}
          onPress={recording ? stopRecording : startRecording}
        >
          <View style={[styles.innerCircle, recording && styles.innerRecording]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  controls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  recordButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  recording: { backgroundColor: 'rgba(255,0,0,0.5)' },
  innerCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff' },
  innerRecording: { backgroundColor: '#ef4444' },
  button: { padding: 16, backgroundColor: '#3b82f6', borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  text: { color: '#fff', textAlign: 'center', marginBottom: 16 },
});

export default VideoRecorder;
