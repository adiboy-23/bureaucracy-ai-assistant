export interface Process {
  id: string;
  type: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'ready' | 'submitted';
  readinessScore: number;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  fields: FormField[];
  documents: ProcessDocument[];
  validationIssues: ValidationIssue[];
  checklistItems: ChecklistItem[];
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  value: string;
  type: 'text' | 'date' | 'number' | 'select' | 'multiline';
  required: boolean;
  validated: boolean;
  validationMessage?: string;
  options?: string[];
  extractedFrom?: string;
}

export interface ProcessDocument {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  uploadedAt: string;
  parsed: boolean;
  extractedData?: Record<string, unknown>;
}

export interface ValidationIssue {
  id: string;
  fieldId?: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
}
