export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hireDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  avatar?: string;
  salary: number;
  employeeId: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  branch: string;
  notes?: string;
}

export interface Commission {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  salesAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'Pending' | 'Approved' | 'Paid';
  paidDate?: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string;
  reviewDate: string;
  reviewerName: string;
  overallRating: number;
  categories: {
    customerService: number;
    teamwork: number;
    productivity: number;
    punctuality: number;
    knowledge: number;
  };
  achievements: string[];
  areasForImprovement: string[];
  goals: string[];
  status: 'Draft' | 'Completed' | 'Reviewed';
}

export interface Delivery {
  id: string;
  orderId: string;
  driverId: string;
  driverName: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'Pending' | 'Assigned' | 'In Transit' | 'Delivered' | 'Failed';
  assignedDate: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  route: string;
  notes?: string;
}

export interface DeliveryRoute {
  id: string;
  name: string;
  description: string;
  area: string;
  estimatedTime: string;
  distance: string;
  deliveryCount: number;
  status: 'Active' | 'Inactive';
}

// Mock Employees
export const mockEmployees: Employee[] = [
  {
    id: 'emp1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@pharmacy.com',
    phone: '+1 234 567 8901',
    role: 'Senior Pharmacist',
    department: 'Pharmacy',
    hireDate: '2020-01-15',
    status: 'Active',
    salary: 85000,
    employeeId: 'PH001'
  },
  {
    id: 'emp2',
    name: 'Mike Thompson',
    email: 'mike.thompson@pharmacy.com',
    phone: '+1 234 567 8902',
    role: 'Pharmacy Technician',
    department: 'Pharmacy',
    hireDate: '2021-03-10',
    status: 'Active',
    salary: 45000,
    employeeId: 'PT001'
  },
  {
    id: 'emp3',
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@pharmacy.com',
    phone: '+1 234 567 8903',
    role: 'Sales Associate',
    department: 'Sales',
    hireDate: '2022-06-01',
    status: 'Active',
    salary: 35000,
    employeeId: 'SA001'
  },
  {
    id: 'emp4',
    name: 'David Wilson',
    email: 'david.wilson@pharmacy.com',
    phone: '+1 234 567 8904',
    role: 'Delivery Driver',
    department: 'Logistics',
    hireDate: '2021-09-15',
    status: 'Active',
    salary: 38000,
    employeeId: 'DD001'
  },
  {
    id: 'emp5',
    name: 'Emma Davis',
    email: 'emma.davis@pharmacy.com',
    phone: '+1 234 567 8905',
    role: 'Cashier',
    department: 'Sales',
    hireDate: '2023-01-20',
    status: 'Active',
    salary: 32000,
    employeeId: 'CA001'
  }
];

// Mock Shifts
export const mockShifts: Shift[] = [
  {
    id: 'shift1',
    employeeId: 'emp1',
    employeeName: 'Dr. Sarah Johnson',
    date: '2024-01-15',
    startTime: '08:00',
    endTime: '16:00',
    role: 'Senior Pharmacist',
    status: 'Scheduled',
    branch: 'Main Branch',
    notes: 'Morning consultation hours'
  },
  {
    id: 'shift2',
    employeeId: 'emp2',
    employeeName: 'Mike Thompson',
    date: '2024-01-15',
    startTime: '12:00',
    endTime: '20:00',
    role: 'Pharmacy Technician',
    status: 'In Progress',
    branch: 'Main Branch'
  },
  {
    id: 'shift3',
    employeeId: 'emp3',
    employeeName: 'Lisa Rodriguez',
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '17:00',
    role: 'Sales Associate',
    status: 'Scheduled',
    branch: 'Downtown Branch'
  },
  {
    id: 'shift4',
    employeeId: 'emp4',
    employeeName: 'David Wilson',
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '18:00',
    role: 'Delivery Driver',
    status: 'Completed',
    branch: 'Main Branch',
    notes: 'Route A completed successfully'
  }
];

// Mock Commissions
export const mockCommissions: Commission[] = [
  {
    id: 'comm1',
    employeeId: 'emp3',
    employeeName: 'Lisa Rodriguez',
    period: 'December 2023',
    salesAmount: 45000,
    commissionRate: 0.03,
    commissionAmount: 1350,
    status: 'Paid',
    paidDate: '2024-01-05'
  },
  {
    id: 'comm2',
    employeeId: 'emp5',
    employeeName: 'Emma Davis',
    period: 'December 2023',
    salesAmount: 32000,
    commissionRate: 0.025,
    commissionAmount: 800,
    status: 'Approved'
  },
  {
    id: 'comm3',
    employeeId: 'emp3',
    employeeName: 'Lisa Rodriguez',
    period: 'January 2024',
    salesAmount: 38000,
    commissionRate: 0.03,
    commissionAmount: 1140,
    status: 'Pending'
  }
];

// Mock Performance Reviews
export const mockPerformanceReviews: PerformanceReview[] = [
  {
    id: 'review1',
    employeeId: 'emp2',
    employeeName: 'Mike Thompson',
    reviewPeriod: 'Q4 2023',
    reviewDate: '2024-01-10',
    reviewerName: 'Dr. Sarah Johnson',
    overallRating: 4.2,
    categories: {
      customerService: 4.5,
      teamwork: 4.0,
      productivity: 4.3,
      punctuality: 4.8,
      knowledge: 3.8
    },
    achievements: [
      'Completed Advanced Pharmacy Technician Certification',
      'Reduced prescription processing time by 15%',
      'Zero medication errors for 6 months'
    ],
    areasForImprovement: [
      'Expand knowledge of new drug interactions',
      'Improve inventory management skills'
    ],
    goals: [
      'Complete specialized training in compounding',
      'Mentor new pharmacy technicians',
      'Achieve 98% customer satisfaction rating'
    ],
    status: 'Completed'
  },
  {
    id: 'review2',
    employeeId: 'emp3',
    employeeName: 'Lisa Rodriguez',
    reviewPeriod: 'Q4 2023',
    reviewDate: '2024-01-12',
    reviewerName: 'Store Manager',
    overallRating: 4.6,
    categories: {
      customerService: 4.8,
      teamwork: 4.5,
      productivity: 4.7,
      punctuality: 4.2,
      knowledge: 4.6
    },
    achievements: [
      'Top sales performer for Q4 2023',
      'Excellent customer feedback scores',
      'Successfully launched loyalty program'
    ],
    areasForImprovement: [
      'Improve punctuality for morning shifts'
    ],
    goals: [
      'Increase quarterly sales by 20%',
      'Complete customer service excellence training',
      'Lead training sessions for new sales staff'
    ],
    status: 'Reviewed'
  }
];

// Mock Deliveries
export const mockDeliveries: Delivery[] = [
  {
    id: 'del1',
    orderId: 'ORD001',
    driverId: 'emp4',
    driverName: 'David Wilson',
    customerName: 'John Smith',
    customerAddress: '123 Main St, City, State 12345',
    customerPhone: '+1 234 567 9001',
    items: [
      { name: 'Amoxicillin 500mg', quantity: 21, price: 25.99 },
      { name: 'Lisinopril 10mg', quantity: 30, price: 15.49 }
    ],
    totalAmount: 41.48,
    status: 'Delivered',
    assignedDate: '2024-01-15T10:00:00Z',
    estimatedDelivery: '2024-01-15T14:00:00Z',
    actualDelivery: '2024-01-15T13:45:00Z',
    route: 'Route A'
  },
  {
    id: 'del2',
    orderId: 'ORD002',
    driverId: 'emp4',
    driverName: 'David Wilson',
    customerName: 'Mary Johnson',
    customerAddress: '456 Oak Ave, City, State 12345',
    customerPhone: '+1 234 567 9002',
    items: [
      { name: 'Metformin 500mg', quantity: 60, price: 12.99 },
      { name: 'Blood Pressure Monitor', quantity: 1, price: 89.99 }
    ],
    totalAmount: 102.98,
    status: 'In Transit',
    assignedDate: '2024-01-15T11:30:00Z',
    estimatedDelivery: '2024-01-15T15:30:00Z',
    route: 'Route B'
  },
  {
    id: 'del3',
    orderId: 'ORD003',
    driverId: 'emp4',
    driverName: 'David Wilson',
    customerName: 'Robert Brown',
    customerAddress: '789 Pine St, City, State 12345',
    customerPhone: '+1 234 567 9003',
    items: [
      { name: 'Atorvastatin 20mg', quantity: 30, price: 22.49 }
    ],
    totalAmount: 22.49,
    status: 'Pending',
    assignedDate: '2024-01-15T12:00:00Z',
    estimatedDelivery: '2024-01-15T16:00:00Z',
    route: 'Route A'
  }
];

// Mock Delivery Routes
export const mockDeliveryRoutes: DeliveryRoute[] = [
  {
    id: 'route1',
    name: 'Route A - Downtown',
    description: 'Central business district and nearby residential areas',
    area: 'Downtown/Central',
    estimatedTime: '4-6 hours',
    distance: '25 miles',
    deliveryCount: 8,
    status: 'Active'
  },
  {
    id: 'route2',
    name: 'Route B - Suburbs North',
    description: 'Northern suburban areas and residential neighborhoods',
    area: 'North Suburbs',
    estimatedTime: '5-7 hours',
    distance: '35 miles',
    deliveryCount: 12,
    status: 'Active'
  },
  {
    id: 'route3',
    name: 'Route C - Industrial',
    description: 'Industrial district and commercial areas',
    area: 'Industrial/Commercial',
    estimatedTime: '3-5 hours',
    distance: '20 miles',
    deliveryCount: 6,
    status: 'Active'
  }
];

// Summary Stats
export const staffStats = {
  totalEmployees: mockEmployees.length,
  activeEmployees: mockEmployees.filter(emp => emp.status === 'Active').length,
  onLeave: mockEmployees.filter(emp => emp.status === 'On Leave').length,
  totalShiftsToday: mockShifts.filter(shift => shift.date === '2024-01-15').length,
  inProgressShifts: mockShifts.filter(shift => shift.status === 'In Progress').length,
  pendingCommissions: mockCommissions.filter(comm => comm.status === 'Pending').length,
  totalCommissionsPending: mockCommissions
    .filter(comm => comm.status === 'Pending')
    .reduce((sum, comm) => sum + comm.commissionAmount, 0),
  pendingDeliveries: mockDeliveries.filter(del => del.status === 'Pending').length,
  inTransitDeliveries: mockDeliveries.filter(del => del.status === 'In Transit').length,
  activeRoutes: mockDeliveryRoutes.filter(route => route.status === 'Active').length
};