import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'owner' | 'manager' | 'pharmacist' | 'technician' | 'cashier' | 'supplier';
  status: 'active' | 'inactive' | 'pending';
  branchId?: string;
  organizationId?: string;
  permissions: string[];
  lastLogin?: string;
  collectionAmount?: number;
  targets?: {
    sales: number;
    collection: number;
    monthly: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  manufacturer: string;
  strength?: string;
  dosageForm: string;
  barcode?: string;
  cost: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  expiryDate?: string;
  batchNumber?: string;
  isControlled: boolean;
  requiresPrescription: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  memberSince: string;
  totalPurchases: number;
  totalSpent: number;
  lastVisit: string;
  status: 'active' | 'inactive' | 'vip' | 'new';
  loyaltyPoints: number;
  prescriptions: Prescription[];
  allergies: string[];
  insurance?: string;
  preferredContact: 'email' | 'phone' | 'sms';
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  customerId: string;
  medication: string;
  dosage: string;
  quantity: number;
  prescriber: string;
  instructions?: string;
  refills: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface AppState {
  // Loading states
  isLoading: boolean;
  isUsersLoading: boolean;
  isProductsLoading: boolean;
  isCustomersLoading: boolean;
  isOrdersLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Data
  users: User[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  prescriptions: Prescription[];
  
  // Current user
  currentUser: User | null;
  
  // UI state
  searchQueries: Record<string, string>;
  filters: Record<string, any>;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // User actions
  setCurrentUser: (user: User | null) => void;
  loadUsers: () => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>;
  updateUser: (id: string, userData: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  
  // Product actions
  loadProducts: () => Promise<void>;
  createProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, quantity: number, operation: 'add' | 'subtract' | 'set') => Promise<void>;
  
  // Customer actions
  loadCustomers: () => Promise<void>;
  createCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'memberSince' | 'totalPurchases' | 'totalSpent' | 'loyaltyPoints' | 'prescriptions'>) => Promise<Customer>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Order actions
  loadOrders: () => Promise<void>;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  
  // Prescription actions
  createPrescription: (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Prescription>;
  updatePrescription: (id: string, prescriptionData: Partial<Prescription>) => Promise<Prescription>;
  deletePrescription: (id: string) => Promise<void>;
  
  // Search and filter actions
  setSearchQuery: (entity: string, query: string) => void;
  setFilter: (entity: string, key: string, value: any) => void;
  clearFilters: (entity: string) => void;
  
  // Utility actions
  resetStore: () => void;
}

// Helper function to simulate API delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      isUsersLoading: false,
      isProductsLoading: false,
      isCustomersLoading: false,
      isOrdersLoading: false,
      error: null,
      
      users: [],
      products: [],
      customers: [],
      orders: [],
      prescriptions: [],
      
      currentUser: null,
      
      searchQueries: {},
      filters: {},
      
      // Basic actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // User actions
      setCurrentUser: (user) => set({ currentUser: user }),
      
      loadUsers: async () => {
        set({ isUsersLoading: true, error: null });
        try {
          await simulateDelay();
          // Users are loaded from persisted state
          set({ isUsersLoading: false });
        } catch (error) {
          set({ error: 'Failed to load users', isUsersLoading: false });
        }
      },
      
      createUser: async (userData) => {
        set({ isUsersLoading: true, error: null });
        try {
          await simulateDelay();
          const newUser: User = {
            ...userData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            users: [...state.users, newUser],
            isUsersLoading: false
          }));
          
          return newUser;
        } catch (error) {
          set({ error: 'Failed to create user', isUsersLoading: false });
          throw error;
        }
      },
      
      updateUser: async (id, userData) => {
        set({ isUsersLoading: true, error: null });
        try {
          await simulateDelay();
          
          set(state => ({
            users: state.users.map(user =>
              user.id === id
                ? { ...user, ...userData, updatedAt: new Date().toISOString() }
                : user
            ),
            isUsersLoading: false
          }));
          
          const updatedUser = get().users.find(u => u.id === id)!;
          return updatedUser;
        } catch (error) {
          set({ error: 'Failed to update user', isUsersLoading: false });
          throw error;
        }
      },
      
      deleteUser: async (id) => {
        set({ isUsersLoading: true, error: null });
        try {
          await simulateDelay();
          
          set(state => ({
            users: state.users.filter(user => user.id !== id),
            isUsersLoading: false
          }));
        } catch (error) {
          set({ error: 'Failed to delete user', isUsersLoading: false });
          throw error;
        }
      },
      
      // Product actions
      loadProducts: async () => {
        set({ isProductsLoading: true, error: null });
        try {
          await simulateDelay();
          set({ isProductsLoading: false });
        } catch (error) {
          set({ error: 'Failed to load products', isProductsLoading: false });
        }
      },
      
      createProduct: async (productData) => {
        set({ isProductsLoading: true, error: null });
        try {
          await simulateDelay();
          const newProduct: Product = {
            ...productData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            products: [...state.products, newProduct],
            isProductsLoading: false
          }));
          
          return newProduct;
        } catch (error) {
          set({ error: 'Failed to create product', isProductsLoading: false });
          throw error;
        }
      },
      
      updateProduct: async (id, productData) => {
        set({ isProductsLoading: true, error: null });
        try {
          await simulateDelay();
          
          set(state => ({
            products: state.products.map(product =>
              product.id === id
                ? { ...product, ...productData, updatedAt: new Date().toISOString() }
                : product
            ),
            isProductsLoading: false
          }));
          
          const updatedProduct = get().products.find(p => p.id === id)!;
          return updatedProduct;
        } catch (error) {
          set({ error: 'Failed to update product', isProductsLoading: false });
          throw error;
        }
      },
      
      deleteProduct: async (id) => {
        set({ isProductsLoading: true, error: null });
        try {
          await simulateDelay();
          
          set(state => ({
            products: state.products.filter(product => product.id !== id),
            isProductsLoading: false
          }));
        } catch (error) {
          set({ error: 'Failed to delete product', isProductsLoading: false });
          throw error;
        }
      },
      
      updateStock: async (id, quantity, operation) => {
        set({ isProductsLoading: true, error: null });
        try {
          await simulateDelay();
          
          set(state => ({
            products: state.products.map(product => {
              if (product.id === id) {
                let newStock = product.currentStock;
                switch (operation) {
                  case 'add':
                    newStock += quantity;
                    break;
                  case 'subtract':
                    newStock = Math.max(0, newStock - quantity);
                    break;
                  case 'set':
                    newStock = quantity;
                    break;
                }
                return {
                  ...product,
                  currentStock: newStock,
                  updatedAt: new Date().toISOString()
                };
              }
              return product;
            }),
            isProductsLoading: false
          }));
        } catch (error) {
          set({ error: 'Failed to update stock', isProductsLoading: false });
          throw error;
        }
      },
      
      // Customer actions
      loadCustomers: async () => {
        set({ isCustomersLoading: true, error: null });
        try {
          await simulateDelay();
          set({ isCustomersLoading: false });
        } catch (error) {
          set({ error: 'Failed to load customers', isCustomersLoading: false });
        }
      },
      
      createCustomer: async (customerData) => {
        set({ isCustomersLoading: true, error: null });
        try {
          await simulateDelay();
          const newCustomer: Customer = {
            ...customerData,
            id: generateId(),
            memberSince: new Date().toISOString().split('T')[0],
            totalPurchases: 0,
            totalSpent: 0,
            loyaltyPoints: 0,
            prescriptions: [],
            lastVisit: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            customers: [...state.customers, newCustomer],
            isCustomersLoading: false
          }));
          
          return newCustomer;
        } catch (error) {
          set({ error: 'Failed to create customer', isCustomersLoading: false });
          throw error;
        }
      },
      
      updateCustomer: async (id, customerData) => {
        set({ isCustomersLoading: true, error: null });
        try {
          await simulateDelay();
          
          set(state => ({
            customers: state.customers.map(customer =>
              customer.id === id
                ? { ...customer, ...customerData, updatedAt: new Date().toISOString() }
                : customer
            ),
            isCustomersLoading: false
          }));
          
          const updatedCustomer = get().customers.find(c => c.id === id)!;
          return updatedCustomer;
        } catch (error) {
          set({ error: 'Failed to update customer', isCustomersLoading: false });
          throw error;
        }
      },
      
      deleteCustomer: async (id) => {
        set({ isCustomersLoading: true, error: null });
        try {
          await simulateDelay();
          
          set(state => ({
            customers: state.customers.filter(customer => customer.id !== id),
            isCustomersLoading: false
          }));
        } catch (error) {
          set({ error: 'Failed to delete customer', isCustomersLoading: false });
          throw error;
        }
      },
      
      // Order actions
      loadOrders: async () => {
        set({ isOrdersLoading: true, error: null });
        try {
          await simulateDelay();
          set({ isOrdersLoading: false });
        } catch (error) {
          set({ error: 'Failed to load orders', isOrdersLoading: false });
        }
      },
      
      createOrder: async (orderData) => {
        set({ isOrdersLoading: true, error: null });
        try {
          await simulateDelay();
          const newOrder: Order = {
            ...orderData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            orders: [...state.orders, newOrder],
            isOrdersLoading: false
          }));
          
          return newOrder;
        } catch (error) {
          set({ error: 'Failed to create order', isOrdersLoading: false });
          throw error;
        }
      },
      
      updateOrder: async (id, orderData) => {
        set({ isOrdersLoading: true, error: null });
        try {
          await simulateDelay();
          
          set(state => ({
            orders: state.orders.map(order =>
              order.id === id
                ? { ...order, ...orderData, updatedAt: new Date().toISOString() }
                : order
            ),
            isOrdersLoading: false
          }));
          
          const updatedOrder = get().orders.find(o => o.id === id)!;
          return updatedOrder;
        } catch (error) {
          set({ error: 'Failed to update order', isOrdersLoading: false });
          throw error;
        }
      },
      
      deleteOrder: async (id) => {
        set({ isOrdersLoading: true, error: null });
        try {
          await simulateDelay();
          
          set(state => ({
            orders: state.orders.filter(order => order.id !== id),
            isOrdersLoading: false
          }));
        } catch (error) {
          set({ error: 'Failed to delete order', isOrdersLoading: false });
          throw error;
        }
      },
      
      // Prescription actions
      createPrescription: async (prescriptionData) => {
        set({ isLoading: true, error: null });
        try {
          await simulateDelay();
          const newPrescription: Prescription = {
            ...prescriptionData,
            id: generateId(),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            prescriptions: [...state.prescriptions, newPrescription],
            isLoading: false
          }));
          
          return newPrescription;
        } catch (error) {
          set({ error: 'Failed to create prescription', isLoading: false });
          throw error;
        }
      },
      
      updatePrescription: async (id, prescriptionData) => {
        set({ isLoading: true, error: null });
        try {
          await simulateDelay();
          
          set(state => ({
            prescriptions: state.prescriptions.map(prescription =>
              prescription.id === id
                ? { ...prescription, ...prescriptionData, updatedAt: new Date().toISOString() }
                : prescription
            ),
            isLoading: false
          }));
          
          const updatedPrescription = get().prescriptions.find(p => p.id === id)!;
          return updatedPrescription;
        } catch (error) {
          set({ error: 'Failed to update prescription', isLoading: false });
          throw error;
        }
      },
      
      deletePrescription: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await simulateDelay();
          
          set(state => ({
            prescriptions: state.prescriptions.filter(prescription => prescription.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ error: 'Failed to delete prescription', isLoading: false });
          throw error;
        }
      },
      
      // Search and filter actions
      setSearchQuery: (entity, query) => {
        set(state => ({
          searchQueries: { ...state.searchQueries, [entity]: query }
        }));
      },
      
      setFilter: (entity, key, value) => {
        set(state => ({
          filters: {
            ...state.filters,
            [entity]: { ...state.filters[entity], [key]: value }
          }
        }));
      },
      
      clearFilters: (entity) => {
        set(state => ({
          filters: { ...state.filters, [entity]: {} }
        }));
      },
      
      // Utility actions
      resetStore: () => {
        set({
          users: [],
          products: [],
          customers: [],
          orders: [],
          prescriptions: [],
          currentUser: null,
          searchQueries: {},
          filters: {},
          error: null,
          isLoading: false,
          isUsersLoading: false,
          isProductsLoading: false,
          isCustomersLoading: false,
          isOrdersLoading: false,
        });
      },
    }),
    {
      name: 'pharmacy-app-store',
      partialize: (state) => ({
        users: state.users,
        products: state.products,
        customers: state.customers,
        orders: state.orders,
        prescriptions: state.prescriptions,
        currentUser: state.currentUser,
      }),
    }
  )
);