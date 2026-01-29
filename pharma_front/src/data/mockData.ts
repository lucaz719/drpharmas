import { User, Product, Customer, Order } from '@/store/appStore';

// Additional types for the existing components
export interface Organization {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  licenseNumber: string;
  subscription?: string;
  status?: string;
  ownerId?: string;
  branches: Branch[];
  settings: {
    taxRate: number;
    currency: string;
    timeZone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  isActive: boolean;
  status: 'active' | 'inactive' | 'maintenance';
  type: 'main' | 'branch' | 'warehouse';
  createdAt: string;
  updatedAt: string;
}

// Mock organizations data
export const mockOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "drpharmas",
    type: "Pharmacy Chain",
    address: "123 Health Street, Medical District",
    phone: "(555) 123-0000",
    email: "info@pharmacare.com",
    licenseNumber: "PH-2024-001234",
    subscription: "Premium",
    status: "active",
    ownerId: "user-1",
    branches: [],
    settings: {
      taxRate: 8.5,
      currency: "USD",
      timeZone: "America/New_York"
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z"
  }
];

// Mock branches data
export const mockBranches: Branch[] = [
  {
    id: "main",
    organizationId: "org-1",
    name: "Main Branch",
    address: "123 Main St, City, State",
    phone: "(555) 123-4567",
    email: "main@pharmacare.com",
    manager: "Dr. Sarah Johnson",
    isActive: true,
    status: "active",
    type: "main",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z"
  },
  {
    id: "branch1",
    organizationId: "org-1",
    name: "North Branch",
    address: "456 North Ave, City, State",
    phone: "(555) 234-5678",
    email: "north@pharmacare.com",
    manager: "Mike Wilson",
    isActive: true,
    status: "active",
    type: "branch",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z"
  }
];

// Enhanced User type for existing components
export type { User } from '@/store/appStore';

// Mock users data (with full User type including IDs)
export const mockUsers: User[] = [
  // Super Admin
  {
    id: "super-admin",
    name: "System Administrator",
    email: "admin@system.com",
    phone: "(555) 000-0000",
    role: "super_admin",
    status: "active",
    organizationId: "org-1",
    permissions: ["all"],
    lastLogin: "2024-01-13",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z"
  },
  
  // Pharmacy Owner
  {
    id: "owner-1",
    name: "Dr. Sarah Johnson",
    email: "owner@pharmacy.com",
    phone: "(555) 111-1111",
    role: "owner",
    status: "active",
    organizationId: "org-1",
    permissions: ["all"],
    lastLogin: "2024-01-13",
    collectionAmount: 180000,
    targets: { sales: 200000, collection: 190000, monthly: 15000 },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z"
  },
  
  // Branch Manager
  {
    id: "manager-1",
    name: "Mike Wilson",
    email: "manager@pharmacy.com",
    phone: "(555) 222-2222",
    role: "manager",
    status: "active",
    branchId: "main",
    organizationId: "org-1",
    permissions: ["manage_inventory", "manage_users", "view_reports", "manage_prescriptions"],
    lastLogin: "2024-01-13",
    collectionAmount: 45000,
    targets: { sales: 50000, collection: 48000, monthly: 4000 },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z"
  },
  
  // Senior Pharmacist  
  {
    id: "pharmacist-1",
    name: "Dr. Emily Chen",
    email: "pharmacist@pharmacy.com",
    phone: "(555) 333-3333",
    role: "pharmacist",
    status: "active",
    branchId: "main",
    organizationId: "org-1",
    permissions: ["dispense_medication", "manage_prescriptions", "view_reports"],
    lastLogin: "2024-01-12",
    collectionAmount: 32000,
    targets: { sales: 35000, collection: 33000, monthly: 2800 },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z"
  },
  
  // Pharmacy Technician
  {
    id: "technician-1",
    name: "Lisa Brown",
    email: "technician@pharmacy.com",
    phone: "(555) 444-4444",
    role: "technician",
    status: "active",
    branchId: "main",
    organizationId: "org-1",
    permissions: ["manage_inventory", "process_orders"],
    lastLogin: "2024-01-11",
    collectionAmount: 28000,
    targets: { sales: 30000, collection: 29000, monthly: 2400 },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-11T00:00:00Z"
  },
  
  // Cashier
  {
    id: "cashier-1",
    name: "John Smith",
    email: "cashier@pharmacy.com",
    phone: "(555) 555-5555",
    role: "cashier",
    status: "active",
    branchId: "main",
    organizationId: "org-1",
    permissions: ["process_sales", "handle_returns"],
    lastLogin: "2024-01-10",
    collectionAmount: 15000,
    targets: { sales: 20000, collection: 18000, monthly: 1500 },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z"
  },
  
  // Supplier Admin
  {
    id: "supplier-admin-1",
    name: "Robert Davis",
    email: "supplier@admin.com",
    phone: "(555) 666-6666",
    role: "supplier",
    status: "active",
    permissions: ["all_supplier"],
    lastLogin: "2024-01-13",
    collectionAmount: 85000,
    targets: { sales: 100000, collection: 90000, monthly: 7500 },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z"
  },
  
  // Sales Representative
  {
    id: "sales-rep-1",
    name: "Anna Garcia",
    email: "sales@supplier.com",
    phone: "(555) 777-7777",
    role: "supplier",
    status: "active",
    permissions: ["sales", "clients"],
    lastLogin: "2024-01-12",
    collectionAmount: 42000,
    targets: { sales: 50000, collection: 45000, monthly: 3500 },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z"
  }
];

// Auth credentials for login
export const authCredentials: Record<string, { password: string; userId: string }> = {
  // Easy to remember demo accounts
  "admin@system.com": { password: "pharmacy123", userId: "super-admin" },
  "owner@pharmacy.com": { password: "pharmacy123", userId: "owner-1" },
  "manager@pharmacy.com": { password: "pharmacy123", userId: "manager-1" },
  "pharmacist@pharmacy.com": { password: "pharmacy123", userId: "pharmacist-1" },
  "technician@pharmacy.com": { password: "pharmacy123", userId: "technician-1" },
  "cashier@pharmacy.com": { password: "pharmacy123", userId: "cashier-1" },
  "supplier@admin.com": { password: "pharmacy123", userId: "supplier-admin-1" },
  "sales@supplier.com": { password: "pharmacy123", userId: "sales-rep-1" }
};

// Helper functions
export function getUserById(id: string): User | undefined {
  return mockUsers.find(user => user.id === id);
}

export function getOrganizationById(id: string): Organization | undefined {
  return mockOrganizations.find(org => org.id === id);
}

export function getBranchById(id: string): Branch | undefined {
  return mockBranches.find(branch => branch.id === id);
}

export function getUsersByOrganization(organizationId: string): User[] {
  const branches = mockBranches.filter(branch => branch.organizationId === organizationId);
  const branchIds = branches.map(branch => branch.id);
  return mockUsers.filter(user => user.branchId && branchIds.includes(user.branchId));
}

export function getUsersByBranch(branchId: string): User[] {
  return mockUsers.filter(user => user.branchId === branchId);
}

export function getRoleDisplayName(role: string): string {
  const roleNames = {
    super_admin: "Super Administrator",
    owner: "Pharmacy Owner",
    manager: "Branch Manager",
    pharmacist: "Pharmacist",
    technician: "Pharmacy Technician",
    cashier: "Cashier",
    supplier: "Supplier"
  };
  return roleNames[role as keyof typeof roleNames] || role;
}

// Export the store-compatible mock data without IDs for the store
export const mockUsersForStore: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@pharmacy.com",
    phone: "(555) 123-4567",
    role: "manager",
    status: "active",
    branchId: "main",
    organizationId: "org-1",
    permissions: ["manage_inventory", "manage_users", "view_reports", "manage_prescriptions"],
    lastLogin: "2024-01-13",
    collectionAmount: 45000,
    targets: { sales: 50000, collection: 48000, monthly: 4000 },
  },
  {
    name: "Mike Wilson",
    email: "mike.wilson@pharmacy.com",
    phone: "(555) 234-5678",
    role: "pharmacist",
    status: "active",
    branchId: "main",
    organizationId: "org-1",
    permissions: ["dispense_medication", "manage_prescriptions", "view_reports"],
    lastLogin: "2024-01-12",
    collectionAmount: 32000,
    targets: { sales: 35000, collection: 33000, monthly: 2800 },
  },
  {
    name: "Lisa Brown",
    email: "lisa.brown@pharmacy.com",
    phone: "(555) 345-6789",
    role: "technician",
    status: "active",
    branchId: "branch1",
    organizationId: "org-1",
    permissions: ["manage_inventory", "process_orders"],
    lastLogin: "2024-01-11",
    collectionAmount: 28000,
    targets: { sales: 30000, collection: 29000, monthly: 2400 },
  },
  {
    name: "John Doe",
    email: "john.doe@pharmacy.com",
    phone: "(555) 456-7890",
    role: "cashier",
    status: "active",
    branchId: "main",
    organizationId: "org-1",
    permissions: ["process_sales", "handle_returns"],
    lastLogin: "2024-01-10",
    collectionAmount: 15000,
    targets: { sales: 20000, collection: 18000, monthly: 1500 },
  },
];

export const mockProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    category: "Pain Relief",
    manufacturer: "Generic Pharma",
    strength: "400mg",
    dosageForm: "Tablet",
    barcode: "123456789012",
    cost: 5.99,
    sellingPrice: 8.99,
    currentStock: 150,
    minStockLevel: 20,
    maxStockLevel: 500,
    expiryDate: "2025-12-31",
    batchNumber: "IBU2024001",
    isControlled: false,
    requiresPrescription: false,
  },
  {
    name: "Metformin 500mg",
    genericName: "Metformin HCl",
    category: "Diabetes",
    manufacturer: "DiaCare Labs",
    strength: "500mg",
    dosageForm: "Tablet",
    barcode: "234567890123",
    cost: 12.50,
    sellingPrice: 18.75,
    currentStock: 89,
    minStockLevel: 15,
    maxStockLevel: 300,
    expiryDate: "2025-08-15",
    batchNumber: "MET2024002",
    isControlled: false,
    requiresPrescription: true,
  },
  {
    name: "Vitamin D3 1000IU",
    genericName: "Cholecalciferol",
    category: "Vitamins",
    manufacturer: "NutriHealth",
    strength: "1000IU",
    dosageForm: "Capsule",
    barcode: "345678901234",
    cost: 8.99,
    sellingPrice: 15.99,
    currentStock: 67,
    minStockLevel: 25,
    maxStockLevel: 200,
    expiryDate: "2026-03-20",
    batchNumber: "VIT2024003",
    isControlled: false,
    requiresPrescription: false,
  },
  {
    name: "Lisinopril 10mg",
    genericName: "Lisinopril",
    category: "Cardiovascular",
    manufacturer: "CardioMed",
    strength: "10mg",
    dosageForm: "Tablet",
    barcode: "456789012345",
    cost: 15.00,
    sellingPrice: 22.50,
    currentStock: 45,
    minStockLevel: 10,
    maxStockLevel: 150,
    expiryDate: "2025-11-30",
    batchNumber: "LIS2024004",
    isControlled: false,
    requiresPrescription: true,
  },
  {
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin",
    category: "Antibiotics",
    manufacturer: "AntiBio Corp",
    strength: "500mg",
    dosageForm: "Capsule",
    barcode: "567890123456",
    cost: 18.75,
    sellingPrice: 28.99,
    currentStock: 23,
    minStockLevel: 15,
    maxStockLevel: 100,
    expiryDate: "2025-06-15",
    batchNumber: "AMO2024005",
    isControlled: false,
    requiresPrescription: true,
  },
];

export const mockCustomers: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'memberSince' | 'totalPurchases' | 'totalSpent' | 'loyaltyPoints' | 'prescriptions'>[] = [
  {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    address: "123 Main St, City, State 12345",
    dateOfBirth: "1985-06-15",
    lastVisit: "2024-01-12",
    status: "active",
    allergies: ["Penicillin", "Sulfa drugs"],
    insurance: "Blue Cross Blue Shield",
    preferredContact: "email",
  },
  {
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "(555) 234-5678",
    address: "456 Oak Ave, City, State 12345",
    dateOfBirth: "1978-09-22",
    lastVisit: "2024-01-13",
    status: "vip",
    allergies: ["None known"],
    insurance: "Aetna",
    preferredContact: "phone",
  },
  {
    name: "Bob Wilson",
    email: "bob.wilson@email.com",
    phone: "(555) 345-6789",
    address: "789 Pine St, City, State 12345",
    dateOfBirth: "1965-12-03",
    lastVisit: "2024-01-10",
    status: "active",
    allergies: ["Aspirin"],
    insurance: "Medicare",
    preferredContact: "phone",
  },
  {
    name: "Alice Brown",
    email: "alice.brown@email.com",
    phone: "(555) 456-7890",
    address: "321 Elm Dr, City, State 12345",
    dateOfBirth: "1992-03-18",
    lastVisit: "2024-01-11",
    status: "new",
    allergies: ["None known"],
    insurance: "United Healthcare",
    preferredContact: "email",
  },
];

export const mockOrders: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    supplierId: "SUP001",
    supplierName: "MedSupply Co",
    orderDate: "2024-01-10",
    expectedDelivery: "2024-01-12",
    actualDelivery: "2024-01-12",
    status: "delivered",
    priority: "normal",
    items: [
      {
        id: "item1",
        productId: "prod1",
        productName: "Ibuprofen 400mg",
        quantity: 100,
        unitCost: 5.99,
        totalCost: 599.00,
      },
      {
        id: "item2",
        productId: "prod2",
        productName: "Vitamin D3 1000IU",
        quantity: 50,
        unitCost: 8.99,
        totalCost: 449.50,
      },
    ],
    subtotal: 1048.50,
    tax: 83.88,
    shipping: 25.00,
    total: 1157.38,
    notes: "Regular monthly order",
  },
  {
    supplierId: "SUP002",
    supplierName: "PharmaDist",
    orderDate: "2024-01-11",
    expectedDelivery: "2024-01-13",
    status: "shipped",
    priority: "high",
    items: [
      {
        id: "item3",
        productId: "prod3",
        productName: "Metformin 500mg",
        quantity: 75,
        unitCost: 12.50,
        totalCost: 937.50,
      },
    ],
    subtotal: 937.50,
    tax: 75.00,
    shipping: 15.00,
    total: 1027.50,
    notes: "Urgent restock needed",
  },
  {
    supplierId: "SUP003",
    supplierName: "HealthWare",
    orderDate: "2024-01-11",
    expectedDelivery: "2024-01-14",
    status: "processing",
    priority: "normal",
    items: [
      {
        id: "item4",
        productId: "prod4",
        productName: "Lisinopril 10mg",
        quantity: 60,
        unitCost: 15.00,
        totalCost: 900.00,
      },
      {
        id: "item5",
        productId: "prod5",
        productName: "Amoxicillin 500mg",
        quantity: 40,
        unitCost: 18.75,
        totalCost: 750.00,
      },
    ],
    subtotal: 1650.00,
    tax: 132.00,
    shipping: 30.00,
    total: 1812.00,
  },
];