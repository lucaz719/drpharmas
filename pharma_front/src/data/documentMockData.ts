// Document Management Mock Data

export interface Document {
  id: string;
  name: string;
  type: string;
  category: 'license' | 'certificate' | 'compliance' | 'contract' | 'invoice' | 'report' | 'policy' | 'other';
  description?: string;
  fileSize: number;
  mimeType: string;
  version: number;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'archived';
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  expiryDate?: string;
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  departmentId?: string;
  branchId?: string;
  organizationId?: string;
  parentDocumentId?: string;
  checksum: string;
  downloadCount: number;
  metadata: Record<string, any>;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  changes: string;
  status: 'current' | 'archived';
}

export interface DocumentWorkflow {
  id: string;
  documentId: string;
  workflowType: 'approval' | 'review' | 'signature' | 'renewal';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string[];
  currentStep: number;
  totalSteps: number;
  dueDate?: string;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: string;
  comments?: string;
  actions: string[];
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string;
  type: 'folder' | 'category';
  permissions: string[];
  createdBy: string;
  createdAt: string;
  documentCount: number;
  subfolderCount: number;
}

export interface DocumentAccess {
  id: string;
  documentId: string;
  userId: string;
  action: 'view' | 'download' | 'edit' | 'delete' | 'share';
  accessedAt: string;
  ipAddress: string;
  userAgent: string;
}

// Mock Data
export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Drug License Certificate',
    type: 'pdf',
    category: 'license',
    description: 'Main drug license certificate for MediCare Hospital Network',
    fileSize: 2457600, // 2.4 MB
    mimeType: 'application/pdf',
    version: 3,
    status: 'approved',
    tags: ['drug-license', 'certificate', 'regulatory', 'main-branch'],
    uploadedBy: 'user-owner-1',
    uploadedAt: '2024-01-15T10:30:00Z',
    lastModified: '2024-02-20T14:15:00Z',
    expiryDate: '2025-01-15',
    accessLevel: 'confidential',
    organizationId: 'org-1',
    branchId: 'branch-1',
    checksum: 'sha256:abc123def456',
    downloadCount: 15,
    metadata: {
      licenseNumber: 'DL-MH-001-2024',
      issuingAuthority: 'Maharashtra FDA',
      renewalRequired: true
    }
  },
  {
    id: 'doc-2',
    name: 'GST Registration Certificate',
    type: 'pdf',
    category: 'certificate',
    description: 'GST registration certificate for tax compliance',
    fileSize: 1843200, // 1.8 MB
    mimeType: 'application/pdf',
    version: 1,
    status: 'approved',
    tags: ['gst', 'tax', 'registration', 'compliance'],
    uploadedBy: 'user-manager-1',
    uploadedAt: '2024-01-20T09:45:00Z',
    lastModified: '2024-01-20T09:45:00Z',
    expiryDate: '2027-01-20',
    accessLevel: 'internal',
    organizationId: 'org-1',
    checksum: 'sha256:def456ghi789',
    downloadCount: 8,
    metadata: {
      gstNumber: '27ABCDE1234F1Z5',
      stateCode: '27'
    }
  },
  {
    id: 'doc-3',
    name: 'Monthly Compliance Report - March 2024',
    type: 'docx',
    category: 'report',
    description: 'Comprehensive compliance report for March 2024',
    fileSize: 3276800, // 3.2 MB
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    version: 2,
    status: 'under_review',
    tags: ['compliance', 'monthly', 'march-2024', 'report'],
    uploadedBy: 'user-pharmacist-1',
    uploadedAt: '2024-03-05T16:20:00Z',
    lastModified: '2024-03-10T11:30:00Z',
    accessLevel: 'internal',
    organizationId: 'org-1',
    branchId: 'branch-1',
    checksum: 'sha256:ghi789jkl012',
    downloadCount: 3,
    metadata: {
      reportPeriod: '2024-03',
      complianceScore: 92.5,
      issuesFound: 2
    }
  },
  {
    id: 'doc-4',
    name: 'Supplier Agreement - MedPharma Distributors',
    type: 'pdf',
    category: 'contract',
    description: 'Master agreement with MedPharma Distributors',
    fileSize: 4567890, // 4.6 MB
    mimeType: 'application/pdf',
    version: 2,
    status: 'approved',
    tags: ['contract', 'supplier', 'medpharma', 'agreement'],
    uploadedBy: 'user-owner-1',
    uploadedAt: '2024-02-01T12:00:00Z',
    lastModified: '2024-02-15T14:30:00Z',
    expiryDate: '2025-02-01',
    accessLevel: 'confidential',
    organizationId: 'org-1',
    checksum: 'sha256:jkl012mno345',
    downloadCount: 12,
    metadata: {
      contractValue: 500000,
      supplierId: 'sup-1',
      paymentTerms: '30 days'
    }
  },
  {
    id: 'doc-5',
    name: 'FSSAI License Certificate',
    type: 'pdf',
    category: 'license',
    description: 'Food Safety and Standards Authority license',
    fileSize: 1234567, // 1.2 MB
    mimeType: 'application/pdf',
    version: 1,
    status: 'approved',
    tags: ['fssai', 'food-safety', 'license', 'certificate'],
    uploadedBy: 'user-manager-2',
    uploadedAt: '2024-01-25T08:15:00Z',
    lastModified: '2024-01-25T08:15:00Z',
    expiryDate: '2025-01-25',
    accessLevel: 'internal',
    organizationId: 'org-1',
    branchId: 'branch-2',
    checksum: 'sha256:mno345pqr678',
    downloadCount: 6,
    metadata: {
      licenseNumber: 'FSSAI-001-2024',
      category: 'Drug Retail'
    }
  },
  {
    id: 'doc-6',
    name: 'SOPs - Inventory Management',
    type: 'pdf',
    category: 'policy',
    description: 'Standard Operating Procedures for inventory management',
    fileSize: 2890123, // 2.9 MB
    mimeType: 'application/pdf',
    version: 4,
    status: 'approved',
    tags: ['sop', 'inventory', 'procedures', 'guidelines'],
    uploadedBy: 'user-pharmacist-1',
    uploadedAt: '2024-02-10T13:45:00Z',
    lastModified: '2024-03-01T10:20:00Z',
    accessLevel: 'internal',
    organizationId: 'org-1',
    checksum: 'sha256:pqr678stu901',
    downloadCount: 25,
    metadata: {
      department: 'Inventory',
      reviewDate: '2024-09-01'
    }
  }
];

export const mockDocumentVersions: DocumentVersion[] = [
  {
    id: 'dv-1',
    documentId: 'doc-1',
    version: 3,
    fileName: 'drug_license_v3.pdf',
    fileSize: 2457600,
    uploadedBy: 'user-owner-1',
    uploadedAt: '2024-02-20T14:15:00Z',
    changes: 'Updated expiry date and added new branch coverage',
    status: 'current'
  },
  {
    id: 'dv-2',
    documentId: 'doc-1',
    version: 2,
    fileName: 'drug_license_v2.pdf',
    fileSize: 2398000,
    uploadedBy: 'user-owner-1',
    uploadedAt: '2024-01-20T11:30:00Z',
    changes: 'Corrected address information',
    status: 'archived'
  },
  {
    id: 'dv-3',
    documentId: 'doc-3',
    version: 2,
    fileName: 'compliance_report_march_v2.docx',
    fileSize: 3276800,
    uploadedBy: 'user-pharmacist-1',
    uploadedAt: '2024-03-10T11:30:00Z',
    changes: 'Added additional compliance metrics and corrected data errors',
    status: 'current'
  }
];

export const mockDocumentWorkflows: DocumentWorkflow[] = [
  {
    id: 'dw-1',
    documentId: 'doc-3',
    workflowType: 'approval',
    status: 'in_progress',
    assignedTo: ['user-manager-1', 'user-owner-1'],
    currentStep: 2,
    totalSteps: 3,
    dueDate: '2024-03-20',
    createdBy: 'user-pharmacist-1',
    createdAt: '2024-03-10T11:30:00Z',
    steps: [
      {
        stepNumber: 1,
        title: 'Initial Review',
        description: 'Technical review of compliance data',
        assignedTo: 'user-pharmacist-1',
        status: 'completed',
        completedAt: '2024-03-11T09:15:00Z',
        comments: 'Data verified and accurate',
        actions: ['review', 'approve']
      },
      {
        stepNumber: 2,
        title: 'Manager Approval',
        description: 'Branch manager review and approval',
        assignedTo: 'user-manager-1',
        status: 'in_progress',
        actions: ['approve', 'reject', 'request_changes']
      },
      {
        stepNumber: 3,
        title: 'Final Authorization',
        description: 'Owner final authorization',
        assignedTo: 'user-owner-1',
        status: 'pending',
        actions: ['approve', 'reject']
      }
    ]
  },
  {
    id: 'dw-2',
    documentId: 'doc-1',
    workflowType: 'renewal',
    status: 'pending',
    assignedTo: ['user-owner-1'],
    currentStep: 1,
    totalSteps: 2,
    dueDate: '2024-12-15',
    createdBy: 'system',
    createdAt: '2024-03-01T00:00:00Z',
    steps: [
      {
        stepNumber: 1,
        title: 'Renewal Preparation',
        description: 'Prepare documents for license renewal',
        assignedTo: 'user-owner-1',
        status: 'pending',
        actions: ['prepare', 'submit']
      },
      {
        stepNumber: 2,
        title: 'Authority Submission',
        description: 'Submit to regulatory authority',
        assignedTo: 'user-owner-1',
        status: 'pending',
        actions: ['submit', 'track']
      }
    ]
  }
];

export const mockDocumentFolders: DocumentFolder[] = [
  {
    id: 'df-1',
    name: 'Licenses & Certificates',
    type: 'category',
    permissions: ['view', 'download'],
    createdBy: 'user-owner-1',
    createdAt: '2024-01-01T00:00:00Z',
    documentCount: 3,
    subfolderCount: 2
  },
  {
    id: 'df-2',
    name: 'Compliance Reports',
    type: 'category',
    permissions: ['view', 'download', 'upload'],
    createdBy: 'user-pharmacist-1',
    createdAt: '2024-01-05T00:00:00Z',
    documentCount: 12,
    subfolderCount: 0
  },
  {
    id: 'df-3',
    name: 'Contracts & Agreements',
    type: 'category',
    permissions: ['view'],
    createdBy: 'user-owner-1',
    createdAt: '2024-01-10T00:00:00Z',
    documentCount: 5,
    subfolderCount: 1
  },
  {
    id: 'df-4',
    name: 'Policies & SOPs',
    type: 'category',
    permissions: ['view', 'download'],
    createdBy: 'user-manager-1',
    createdAt: '2024-01-15T00:00:00Z',
    documentCount: 8,
    subfolderCount: 3
  }
];

export const mockDocumentAccess: DocumentAccess[] = [
  {
    id: 'da-1',
    documentId: 'doc-1',
    userId: 'user-manager-1',
    action: 'view',
    accessedAt: '2024-03-15T10:30:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: 'da-2',
    documentId: 'doc-1',
    userId: 'user-pharmacist-1',
    action: 'download',
    accessedAt: '2024-03-14T14:20:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: 'da-3',
    documentId: 'doc-3',
    userId: 'user-owner-1',
    action: 'edit',
    accessedAt: '2024-03-13T09:45:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
];

// Helper functions
export const getDocumentById = (id: string): Document | undefined => {
  return mockDocuments.find(doc => doc.id === id);
};

export const getDocumentsByCategory = (category: Document['category']): Document[] => {
  return mockDocuments.filter(doc => doc.category === category);
};

export const getDocumentsByStatus = (status: Document['status']): Document[] => {
  return mockDocuments.filter(doc => doc.status === status);
};

export const getExpiringDocuments = (daysThreshold: number = 30): Document[] => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  return mockDocuments.filter(doc => {
    if (!doc.expiryDate) return false;
    const expiryDate = new Date(doc.expiryDate);
    return expiryDate <= thresholdDate;
  });
};

export const getDocumentVersions = (documentId: string): DocumentVersion[] => {
  return mockDocumentVersions.filter(version => version.documentId === documentId);
};

export const getActiveWorkflows = (): DocumentWorkflow[] => {
  return mockDocumentWorkflows.filter(workflow => 
    workflow.status === 'pending' || workflow.status === 'in_progress'
  );
};

export const getDocumentsByAccessLevel = (accessLevel: Document['accessLevel']): Document[] => {
  return mockDocuments.filter(doc => doc.accessLevel === accessLevel);
};

export const getTotalDocumentSize = (): number => {
  return mockDocuments.reduce((total, doc) => total + doc.fileSize, 0);
};