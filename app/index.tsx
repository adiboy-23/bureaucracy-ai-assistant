import { useRouter } from 'expo-router';
import { FileText, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useProcess } from '@/contexts/ProcessContext';

export default function HomeScreen() {
  const router = useRouter();
  const { processes, setCurrentProcess } = useProcess();

  const handleCreateProcess = () => {
    router.push('/new-process');
  };

  const handleProcessPress = (process: typeof processes[0]) => {
    setCurrentProcess(process);
    router.push(`/process/${process.id}` as never);
  };

  const getStatusIcon = (status: string, readiness: number) => {
    const iconSize = 20;
    if (status === 'submitted') return <CheckCircle size={iconSize} color={Colors.success} />;
    if (status === 'ready' || readiness >= 80) return <CheckCircle size={iconSize} color={Colors.status.complete} />;
    if (status === 'in_progress') return <Clock size={iconSize} color={Colors.status.inProgress} />;
    return <AlertCircle size={iconSize} color={Colors.status.pending} />;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'ready': return 'Ready to Submit';
      case 'in_progress': return 'In Progress';
      default: return 'Draft';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Clarity</Text>
          <Text style={styles.headerSubtitle}>Your bureaucracy copilot</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {processes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <FileText size={48} color={Colors.text.muted} />
            </View>
            <Text style={styles.emptyTitle}>No processes yet</Text>
            <Text style={styles.emptyDescription}>
              Start by creating a new process. Upload documents, describe your situation, and let AI guide you through the forms.
            </Text>
          </View>
        ) : (
          <View style={styles.processList}>
            <Text style={styles.sectionTitle}>Your Processes</Text>
            {processes.map((process) => (
              <TouchableOpacity
                key={process.id}
                style={styles.processCard}
                onPress={() => handleProcessPress(process)}
                activeOpacity={0.7}
              >
                <View style={styles.processHeader}>
                  <View style={styles.processInfo}>
                    <Text style={styles.processTitle}>{process.title}</Text>
                    <Text style={styles.processType} numberOfLines={1}>{process.type}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    {getStatusIcon(process.status, process.readinessScore)}
                    <Text style={styles.statusText}>{getStatusText(process.status)}</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${process.readinessScore}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{process.readinessScore}% ready</Text>
                </View>

                <View style={styles.processFooter}>
                  <Text style={styles.processDate}>
                    Updated {new Date(process.updatedAt).toLocaleDateString()}
                  </Text>
                  {process.validationIssues && process.validationIssues.length > 0 && (
                    <View style={styles.issuesBadge}>
                      <AlertCircle size={12} color={Colors.error} />
                      <Text style={styles.issuesText}>
                        {process.validationIssues.filter(i => i.severity === 'error').length} issues
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateProcess}
        activeOpacity={0.9}
      >
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  processList: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  processCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  processHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  processInfo: {
    flex: 1,
    marginRight: 12,
  },
  processTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  processType: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  processFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  processDate: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  issuesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  issuesText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
