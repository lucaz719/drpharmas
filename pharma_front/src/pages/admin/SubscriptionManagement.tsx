import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, TrendingUp, Users, Building, DollarSign } from 'lucide-react';
import { subscriptionService } from '@/services/subscriptionService';

interface SubscriptionPlan {
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
}

interface OrganizationSubscription {
  id: number;
  organization: number;
  organization_name: string;
  plan: number;
  plan_details: SubscriptionPlan;
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  is_active: boolean;
  created_at: string;
}

interface SubscriptionStats {
  total_organizations: number;
  active_subscriptions: number;
  monthly_revenue: number;
  growth_rate: number;
  subscription_distribution: Record<string, number>;
  recent_subscriptions: OrganizationSubscription[];
}

const SubscriptionManagement: React.FC = () => {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<OrganizationSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, plansData, subscriptionsData] = await Promise.all([
        subscriptionService.getStats(),
        subscriptionService.getPlans(),
        subscriptionService.getSubscriptions()
      ]);
      
      setStats(statsData);
      setPlans(plansData);
      setSubscriptions(subscriptionsData.results || subscriptionsData);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPlanBadge = (planName: string) => {
    const planColors = {
      trial: 'bg-blue-100 text-blue-800',
      basic: 'bg-green-100 text-green-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800',
    };
    
    return (
      <Badge className={planColors[planName as keyof typeof planColors] || 'bg-gray-100 text-gray-800'}>
        {planName.charAt(0).toUpperCase() + planName.slice(1)}
      </Badge>
    );
  };

  const getAvailablePlanTypes = () => {
    const allPlanTypes = [
      { value: 'trial', label: 'Trial' },
      { value: 'basic', label: 'Basic' },
      { value: 'professional', label: 'Professional' },
      { value: 'enterprise', label: 'Enterprise' }
    ];

    // Filter out plan types that already exist
    const existingPlanTypes = plans.map(plan => plan.name);
    return allPlanTypes.filter(planType => !existingPlanTypes.includes(planType.value));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-gray-600">Manage subscription plans and billing</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                  <p className="text-2xl font-bold">{stats.total_organizations}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{stats.active_subscriptions}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold">{stats.growth_rate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">Organization Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Subscription Plans Tab */}
        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                      {getPlanBadge(plan.name)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                      <span className="text-gray-600">/{plan.billing_cycle}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {plan.max_users && (
                        <p className="text-sm text-gray-600">Up to {plan.max_users} users</p>
                      )}
                      {plan.max_organizations && (
                        <p className="text-sm text-gray-600">{plan.max_organizations} organizations</p>
                      )}
                      {plan.features.map((feature, index) => (
                        <p key={index} className="text-sm text-gray-600">• {feature}</p>
                      ))}
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      Manage Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Organization Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Organization Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Organization</th>
                      <th className="text-left p-2">Plan</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Start Date</th>
                      <th className="text-left p-2">End Date</th>
                      <th className="text-left p-2">Auto Renew</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b">
                        <td className="p-2">{subscription.organization_name}</td>
                        <td className="p-2">{getPlanBadge(subscription.plan_details.name)}</td>
                        <td className="p-2">{getStatusBadge(subscription.status)}</td>
                        <td className="p-2">{new Date(subscription.start_date).toLocaleDateString()}</td>
                        <td className="p-2">{new Date(subscription.end_date).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Badge variant={subscription.auto_renew ? "default" : "secondary"}>
                            {subscription.auto_renew ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button size="sm" variant="outline">
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Distribution */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.subscription_distribution).map(([plan, count]) => (
                      <div key={plan} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {getPlanBadge(plan)}
                          <span className="capitalize">{plan}</span>
                        </div>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Subscriptions */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recent_subscriptions.map((subscription) => (
                      <div key={subscription.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">{subscription.organization_name}</p>
                          <p className="text-sm text-gray-600">{subscription.plan_details.display_name}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(subscription.status)}
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(subscription.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionManagement;