import { useLocalSearchParams, useRouter } from 'expo-router';
import { MessageSquare, FileUp, FileText, CheckCircle2, ChevronRight, AlertCircle, GitBranch, TrendingUp, Settings as SettingsIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useProcess } from '@/contexts/ProcessContext';

export default function ProcessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { processes, setCurrentProcess, currentProcess } = useProcess();

  useEffect(() => {
    const process = processes.find(p => p.id === id);
    if (process) {
      setCurrentProcess(process);
    }
  }, [id, processes, setCurrentProcess]);

  if (!currentProcess || currentProcess.id !== id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Process not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const steps = [
    {
      id: 'chat',
      title: 'Describe Your Situation',
      subtitle: 'Chat with AI to understand your needs',
      icon: MessageSquare,
      route: `/process/${id}/chat`,
      completed: currentProcess.checklistItems[0]?.completed || false,
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      subtitle: `${currentProcess.documents.length} document${currentProcess.documents.length !== 1 ? 's' : ''} uploaded`,
      icon: FileUp,
      route: `/process/${id}/documents`,
      completed: currentProcess.checklistItems[1]?.completed || currentProcess.documents.length > 0,
    },
    {
      id: 'form',
      title: 'Complete Form',
      subtitle: `${currentProcess.fields.filter(f => f.value).length}/${currentProcess.fields.length} fields filled`,
      icon: FileText,
      route: `/process/${id}/form`,
      completed: currentProcess.checklistItems[2]?.completed || false,
    },
    {
      id: 'review',
      title: 'Review & Validate',
      subtitle: 'Check for errors and submit',
      icon: CheckCircle2,
      route: `/process/${id}/review`,
      completed: currentProcess.checklistItems[3]?.completed || false,
    },
  ];

  const advancedFeatures = [
    {
      id: 'workflow',
      title: 'Workflow Graph',
      subtitle: 'View process flow and dependencies',
      icon: GitBranch,
      route: `/process/${id}/workflow`,
      color: '#3B82F6',
    },
    {
      id: 'impact',
      title: 'Impact Dashboard',
      subtitle: 'Time and cost savings analysis',
      icon: TrendingUp,
      route: `/process/${id}/impact`,
      color: '#F59E0B',
    },
    {
      id: 'settings',
      title: 'Process Settings',
      subtitle: 'Persona, privacy, and preferences',
      icon: SettingsIcon,
      route: `/process/${id}/settings`,
      color: '#8B5CF6',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return Colors.success;
    if (score >= 50) return Colors.warning;
    return Colors.error;
  };

  const errorCount = currentProcess.validationIssues?.filter(i => i.severity === 'error').length || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{currentProcess.title}</Text>
          <Text style={styles.subtitle}>{currentProcess.type}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>Submission Readiness</Text>
            {errorCount > 0 && (
              <View style={styles.errorBadge}>
                <AlertCircle size={14} color={Colors.error} />
                <Text style={styles.errorText}>{errorCount} error{errorCount !== 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: getScoreColor(currentProcess.readinessScore) }]}>
              {currentProcess.readinessScore}%
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${currentProcess.readinessScore}%`,
                      backgroundColor: getScoreColor(currentProcess.readinessScore)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressLabel}>
                {currentProcess.readinessScore >= 80 
                  ? 'Ready to submit' 
                  : currentProcess.readinessScore >= 50 
                  ? 'Almost there' 
                  : 'Needs attention'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Steps</Text>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <TouchableOpacity
                key={step.id}
                style={styles.stepCard}
                onPress={() => router.push(step.route as never)}
                activeOpacity={0.7}
              >
                <View style={styles.stepLeft}>
                  <View style={[styles.stepIconContainer, step.completed && styles.stepIconCompleted]}>
                    <Icon 
                      size={20} 
                      color={step.completed ? Colors.success : Colors.text.secondary} 
                    />
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.text.muted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.advancedSection}>
          <Text style={styles.sectionTitle}>Advanced Features</Text>
          {advancedFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCard}
                onPress={() => router.push(feature.route as never)}
                activeOpacity={0.7}
              >
                <View style={styles.featureLeft}>
                  <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}20` }]}>
                    <Icon size={20} color={feature.color} />
                  </View>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.text.muted} />
              </TouchableOpacity>
            );
          })}
        </View>

        {currentProcess.deadline && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Deadline</Text>
            <Text style={styles.infoValue}>
              {new Date(currentProcess.deadline).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  scoreCard: {
    backgroundColor: Colors.cardBackground,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  errorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.error,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  progressContainer: {
    flex: 1,
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  stepsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconCompleted: {
    backgroundColor: '#D1FAE5',
  },
  stepInfo: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  stepSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  advancedSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  featureSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
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
