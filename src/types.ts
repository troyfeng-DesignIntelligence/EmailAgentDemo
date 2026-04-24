export type ServiceType = 'Monthly' | 'Quarterly' | 'Annual';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type TaskType = 'Missing Document' | 'OCR Review' | 'GST Review';
export type Priority = 'Low' | 'Medium' | 'High';
export type AssignedRole = 'Accountant' | 'CPA' | 'Manager' | 'CST';
export type TaskStatus = 'Open' | 'In Progress' | 'Waiting' | 'Completed';
export type DocumentType = 'Invoice' | 'Bank Statement' | 'Payroll File' | 'Receipt Batch' | 'GST Pack';
export type FollowUpLevel = 'L1' | 'L2' | 'L3';

export interface Client {
  id: string;
  name: string;
  serviceType: ServiceType;
  manager: string;
  riskLevel: RiskLevel;
  coverageRate: number;
  status: string;
}

export interface Task {
  id: string;
  clientId: string;
  title: string;
  type: TaskType;
  priority: Priority;
  assignedRole: AssignedRole;
  status: TaskStatus;
  createdAt: string;
  dueDate: string;
}

export interface DocumentRecord {
  clientId: string;
  documentType: DocumentType;
  expectedMonths: string[];
  receivedMonths: string[];
  missingMonths: string[];
}

export interface EmailDraft {
  taskId: string;
  to: string;
  cc: string;
  subject: string;
  body: string;
  followUpLevel: FollowUpLevel;
}

export interface AppState {
  selectedTaskId: string;
  selectedClientId: string;
  view: 'dashboard' | 'taskDetail' | 'clientWorkspace' | 'emailPreview';
}
