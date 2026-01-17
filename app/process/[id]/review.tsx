import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Download, ArrowLeft } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useProcess } from '@/contexts/ProcessContext';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentProcess, validateProcess, completeChecklistItem, updateProcess } = useProcess();

  useEffect(() => {
    if (currentProcess && currentProcess.id === id) {
      validateProcess(id);
    }
  }, [currentProcess, id, validateProcess]);

  if (!currentProcess || currentProcess.id !== id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Process not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const errors = currentProcess.validationIssues.filter(i => i.severity === 'error');
  const warnings = currentProcess.validationIssues.filter(i => i.severity === 'warning');
  const infos = currentProcess.validationIssues.filter(i => i.severity === 'info');

  const getScoreColor = (score: number) => {
    if (score >= 80) return Colors.success;
    if (score >= 50) return Colors.warning;
    return Colors.error;
  };

  const handleSubmit = () => {
    if (errors.length > 0) {
      Alert.alert(
        'Cannot Submit',
        'Please fix all errors before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Ready to Submit',
      'Your form is ready for submission. In a real app, this would export as a PDF or submit to the relevant authority.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Ready',
          onPress: () => {
            updateProcess(id, { status: 'ready' });
            completeChecklistItem(id, '4');
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const renderIssueIcon = (severity: string) => {
    const iconSize = 20;
    switch (severity) {
      case 'error':
        return <AlertCircle size={iconSize} color={Colors.error} />;
      case 'warning':
        return <AlertTriangle size={iconSize} color={Colors.warning} />;
      default:
        return <Info size={iconSize} color={Colors.secondary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          <ArrowLeft size={24} color={Colors.text.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>Submission Readiness</Text>
            <View style={styles.scoreBadge}>
              <Text style={[styles.scorePercentage, { color: getScoreColor(currentProcess.readinessScore) }]}>
                {currentProcess.readinessScore}%
              </Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${currentProcess.readinessScore}%`,
                  backgroundColor: getScoreColor(currentProcess.readinessScore),
                },
              ]}
            />
          </View>

          <Text style={styles.scoreDescription}>
            {currentProcess.readinessScore >= 80
              ? 'Your form looks great! Ready to submit.'
              : currentProcess.readinessScore >= 50
              ? 'Almost there. Fix remaining issues to improve readiness.'
              : 'Several issues need attention before submission.'}
          </Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{currentProcess.fields.length}</Text>
              <Text style={styles.summaryLabel}>Total Fields</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                {currentProcess.fields.filter(f => f.value.trim()).length}
              </Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: Colors.error }]}>
                {errors.length}
              </Text>
              <Text style={styles.summaryLabel}>Errors</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: Colors.warning }]}>
                {warnings.length}
              </Text>
              <Text style={styles.summaryLabel}>Warnings</Text>
            </View>
          </View>
        </View>

        {errors.length > 0 && (
          <View style={styles.issuesSection}>
            <Text style={styles.sectionTitle}>Errors ({errors.length})</Text>
            {errors.map((issue) => (
              <View key={issue.id} style={[styles.issueCard, styles.errorCard]}>
                <View style={styles.issueHeader}>
                  {renderIssueIcon(issue.severity)}
                  <Text style={styles.issueMessage}>{issue.message}</Text>
                </View>
                {issue.suggestion && (
                  <Text style={styles.issueSuggestion}>{issue.suggestion}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {warnings.length > 0 && (
          <View style={styles.issuesSection}>
            <Text style={styles.sectionTitle}>Warnings ({warnings.length})</Text>
            {warnings.map((issue) => (
              <View key={issue.id} style={[styles.issueCard, styles.warningCard]}>
                <View style={styles.issueHeader}>
                  {renderIssueIcon(issue.severity)}
                  <Text style={styles.issueMessage}>{issue.message}</Text>
                </View>
                {issue.suggestion && (
                  <Text style={styles.issueSuggestion}>{issue.suggestion}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {infos.length > 0 && (
          <View style={styles.issuesSection}>
            <Text style={styles.sectionTitle}>Information ({infos.length})</Text>
            {infos.map((issue) => (
              <View key={issue.id} style={[styles.issueCard, styles.infoCard]}>
                <View style={styles.issueHeader}>
                  {renderIssueIcon(issue.severity)}
                  <Text style={styles.issueMessage}>{issue.message}</Text>
                </View>
                {issue.suggestion && (
                  <Text style={styles.issueSuggestion}>{issue.suggestion}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {errors.length === 0 && warnings.length === 0 && (
          <View style={styles.successCard}>
            <CheckCircle2 size={48} color={Colors.success} />
            <Text style={styles.successTitle}>All Clear!</Text>
            <Text style={styles.successText}>
              Your form has been validated and is ready for submission.
            </Text>
          </View>
        )}

        {currentProcess.riskFlags && currentProcess.riskFlags.length > 0 && (
          <View style={styles.riskSection}>
            <Text style={styles.sectionTitle}>Risk & Compliance Alerts</Text>
            {currentProcess.riskFlags.map((risk) => (
              <View key={risk.id} style={[
                styles.riskCard,
                risk.severity === 'high' && styles.riskCardHigh,
                risk.severity === 'medium' && styles.riskCardMedium,
                risk.severity === 'low' && styles.riskCardLow,
              ]}>
                <View style={styles.riskHeader}>
                  <AlertCircle size={20} color={
                    risk.severity === 'high' ? Colors.error :
                    risk.severity === 'medium' ? Colors.warning :
                    Colors.secondary
                  } />
                  <Text style={styles.riskMessage}>{risk.message}</Text>
                </View>
                <Text style={styles.riskExplanation}>{risk.explanation}</Text>
                {risk.aiConfidence !== undefined && (
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      AI Confidence: {Math.round(risk.aiConfidence * 100)}%
                    </Text>
                  </View>
                )}
              </View>
            ))}
            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerTitle}>⚠️ Important Disclaimer</Text>
              <Text style={styles.disclaimerText}>
                This AI system provides guidance based on patterns and rules, but may not account for all edge cases or recent policy changes. Risk flags indicate areas of uncertainty. Always verify critical information and consult with a qualified professional when needed.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.exportButton]}
          onPress={() => Alert.alert('Export', 'Export functionality would generate a PDF here')}
          activeOpacity={0.8}
        >
          <Download size={20} color={Colors.text.primary} />
          <Text style={styles.exportButtonText}>Export PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton, errors.length > 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={errors.length > 0}
          activeOpacity={0.8}
        >
          <CheckCircle2 size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Mark as Ready</Text>
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
    fontWeight: '600',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  scoreCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  scorePercentage: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  issuesSection: {
    marginBottom: 24,
  },
  issueCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  issueHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  issueMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  issueSuggestion: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginLeft: 32,
    lineHeight: 18,
  },
  successCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.success,
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  exportButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.text.muted,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
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
  riskSection: {
    marginBottom: 24,
  },
  riskCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  riskCardHigh: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  riskCardMedium: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  riskCardLow: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  riskHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  riskMessage: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  riskExplanation: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginLeft: 32,
  },
  confidenceBadge: {
    marginTop: 8,
    marginLeft: 32,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.background,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  disclaimerCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginTop: 8,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
