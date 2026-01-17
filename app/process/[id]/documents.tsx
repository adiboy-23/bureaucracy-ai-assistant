import { useLocalSearchParams } from 'expo-router';
import { Upload, File, Loader } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useMutation } from '@tanstack/react-query';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import Colors from '@/constants/colors';
import { useProcess } from '@/contexts/ProcessContext';
import type { ProcessDocument } from '@/types/process';

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentProcess, addDocument, completeChecklistItem, addFields } = useProcess();
  const [uploading, setUploading] = useState(false);

  const parseMutation = useMutation({
    mutationFn: async (document: ProcessDocument) => {
      console.log('Parsing document with AI...');
      
      const result = await generateObject({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract structured data from this document. Identify key fields like names, dates, numbers, addresses, and any other relevant information that might be needed for a form.',
              },
              {
                type: 'image',
                image: document.uri,
              },
            ],
          },
        ],
        schema: z.object({
          extractedFields: z.array(z.object({
            key: z.string(),
            value: z.string(),
            confidence: z.number(),
          })),
          documentType: z.string().optional(),
          summary: z.string().optional(),
        }),
      });

      return result;
    },
    onSuccess: (data, document) => {
      console.log('Document parsed:', data);
      
      if (data.extractedFields.length > 0) {
        const fields = data.extractedFields
          .filter(f => f.confidence > 0.7)
          .map((f, idx) => ({
            id: `extracted-${document.id}-${idx}`,
            name: f.key.toLowerCase().replace(/\s+/g, '_'),
            label: f.key,
            value: f.value,
            type: 'text' as const,
            required: false,
            validated: false,
            extractedFrom: document.name,
          }));

        if (fields.length > 0) {
          addFields(id, fields);
        }
      }
      
      completeChecklistItem(id, '2');
    },
    onError: (error) => {
      console.error('Failed to parse document:', error);
      Alert.alert('Parse Error', 'Failed to extract data from document');
    },
  });

  const handlePickDocument = async () => {
    try {
      setUploading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setUploading(false);
        return;
      }

      const file = result.assets[0];
      
      let base64Data = '';
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        base64Data = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        base64Data = file.uri;
      }

      const document: ProcessDocument = {
        id: Date.now().toString(),
        name: file.name,
        uri: base64Data,
        mimeType: file.mimeType || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        parsed: false,
      };

      addDocument(id, document);
      setUploading(false);

      if (file.mimeType?.startsWith('image/')) {
        parseMutation.mutate(document);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      setUploading(false);
      Alert.alert('Upload Error', 'Failed to upload document');
    }
  };

  const documents = currentProcess?.documents || [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upload Documents</Text>
          <Text style={styles.headerSubtitle}>
            Add supporting documents like IDs, forms, or certificates. AI will extract relevant data automatically.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handlePickDocument}
          disabled={uploading || parseMutation.isPending}
          activeOpacity={0.7}
        >
          <View style={styles.uploadIconContainer}>
            {uploading || parseMutation.isPending ? (
              <Loader size={32} color={Colors.primary} />
            ) : (
              <Upload size={32} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.uploadText}>
            {uploading ? 'Uploading...' : parseMutation.isPending ? 'Parsing document...' : 'Upload Document'}
          </Text>
          <Text style={styles.uploadSubtext}>
            Images and PDFs supported
          </Text>
        </TouchableOpacity>

        {documents.length > 0 && (
          <View style={styles.documentsSection}>
            <Text style={styles.sectionTitle}>Uploaded Documents</Text>
            {documents.map((doc) => (
              <View key={doc.id} style={styles.documentCard}>
                <View style={styles.documentIcon}>
                  <File size={20} color={Colors.text.secondary} />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <Text style={styles.documentDate}>
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </Text>
                </View>
                {doc.parsed && (
                  <View style={styles.parsedBadge}>
                    <Text style={styles.parsedText}>Parsed</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {documents.length === 0 && !uploading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No documents uploaded yet. Uploading documents helps AI extract information and pre-fill forms.
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  uploadButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    marginBottom: 32,
  },
  uploadIconContainer: {
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  documentsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  parsedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
  },
  parsedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
