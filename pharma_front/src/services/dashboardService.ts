import api, { ApiResponse } from './api';

export interface DashboardStats {
  totalSales: number;
  totalReturns: number;
  netSales: number;
  patientCredit: number;
  supplierCredit: number;
  criticalStock: number;
  expiring: number;
  todaySales: number;
  todayPatients: number;
  lowStockItems: number;
  expiringItems: number;
  totalTransactions: number;
  activeStaff: number;
  pendingOrders: number;
  totalMedications: number;
  avgTransaction: number;
  salesGrowth: number;
  patientGrowth: number;
  stockValue: number;
}

export interface RecentActivity {
  id: string;
  type: 'sale' | 'stock' | 'patient' | 'order';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  action?: string;
}

export const dashboardService = {
  getDashboardStats: async (dateFilter: string = 'today', branchId?: string): Promise<ApiResponse<DashboardStats>> => {
    try {
      const params = new URLSearchParams();
      params.append('date_filter', dateFilter);
      if (branchId) params.append('branch_id', branchId);

      const response = await api.get(`/pos/manager/dashboard/stats/?${params}`);
      return {
        success: true,
        data: response.data,
        message: 'Dashboard stats retrieved successfully'
      };
    } catch (error: any) {
      // Try to get real data from multiple endpoints
      try {
        const [posStats, inventoryStats, patientStats] = await Promise.allSettled([
          api.get('/pos/manager/dashboard/stats/'),
          api.get('/inventory/dashboard/stats/'),
          api.get('/patients/dashboard/stats/')
        ]);

        const stats: DashboardStats = {
          totalSales: 0,
          totalReturns: 0,
          netSales: 0,
          patientCredit: 0,
          supplierCredit: 0,
          criticalStock: 0,
          expiring: 0,
          todaySales: 0,
          todayPatients: 0,
          lowStockItems: 0,
          expiringItems: 0,
          totalTransactions: 0,
          activeStaff: 0,
          pendingOrders: 0,
          totalMedications: 0,
          avgTransaction: 0,
          salesGrowth: 0,
          patientGrowth: 0,
          stockValue: 0
        };

        // Extract data from successful responses
        if (posStats.status === 'fulfilled' && posStats.value.data) {
          const posData = posStats.value.data;
          stats.totalSales = posData.totalSales || posData.total_sales || 0;
          stats.totalReturns = posData.totalReturns || posData.total_returns || 0;
          stats.netSales = posData.netSales || posData.net_sales || 0;
          stats.todaySales = posData.today_sales || 0;
          stats.totalTransactions = posData.total_transactions || 0;
          stats.avgTransaction = posData.avg_transaction || 0;
          stats.salesGrowth = posData.sales_growth || 0;
          stats.patientGrowth = posData.patient_growth || 0;
        }

        if (inventoryStats.status === 'fulfilled' && inventoryStats.value.data) {
          const invData = inventoryStats.value.data;
          stats.criticalStock = invData.criticalStock || invData.critical_stock || 0;
          stats.expiring = invData.expiringItems || invData.expiring_items || 0;
          stats.lowStockItems = invData.lowStockItems || invData.low_stock_items || 0;
          stats.expiringItems = invData.expiringItems || invData.expiring_items || 0;
          stats.totalMedications = invData.total_medications || 0;
          stats.stockValue = invData.stock_value || 0;
          stats.pendingOrders = invData.pending_orders || 0;
        }

        if (patientStats.status === 'fulfilled' && patientStats.value.data) {
          const patData = patientStats.value.data;
          stats.patientCredit = patData.patientCredit || patData.patient_credit || 0;
          stats.todayPatients = patData.today_patients || 0;
        }

        return {
          success: true,
          data: stats,
          message: 'Dashboard stats retrieved from multiple sources'
        };
      } catch (fallbackError) {
        // Return mock data if all APIs fail
        return {
          success: true,
          data: {
            totalSales: 125000,
            totalReturns: 8500,
            netSales: 116500,
            patientCredit: 45000,
            supplierCredit: 78000,
            criticalStock: 12,
            expiring: 8,
            todaySales: 15000,
            todayPatients: 45,
            lowStockItems: 23,
            expiringItems: 15,
            totalTransactions: 67,
            activeStaff: 12,
            pendingOrders: 8,
            totalMedications: 1247,
            avgTransaction: 2240,
            salesGrowth: 12.5,
            patientGrowth: 8.2,
            stockValue: 890000
          },
          message: 'Using mock data - API unavailable'
        };
      }
    }
  },

  getRecentActivity: async (): Promise<ApiResponse<RecentActivity[]>> => {
    try {
      const response = await api.get('/dashboard/recent-activity/');
      return {
        success: true,
        data: response.data,
        message: 'Recent activity retrieved successfully'
      };
    } catch (error: any) {
      // Return mock data if API fails
      return {
        success: true,
        data: [
          {
            id: '1',
            type: 'sale',
            title: 'Sale completed',
            description: '₹2,450 • 2 minutes ago',
            amount: 2450,
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            status: 'success'
          },
          {
            id: '2',
            type: 'stock',
            title: 'Stock updated',
            description: 'Paracetamol 500mg • 5 minutes ago',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            status: 'info'
          },
          {
            id: '3',
            type: 'patient',
            title: 'New patient registered',
            description: 'John Doe • 10 minutes ago',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            status: 'info'
          }
        ],
        message: 'Using mock data'
      };
    }
  },

  getSystemAlerts: async (): Promise<ApiResponse<SystemAlert[]>> => {
    try {
      const response = await api.get('/dashboard/alerts/');
      return {
        success: true,
        data: response.data,
        message: 'System alerts retrieved successfully'
      };
    } catch (error: any) {
      // Return mock data if API fails
      return {
        success: true,
        data: [
          {
            id: '1',
            type: 'critical',
            title: 'Expiring medications',
            message: '3 medications expire within 7 days',
            timestamp: new Date().toISOString(),
            action: 'View Details'
          },
          {
            id: '2',
            type: 'warning',
            title: 'Low stock alert',
            message: 'Low stock: Acetaminophen 500mg',
            timestamp: new Date().toISOString(),
            action: 'Reorder'
          },
          {
            id: '3',
            type: 'info',
            title: 'System backup',
            message: 'System backup completed successfully',
            timestamp: new Date().toISOString()
          }
        ],
        message: 'Using mock data'
      };
    }
  },

  getSalesReport: async (dateFilter: string = 'today', branchId?: string): Promise<ApiResponse<any>> => {
    try {
      const params = new URLSearchParams();
      params.append('date_filter', dateFilter);
      if (branchId) params.append('branch_id', branchId);

      const response = await api.get(`/pos/dashboard/sales-chart/?${params}`);
      return {
        success: true,
        data: response.data,
        message: 'Sales report retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: true,
        data: {
          totalSales: 15000,
          totalTransactions: 67,
          avgTransaction: 224,
          topProducts: [
            { name: 'Paracetamol 500mg', sales: 2500, quantity: 50 },
            { name: 'Amoxicillin 250mg', sales: 1800, quantity: 30 },
            { name: 'Ibuprofen 400mg', sales: 1200, quantity: 25 }
          ]
        },
        message: 'Using mock data'
      };
    }
  },

  getStockAnalysis: async (branchId?: string): Promise<ApiResponse<any>> => {
    try {
      const params = new URLSearchParams();
      if (branchId) params.append('branch_id', branchId);

      const response = await api.get(`/pos/dashboard/stock-categories/?${params}`);
      return {
        success: true,
        data: response.data,
        message: 'Stock analysis retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: true,
        data: {
          totalMedications: 1247,
          lowStockItems: 23,
          expiringItems: 15,
          outOfStock: 3,
          stockValue: 890000,
          categories: [
            { name: 'Antibiotics', count: 245, value: 180000 },
            { name: 'Pain Relief', count: 189, value: 120000 },
            { name: 'Vitamins', count: 156, value: 95000 }
          ]
        },
        message: 'Using mock data'
      };
    }
  }
};