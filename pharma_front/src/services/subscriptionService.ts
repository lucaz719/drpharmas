import { apiClient } from './api';

export interface SubscriptionPlan {
  id: number;
  name: string;
  display_name: string;
  price: number;
  currency: string;
  billing_cycle: string;
  max_users: number | null;
  max_organizations: number | null;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSubscription {
  id: number;
  organization: number;
  organization_name: string;
  plan: number;
  plan_details: SubscriptionPlan;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStats {
  total_organizations: number;
  active_subscriptions: number;
  monthly_revenue: number;
  growth_rate: number;
  subscription_distribution: Record<string, number>;
  recent_subscriptions: OrganizationSubscription[];
}

export interface CreateSubscriptionData {
  organization: number;
  plan: number;
  start_date?: string;
  end_date?: string;
  auto_renew?: boolean;
}

export interface UpdatePlanData {
  plan: string;
}

export interface BillingRecord {
  id: number;
  organization: number;
  organization_name: string;
  subscription: number | null;
  subscription_plan: string | null;
  transaction_type: 'invoice' | 'payment' | 'refund' | 'credit';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  invoice_number: string | null;
  payment_method: string;
  payment_reference: string;
  description: string;
  billing_period_start: string | null;
  billing_period_end: string | null;
  due_date: string | null;
  paid_date: string | null;
  created_at: string;
  updated_at: string;
}

class SubscriptionService {
  private baseUrl = '/organizations';

  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get(`${this.baseUrl}/subscription-plans/`);
    return response.data;
  }

  async getSubscriptions(params?: {
    status?: string;
    plan?: number;
    search?: string;
    ordering?: string;
  }): Promise<{ results: OrganizationSubscription[]; count: number }> {
    const response = await apiClient.get(`${this.baseUrl}/subscriptions/`, { params });
    return response.data;
  }

  async getSubscription(id: number): Promise<OrganizationSubscription> {
    const response = await apiClient.get(`${this.baseUrl}/subscriptions/${id}/`);
    return response.data;
  }

  async createSubscription(data: CreateSubscriptionData): Promise<OrganizationSubscription> {
    const response = await apiClient.post(`${this.baseUrl}/create-subscription/`, data);
    return response.data.subscription;
  }

  async updateSubscription(id: number, data: Partial<OrganizationSubscription>): Promise<OrganizationSubscription> {
    const response = await apiClient.patch(`${this.baseUrl}/subscriptions/${id}/`, data);
    return response.data;
  }

  async deleteSubscription(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/subscriptions/${id}/`);
  }

  async getStats(): Promise<SubscriptionStats> {
    const response = await apiClient.get(`${this.baseUrl}/subscription-stats/`);
    return response.data;
  }

  async updateOrganizationPlan(organizationId: number, data: UpdatePlanData): Promise<{
    organization: any;
    subscription: OrganizationSubscription;
    message: string;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/${organizationId}/update-plan/`, data);
    return response.data;
  }

  // Helper methods for plan management
  async activatePlan(planId: number): Promise<SubscriptionPlan> {
    const response = await apiClient.patch(`${this.baseUrl}/subscription-plans/${planId}/`, {
      is_active: true
    });
    return response.data;
  }

  async deactivatePlan(planId: number): Promise<SubscriptionPlan> {
    const response = await apiClient.patch(`${this.baseUrl}/subscription-plans/${planId}/`, {
      is_active: false
    });
    return response.data;
  }

  // Subscription status management
  async activateSubscription(subscriptionId: number): Promise<OrganizationSubscription> {
    const response = await apiClient.patch(`${this.baseUrl}/subscriptions/${subscriptionId}/`, {
      status: 'active'
    });
    return response.data;
  }

  async cancelSubscription(subscriptionId: number): Promise<OrganizationSubscription> {
    const response = await apiClient.patch(`${this.baseUrl}/subscriptions/${subscriptionId}/`, {
      status: 'cancelled'
    });
    return response.data;
  }

  async renewSubscription(subscriptionId: number, endDate: string): Promise<OrganizationSubscription> {
    const response = await apiClient.patch(`${this.baseUrl}/subscriptions/${subscriptionId}/`, {
      end_date: endDate,
      status: 'active'
    });
    return response.data;
  }

  // Analytics and reporting
  async getSubscriptionAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    plan?: string;
  }): Promise<{
    revenue_by_month: Array<{ month: string; revenue: number }>;
    subscriptions_by_plan: Record<string, number>;
    churn_rate: number;
    growth_metrics: {
      new_subscriptions: number;
      cancelled_subscriptions: number;
      net_growth: number;
    };
  }> {
    const response = await apiClient.get(`${this.baseUrl}/subscription-analytics/`, { params });
    return response.data;
  }

  // Bulk operations
  async bulkUpdateSubscriptions(subscriptionIds: number[], data: Partial<OrganizationSubscription>): Promise<{
    updated: number;
    errors: Array<{ id: number; error: string }>;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/subscriptions/bulk-update/`, {
      subscription_ids: subscriptionIds,
      data
    });
    return response.data;
  }

  // Export functionality
  async exportSubscriptions(format: 'csv' | 'xlsx' = 'csv', filters?: {
    status?: string;
    plan?: string;
    date_range?: { start: string; end: string };
  }): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/subscriptions/export/`, {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  }

  // Billing History methods
  async getBillingHistory(organizationId: number, params?: {
    transaction_type?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ billing_history: BillingRecord[]; count: number }> {
    const response = await apiClient.get(`${this.baseUrl}/${organizationId}/billing-history/`, { params });
    return response.data;
  }


}

export const subscriptionService = new SubscriptionService();