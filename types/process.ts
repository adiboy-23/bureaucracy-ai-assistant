export type PersonaType = 'self' | 'parent' | 'caregiver' | 'proxy';

export interface Persona {
  type: PersonaType;
  name: string;
  relationship?: string;
  authorized: boolean;
}

export interface WorkflowNode {
  id: string;
  type: 'question' | 'document' | 'field' | 'validation' | 'decision';
  label: string;
  completed: boolean;
  required: boolean;
  dependsOn?: string[];
  conditions?: NodeCondition[];
  metadata?: Record<string, unknown>;
}

export interface NodeCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less';
  value: string;
  explanation: string;
}

export interface ExplainWhy {
  triggerId: string;
  reason: string;
  ruleSource: string;
  confidence: number;
  timestamp: string;
}

export interface RiskFlag {
  id: string;
  category: 'eligibility' | 'policy' | 'ai_confidence' | 'missing_data';
  severity: 'low' | 'medium' | 'high';
  message: string;
  explanation: string;
  aiConfidence?: number;
}

export interface ImpactMetrics {
  estimatedTimeSavedHours: number;
  errorReductionPercent: number;
  estimatedCostSaved: number;
  comparisonToManual: string;
}

export interface DataExpiry {
  enabled: boolean;
  expiryDate?: string;
  autoDeleteAfterDays?: number;
}

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
  workflowGraph: WorkflowNode[];
  persona: Persona;
  explainWhyLog: ExplainWhy[];
  riskFlags: RiskFlag[];
  impactMetrics: ImpactMetrics;
  dataExpiry: DataExpiry;
  voiceEnabled: boolean;
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
  confidence?: number;
  triggeredBy?: string;
  explanation?: string;
}

export interface ProcessDocument {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  uploadedAt: string;
  parsed: boolean;
  extractedData?: Record<string, unknown>;
  confidence?: number;
  riskFlags?: string[];
}

export interface ValidationIssue {
  id: string;
  fieldId?: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  ruleSource?: string;
  confidence?: number;
  explanation?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
}
