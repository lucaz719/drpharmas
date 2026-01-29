import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access, refresh } = response.data;
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// User Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  status: string;
  organization_id?: number;
  organization_name?: string;
  branch_id?: number;
  branch_name?: string;
  employee_id?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  license_number?: string;
  license_expiry?: string;
  qualifications?: string;
  collection_amount?: number;
  sales_target?: number;
  collection_target?: number;
  is_supplier?: boolean;
  supplier_company?: string;
  supplier_license?: string;
  plain_text_password?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  type: string;
  medical_system: string;
  status: string;
  owner?: string;
  owner_name?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  license_number: string;
  license_expiry: string;
  tax_id?: string;
  registration_number?: string;
  currency: string;
  tax_rate: number;
  timezone: string;
  language: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_expiry?: string;
  total_branches?: number;
  active_branches?: number;
  total_users?: number;
  active_users?: number;
  logo?: string;
  created_at: string;
  updated_at: string;
}

// Branch Types
export interface Branch {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  organization: string;
  organization_name?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  fax?: string;
  manager?: string;
  manager_name?: string;
  license_number?: string;
  license_expiry?: string;
  timezone: string;
  currency: string;
  latitude?: number;
  longitude?: number;
  total_users?: number;
  active_users?: number;
  created_at: string;
  updated_at: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; tokens: { access: string; refresh: string } }>> => {
    console.log('🔍 LOGIN DEBUG - Starting login process');
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password?.length);
    console.log('🌐 API Base URL:', API_BASE_URL);
    console.log('📍 Full URL:', `${API_BASE_URL}/auth/login/`);

    const requestData = { email, password };
    console.log('📤 Request data:', requestData);

    try {
      const response = await api.post('/auth/login/', requestData);
      console.log('✅ Response received:', response);
      console.log('📊 Response status:', response.status);
      console.log('📋 Response data:', response.data);

      // Handle backend response structure
      if (response.data.user && response.data.tokens) {
        return {
          success: true,
          data: {
            user: response.data.user,
            tokens: response.data.tokens
          },
          message: response.data.message || "Login successful"
        };
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ LOGIN ERROR - Full error object:', error);
      console.error('📊 Error status:', error.response?.status);
      console.error('📋 Error data:', error.response?.data);
      console.error('📍 Error config:', error.config);
      console.error('🌐 Request URL:', error.config?.url);
      console.error('📤 Request data:', error.config?.data);
      console.error('📋 Request headers:', error.config?.headers);
      throw error;
    }
  },

  register: async (userData: Partial<User>): Promise<ApiResponse<{ user: User; tokens: { access: string; refresh: string } }>> => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout/');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ access: string; refresh: string }>> => {
    const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put('/auth/profile/', userData);
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPassword,
    });
    return response.data;
  },

  validateToken: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/auth/profile/');
      return {
        success: true,
        data: response.data,
        message: 'Token is valid'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token validation failed'
      };
    }
  },
};

// Organizations API
export const organizationsAPI = {
  getOrganizations: async (params?: Record<string, any>): Promise<ApiResponse<Organization[]>> => {
    const response = await api.get('/organizations/', { params });

    // Handle paginated response from Django REST framework
    if (response.data && response.data.results) {
      return {
        success: true,
        data: response.data.results,
        message: `Found ${response.data.count} organizations`
      };
    }

    return response.data;
  },

  getOrganization: async (id: string): Promise<ApiResponse<Organization>> => {
    const response = await api.get(`/organizations/${id}/`);
    return {
      success: true,
      data: response.data,
      message: 'Organization retrieved successfully'
    };
  },

  createOrganization: async (orgData: Partial<Organization>): Promise<ApiResponse<Organization>> => {
    const response = await api.post('/organizations/', orgData);

    // Handle backend response structure
    if (response.data && response.data.organization) {
      return {
        success: true,
        data: response.data.organization,
        message: response.data.message || 'Organization created successfully'
      };
    }

    // Handle direct organization response (fallback)
    if (response.data && response.data.id) {
      return {
        success: true,
        data: response.data,
        message: 'Organization created successfully'
      };
    }

    return response.data;
  },

  updateOrganization: async (id: string, orgData: Partial<Organization>): Promise<ApiResponse<Organization>> => {
    const response = await api.put(`/organizations/${id}/`, orgData);
    return response.data;
  },

  deleteOrganization: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/organizations/${id}/`);
    return response.data;
  },

  createOrganizationWithOwner: async (data: any): Promise<ApiResponse<{ organization: Organization; owner: User }>> => {
    const response = await api.post('/organizations/create-with-owner/', data);
    return response.data;
  },

  getBranches: async (params?: Record<string, any>): Promise<ApiResponse<Branch[]>> => {
    const response = await api.get('/organizations/branches/', { params });
    return response.data;
  },

  getBranch: async (id: string): Promise<ApiResponse<Branch>> => {
    const response = await api.get(`/organizations/branches/${id}/`);
    return response.data;
  },

  createBranch: async (branchData: Partial<Branch>): Promise<ApiResponse<Branch>> => {
    const response = await api.post('/organizations/branches/', branchData);
    return response.data;
  },

  updateBranch: async (id: string, branchData: Partial<Branch>): Promise<ApiResponse<Branch>> => {
    const response = await api.put(`/organizations/branches/${id}/`, branchData);
    return response.data;
  },

  deleteBranch: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/organizations/branches/${id}/`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse> => {
    const response = await api.get('/organizations/stats/');
    return response.data;
  },

  getDashboardStats: async (): Promise<ApiResponse> => {
    const response = await api.get('/organizations/stats/');
    return response.data;
  },

  getSystemHealth: async (): Promise<ApiResponse> => {
    const response = await api.get('/organizations/system-health/');
    return response.data;
  },

  createDefaultBranch: async (): Promise<ApiResponse<Branch>> => {
    const response = await api.post('/organizations/create-default-branch/');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (params?: Record<string, any>): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/auth/users/', { params });

    // Handle paginated response from Django REST framework
    if (response.data && response.data.results) {
      return {
        success: true,
        data: response.data.results,
        message: `Found ${response.data.count} users`
      };
    }

    // Handle direct array response
    if (Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data,
        message: `Found ${response.data.length} users`
      };
    }

    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/auth/users/${id}/`);
    return response.data;
  },

  createUser: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/users/', userData);

    // Handle nested user response structure: { user: {...}, message: '...' }
    if (response.data && response.data.user && response.data.user.id) {
      return {
        success: true,
        data: response.data.user,
        message: response.data.message || 'User created successfully'
      };
    }

    // Handle direct user response (fallback)
    if (response.data && response.data.id) {
      return {
        success: true,
        data: response.data,
        message: 'User created successfully'
      };
    }

    return response.data;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/auth/users/${id}/`, userData);
    // Backend returns data directly, wrap it in expected format
    return {
      success: true,
      data: response.data,
      message: 'User updated successfully'
    };
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/auth/users/${id}/`);
    return response.data;
  },

  getPermissions: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/permissions/');
    return response.data;
  },

  getStats: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/stats/');
    return response.data;
  },

  // Module permission endpoints
  getAvailableModules: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/modules/');
    // Backend returns data directly, wrap it in expected format
    return {
      success: true,
      data: response.data,
      message: 'Available modules retrieved successfully'
    };
  },

  getUserModulePermissions: async (userId: string): Promise<ApiResponse> => {
    const response = await api.get(`/auth/users/${userId}/module-permissions/`);
    // Backend returns data directly, wrap it in expected format
    return {
      success: true,
      data: response.data,
      message: 'User permissions retrieved successfully'
    };
  },

  updateUserModulePermissions: async (userId: string, permissions: Record<string, boolean>): Promise<ApiResponse> => {
    const response = await api.post(`/auth/users/${userId}/update-permissions/`, {
      permissions
    });
    // Backend returns data directly, wrap it in expected format
    return {
      success: true,
      data: response.data,
      message: 'Permissions updated successfully'
    };
  },

  changeUserPassword: async (userId: string, passwordData: { new_password: string; confirm_password: string }): Promise<ApiResponse> => {
    const response = await api.post(`/auth/users/${userId}/change-password/`, passwordData);
    // Backend returns data directly, wrap it in expected format
    return {
      success: true,
      data: response.data,
      message: 'Password changed successfully'
    };
  },
};

// Inventory Types
export interface Product {
  id: number;
  name: string;
  generic_name?: string;
  brand_name?: string;
  product_code: string;
  barcode?: string;
  description?: string;
  category?: number;
  category_name?: string;
  manufacturer?: number;
  manufacturer_name?: string;
  dosage_form: string;
  strength?: string;
  pack_size?: string;
  unit: string;
  is_controlled: boolean;
  requires_prescription: boolean;
  license_required: boolean;
  batch_number?: string;
  expiry_date?: string;
  cost_price: number;
  selling_price: number;
  mrp?: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  status: string;
  is_active: boolean;
  organization: number;
  image?: string;
  document?: string;
  created_by?: number;
  total_stock?: number;
  is_low_stock?: boolean;
  is_expired?: boolean;
  days_to_expiry?: number;
  profit_margin?: number;
  alternatives?: string[];
  is_insured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent?: number;
  is_active: boolean;
  organization: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  license_number?: string;
  is_active: boolean;
  organization: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface MedicationStats {
  total_medications: number;
  active_medications: number;
  prescription_medications: number;
  controlled_medications: number;
  insured_medications: number;
  categories_count: number;
  manufacturers_count: number;
}

// Inventory API
export const inventoryAPI = {
  // Products/Medications
  getMedications: async (params?: Record<string, any>): Promise<ApiResponse<{ results: Product[], count: number, next: string | null, previous: string | null }>> => {
    const response = await api.get('/inventory/medications/', { params });

    // Handle paginated response from Django REST framework
    if (response.data && response.data.results) {
      return {
        success: true,
        data: {
          results: response.data.results,
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        },
        message: `Found ${response.data.count} medications`
      };
    }

    return response.data;
  },

  getMedication: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/inventory/products/${id}/`);
    return {
      success: true,
      data: response.data,
      message: 'Medication retrieved successfully'
    };
  },

  createMedication: async (medicationData: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.post('/inventory/products/', medicationData);
    return {
      success: true,
      data: response.data,
      message: 'Medication created successfully'
    };
  },

  updateMedication: async (id: number, medicationData: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.put(`/inventory/products/${id}/`, medicationData);
    return {
      success: true,
      data: response.data,
      message: 'Medication updated successfully'
    };
  },

  deleteMedication: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/inventory/products/${id}/`);
    return {
      success: true,
      data: null,
      message: 'Medication deleted successfully'
    };
  },

  // Bulk operations
  bulkCreateMedications: async (medications: Partial<Product>[]): Promise<ApiResponse<Product[]>> => {
    const response = await api.post('/inventory/products/bulk_create/', { medications });
    return {
      success: true,
      data: response.data,
      message: `${medications.length} medications created successfully`
    };
  },

  bulkUploadMedications: async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/inventory/medications/bulk-upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Backend returns data directly, wrap it in expected format
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'File uploaded successfully'
    };
  },

  // Statistics
  getMedicationStats: async (): Promise<ApiResponse<MedicationStats>> => {
    const response = await api.get('/inventory/medications/stats/');
    return {
      success: true,
      data: response.data,
      message: 'Statistics retrieved successfully'
    };
  },

  // Categories
  getCategories: async (params?: Record<string, any>): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/inventory/categories/', { params });

    // Handle paginated response from Django REST framework
    if (response.data && response.data.results) {
      return {
        success: true,
        data: response.data.results,
        message: `Found ${response.data.count} categories`
      };
    }

    // Handle direct array response
    if (Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data,
        message: `Found ${response.data.length} categories`
      };
    }

    return response.data;
  },

  createCategory: async (categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await api.post('/inventory/categories/', categoryData);
    return {
      success: true,
      data: response.data,
      message: 'Category created successfully'
    };
  },

  updateCategory: async (id: number, categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/inventory/categories/${id}/`, categoryData);
    return {
      success: true,
      data: response.data,
      message: 'Category updated successfully'
    };
  },

  deleteCategory: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/inventory/categories/${id}/`);
    return {
      success: true,
      message: 'Category deleted successfully'
    };
  },

  // Manufacturers
  getManufacturers: async (params?: Record<string, any>): Promise<ApiResponse<Manufacturer[]>> => {
    const response = await api.get('/inventory/manufacturers/', { params });

    // Handle paginated response from Django REST framework
    if (response.data && response.data.results) {
      return {
        success: true,
        data: response.data.results,
        message: `Found ${response.data.count} manufacturers`
      };
    }

    // Handle direct array response
    if (Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data,
        message: `Found ${response.data.length} manufacturers`
      };
    }

    return response.data;
  },

  createManufacturer: async (manufacturerData: Partial<Manufacturer>): Promise<ApiResponse<Manufacturer>> => {
    const response = await api.post('/inventory/manufacturers/', manufacturerData);
    return {
      success: true,
      data: response.data,
      message: 'Manufacturer created successfully'
    };
  },

  // Rack Management
  getRacks: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/inventory/racks/');
    return {
      success: true,
      data: response.data,
      message: 'Racks retrieved successfully'
    };
  },

  createRack: async (rackData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/inventory/racks/', rackData);
    return {
      success: true,
      data: response.data,
      message: 'Rack created successfully'
    };
  },

  getRack: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/inventory/racks/${id}/`);
    return {
      success: true,
      data: response.data,
      message: 'Rack retrieved successfully'
    };
  },

  updateRack: async (id: number, rackData: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/inventory/racks/${id}/`, rackData);
    return {
      success: true,
      data: response.data,
      message: 'Rack updated successfully'
    };
  },

  deleteRack: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/inventory/racks/${id}/`);
    return {
      success: true,
      message: 'Rack deleted successfully'
    };
  },

  getRackSections: async (rackId: number): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/inventory/racks/${rackId}/sections/`);
    return {
      success: true,
      data: response.data,
      message: 'Rack sections retrieved successfully'
    };
  },

  assignMedicineToSection: async (sectionId: number, assignmentData: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/inventory/rack-sections/${sectionId}/assign-medicine/`, assignmentData);
    return {
      success: true,
      data: response.data,
      message: 'Medicine assigned to section successfully'
    };
  },

  removeMedicineFromSection: async (sectionId: number, reason: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/inventory/rack-sections/${sectionId}/remove-medicine/`, { reason });
    return {
      success: true,
      data: response.data,
      message: 'Medicine removed from section successfully'
    };
  },

  // Medicine search for rack assignment
  searchMedicinesForRack: async (query: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/inventory/medicines/search/', { params: { q: query } });
    return {
      success: true,
      data: response.data,
      message: 'Medicines retrieved successfully'
    };
  },

  // Supplier Dashboard APIs
  getSupplierDashboardStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/inventory/supplier/dashboard/stats/');
    return {
      success: true,
      data: response.data,
      message: 'Supplier dashboard stats retrieved successfully'
    };
  },

  getSupplierRecentOrders: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/inventory/supplier/dashboard/recent-orders/');
    return {
      success: true,
      data: response.data,
      message: 'Recent orders retrieved successfully'
    };
  },

  getSupplierOrdersOverTime: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/inventory/supplier/dashboard/orders-over-time/');
    return {
      success: true,
      data: response.data,
      message: 'Orders over time data retrieved successfully'
    };
  },

  getSupplierCustomersChart: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/inventory/supplier/dashboard/customers-chart/');
    return {
      success: true,
      data: response.data,
      message: 'Customer chart data retrieved successfully'
    };
  },

  getSupplierTopProducts: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/inventory/supplier/dashboard/top-products/');
    return {
      success: true,
      data: response.data,
      message: 'Top products retrieved successfully'
    };
  },

  // Manager Dashboard APIs
  getManagerDashboardStats: async (dateFilter?: string): Promise<ApiResponse<any>> => {
    const response = await api.get('/pos/manager/dashboard/stats/', {
      params: { date_filter: dateFilter || 'month' }
    });
    return {
      success: true,
      data: response.data,
      message: 'Manager dashboard stats retrieved successfully'
    };
  },

  getManagerSalesOverTime: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/pos/manager/dashboard/sales-over-time/');
    return {
      success: true,
      data: response.data,
      message: 'Sales over time data retrieved successfully'
    };
  },

  getManagerPaymentMethodsChart: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/pos/manager/dashboard/payment-methods/');
    return {
      success: true,
      data: response.data,
      message: 'Payment methods chart data retrieved successfully'
    };
  },

  getManagerTopProducts: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/pos/manager/dashboard/top-products/');
    return {
      success: true,
      data: response.data,
      message: 'Top products retrieved successfully'
    };
  },

  getManagerRecentActivities: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/pos/manager/dashboard/recent-activities/');
    return {
      success: true,
      data: response.data,
      message: 'Recent activities retrieved successfully'
    };
  },

  getManagerStaffPerformance: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/pos/manager/dashboard/staff-performance/');
    return {
      success: true,
      data: response.data,
      message: 'Staff performance data retrieved successfully'
    };
  },
};

// Patient Types
export interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  date_of_birth: string;
  age?: number;
  gender: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
  full_address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  blood_group?: string;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  insurance_provider?: string;
  insurance_number?: string;
  insurance_expiry?: string;
  status: string;
  organization_id: number;
  branch_id?: number;
  preferred_language: string;
  marketing_consent: boolean;
  sms_notifications: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  record_id: string;
  patient: string;
  patient_name?: string;
  patient_id?: string;
  record_type: string;
  title: string;
  description: string;
  symptoms?: string;
  diagnosis?: string;
  treatment_plan?: string;
  medications_prescribed?: any[];
  follow_up_date?: string;
  doctor_name: string;
  doctor_license?: string;
  doctor_signature?: string;
  status: string;
  record_date: string;
  created_at: string;
  updated_at: string;
}

export interface PatientPrescription {
  id: string;
  prescription_id: string;
  patient: string;
  patient_name?: string;
  patient_id?: string;
  medical_record?: string;
  doctor_name: string;
  doctor_license?: string;
  medications: any[];
  notes?: string;
  prescription_date: string;
  valid_until: string;
  status: string;
  is_expired?: boolean;
  days_until_expiry?: number;
  created_at: string;
  updated_at: string;
}

export interface PatientVisit {
  id: string;
  visit_id: string;
  patient: string;
  patient_name?: string;
  patient_id?: string;
  visit_type: string;
  visit_date: string;
  purpose: string;
  notes?: string;
  total_amount: number;
  items_purchased?: any[];
  attended_by?: string;
  attended_by_name?: string;
  created_at: string;
  updated_at: string;
}

// Patients API
export const patientsAPI = {
  getPatients: async (params?: Record<string, any>): Promise<ApiResponse<Patient[]>> => {
    const response = await api.get('/patients/', { params });

    // Handle paginated response from Django REST framework
    if (response.data && response.data.results) {
      return {
        success: true,
        data: response.data.results,
        message: `Found ${response.data.count} patients`
      };
    }

    // Handle direct array response
    if (Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data,
        message: `Found ${response.data.length} patients`
      };
    }

    return response.data;
  },

  getPatient: async (id: string): Promise<ApiResponse<Patient>> => {
    const response = await api.get(`/patients/${id}/`);
    return {
      success: true,
      data: response.data,
      message: 'Patient retrieved successfully'
    };
  },

  createPatient: async (patientData: Partial<Patient>): Promise<ApiResponse<Patient>> => {
    const response = await api.post('/patients/', patientData);
    return {
      success: true,
      data: response.data,
      message: 'Patient created successfully'
    };
  },

  updatePatient: async (id: string, patientData: Partial<Patient>): Promise<ApiResponse<Patient>> => {
    const response = await api.put(`/patients/${id}/`, patientData);
    return {
      success: true,
      data: response.data,
      message: 'Patient updated successfully'
    };
  },

  deletePatient: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/patients/${id}/`);
    return {
      success: true,
      message: 'Patient deleted successfully'
    };
  },

  searchPatients: async (query: string): Promise<ApiResponse<Patient[]>> => {
    const response = await api.get('/patients/search/', { params: { q: query } });
    return {
      success: true,
      data: response.data.patients || [],
      message: 'Search completed successfully'
    };
  },

  getPatientSummary: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/patients/${id}/summary/`);
    return {
      success: true,
      data: response.data,
      message: 'Patient summary retrieved successfully'
    };
  },

  getPatientStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/patients/stats/');
    return {
      success: true,
      data: response.data,
      message: 'Patient statistics retrieved successfully'
    };
  },

  // Medical Records
  getMedicalRecords: async (params?: Record<string, any>): Promise<ApiResponse<MedicalRecord[]>> => {
    const response = await api.get('/patients/medical-records/', { params });

    if (response.data && response.data.results) {
      return {
        success: true,
        data: response.data.results,
        message: `Found ${response.data.count} medical records`
      };
    }

    if (Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data,
        message: `Found ${response.data.length} medical records`
      };
    }

    return response.data;
  },

  createMedicalRecord: async (recordData: Partial<MedicalRecord>): Promise<ApiResponse<MedicalRecord>> => {
    const response = await api.post('/patients/medical-records/', recordData);
    return {
      success: true,
      data: response.data,
      message: 'Medical record created successfully'
    };
  },

  // Prescriptions
  getPrescriptions: async (params?: Record<string, any>): Promise<ApiResponse<PatientPrescription[]>> => {
    const response = await api.get('/patients/prescriptions/', { params });

    if (response.data && response.data.results) {
      return {
        success: true,
        data: response.data.results,
        message: `Found ${response.data.count} prescriptions`
      };
    }

    if (Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data,
        message: `Found ${response.data.length} prescriptions`
      };
    }

    return response.data;
  },

  createPrescription: async (prescriptionData: Partial<PatientPrescription>): Promise<ApiResponse<PatientPrescription>> => {
    const response = await api.post('/patients/prescriptions/', prescriptionData);
    return {
      success: true,
      data: response.data,
      message: 'Prescription created successfully'
    };
  },

  // Visits
  getVisits: async (params?: Record<string, any>): Promise<ApiResponse<PatientVisit[]>> => {
    const response = await api.get('/patients/visits/', { params });

    if (response.data && response.data.results) {
      return {
        success: true,
        data: response.data.results,
        message: `Found ${response.data.count} visits`
      };
    }

    if (Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data,
        message: `Found ${response.data.length} visits`
      };
    }

    return response.data;
  },

  createVisit: async (visitData: Partial<PatientVisit>): Promise<ApiResponse<PatientVisit>> => {
    const response = await api.post('/patients/visits/', visitData);
    return {
      success: true,
      data: response.data,
      message: 'Visit recorded successfully'
    };
  },
};

// Subscription API
export const subscriptionAPI = {
  getPlans: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/organizations/subscription-plans/');
    return {
      success: true,
      data: response.data.results || response.data,
      message: 'Subscription plans retrieved successfully'
    };
  },

  getSubscriptions: async (params?: Record<string, any>): Promise<ApiResponse<{ results: any[], count: number }>> => {
    const response = await api.get('/organizations/subscriptions/', { params });

    if (response.data && response.data.results) {
      return {
        success: true,
        data: {
          results: response.data.results,
          count: response.data.count
        },
        message: `Found ${response.data.count} subscriptions`
      };
    }

    return {
      success: true,
      data: { results: response.data, count: response.data.length },
      message: 'Subscriptions retrieved successfully'
    };
  },

  getSubscription: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/organizations/subscriptions/${id}/`);
    return {
      success: true,
      data: response.data,
      message: 'Subscription retrieved successfully'
    };
  },

  createSubscription: async (subscriptionData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/organizations/create-subscription/', subscriptionData);
    return {
      success: true,
      data: response.data.subscription,
      message: response.data.message || 'Subscription created successfully'
    };
  },

  updateSubscription: async (id: number, subscriptionData: any): Promise<ApiResponse<any>> => {
    const response = await api.patch(`/organizations/subscriptions/${id}/`, subscriptionData);
    return {
      success: true,
      data: response.data,
      message: 'Subscription updated successfully'
    };
  },

  deleteSubscription: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/organizations/subscriptions/${id}/`);
    return {
      success: true,
      message: 'Subscription deleted successfully'
    };
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/organizations/subscription-stats/');
    return {
      success: true,
      data: response.data,
      message: 'Subscription statistics retrieved successfully'
    };
  },

  updateOrganizationPlan: async (organizationId: number, planData: { plan: string }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/organizations/${organizationId}/update-plan/`, planData);
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Organization plan updated successfully'
    };
  },

  createPlan: async (planData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/organizations/subscription-plans/', planData);
    return {
      success: true,
      data: response.data,
      message: 'Subscription plan created successfully'
    };
  },

  updatePlan: async (id: number, planData: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/organizations/subscription-plans/${id}/`, planData);
    return {
      success: true,
      data: response.data,
      message: 'Subscription plan updated successfully'
    };
  },

  deletePlan: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/organizations/subscription-plans/${id}/`);
    return {
      success: true,
      data: response.data,
      message: 'Subscription plan deleted successfully'
    };
  },

  togglePlanStatus: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/organizations/subscription-plans/${id}/toggle-status/`);
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Plan status updated successfully'
    };
  },
};

// Export the axios instance for direct use if needed
export const auditAPI = {
  getLogs: () => api.get('/accounts/activities/'),
};

export default api;

// Also export as apiClient for the subscription service
export const apiClient = api;