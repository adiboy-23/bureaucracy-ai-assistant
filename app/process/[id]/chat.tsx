import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRorkAgent, createRorkTool } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import Colors from '@/constants/colors';
import { useProcess } from '@/contexts/ProcessContext';
import type { FormField } from '@/types/process';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addFields, completeChecklistItem } = useProcess();
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const { messages, sendMessage } = useRorkAgent({
    tools: {
      generateFormFields: createRorkTool({
        description: 'Generate form fields based on the user situation and requirements',
        zodSchema: z.object({
          fields: z.array(z.object({
            id: z.string().describe('Unique field identifier'),
            name: z.string().describe('Field name for processing'),
            label: z.string().describe('Human readable label'),
            type: z.enum(['text', 'date', 'number', 'select', 'multiline']).describe('Field input type'),
            required: z.boolean().describe('Whether field is required'),
            options: z.array(z.string()).optional().describe('Options for select fields'),
          })),
        }),
        execute(input) {
          console.log('Generating fields:', input.fields);
          const formFields: FormField[] = input.fields.map(f => ({
            ...f,
            value: '',
            validated: false,
          }));
          addFields(id, formFields);
          completeChecklistItem(id, '1');
          return 'Form fields created successfully';
        },
      }),
    },
  });

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Tell me about your situation</Text>
              <Text style={styles.welcomeText}>
                Describe what you&apos;re trying to accomplish, and I&apos;ll help guide you through the process step by step.
              </Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>Examples:</Text>
                <Text style={styles.exampleText}>• &quot;I need to apply for a US tourist visa&quot;</Text>
                <Text style={styles.exampleText}>• &quot;Help me file a health insurance claim&quot;</Text>
                <Text style={styles.exampleText}>• &quot;I&apos;m enrolling my child in school&quot;</Text>
              </View>
            </View>
          )}

          {messages.map((m) => (
            <View key={m.id}>
              {m.parts.map((part, i) => {
                if (part.type === 'text') {
                  return (
                    <View
                      key={`${m.id}-${i}`}
                      style={[
                        styles.messageBubble,
                        m.role === 'user' ? styles.userBubble : styles.assistantBubble,
                      ]}
                    >
                      <Text style={[
                        styles.messageText,
                        m.role === 'user' ? styles.userText : styles.assistantText,
                      ]}>
                        {part.text}
                      </Text>
                    </View>
                  );
                }
                
                if (part.type === 'tool') {
                  if (part.state === 'input-streaming' || part.state === 'input-available') {
                    return (
                      <View key={`${m.id}-${i}`} style={styles.toolBubble}>
                        <Text style={styles.toolText}>🔧 Creating form fields...</Text>
                      </View>
                    );
                  }
                  
                  if (part.state === 'output-available') {
                    return (
                      <View key={`${m.id}-${i}`} style={styles.toolBubble}>
                        <Text style={styles.toolText}>✅ Form fields created! Continue to the next step.</Text>
                      </View>
                    );
                  }

                  if (part.state === 'output-error') {
                    return (
                      <View key={`${m.id}-${i}`} style={styles.toolBubble}>
                        <Text style={styles.toolErrorText}>⚠️ Error: {part.errorText}</Text>
                      </View>
                    );
                  }
                }

                return null;
              })}
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={Colors.text.muted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
            activeOpacity={0.7}
          >
            <Send size={20} color={input.trim() ? '#FFFFFF' : Colors.text.muted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  welcomeContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  exampleContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: Colors.text.primary,
  },
  toolBubble: {
    alignSelf: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 4,
  },
  toolText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  toolErrorText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.background,
  },
});
