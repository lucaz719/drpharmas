import { apiClient } from './api';

export interface ExpenseCategory {
  id?: number;
  name: string;
  description?: string;
  budget: number;
  color: string;
  is_active: boolean;
  spent?: number;
  transactions?: number;
  remaining?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id?: number;
  category: number;
  category_name?: string;
  amount: number;
  description: string;
  receipt?: File | string;
  pharmacy: string;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryLoss {
  id?: number;
  item_name: string;
  batch_no?: string;
  quantity: number;
  unit_cost: number;
  total_loss?: number;
  reason: string;
  pharmacy: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseStats {
  total_categories: number;
  total_budget: number;
  total_spent: number;
  avg_usage: number;
}

export const expensesAPI = {
  // Categories
  getCategories: () => apiClient.get<ExpenseCategory[]>('/expenses/categories/'),
  getCategoryStats: () => apiClient.get<ExpenseStats>('/expenses/categories/stats/'),
  createCategory: (data: Omit<ExpenseCategory, 'id'>) => 
    apiClient.post<ExpenseCategory>('/expenses/categories/', data),
  updateCategory: (id: number, data: Partial<ExpenseCategory>) => 
    apiClient.put<ExpenseCategory>(`/expenses/categories/${id}/`, data),
  deleteCategory: (id: number) => apiClient.delete(`/expenses/categories/${id}/`),

  // Expenses
  getExpenses: () => apiClient.get<Expense[]>('/expenses/expenses/'),
  createExpense: (data: FormData) => 
    apiClient.post<Expense>('/expenses/expenses/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateExpense: (id: number, data: Partial<Expense>) => 
    apiClient.put<Expense>(`/expenses/expenses/${id}/`, data),
  deleteExpense: (id: number) => apiClient.delete(`/expenses/expenses/${id}/`),

  // Inventory Losses
  getInventoryLosses: () => apiClient.get<InventoryLoss[]>('/expenses/inventory-losses/'),
  createInventoryLoss: (data: Omit<InventoryLoss, 'id' | 'total_loss'>) => 
    apiClient.post<InventoryLoss>('/expenses/inventory-losses/', data),
  updateInventoryLoss: (id: number, data: Partial<InventoryLoss>) => 
    apiClient.put<InventoryLoss>(`/expenses/inventory-losses/${id}/`, data),
  deleteInventoryLoss: (id: number) => apiClient.delete(`/expenses/inventory-losses/${id}/`),
};