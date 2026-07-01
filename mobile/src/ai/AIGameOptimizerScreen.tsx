import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const NVIDIA_API_KEY = "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";

export const AIGameOptimizerScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "System online. MiniMax-M3 hooked directly to the veins. Tell me your rig specs or the game you're trying to push, and let's squeeze out every last frame. Time to max that FPS and Hz.",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    Keyboard.dismiss();

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const history = messages
        .concat(userMessage)
        .filter(m => m.id !== 'welcome') // We can send welcome or not, but let's keep it simple
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // In a real-world scenario, you shouldn't ship your API keys in the client bundle.
      // But we're living on the edge today.
      const response = await axios.post(
        'https://integrate.api.nvidia.com/v1/chat/completions',
        {
          model: "minimaxai/minimax-m3",
          messages: [
            { 
              role: "system", 
              content: "You are an elite, no-bullshit PC and Mobile game performance optimizer. Your sole purpose is to help the user max out their FPS, Hz, and reduce input lag. Provide hardcore tweaks, OS-level settings, and in-game config changes. Speak with a hacker/gamer persona, but keep the technical advice 100% accurate."
            },
            ...history
          ],
          max_tokens: 2048,
          temperature: 1.00,
          top_p: 0.95,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${NVIDIA_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.choices?.[0]?.message?.content || "Damn, connection dropped. Hit me again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('NVIDIA AI request error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "API rate limit hit or network shit the bed. Can't reach the Nvidia servers. Try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Ionicons name="hardware-chip" size={16} color="#000" />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={isUser ? styles.userText : styles.assistantText}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.keyboardContainer}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {loading && (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" color="#00ff00" />
            <Text style={styles.loadingText}>Compiling optimizations...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="e.g. How do I max out Cyberpunk 2077 on a 3060?"
            placeholderTextColor="#00ff0055"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.disabledSendButton]}
            onPress={() => handleSend(inputText)}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="flash" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  keyboardContainer: { flex: 1 },
  messageList: { padding: 16, paddingBottom: 24 },
  messageRow: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
  userRow: { alignSelf: 'flex-end' },
  assistantRow: { alignSelf: 'flex-start' },
  assistantAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#00ff00',
    alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 2,
    shadowColor: '#00ff00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5,
  },
  messageBubble: {
    padding: 12, borderRadius: 16, elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1,
  },
  userBubble: { backgroundColor: '#1a1a1a', borderTopRightRadius: 2, borderWidth: 1, borderColor: '#333' },
  assistantBubble: { backgroundColor: '#002200', borderTopLeftRadius: 2, borderWidth: 1, borderColor: '#00ff00' },
  userText: { color: '#ccc', fontSize: 14, lineHeight: 20 },
  assistantText: { color: '#00ff00', fontSize: 14, lineHeight: 20, textShadowColor: 'rgba(0, 255, 0, 0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
  loadingWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 6 },
  loadingText: { fontSize: 12, color: '#00ff00', fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#222', alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100, fontSize: 14, color: '#00ff00', marginRight: 10, borderWidth: 1, borderColor: '#333' },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#00ff00', alignItems: 'center', justifyContent: 'center', shadowColor: '#00ff00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 4 },
  disabledSendButton: { backgroundColor: '#1a1a1a', shadowOpacity: 0 },
});

export default AIGameOptimizerScreen;
