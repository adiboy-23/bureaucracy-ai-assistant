import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { Process, FormField, ProcessDocument, ValidationIssue } from '@/types/process';

const STORAGE_KEY = 'processes_data';

export const [ProcessProvider, useProcess] = createContextHook(() => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [currentProcess, setCurrentProcess] = useState<Process | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProcesses = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setProcesses(data);
      }
    } catch (error) {
      console.error('Failed to load processes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProcesses = async (data: Process[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save processes:', error);
    }
  };

  useEffect(() => {
    loadProcesses();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveProcesses(processes);
    }
  }, [processes, isLoading]);

  const createProcess = (type: string, title: string, description: string): Process => {
    const newProcess: Process = {
      id: Date.now().toString(),
      type,
      title,
      description,
      status: 'draft',
      readinessScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [],
      documents: [],
      validationIssues: [],
      checklistItems: [
        { id: '1', title: 'Describe your situation', completed: false, required: true },
        { id: '2', title: 'Upload required documents', completed: false, required: true },
        { id: '3', title: 'Complete form fields', completed: false, required: true },
        { id: '4', title: 'Review and validate', completed: false, required: true },
      ],
    };
    setProcesses([newProcess, ...processes]);
    setCurrentProcess(newProcess);
    return newProcess;
  };

  const updateProcess = (processId: string, updates: Partial<Process>) => {
    setProcesses(prev => {
      const updated = prev.map(p => p.id === processId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
      );
      return updated;
    });
    if (currentProcess?.id === processId) {
      setCurrentProcess(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }
  };

  const updateField = (processId: string, fieldId: string, value: string) => {
    const process = processes.find(p => p.id === processId);
    if (!process) return;

    const updatedFields = process.fields.map(f => 
      f.id === fieldId ? { ...f, value, validated: false } : f
    );

    updateProcess(processId, { fields: updatedFields });
    calculateReadinessScore(processId);
  };

  const addDocument = (processId: string, document: ProcessDocument) => {
    const process = processes.find(p => p.id === processId);
    if (!process) return;

    updateProcess(processId, { 
      documents: [...process.documents, document] 
    });
  };

  const addFields = (processId: string, fields: FormField[]) => {
    const process = processes.find(p => p.id === processId);
    if (!process) return;

    const existingFieldIds = new Set(process.fields.map(f => f.id));
    const newFields = fields.filter(f => !existingFieldIds.has(f.id));
    
    updateProcess(processId, { 
      fields: [...process.fields, ...newFields] 
    });
  };

  const validateProcess = (processId: string) => {
    setProcesses(prev => {
      const process = prev.find(p => p.id === processId);
      if (!process) return prev;

      const issues: ValidationIssue[] = [];

      process.fields.forEach(field => {
        if (field.required && !field.value.trim()) {
          issues.push({
            id: `${field.id}-required`,
            fieldId: field.id,
            severity: 'error',
            message: `${field.label} is required`,
            suggestion: 'Please fill in this field',
          });
        }

        if (field.type === 'date' && field.value) {
          const date = new Date(field.value);
          if (isNaN(date.getTime())) {
            issues.push({
              id: `${field.id}-invalid-date`,
              fieldId: field.id,
              severity: 'error',
              message: `${field.label} has invalid date format`,
              suggestion: 'Please enter a valid date',
            });
          }
        }

        if (field.type === 'number' && field.value) {
          if (isNaN(Number(field.value))) {
            issues.push({
              id: `${field.id}-invalid-number`,
              fieldId: field.id,
              severity: 'error',
              message: `${field.label} must be a valid number`,
              suggestion: 'Please enter a numeric value',
            });
          }
        }
      });

      if (process.documents.length === 0) {
        issues.push({
          id: 'no-documents',
          severity: 'warning',
          message: 'No documents uploaded',
          suggestion: 'Upload supporting documents to strengthen your application',
        });
      }

      let score = 0;
      let maxScore = 0;

      process.fields.forEach(field => {
        maxScore += field.required ? 20 : 10;
        if (field.value.trim()) {
          score += field.required ? 20 : 10;
        }
      });

      const errors = issues.filter(i => i.severity === 'error').length;
      const warnings = issues.filter(i => i.severity === 'warning').length;

      if (maxScore > 0) {
        score = Math.round((score / maxScore) * 100);
      } else {
        score = process.documents.length > 0 ? 50 : 0;
      }

      score = Math.max(0, score - (errors * 10) - (warnings * 5));

      const updated = prev.map(p => p.id === processId 
        ? { ...p, validationIssues: issues, readinessScore: score, updatedAt: new Date().toISOString() }
        : p
      );
      
      if (currentProcess?.id === processId) {
        setCurrentProcess(prev => prev ? { ...prev, validationIssues: issues, readinessScore: score, updatedAt: new Date().toISOString() } : null);
      }
      
      return updated;
    });
  };

  const calculateReadinessScore = (processId: string) => {
    setProcesses(prev => {
      const process = prev.find(p => p.id === processId);
      if (!process) return prev;

      let score = 0;
      let maxScore = 0;

      process.fields.forEach(field => {
        maxScore += field.required ? 20 : 10;
        if (field.value.trim()) {
          score += field.required ? 20 : 10;
        }
      });

      const errors = process.validationIssues.filter(i => i.severity === 'error').length;
      const warnings = process.validationIssues.filter(i => i.severity === 'warning').length;

      if (maxScore > 0) {
        score = Math.round((score / maxScore) * 100);
      } else {
        score = process.documents.length > 0 ? 50 : 0;
      }

      score = Math.max(0, score - (errors * 10) - (warnings * 5));

      const updated = prev.map(p => p.id === processId 
        ? { ...p, readinessScore: score, updatedAt: new Date().toISOString() }
        : p
      );
      
      if (currentProcess?.id === processId) {
        setCurrentProcess(prev => prev ? { ...prev, readinessScore: score, updatedAt: new Date().toISOString() } : null);
      }
      
      return updated;
    });
  };

  const completeChecklistItem = (processId: string, itemId: string) => {
    const process = processes.find(p => p.id === processId);
    if (!process) return;

    const updatedItems = process.checklistItems.map(item =>
      item.id === itemId ? { ...item, completed: true } : item
    );

    updateProcess(processId, { checklistItems: updatedItems });
  };

  const deleteProcess = (processId: string) => {
    setProcesses(prev => prev.filter(p => p.id !== processId));
    if (currentProcess?.id === processId) {
      setCurrentProcess(null);
    }
  };

  return {
    processes,
    currentProcess,
    setCurrentProcess,
    isLoading,
    createProcess,
    updateProcess,
    updateField,
    addDocument,
    addFields,
    validateProcess,
    completeChecklistItem,
    deleteProcess,
  };
});
