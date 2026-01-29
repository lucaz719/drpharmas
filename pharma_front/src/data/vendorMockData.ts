// Vendor Portal Mock Data

export interface VendorOrder {
  id: string;
  orderNumber: string;
  pharmacyId: string;
  pharmacyName: string;
  orderDate: string;
  deliveryDate?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: VendorOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

export interface VendorOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface VendorProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  minimumOrder: number;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
  leadTime: number; // days
  status: 'active' | 'inactive';
  lastUpdated: string;
}

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  orderIds: string[];
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paidDate?: string;
}

export interface VendorPerformanceMetric {
  period: string;
  ordersReceived: number;
  ordersDelivered: number;
  onTimeDelivery: number;
  qualityRating: number;
  revenue: number;
  disputesResolved: number;
}

export interface VendorCommunication {
  id: string;
  from: string;
  to: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  attachments?: string[];
}

// Mock Data
export const mockVendorOrders: VendorOrder[] = [
  {
    id: 'vo-1',
    orderNumber: 'ORD-2024-001',
    pharmacyId: 'org-1',
    pharmacyName: 'MediCare Hospital Network',
    orderDate: '2024-03-15',
    deliveryDate: '2024-03-20',
    status: 'confirmed',
    items: [
      {
        productId: 'vp-1',
        productName: 'Paracetamol 500mg (1000 tablets)',
        quantity: 10,
        unitPrice: 850.00,
        total: 8500.00
      },
      {
        productId: 'vp-2',
        productName: 'Amoxicillin 250mg (500 capsules)',
        quantity: 5,
        unitPrice: 1200.00,
        total: 6000.00
      }
    ],
    subtotal: 14500.00,
    tax: 2610.00,
    total: 17110.00,
    paymentStatus: 'pending',
    notes: 'Urgent delivery required for main branch'
  },
  {
    id: 'vo-2',
    orderNumber: 'ORD-2024-002',
    pharmacyId: 'org-2',
    pharmacyName: 'HealthPlus Pharmacy Chain',
    orderDate: '2024-03-12',
    deliveryDate: '2024-03-18',
    status: 'delivered',
    items: [
      {
        productId: 'vp-3',
        productName: 'Insulin Aspart 100 units/ml',
        quantity: 20,
        unitPrice: 680.00,
        total: 13600.00
      }
    ],
    subtotal: 13600.00,
    tax: 2448.00,
    total: 16048.00,
    paymentStatus: 'paid',
    notes: 'Standard delivery'
  },
  {
    id: 'vo-3',
    orderNumber: 'ORD-2024-003',
    pharmacyId: 'org-1',
    pharmacyName: 'MediCare Hospital Network',
    orderDate: '2024-03-10',
    status: 'pending',
    items: [
      {
        productId: 'vp-4',
        productName: 'Hand Sanitizer 500ml (24 bottles)',
        quantity: 50,
        unitPrice: 95.00,
        total: 4750.00
      }
    ],
    subtotal: 4750.00,
    tax: 855.00,
    total: 5605.00,
    paymentStatus: 'pending'
  }
];

export const mockVendorProducts: VendorProduct[] = [
  {
    id: 'vp-1',
    name: 'Paracetamol 500mg',
    sku: 'PAR-500-1000',
    category: 'Analgesics',
    description: 'High-quality paracetamol tablets, 1000 count bottle',
    price: 850.00,
    minimumOrder: 5,
    availability: 'in-stock',
    leadTime: 3,
    status: 'active',
    lastUpdated: '2024-03-14'
  },
  {
    id: 'vp-2',
    name: 'Amoxicillin 250mg',
    sku: 'AMX-250-500',
    category: 'Antibiotics',
    description: 'Broad spectrum antibiotic capsules, 500 count',
    price: 1200.00,
    minimumOrder: 3,
    availability: 'in-stock',
    leadTime: 5,
    status: 'active',
    lastUpdated: '2024-03-13'
  },
  {
    id: 'vp-3',
    name: 'Insulin Aspart 100 units/ml',
    sku: 'INS-ASP-100',
    category: 'Diabetes',
    description: 'Fast-acting insulin for diabetes management',
    price: 680.00,
    minimumOrder: 10,
    availability: 'low-stock',
    leadTime: 7,
    status: 'active',
    lastUpdated: '2024-03-12'
  },
  {
    id: 'vp-4',
    name: 'Hand Sanitizer 500ml',
    sku: 'SAN-500-24',
    category: 'Personal Care',
    description: 'Alcohol-based hand sanitizer, 24 bottle case',
    price: 95.00,
    minimumOrder: 20,
    availability: 'in-stock',
    leadTime: 2,
    status: 'active',
    lastUpdated: '2024-03-15'
  }
];

export const mockVendorInvoices: VendorInvoice[] = [
  {
    id: 'vi-1',
    invoiceNumber: 'INV-2024-001',
    orderIds: ['vo-2'],
    issueDate: '2024-03-18',
    dueDate: '2024-04-17',
    amount: 16048.00,
    status: 'paid',
    paymentMethod: 'Bank Transfer',
    paidDate: '2024-03-25'
  },
  {
    id: 'vi-2',
    invoiceNumber: 'INV-2024-002',
    orderIds: ['vo-1'],
    issueDate: '2024-03-20',
    dueDate: '2024-04-19',
    amount: 17110.00,
    status: 'pending'
  }
];

export const mockVendorPerformance: VendorPerformanceMetric[] = [
  {
    period: 'March 2024',
    ordersReceived: 45,
    ordersDelivered: 42,
    onTimeDelivery: 95.5,
    qualityRating: 4.8,
    revenue: 245000,
    disputesResolved: 2
  },
  {
    period: 'February 2024',
    ordersReceived: 38,
    ordersDelivered: 36,
    onTimeDelivery: 94.7,
    qualityRating: 4.7,
    revenue: 198000,
    disputesResolved: 1
  },
  {
    period: 'January 2024',
    ordersReceived: 41,
    ordersDelivered: 39,
    onTimeDelivery: 95.1,
    qualityRating: 4.9,
    revenue: 225000,
    disputesResolved: 0
  }
];

export const mockVendorCommunications: VendorCommunication[] = [
  {
    id: 'vc-1',
    from: 'procurement@medicare.com',
    to: 'sales@pharmasupply.com',
    subject: 'Urgent: Stock Update Required for Insulin',
    message: 'We need updated stock levels for Insulin Aspart. Our current order is pending confirmation.',
    priority: 'high',
    status: 'unread',
    createdAt: '2024-03-15T10:30:00Z'
  },
  {
    id: 'vc-2',
    from: 'admin@healthplus.com',
    to: 'sales@pharmasupply.com',
    subject: 'Monthly Order Schedule',
    message: 'Please find attached our monthly order schedule for April 2024.',
    priority: 'medium',
    status: 'read',
    createdAt: '2024-03-14T14:15:00Z',
    attachments: ['april_schedule.pdf']
  },
  {
    id: 'vc-3',
    from: 'quality@medicare.com',
    to: 'quality@pharmasupply.com',
    subject: 'Quality Certificate Required',
    message: 'We need the latest quality certificates for batch PAR-2024-001.',
    priority: 'medium',
    status: 'replied',
    createdAt: '2024-03-13T09:45:00Z'
  }
];

// Helper functions
export const getVendorOrderById = (id: string): VendorOrder | undefined => {
  return mockVendorOrders.find(order => order.id === id);
};

export const getVendorProductById = (id: string): VendorProduct | undefined => {
  return mockVendorProducts.find(product => product.id === id);
};

export const getVendorOrdersByStatus = (status: VendorOrder['status']): VendorOrder[] => {
  return mockVendorOrders.filter(order => order.status === status);
};

export const getVendorInvoicesByStatus = (status: VendorInvoice['status']): VendorInvoice[] => {
  return mockVendorInvoices.filter(invoice => invoice.status === status);
};

export const getTotalVendorRevenue = (): number => {
  return mockVendorInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((total, invoice) => total + invoice.amount, 0);
};

export const getUnreadCommunications = (): VendorCommunication[] => {
  return mockVendorCommunications.filter(comm => comm.status === 'unread');
};