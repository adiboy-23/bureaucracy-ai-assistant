import { useLocalSearchParams } from 'expo-router';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useProcess } from '@/contexts/ProcessContext';

export default function FormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentProcess, updateField, validateProcess } = useProcess();

  useEffect(() => {
    if (currentProcess && currentProcess.id === id && currentProcess.fields.length > 0) {
      const timer = setTimeout(() => {
        validateProcess(id);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentProcess?.fields, id, validateProcess, currentProcess]);

  if (!currentProcess || currentProcess.id !== id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Process not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fields = currentProcess.fields;
  const filledCount = fields.filter(f => f.value.trim()).length;
  const progress = fields.length > 0 ? (filledCount / fields.length) * 100 : 0;

  const renderField = (field: typeof fields[0]) => {
    const error = currentProcess.validationIssues.find(
      i => i.fieldId === field.id && i.severity === 'error'
    );

    return (
      <View key={field.id} style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>
            {field.label}
            {field.required && <Text style={styles.required}> *</Text>}
          </Text>
          {field.value.trim() && !error && (
            <CheckCircle2 size={16} color={Colors.success} />
          )}
          {error && (
            <AlertCircle size={16} color={Colors.error} />
          )}
        </View>

        {field.extractedFrom && (
          <Text style={styles.extractedBadge}>
            Extracted from {field.extractedFrom}
          </Text>
        )}

        {field.type === 'multiline' ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={field.value}
            onChangeText={(value) => updateField(id, field.id, value)}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            placeholderTextColor={Colors.text.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        ) : field.type === 'select' && field.options ? (
          <View style={styles.selectContainer}>
            {field.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.selectOption,
                  field.value === option && styles.selectOptionSelected,
                ]}
                onPress={() => updateField(id, field.id, option)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    field.value === option && styles.selectOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={field.value}
            onChangeText={(value) => updateField(id, field.id, value)}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            placeholderTextColor={Colors.text.muted}
            keyboardType={field.type === 'number' ? 'numeric' : field.type === 'date' ? 'default' : 'default'}
          />
        )}

        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={14} color={Colors.error} />
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Form Progress</Text>
          <Text style={styles.progressValue}>{filledCount} of {fields.length} fields</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {fields.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No fields yet</Text>
            <Text style={styles.emptyText}>
              Chat with AI or upload documents to generate form fields automatically.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Complete Form Fields</Text>
            {fields.map(renderField)}
          </>
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
  progressHeader: {
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  required: {
    color: Colors.error,
  },
  extractedBadge: {
    fontSize: 12,
    color: Colors.success,
    marginBottom: 8,
    fontWeight: '500',
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
  inputError: {
    borderColor: Colors.error,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  selectOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  selectOptionText: {
    fontSize: 15,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectOptionTextSelected: {
    color: Colors.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
  },
  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
