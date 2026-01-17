import { useLocalSearchParams, useRouter } from 'expo-router';
import { TrendingUp, Clock, DollarSign, Target, ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useProcess } from '@/contexts/ProcessContext';

export default function ImpactScreen() {
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

  const metrics = currentProcess.impactMetrics;
  const estimatedManualHours = metrics.estimatedTimeSavedHours + 8;
  const actualHours = 8 - metrics.estimatedTimeSavedHours;

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
            <TrendingUp size={32} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Impact Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            See how much time and money you&apos;re saving
          </Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Clock size={24} color={Colors.primary} />
            </View>
            <Text style={styles.metricValue}>{metrics.estimatedTimeSavedHours}h</Text>
            <Text style={styles.metricLabel}>Time Saved</Text>
            <Text style={styles.metricDescription}>
              vs. manual processing
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <DollarSign size={24} color={Colors.success} />
            </View>
            <Text style={[styles.metricValue, { color: Colors.success }]}>
              ${metrics.estimatedCostSaved}
            </Text>
            <Text style={styles.metricLabel}>Cost Saved</Text>
            <Text style={styles.metricDescription}>
              in professional fees
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Target size={24} color={Colors.warning} />
            </View>
            <Text style={[styles.metricValue, { color: Colors.warning }]}>
              {metrics.errorReductionPercent}%
            </Text>
            <Text style={styles.metricLabel}>Error Reduction</Text>
            <Text style={styles.metricDescription}>
              fewer mistakes
            </Text>
          </View>
        </View>

        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Manual vs. AI-Assisted</Text>
          
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Manual Process</Text>
              <Text style={styles.comparisonTime}>{estimatedManualHours} hours</Text>
              <View style={styles.comparisonBar}>
                <View style={[styles.comparisonBarFill, styles.manualBar, { width: '100%' }]} />
              </View>
              <Text style={styles.comparisonDetail}>
                Research, forms, validation, submission
              </Text>
            </View>

            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>With AI Copilot</Text>
              <Text style={[styles.comparisonTime, { color: Colors.success }]}>
                {actualHours} hours
              </Text>
              <View style={styles.comparisonBar}>
                <View style={[
                  styles.comparisonBarFill, 
                  styles.aiBar, 
                  { width: `${(actualHours / estimatedManualHours) * 100}%` }
                ]} />
              </View>
              <Text style={styles.comparisonDetail}>
                AI guidance, auto-fill, instant validation
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>How We Calculate Savings</Text>
          
          <View style={styles.detailItem}>
            <View style={styles.detailBullet} />
            <Text style={styles.detailText}>
              <Text style={styles.detailBold}>Time saved:</Text> Based on average bureaucratic process completion time (8-12 hours) vs. AI-assisted time
            </Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailBullet} />
            <Text style={styles.detailText}>
              <Text style={styles.detailBold}>Cost saved:</Text> Professional consultation fees ($150-300/hr) that you avoid by using AI guidance
            </Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailBullet} />
            <Text style={styles.detailText}>
              <Text style={styles.detailBold}>Error reduction:</Text> Compared to manual form completion, AI validation reduces submission errors by 75-85%
            </Text>
          </View>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            These estimates are based on average data and may vary depending on your specific situation. Actual savings may differ.
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
    marginBottom: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  comparisonCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  comparisonRow: {
    gap: 20,
  },
  comparisonItem: {
    gap: 8,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  comparisonTime: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  comparisonBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  comparisonBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  manualBar: {
    backgroundColor: '#EF4444',
  },
  aiBar: {
    backgroundColor: Colors.success,
  },
  comparisonDetail: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  detailsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  detailBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  detailBold: {
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  disclaimerCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
    textAlign: 'center',
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
