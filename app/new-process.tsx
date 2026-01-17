import { useRouter } from 'expo-router';
import { FileText, Briefcase, Heart, GraduationCap } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useProcess } from '@/contexts/ProcessContext';

const PROCESS_TYPES = [
  {
    id: 'visa',
    title: 'Visa Application',
    description: 'Tourist, work, or student visas',
    icon: Briefcase,
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Insurance claims, medical forms',
    icon: Heart,
  },
  {
    id: 'education',
    title: 'Education',
    description: 'School enrollment, transcripts',
    icon: GraduationCap,
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Custom bureaucratic process',
    icon: FileText,
  },
];

export default function NewProcessScreen() {
  const router = useRouter();
  const { createProcess } = useProcess();
  const [selectedType, setSelectedType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!selectedType || !title.trim()) return;

    const process = createProcess(
      PROCESS_TYPES.find(t => t.id === selectedType)?.title || selectedType,
      title,
      description
    );

    router.replace(`/process/${process.id}` as never);
  };

  const isValid = selectedType && title.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>What type of process?</Text>
        <View style={styles.typeGrid}>
          {PROCESS_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                onPress={() => setSelectedType(type.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                  <Icon 
                    size={24} 
                    color={isSelected ? Colors.primary : Colors.text.secondary} 
                  />
                </View>
                <Text style={[styles.typeTitle, isSelected && styles.typeTitleSelected]}>
                  {type.title}
                </Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Process details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., US Tourist Visa Application"
              placeholderTextColor={Colors.text.muted}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any relevant details about your situation..."
              placeholderTextColor={Colors.text.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, !isValid && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>Create Process</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  typeCard: {
    width: '48%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  typeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconContainerSelected: {
    backgroundColor: '#DBEAFE',
  },
  typeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  typeTitleSelected: {
    color: Colors.primary,
  },
  typeDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  inputSection: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.text.muted,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
