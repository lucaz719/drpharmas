import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, TrendingUp, Users, Building, DollarSign, CreditCard, Plus } from 'lucide-react';
import { subscriptionAPI, organizationsAPI } from '@/services/api';

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

export default function SubscriptionManagementPage() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<OrganizationSubscription[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planData, setPlanData] = useState({
    name: '',
    display_name: '',
    pricing_tiers: [{ cycle: 'monthly', price: '' }],
    max_users: '',
    max_organizations: '',
    max_branches: '',
    features: ['']
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, plansResponse, subscriptionsResponse, orgsResponse] = await Promise.all([
        subscriptionAPI.getStats(),
        subscriptionAPI.getPlans(),
        subscriptionAPI.getSubscriptions(),
        organizationsAPI.getOrganizations()
      ]);
      
      const statsData = statsResponse.data;
      const plansData = plansResponse.data;
      const subscriptionsData = subscriptionsResponse.data;
      const orgsData = orgsResponse.data;
      
      setStats(statsData || null);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setSubscriptions(subscriptionsData.results || subscriptionsData || []);
      setOrganizations(Array.isArray(orgsData) ? orgsData : []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  const handleCreatePlan = async () => {
    try {
      const planPayload = {
        name: planData.name,
        display_name: planData.display_name,
        pricing_tiers: planData.pricing_tiers.filter(t => t.price),
        max_users: planData.max_users ? parseInt(planData.max_users) : null,
        max_organizations: planData.max_organizations ? parseInt(planData.max_organizations) : null,
        max_branches: planData.max_branches ? parseInt(planData.max_branches) : null,
        features: planData.features.filter(f => f.trim())
      };
      
      if (editingPlan) {
        await subscriptionAPI.updatePlan(editingPlan.id, planPayload);
      } else {
        await subscriptionAPI.createPlan(planPayload);
      }
      
      setShowCreatePlan(false);
      setEditingPlan(null);
      setPlanData({ name: '', display_name: '', pricing_tiers: [{ cycle: 'monthly', price: '' }], max_users: '', max_organizations: '', max_branches: '', features: [''] });
      fetchData();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanData({
      name: plan.name,
      display_name: plan.display_name,
      pricing_tiers: plan.pricing_tiers || [{ cycle: 'monthly', price: plan.price.toString() }],
      max_users: plan.max_users?.toString() || '',
      max_organizations: plan.max_organizations?.toString() || '',
      max_branches: plan.max_branches?.toString() || '',
      features: plan.features.length ? plan.features : ['']
    });
    setShowCreatePlan(true);
  };

  const handleDeletePlan = async (planId: number) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        await subscriptionAPI.deletePlan(planId);
        fetchData();
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  const handleToggleStatus = async (planId: number) => {
    try {
      await subscriptionAPI.togglePlanStatus(planId);
      fetchData();
    } catch (error) {
      console.error('Error toggling plan status:', error);
    }
  };

  const getAvailablePlanTypes = () => {
    const allPlanTypes = [
      { value: 'trial', label: 'Trial' },
      { value: 'basic', label: 'Basic' },
      { value: 'professional', label: 'Professional' },
      { value: 'enterprise', label: 'Enterprise' }
    ];

    // If editing an existing plan, allow the current plan type
    if (editingPlan) {
      return allPlanTypes;
    }

    // Filter out plan types that already exist
    const existingPlanTypes = plans.map(plan => plan.name);
    return allPlanTypes.filter(planType => !existingPlanTypes.includes(planType.value));
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-warning" />
          <div>
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <p className="text-muted-foreground">Manage subscription plans and billing</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
            <DialogTrigger asChild>
              <Button disabled={!editingPlan && getAvailablePlanTypes().length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPlan ? 'Edit' : 'Create'} Subscription Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Plan Type</Label>
                    <Select value={planData.name} onValueChange={(value) => setPlanData({...planData, name: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan type" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailablePlanTypes().length > 0 ? (
                          getAvailablePlanTypes().map((planType) => (
                            <SelectItem key={planType.value} value={planType.value}>
                              {planType.label}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500">
                            All plan types already exist
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {!editingPlan && getAvailablePlanTypes().length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        All plan types (Trial, Basic, Professional, Enterprise) already exist. You can edit existing plans instead.
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Display Name</Label>
                    <Input value={planData.display_name} onChange={(e) => setPlanData({...planData, display_name: e.target.value})} placeholder="e.g., Professional Plan" />
                  </div>
                </div>
                
                <div>
                  <Label>Pricing Tiers</Label>
                  {planData.pricing_tiers.map((tier, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Select value={tier.cycle} onValueChange={(value) => {
                        const newTiers = [...planData.pricing_tiers];
                        newTiers[index].cycle = value;
                        setPlanData({...planData, pricing_tiers: newTiers});
                      }}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">3 Months</SelectItem>
                          <SelectItem value="half-yearly">6 Months</SelectItem>
                          <SelectItem value="yearly">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        type="number" 
                        placeholder="Price" 
                        value={tier.price} 
                        onChange={(e) => {
                          const newTiers = [...planData.pricing_tiers];
                          newTiers[index].price = e.target.value;
                          setPlanData({...planData, pricing_tiers: newTiers});
                        }} 
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        const newTiers = planData.pricing_tiers.filter((_, i) => i !== index);
                        setPlanData({...planData, pricing_tiers: newTiers});
                      }}>Remove</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    setPlanData({...planData, pricing_tiers: [...planData.pricing_tiers, { cycle: 'monthly', price: '' }]});
                  }}>+ Add Pricing Tier</Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Max Users</Label>
                    <Input type="number" value={planData.max_users} onChange={(e) => setPlanData({...planData, max_users: e.target.value})} placeholder="50" />
                  </div>
                  <div>
                    <Label>Max Organizations</Label>
                    <Input type="number" value={planData.max_organizations} onChange={(e) => setPlanData({...planData, max_organizations: e.target.value})} placeholder="5" />
                  </div>
                  <div>
                    <Label>Max Branches</Label>
                    <Input type="number" value={planData.max_branches} onChange={(e) => setPlanData({...planData, max_branches: e.target.value})} placeholder="10" />
                  </div>
                </div>
                
                <div>
                  <Label>Features</Label>
                  {planData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 items-center mb-2">
                      <Input 
                        value={feature} 
                        onChange={(e) => {
                          const newFeatures = [...planData.features];
                          newFeatures[index] = e.target.value;
                          setPlanData({...planData, features: newFeatures});
                        }} 
                        placeholder="Enter feature" 
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        const newFeatures = planData.features.filter((_, i) => i !== index);
                        setPlanData({...planData, features: newFeatures});
                      }}>Remove</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    setPlanData({...planData, features: [...planData.features, '']});
                  }}>+ Add Feature</Button>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setShowCreatePlan(false);
                    setEditingPlan(null);
                    setPlanData({ name: '', display_name: '', pricing_tiers: [{ cycle: 'monthly', price: '' }], max_users: '', max_organizations: '', max_branches: '', features: [''] });
                  }}>Cancel</Button>
                  <Button 
                    onClick={handleCreatePlan}
                    disabled={!editingPlan && !planData.name && getAvailablePlanTypes().length === 0}
                  >
                    {editingPlan ? 'Update' : 'Create'} Plan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="organizations">Organization Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Subscription Plans Tab */}
        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(plans || []).map((plan) => (
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
                      {plan.pricing_tiers && plan.pricing_tiers.length > 0 ? (
                        <div className="space-y-1">
                          {plan.pricing_tiers.map((tier: any, index: number) => (
                            <div key={index} className="text-sm">
                              <span className="font-bold">{formatCurrency(parseFloat(tier.price))}</span>
                              <span className="text-gray-600">/{tier.cycle}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                          <span className="text-gray-600">/{plan.billing_cycle}</span>
                        </div>
                      )}
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
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" variant="outline" onClick={() => handleEditPlan(plan)}>Edit</Button>
                      <Button className="flex-1" variant="destructive" onClick={() => handleDeletePlan(plan.id)}>Delete</Button>
                    </div>
                    <Button 
                      className="w-full mt-2" 
                      variant={plan.is_active ? "secondary" : "default"}
                      onClick={() => handleToggleStatus(plan.id)}
                    >
                      {plan.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Organization Subscriptions Tab */}
        <TabsContent value="organizations">
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
                    {(subscriptions || []).map((subscription) => (
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
                    {(stats.recent_subscriptions || []).map((subscription) => (
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
}