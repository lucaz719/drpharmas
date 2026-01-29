// Inventory Mock Data

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  manufacturer: string;
  description: string;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  location: string;
  expiryDate?: string;
  batchNumber?: string;
  barcode?: string;
  status: 'active' | 'inactive' | 'discontinued';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  reference: string;
  notes?: string;
  userId: string;
  branchId: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  drugLicense?: string;
  paymentTerms: string;
  creditLimit: number;
  status: 'active' | 'inactive';
  rating: number;
  totalOrders: number;
  onTimeDelivery: number;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  branchId: string;
  orderDate: string;
  expectedDate: string;
  deliveryDate?: string;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  receivedQuantity?: number;
}

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Paracetamol 500mg',
    sku: 'MED-001',
    category: 'Analgesics',
    brand: 'Cipla',
    manufacturer: 'Cipla Ltd',
    description: 'Pain relief and fever reducer',
    unit: 'Tablet',
    price: 2.50,
    cost: 1.80,
    stock: 500,
    minStock: 50,
    maxStock: 1000,
    location: 'A-01-001',
    expiryDate: '2025-12-31',
    batchNumber: 'PAR2024001',
    barcode: '8901030123456',
    status: 'active',
    tags: ['otc', 'analgesic', 'fever'],
    createdAt: '2024-01-15',
    updatedAt: '2024-03-10'
  },
  {
    id: 'prod-2',
    name: 'Amoxicillin 250mg',
    sku: 'MED-002',
    category: 'Antibiotics',
    brand: 'Ranbaxy',
    manufacturer: 'Sun Pharmaceutical',
    description: 'Broad spectrum antibiotic',
    unit: 'Capsule',
    price: 8.75,
    cost: 6.20,
    stock: 200,
    minStock: 30,
    maxStock: 500,
    location: 'A-02-005',
    expiryDate: '2025-08-15',
    batchNumber: 'AMX2024002',
    barcode: '8901030123457',
    status: 'active',
    tags: ['prescription', 'antibiotic'],
    createdAt: '2024-01-20',
    updatedAt: '2024-03-12'
  },
  {
    id: 'prod-3',
    name: 'Vitamin D3 1000 IU',
    sku: 'MED-003',
    category: 'Vitamins',
    brand: 'HealthVit',
    manufacturer: 'HealthKart',
    description: 'Vitamin D3 supplement',
    unit: 'Tablet',
    price: 15.00,
    cost: 10.50,
    stock: 150,
    minStock: 25,
    maxStock: 300,
    location: 'B-01-010',
    expiryDate: '2026-01-30',
    batchNumber: 'VIT2024003',
    barcode: '8901030123458',
    status: 'active',
    tags: ['supplement', 'vitamin', 'otc'],
    createdAt: '2024-02-01',
    updatedAt: '2024-03-14'
  },
  {
    id: 'prod-4',
    name: 'Insulin Aspart 100 units/ml',
    sku: 'MED-004',
    category: 'Diabetes',
    brand: 'Novo Nordisk',
    manufacturer: 'Novo Nordisk',
    description: 'Fast-acting insulin',
    unit: 'Vial',
    price: 850.00,
    cost: 680.00,
    stock: 25,
    minStock: 5,
    maxStock: 50,
    location: 'C-01-001',
    expiryDate: '2025-06-30',
    batchNumber: 'INS2024004',
    barcode: '8901030123459',
    status: 'active',
    tags: ['prescription', 'diabetes', 'insulin', 'refrigerated'],
    createdAt: '2024-02-05',
    updatedAt: '2024-03-15'
  },
  {
    id: 'prod-5',
    name: 'Hand Sanitizer 500ml',
    sku: 'MED-005',
    category: 'Personal Care',
    brand: 'Dettol',
    manufacturer: 'Reckitt Benckiser',
    description: 'Alcohol-based hand sanitizer',
    unit: 'Bottle',
    price: 125.00,
    cost: 95.00,
    stock: 80,
    minStock: 20,
    maxStock: 200,
    location: 'D-01-015',
    expiryDate: '2025-10-15',
    batchNumber: 'SAN2024005',
    barcode: '8901030123460',
    status: 'active',
    tags: ['hygiene', 'sanitizer', 'otc'],
    createdAt: '2024-02-10',
    updatedAt: '2024-03-16'
  }
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'MedPharma Distributors',
    contactPerson: 'Rajesh Kumar',
    email: 'rajesh@medpharma.com',
    phone: '+91-9876543210',
    address: '123 Industrial Area, Mumbai, Maharashtra',
    gstNumber: '27ABCDE1234F1Z5',
    drugLicense: 'DL-MH-001-2024',
    paymentTerms: '30 days',
    creditLimit: 500000,
    status: 'active',
    rating: 4.8,
    totalOrders: 245,
    onTimeDelivery: 95,
    createdAt: '2024-01-10'
  },
  {
    id: 'sup-2',
    name: 'HealthCare Supplies Ltd',
    contactPerson: 'Priya Sharma',
    email: 'priya@healthcaresupplies.com',
    phone: '+91-9876543211',
    address: '456 Medical Hub, Delhi',
    gstNumber: '07ABCDE1234F1Z6',
    drugLicense: 'DL-DL-002-2024',
    paymentTerms: '45 days',
    creditLimit: 750000,
    status: 'active',
    rating: 4.6,
    totalOrders: 189,
    onTimeDelivery: 92,
    createdAt: '2024-01-15'
  },
  {
    id: 'sup-3',
    name: 'Generic Medicines Co.',
    contactPerson: 'Amit Patel',
    email: 'amit@genericmed.com',
    phone: '+91-9876543212',
    address: '789 Pharma Park, Ahmedabad, Gujarat',
    gstNumber: '24ABCDE1234F1Z7',
    drugLicense: 'DL-GJ-003-2024',
    paymentTerms: '30 days',
    creditLimit: 300000,
    status: 'active',
    rating: 4.4,
    totalOrders: 156,
    onTimeDelivery: 88,
    createdAt: '2024-01-20'
  }
];

// Mock Purchase Orders
export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    orderNumber: 'PO-2024-001',
    supplierId: 'sup-1',
    branchId: 'branch-1',
    orderDate: '2024-03-01',
    expectedDate: '2024-03-10',
    deliveryDate: '2024-03-08',
    status: 'received',
    items: [
      { productId: 'prod-1', quantity: 1000, unitPrice: 1.80, total: 1800, receivedQuantity: 1000 },
      { productId: 'prod-2', quantity: 500, unitPrice: 6.20, total: 3100, receivedQuantity: 500 }
    ],
    subtotal: 4900,
    tax: 882,
    total: 5782,
    notes: 'Urgent order for restocking',
    createdBy: 'user-manager-1',
    approvedBy: 'user-owner-1',
    createdAt: '2024-03-01'
  },
  {
    id: 'po-2',
    orderNumber: 'PO-2024-002',
    supplierId: 'sup-2',
    branchId: 'branch-1',
    orderDate: '2024-03-05',
    expectedDate: '2024-03-15',
    status: 'approved',
    items: [
      { productId: 'prod-3', quantity: 300, unitPrice: 10.50, total: 3150 },
      { productId: 'prod-4', quantity: 50, unitPrice: 680.00, total: 34000 }
    ],
    subtotal: 37150,
    tax: 6687,
    total: 43837,
    notes: 'Monthly vitamin and insulin order',
    createdBy: 'user-pharmacist-1',
    approvedBy: 'user-manager-1',
    createdAt: '2024-03-05'
  }
];

// Mock Stock Transactions
export const mockStockTransactions: StockTransaction[] = [
  {
    id: 'tx-1',
    productId: 'prod-1',
    type: 'purchase',
    quantity: 1000,
    unitPrice: 1.80,
    totalAmount: 1800,
    reference: 'PO-2024-001',
    notes: 'Received from MedPharma',
    userId: 'user-manager-1',
    branchId: 'branch-1',
    createdAt: '2024-03-08T10:30:00Z'
  },
  {
    id: 'tx-2',
    productId: 'prod-1',
    type: 'sale',
    quantity: -50,
    unitPrice: 2.50,
    totalAmount: 125,
    reference: 'SALE-001',
    notes: 'OTC sale',
    userId: 'user-cashier-1',
    branchId: 'branch-1',
    createdAt: '2024-03-10T14:15:00Z'
  },
  {
    id: 'tx-3',
    productId: 'prod-2',
    type: 'sale',
    quantity: -20,
    unitPrice: 8.75,
    totalAmount: 175,
    reference: 'SALE-002',
    notes: 'Prescription sale',
    userId: 'user-pharmacist-1',
    branchId: 'branch-1',
    createdAt: '2024-03-12T11:45:00Z'
  }
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getSupplierById = (id: string): Supplier | undefined => {
  return mockSuppliers.find(supplier => supplier.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return mockProducts.filter(product => product.category === category);
};

export const getLowStockProducts = (): Product[] => {
  return mockProducts.filter(product => product.stock <= product.minStock);
};

export const getExpiringProducts = (daysThreshold: number = 30): Product[] => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  return mockProducts.filter(product => {
    if (!product.expiryDate) return false;
    const expiryDate = new Date(product.expiryDate);
    return expiryDate <= thresholdDate;
  });
};