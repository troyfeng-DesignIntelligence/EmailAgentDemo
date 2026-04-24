import type { Client, DocumentRecord, EmailDraft, Task } from '../types';

export const clients: Client[] = [
  {
    id: 'client-1',
    name: 'Apex Retail Pte Ltd',
    serviceType: 'Monthly',
    manager: 'Yang Wen',
    riskLevel: 'High',
    coverageRate: 83,
    status: 'Missing Documents',
  },
  {
    id: 'client-2',
    name: 'Northstar Logistics',
    serviceType: 'Quarterly',
    manager: 'Lin Jia',
    riskLevel: 'Medium',
    coverageRate: 91,
    status: 'Needs Review',
  },
  {
    id: 'client-3',
    name: 'Blue Harbor Foods',
    serviceType: 'Monthly',
    manager: 'Chen Hao',
    riskLevel: 'Medium',
    coverageRate: 95,
    status: 'Waiting Reply',
  },
  {
    id: 'client-4',
    name: 'Summit Studio',
    serviceType: 'Annual',
    manager: 'Wang Yu',
    riskLevel: 'Low',
    coverageRate: 98,
    status: 'Completed',
  },
];

export const tasks: Task[] = [
  {
    id: 'task-1',
    clientId: 'client-1',
    title: 'Missing June Supplier Invoice',
    type: 'Missing Document',
    priority: 'High',
    assignedRole: 'Accountant',
    status: 'Open',
    createdAt: '2026-04-24',
    dueDate: '2026-04-26',
  },
  {
    id: 'task-2',
    clientId: 'client-2',
    title: 'Review April Bank Statement OCR',
    type: 'OCR Review',
    priority: 'High',
    assignedRole: 'CPA',
    status: 'In Progress',
    createdAt: '2026-04-23',
    dueDate: '2026-04-25',
  },
  {
    id: 'task-3',
    clientId: 'client-3',
    title: 'Confirm GST Pack Missing Attachments',
    type: 'GST Review',
    priority: 'Medium',
    assignedRole: 'Manager',
    status: 'Waiting',
    createdAt: '2026-04-22',
    dueDate: '2026-04-28',
  },
  {
    id: 'task-4',
    clientId: 'client-4',
    title: 'Validate Annual Receipt Batch Completeness',
    type: 'Missing Document',
    priority: 'Low',
    assignedRole: 'CST',
    status: 'Open',
    createdAt: '2026-04-18',
    dueDate: '2026-05-05',
  },
  {
    id: 'task-5',
    clientId: 'client-1',
    title: 'Follow Up on Supplier Credit Note',
    type: 'Missing Document',
    priority: 'Medium',
    assignedRole: 'Accountant',
    status: 'Open',
    createdAt: '2026-04-21',
    dueDate: '2026-04-30',
  },
];

export const documents: DocumentRecord[] = [
  {
    clientId: 'client-1',
    documentType: 'Invoice',
    expectedMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    receivedMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    missingMonths: ['Jun'],
  },
  {
    clientId: 'client-2',
    documentType: 'Bank Statement',
    expectedMonths: ['Jan', 'Feb', 'Mar', 'Apr'],
    receivedMonths: ['Jan', 'Feb', 'Mar'],
    missingMonths: ['Apr'],
  },
  {
    clientId: 'client-3',
    documentType: 'GST Pack',
    expectedMonths: ['Q1'],
    receivedMonths: [],
    missingMonths: ['Q1'],
  },
  {
    clientId: 'client-4',
    documentType: 'Receipt Batch',
    expectedMonths: ['FY2025'],
    receivedMonths: ['FY2025'],
    missingMonths: [],
  },
];

export const emailDrafts: EmailDraft[] = [
  {
    taskId: 'task-1',
    to: 'apex.ap@client.com',
    cc: 'yang.wen@firm.com',
    subject: 'Missing June Supplier Invoice',
    followUpLevel: 'L1',
    body: `Dear Apex Retail team,

We are finalizing the June accounting review and noticed that the June supplier invoice is still outstanding.

Could you please send the invoice at your earliest convenience? Once received, we will complete the review promptly.

Thank you.
Best regards,
Accounting Assistant`,
  },
];
