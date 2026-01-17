import { useLocalSearchParams, useRouter } from 'expo-router';
import { GitBranch, CheckCircle, Circle, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useProcess } from '@/contexts/ProcessContext';
import type { WorkflowNode } from '@/types/process';

export default function WorkflowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentProcess } = useProcess();

  if (!currentProcess || currentProcess.id !== id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Process not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getNodeIcon = (node: WorkflowNode) => {
    const iconSize = 20;
    if (node.completed) return <CheckCircle size={iconSize} color={Colors.success} />;
    if (node.required) return <AlertCircle size={iconSize} color={Colors.warning} />;
    return <Circle size={iconSize} color={Colors.text.muted} />;
  };

  const canAccessNode = (node: WorkflowNode): boolean => {
    if (!node.dependsOn || node.dependsOn.length === 0) return true;
    return node.dependsOn.every(depId => {
      const depNode = currentProcess.workflowGraph.find(n => n.id === depId);
      return depNode?.completed || false;
    });
  };

  const completedNodes = currentProcess.workflowGraph.filter(n => n.completed).length;
  const totalNodes = currentProcess.workflowGraph.length;
  const progress = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

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
            <GitBranch size={32} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Workflow Graph</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress through the bureaucratic process
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Workflow Progress</Text>
            <Text style={styles.progressValue}>{completedNodes} of {totalNodes} nodes</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.graphContainer}>
          {currentProcess.workflowGraph.map((node, index) => {
            const isAccessible = canAccessNode(node);
            const isLocked = !isAccessible && !node.completed;

            return (
              <View key={node.id}>
                <View style={[
                  styles.nodeCard,
                  node.completed && styles.nodeCardCompleted,
                  isLocked && styles.nodeCardLocked,
                ]}>
                  <View style={styles.nodeHeader}>
                    <View style={styles.nodeLeft}>
                      {getNodeIcon(node)}
                      <View style={styles.nodeInfo}>
                        <Text style={[
                          styles.nodeLabel,
                          isLocked && styles.nodeLabelLocked,
                        ]}>
                          {node.label}
                        </Text>
                        <Text style={styles.nodeType}>{node.type}</Text>
                      </View>
                    </View>
                    {!isLocked && (
                      <ChevronRight size={20} color={Colors.text.muted} />
                    )}
                  </View>

                  {node.dependsOn && node.dependsOn.length > 0 && (
                    <View style={styles.dependencyInfo}>
                      <Text style={styles.dependencyLabel}>Depends on:</Text>
                      {node.dependsOn.map(depId => {
                        const depNode = currentProcess.workflowGraph.find(n => n.id === depId);
                        return (
                          <Text key={depId} style={styles.dependencyText}>
                            • {depNode?.label || depId}
                          </Text>
                        );
                      })}
                    </View>
                  )}

                  {node.conditions && node.conditions.length > 0 && (
                    <View style={styles.conditionsInfo}>
                      <Text style={styles.conditionsLabel}>Conditions:</Text>
                      {node.conditions.map((condition, idx) => (
                        <View key={idx} style={styles.conditionItem}>
                          <Text style={styles.conditionText}>
                            {condition.field} {condition.operator} {condition.value}
                          </Text>
                          <Text style={styles.conditionExplanation}>
                            {condition.explanation}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {isLocked && (
                    <View style={styles.lockedBadge}>
                      <Text style={styles.lockedText}>
                        Complete dependencies to unlock
                      </Text>
                    </View>
                  )}
                </View>

                {index < currentProcess.workflowGraph.length - 1 && (
                  <View style={styles.connector}>
                    <View style={styles.connectorLine} />
                  </View>
                )}
              </View>
            );
          })}
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
    marginBottom: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
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
  progressCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  graphContainer: {
    gap: 0,
  },
  nodeCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nodeCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: Colors.success,
  },
  nodeCardLocked: {
    opacity: 0.6,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  nodeInfo: {
    flex: 1,
    gap: 4,
  },
  nodeLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  nodeLabelLocked: {
    color: Colors.text.muted,
  },
  nodeType: {
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'capitalize' as const,
  },
  dependencyInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dependencyLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  dependencyText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  conditionsInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  conditionsLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  conditionItem: {
    marginBottom: 8,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  conditionExplanation: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontStyle: 'italic' as const,
  },
  lockedBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lockedText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontStyle: 'italic' as const,
  },
  connector: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  connectorLine: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
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
