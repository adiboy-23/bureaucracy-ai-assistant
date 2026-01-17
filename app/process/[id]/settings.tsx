import { useLocalSearchParams, useRouter } from 'expo-router';
import { Settings, User, Trash2, Calendar, Mic, Shield, ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useProcess } from '@/contexts/ProcessContext';
import type { PersonaType } from '@/types/process';

export default function SettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentProcess, updateProcess, deleteProcess } = useProcess();

  if (!currentProcess || currentProcess.id !== id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Process not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const personas: { type: PersonaType; label: string; description: string }[] = [
    { type: 'self', label: 'Self', description: 'Acting on my own behalf' },
    { type: 'parent', label: 'Parent', description: 'Acting for my child' },
    { type: 'caregiver', label: 'Caregiver', description: 'Acting for someone I care for' },
    { type: 'proxy', label: 'Authorized Proxy', description: 'Acting with legal authorization' },
  ];

  const handlePersonaChange = (personaType: PersonaType) => {
    updateProcess(id, {
      persona: {
        type: personaType,
        name: personas.find(p => p.type === personaType)?.label || 'Self',
        authorized: true,
      },
    });
  };

  const handleDataExpiryToggle = (enabled: boolean) => {
    const expiryDate = enabled 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : undefined;
    
    updateProcess(id, {
      dataExpiry: {
        enabled,
        expiryDate,
        autoDeleteAfterDays: enabled ? 30 : undefined,
      },
    });
  };

  const handleVoiceToggle = (enabled: boolean) => {
    updateProcess(id, { voiceEnabled: enabled });
  };

  const handleDeleteProcess = () => {
    Alert.alert(
      'Delete Process',
      'Are you sure you want to permanently delete this process and all its data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProcess(id);
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color={Colors.text.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Settings size={32} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Process Settings</Text>
          <Text style={styles.headerSubtitle}>
            Configure persona, privacy, and advanced features
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={Colors.text.primary} />
            <Text style={styles.sectionTitle}>Persona</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Who are you acting on behalf of? This helps AI provide appropriate guidance.
          </Text>
          <View style={styles.personaList}>
            {personas.map((persona) => (
              <TouchableOpacity
                key={persona.type}
                style={[
                  styles.personaCard,
                  currentProcess.persona.type === persona.type && styles.personaCardActive,
                ]}
                onPress={() => handlePersonaChange(persona.type)}
                activeOpacity={0.7}
              >
                <View style={styles.personaHeader}>
                  <Text style={[
                    styles.personaLabel,
                    currentProcess.persona.type === persona.type && styles.personaLabelActive,
                  ]}>
                    {persona.label}
                  </Text>
                  {currentProcess.persona.type === persona.type && (
                    <View style={styles.personaBadge}>
                      <Text style={styles.personaBadgeText}>Active</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.personaDescription}>{persona.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mic size={20} color={Colors.text.primary} />
            <Text style={styles.sectionTitle}>Voice Features</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Voice Input</Text>
              <Text style={styles.settingDescription}>
                Enable hands-free interaction with voice commands
              </Text>
            </View>
            <Switch
              value={currentProcess.voiceEnabled}
              onValueChange={handleVoiceToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={Colors.text.primary} />
            <Text style={styles.sectionTitle}>Privacy & Data</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Delete Data</Text>
              <Text style={styles.settingDescription}>
                Automatically delete all data after 30 days
              </Text>
            </View>
            <Switch
              value={currentProcess.dataExpiry.enabled}
              onValueChange={handleDataExpiryToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {currentProcess.dataExpiry.enabled && currentProcess.dataExpiry.expiryDate && (
            <View style={styles.expiryInfo}>
              <Calendar size={16} color={Colors.text.secondary} />
              <Text style={styles.expiryText}>
                Data will be deleted on{' '}
                {new Date(currentProcess.dataExpiry.expiryDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trash2 size={20} color={Colors.error} />
            <Text style={[styles.sectionTitle, { color: Colors.error }]}>Danger Zone</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteProcess}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color={Colors.error} />
            <Text style={styles.deleteButtonText}>Delete Process</Text>
          </TouchableOpacity>
          <Text style={styles.deleteWarning}>
            This action cannot be undone. All data will be permanently deleted.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  personaList: {
    gap: 12,
  },
  personaCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  personaCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  personaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  personaLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  personaLabelActive: {
    color: Colors.primary,
  },
  personaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  personaBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  personaDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  expiryText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  deleteWarning: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});
