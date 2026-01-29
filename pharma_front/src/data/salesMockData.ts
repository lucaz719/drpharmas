// Sales Mock Data

export interface Sale {
  id: string;
  saleNumber: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'insurance';
  paymentStatus: 'paid' | 'pending' | 'partial';
  saleType: 'otc' | 'prescription' | 'insurance';
  prescriptionId?: string;
  doctorId?: string;
  userId: string;
  branchId: string;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  batchNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  allergies?: string[];
  chronicConditions?: string[];
  insuranceProvider?: string;
  insuranceNumber?: string;
  loyaltyPoints: number;
  totalSpent: number;
  lastVisit: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  customerId: string;
  doctorId: string;
  issueDate: string;
  validUntil: string;
  medications: PrescribedMedication[];
  diagnosis?: string;
  notes?: string;
  status: 'active' | 'dispensed' | 'expired' | 'cancelled';
  fillCount: number;
  maxFills: number;
  createdAt: string;
}

export interface PrescribedMedication {
  productId: string;
  productName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  substitutionAllowed: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  registrationNumber: string;
  phone: string;
  email?: string;
  address?: string;
  hospitalAffiliation?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'John Smith',
    phone: '+91-9876543210',
    email: 'john.smith@email.com',
    address: '123 Main Street, City',
    dateOfBirth: '1985-05-15',
    gender: 'male',
    allergies: ['Penicillin'],
    chronicConditions: ['Diabetes'],
    insuranceProvider: 'Star Health',
    insuranceNumber: 'SH123456789',
    loyaltyPoints: 250,
    totalSpent: 15650,
    lastVisit: '2024-03-15',
    createdAt: '2024-01-15'
  },
  {
    id: 'cust-2',
    name: 'Maria Garcia',
    phone: '+91-9876543211',
    email: 'maria.garcia@email.com',
    address: '456 Oak Avenue, City',
    dateOfBirth: '1978-09-22',
    gender: 'female',
    allergies: [],
    chronicConditions: ['Hypertension'],
    loyaltyPoints: 180,
    totalSpent: 8940,
    lastVisit: '2024-03-12',
    createdAt: '2024-01-20'
  },
  {
    id: 'cust-3',
    name: 'Robert Johnson',
    phone: '+91-9876543212',
    address: '789 Pine Road, City',
    dateOfBirth: '1965-12-03',
    gender: 'male',
    allergies: ['Sulfa'],
    chronicConditions: ['Arthritis', 'High Cholesterol'],
    loyaltyPoints: 320,
    totalSpent: 22340,
    lastVisit: '2024-03-14',
    createdAt: '2024-01-10'
  }
];

// Mock Doctors
export const mockDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Raj Patel',
    specialization: 'Internal Medicine',
    qualification: 'MBBS, MD',
    registrationNumber: 'MCI-001-2015',
    phone: '+91-9876543220',
    email: 'dr.raj@hospital.com',
    address: 'City General Hospital',
    hospitalAffiliation: 'City General Hospital',
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: 'doc-2',
    name: 'Dr. Priya Reddy',
    specialization: 'Endocrinology',
    qualification: 'MBBS, MD, DM',
    registrationNumber: 'MCI-002-2018',
    phone: '+91-9876543221',
    email: 'dr.priya@diabetes.com',
    address: 'Diabetes Care Center',
    hospitalAffiliation: 'Diabetes Care Center',
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: 'doc-3',
    name: 'Dr. Kumar Singh',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD, DM',
    registrationNumber: 'MCI-003-2016',
    phone: '+91-9876543222',
    email: 'dr.kumar@heart.com',
    address: 'Heart Care Institute',
    hospitalAffiliation: 'Heart Care Institute',
    status: 'active',
    createdAt: '2024-01-01'
  }
];

// Mock Prescriptions
export const mockPrescriptions: Prescription[] = [
  {
    id: 'rx-1',
    prescriptionNumber: 'RX-2024-001',
    customerId: 'cust-1',
    doctorId: 'doc-2',
    issueDate: '2024-03-10',
    validUntil: '2024-06-10',
    medications: [
      {
        productId: 'prod-4',
        productName: 'Insulin Aspart 100 units/ml',
        dosage: '10 units',
        frequency: 'Before meals',
        duration: '30 days',
        quantity: 1,
        instructions: 'Inject subcutaneously before each meal',
        substitutionAllowed: false
      },
      {
        productId: 'prod-1',
        productName: 'Paracetamol 500mg',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '5 days',
        quantity: 10,
        instructions: 'Take with food if stomach upset occurs',
        substitutionAllowed: true
      }
    ],
    diagnosis: 'Type 1 Diabetes Mellitus',
    notes: 'Monitor blood glucose levels regularly',
    status: 'active',
    fillCount: 0,
    maxFills: 3,
    createdAt: '2024-03-10'
  },
  {
    id: 'rx-2',
    prescriptionNumber: 'RX-2024-002',
    customerId: 'cust-2',
    doctorId: 'doc-1',
    issueDate: '2024-03-12',
    validUntil: '2024-09-12',
    medications: [
      {
        productId: 'prod-2',
        productName: 'Amoxicillin 250mg',
        dosage: '250mg',
        frequency: 'Three times daily',
        duration: '7 days',
        quantity: 21,
        instructions: 'Take on empty stomach, 1 hour before meals',
        substitutionAllowed: false
      }
    ],
    diagnosis: 'Respiratory Tract Infection',
    notes: 'Complete full course even if symptoms improve',
    status: 'dispensed',
    fillCount: 1,
    maxFills: 1,
    createdAt: '2024-03-12'
  }
];

// Mock Sales
export const mockSales: Sale[] = [
  {
    id: 'sale-1',
    saleNumber: 'SALE-2024-001',
    customerId: 'cust-1',
    items: [
      {
        productId: 'prod-1',
        productName: 'Paracetamol 500mg',
        quantity: 10,
        unitPrice: 2.50,
        discount: 0,
        total: 25.00,
        batchNumber: 'PAR2024001'
      }
    ],
    subtotal: 25.00,
    discount: 0,
    tax: 4.50,
    total: 29.50,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    saleType: 'prescription',
    prescriptionId: 'rx-1',
    doctorId: 'doc-2',
    userId: 'user-pharmacist-1',
    branchId: 'branch-1',
    notes: 'Prescription filling',
    createdAt: '2024-03-10T15:30:00Z'
  },
  {
    id: 'sale-2',
    saleNumber: 'SALE-2024-002',
    customerId: 'cust-2',
    items: [
      {
        productId: 'prod-2',
        productName: 'Amoxicillin 250mg',
        quantity: 21,
        unitPrice: 8.75,
        discount: 5.00,
        total: 178.75,
        batchNumber: 'AMX2024002'
      }
    ],
    subtotal: 183.75,
    discount: 5.00,
    tax: 32.18,
    total: 210.93,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    saleType: 'prescription',
    prescriptionId: 'rx-2',
    doctorId: 'doc-1',
    userId: 'user-pharmacist-1',
    branchId: 'branch-1',
    notes: 'Prescription filling with discount',
    createdAt: '2024-03-12T11:45:00Z'
  },
  {
    id: 'sale-3',
    saleNumber: 'SALE-2024-003',
    items: [
      {
        productId: 'prod-3',
        productName: 'Vitamin D3 1000 IU',
        quantity: 1,
        unitPrice: 15.00,
        discount: 0,
        total: 15.00,
        batchNumber: 'VIT2024003'
      },
      {
        productId: 'prod-5',
        productName: 'Hand Sanitizer 500ml',
        quantity: 2,
        unitPrice: 125.00,
        discount: 0,
        total: 250.00,
        batchNumber: 'SAN2024005'
      }
    ],
    subtotal: 265.00,
    discount: 0,
    tax: 47.70,
    total: 312.70,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    saleType: 'otc',
    userId: 'user-cashier-1',
    branchId: 'branch-1',
    notes: 'Over-the-counter sale',
    createdAt: '2024-03-14T16:20:00Z'
  }
];

// Helper functions
export const getCustomerById = (id: string): Customer | undefined => {
  return mockCustomers.find(customer => customer.id === id);
};

export const getDoctorById = (id: string): Doctor | undefined => {
  return mockDoctors.find(doctor => doctor.id === id);
};

export const getPrescriptionById = (id: string): Prescription | undefined => {
  return mockPrescriptions.find(prescription => prescription.id === id);
};

export const getSalesByCustomer = (customerId: string): Sale[] => {
  return mockSales.filter(sale => sale.customerId === customerId);
};

export const getSalesByDateRange = (startDate: string, endDate: string): Sale[] => {
  return mockSales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
  });
};

export const getTotalSalesAmount = (sales: Sale[]): number => {
  return sales.reduce((total, sale) => total + sale.total, 0);
};

export const getMonthlySalesData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    sales: Math.floor(Math.random() * 50000) + 30000,
    orders: Math.floor(Math.random() * 200) + 150,
    profit: Math.floor(Math.random() * 15000) + 8000
  }));
};