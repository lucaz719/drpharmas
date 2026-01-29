// Audit Management Mock Data

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  organizationId?: string;
  branchId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system_access' | 'compliance' | 'security';
  metadata: Record<string, any>;
  changesBefore?: any;
  changesAfter?: any;
}

export interface ComplianceAudit {
  id: string;
  auditType: 'internal' | 'external' | 'regulatory' | 'self_assessment';
  title: string;
  description: string;
  auditor: string;
  auditeeId: string;
  auditeeName: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scope: string[];
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  overallRating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'poor';
  complianceScore: number;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  reportId?: string;
}

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  evidence: string[];
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assignedTo?: string;
  dueDate?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuditRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  expectedBenefit: string;
  implementationEffort: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'in_progress' | 'implemented' | 'rejected';
  assignedTo?: string;
  estimatedCost?: number;
  dueDate?: string;
  implementedAt?: string;
}

export interface SecurityEvent {
  id: string;
  eventType: 'login_failure' | 'unauthorized_access' | 'data_breach' | 'privilege_escalation' | 'suspicious_activity' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  details: Record<string, any>;
  actions: SecurityAction[];
}

export interface SecurityAction {
  id: string;
  action: string;
  description: string;
  takenBy: string;
  takenAt: string;
  result: string;
}

export interface DataIntegrityCheck {
  id: string;
  checkType: 'database_consistency' | 'backup_verification' | 'checksum_validation' | 'referential_integrity';
  tableName?: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  startTime: string;
  endTime?: string;
  recordsChecked: number;
  issuesFound: number;
  details: string;
  recommendations: string[];
}

// Mock Data
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'al-1',
    timestamp: '2024-03-15T10:30:00Z',
    userId: 'user-pharmacist-1',
    userName: 'Dr. Emily Chen',
    userRole: 'SENIOR_PHARMACIST',
    action: 'UPDATE_INVENTORY',
    module: 'Inventory Management',
    resourceType: 'Product',
    resourceId: 'prod-1',
    resourceName: 'Paracetamol 500mg',
    details: 'Updated stock quantity from 450 to 500',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'sess-abc123',
    organizationId: 'org-1',
    branchId: 'branch-1',
    severity: 'low',
    category: 'data_modification',
    metadata: {
      oldQuantity: 450,
      newQuantity: 500,
      reason: 'Stock replenishment'
    },
    changesBefore: { stock: 450 },
    changesAfter: { stock: 500 }
  },
  {
    id: 'al-2',
    timestamp: '2024-03-15T09:15:00Z',
    userId: 'user-manager-1',
    userName: 'Mike Wilson',
    userRole: 'BRANCH_MANAGER',
    action: 'LOGIN',
    module: 'Authentication',
    resourceType: 'User Session',
    details: 'Successful login',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'sess-def456',
    organizationId: 'org-1',
    branchId: 'branch-1',
    severity: 'low',
    category: 'authentication',
    metadata: {
      loginMethod: 'email_password',
      mfaUsed: false
    }
  },
  {
    id: 'al-3',
    timestamp: '2024-03-15T08:45:00Z',
    userId: 'user-cashier-1',
    userName: 'Lisa Brown',
    userRole: 'CASHIER',
    action: 'PROCESS_SALE',
    module: 'Point of Sale',
    resourceType: 'Sale',
    resourceId: 'sale-004',
    resourceName: 'Sale #SALE-2024-004',
    details: 'Processed sale for ₹295.50',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'sess-ghi789',
    organizationId: 'org-1',
    branchId: 'branch-1',
    severity: 'low',
    category: 'data_access',
    metadata: {
      saleAmount: 295.50,
      itemCount: 3,
      paymentMethod: 'cash'
    }
  },
  {
    id: 'al-4',
    timestamp: '2024-03-15T07:30:00Z',
    userId: 'unknown',
    userName: 'Unknown User',
    userRole: 'unknown',
    action: 'FAILED_LOGIN',
    module: 'Authentication',
    resourceType: 'User Session',
    details: 'Failed login attempt for email: admin@test.com',
    ipAddress: '203.0.113.15',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    sessionId: 'sess-jkl012',
    severity: 'medium',
    category: 'security',
    metadata: {
      attemptedEmail: 'admin@test.com',
      failureReason: 'invalid_credentials',
      attemptCount: 3
    }
  },
  {
    id: 'al-5',
    timestamp: '2024-03-14T16:20:00Z',
    userId: 'user-owner-1',
    userName: 'Dr. Sarah Johnson',
    userRole: 'PHARMACY_OWNER',
    action: 'CREATE_USER',
    module: 'User Management',
    resourceType: 'User',
    resourceId: 'user-new-1',
    resourceName: 'New Pharmacist Account',
    details: 'Created new pharmacist account for Jane Doe',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    sessionId: 'sess-mno345',
    organizationId: 'org-1',
    severity: 'medium',
    category: 'authorization',
    metadata: {
      newUserEmail: 'jane.doe@medicare.com',
      newUserRole: 'PHARMACIST',
      permissions: ['prescriptions', 'basic_inventory']
    }
  }
];

export const mockComplianceAudits: ComplianceAudit[] = [
  {
    id: 'ca-1',
    auditType: 'regulatory',
    title: 'FDA Compliance Audit - Q1 2024',
    description: 'Quarterly compliance audit focusing on drug storage and dispensing practices',
    auditor: 'FDA Inspector John Smith',
    auditeeId: 'org-1',
    auditeeName: 'MediCare Hospital Network',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    status: 'completed',
    scope: ['drug_storage', 'dispensing_practices', 'record_keeping', 'staff_qualifications'],
    findings: [
      {
        id: 'af-1',
        title: 'Temperature Monitoring Records',
        description: 'Some gaps found in refrigerator temperature monitoring logs',
        severity: 'medium',
        category: 'record_keeping',
        evidence: ['temperature_logs_jan.pdf', 'refrigerator_inspection.jpg'],
        recommendation: 'Implement automated temperature monitoring system',
        status: 'in_progress',
        assignedTo: 'user-manager-1',
        dueDate: '2024-04-15'
      },
      {
        id: 'af-2',
        title: 'Controlled Substance Documentation',
        description: 'Minor discrepancies in controlled substance inventory records',
        severity: 'low',
        category: 'documentation',
        evidence: ['cs_inventory_march.xlsx'],
        recommendation: 'Enhanced double-verification process for controlled substances',
        status: 'resolved',
        assignedTo: 'user-pharmacist-1',
        resolvedAt: '2024-03-10T14:30:00Z',
        resolvedBy: 'user-pharmacist-1'
      }
    ],
    recommendations: [
      {
        id: 'ar-1',
        title: 'Implement Digital Temperature Monitoring',
        description: 'Deploy IoT-based temperature monitoring system for all refrigerated storage',
        priority: 'high',
        category: 'technology',
        expectedBenefit: 'Eliminate manual logging errors and ensure continuous monitoring',
        implementationEffort: 'medium',
        status: 'approved',
        assignedTo: 'user-manager-1',
        estimatedCost: 15000,
        dueDate: '2024-05-01'
      }
    ],
    overallRating: 'good',
    complianceScore: 87.5,
    createdBy: 'FDA Inspector John Smith',
    createdAt: '2024-03-01T09:00:00Z',
    completedAt: '2024-03-05T17:00:00Z',
    reportId: 'FDA-2024-Q1-001'
  },
  {
    id: 'ca-2',
    auditType: 'internal',
    title: 'Internal Security Audit - March 2024',
    description: 'Monthly internal audit focusing on data security and access controls',
    auditor: 'Internal Audit Team',
    auditeeId: 'branch-1',
    auditeeName: 'MediCare Main Hospital',
    startDate: '2024-03-10',
    endDate: '2024-03-12',
    status: 'in_progress',
    scope: ['access_controls', 'data_security', 'user_permissions', 'backup_procedures'],
    findings: [],
    recommendations: [],
    overallRating: 'good',
    complianceScore: 0,
    createdBy: 'user-owner-1',
    createdAt: '2024-03-10T08:00:00Z'
  }
];

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'se-1',
    eventType: 'login_failure',
    severity: 'medium',
    title: 'Multiple Failed Login Attempts',
    description: 'Multiple failed login attempts detected from IP 203.0.113.15',
    ipAddress: '203.0.113.15',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    timestamp: '2024-03-15T07:30:00Z',
    status: 'investigating',
    assignedTo: 'user-owner-1',
    details: {
      attemptedEmails: ['admin@test.com', 'root@medicare.com', 'admin@medicare.com'],
      attemptCount: 15,
      timeRange: '2024-03-15T07:25:00Z to 2024-03-15T07:35:00Z'
    },
    actions: [
      {
        id: 'sa-1',
        action: 'IP_BLOCKED',
        description: 'Temporarily blocked IP address for 24 hours',
        takenBy: 'system',
        takenAt: '2024-03-15T07:35:00Z',
        result: 'IP successfully blocked'
      }
    ]
  },
  {
    id: 'se-2',
    eventType: 'unauthorized_access',
    severity: 'high',
    title: 'Unauthorized Access Attempt to Compliance Module',
    description: 'User attempted to access compliance module without proper permissions',
    userId: 'user-cashier-1',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-03-14T14:20:00Z',
    status: 'resolved',
    assignedTo: 'user-manager-1',
    details: {
      attemptedModule: 'compliance',
      userRole: 'CASHIER',
      requiredPermissions: ['compliance_access'],
      userPermissions: ['pos', 'basic_reports']
    },
    actions: [
      {
        id: 'sa-2',
        action: 'ACCESS_DENIED',
        description: 'Access denied and incident logged',
        takenBy: 'system',
        takenAt: '2024-03-14T14:20:00Z',
        result: 'Access successfully denied'
      },
      {
        id: 'sa-3',
        action: 'USER_NOTIFICATION',
        description: 'User notified about security policy',
        takenBy: 'user-manager-1',
        takenAt: '2024-03-14T15:00:00Z',
        result: 'User acknowledged security policy'
      }
    ]
  }
];

export const mockDataIntegrityChecks: DataIntegrityCheck[] = [
  {
    id: 'dic-1',
    checkType: 'database_consistency',
    tableName: 'inventory',
    status: 'passed',
    startTime: '2024-03-15T02:00:00Z',
    endTime: '2024-03-15T02:15:00Z',
    recordsChecked: 1247,
    issuesFound: 0,
    details: 'All inventory records passed consistency checks',
    recommendations: []
  },
  {
    id: 'dic-2',
    checkType: 'referential_integrity',
    tableName: 'sales',
    status: 'warning',
    startTime: '2024-03-15T02:15:00Z',
    endTime: '2024-03-15T02:25:00Z',
    recordsChecked: 3456,
    issuesFound: 2,
    details: '2 orphaned sale records found without corresponding customer records',
    recommendations: [
      'Review customer data cleanup procedures',
      'Implement stronger foreign key constraints'
    ]
  },
  {
    id: 'dic-3',
    checkType: 'backup_verification',
    status: 'passed',
    startTime: '2024-03-15T01:00:00Z',
    endTime: '2024-03-15T01:30:00Z',
    recordsChecked: 15678,
    issuesFound: 0,
    details: 'All backup files verified successfully',
    recommendations: []
  }
];

// Helper functions
export const getAuditLogsByUser = (userId: string): AuditLog[] => {
  return mockAuditLogs.filter(log => log.userId === userId);
};

export const getAuditLogsByModule = (module: string): AuditLog[] => {
  return mockAuditLogs.filter(log => log.module === module);
};

export const getAuditLogsBySeverity = (severity: AuditLog['severity']): AuditLog[] => {
  return mockAuditLogs.filter(log => log.severity === severity);
};

export const getAuditLogsByDateRange = (startDate: string, endDate: string): AuditLog[] => {
  return mockAuditLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= new Date(startDate) && logDate <= new Date(endDate);
  });
};

export const getComplianceAuditsByStatus = (status: ComplianceAudit['status']): ComplianceAudit[] => {
  return mockComplianceAudits.filter(audit => audit.status === status);
};

export const getSecurityEventsByStatus = (status: SecurityEvent['status']): SecurityEvent[] => {
  return mockSecurityEvents.filter(event => event.status === status);
};

export const getSecurityEventsBySeverity = (severity: SecurityEvent['severity']): SecurityEvent[] => {
  return mockSecurityEvents.filter(event => event.severity === severity);
};

export const getFailedIntegrityChecks = (): DataIntegrityCheck[] => {
  return mockDataIntegrityChecks.filter(check => check.status === 'failed' || check.status === 'warning');
};

export const getOpenAuditFindings = (): AuditFinding[] => {
  return mockComplianceAudits.flatMap(audit => 
    audit.findings.filter(finding => finding.status === 'open' || finding.status === 'in_progress')
  );
};

export const getPendingAuditRecommendations = (): AuditRecommendation[] => {
  return mockComplianceAudits.flatMap(audit => 
    audit.recommendations.filter(rec => rec.status === 'pending' || rec.status === 'approved')
  );
};