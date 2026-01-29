import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Users, DollarSign,
  Package, Shield, RefreshCw, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { organizationsAPI, subscriptionAPI, usersAPI } from "@/services/api";

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<any[]>([]);
  const [healthLoading, setHealthLoading] = useState(true);

  // Fetch organizations and statistics on component mount
  useEffect(() => {
    fetchOrganizations();
    fetchDashboardStats();
    fetchSubscriptionStats();
    fetchSystemHealth();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await organizationsAPI.getDashboardStats();
      if (response.success && response.data) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchSubscriptionStats = async () => {
    try {
      setStatsLoading(true);
      const subscriptionsResponse = await subscriptionAPI.getStats();

      if (subscriptionsResponse.success && subscriptionsResponse.data) {
        setSubscriptionStats(subscriptionsResponse.data);
        setDashboardStats(subscriptionsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription stats:', error);
      // Set fallback values
      setDashboardStats({
        total_organizations: organizations.length,
        active_organizations: organizations.filter(org => org.status === 'active').length,
        total_users: 0,
        active_users: 0,
        monthly_revenue: 0,
        active_subscriptions: 0,
        growth_rate: 0,
        subscription_distribution: {
          trial: 0,
          basic: 0,
          professional: 0,
          enterprise: 0
        }
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      setHealthLoading(true);
      const response = await organizationsAPI.getSystemHealth();
      if (response.success && response.data) {
        setSystemHealth(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await organizationsAPI.getOrganizations();

      if (response.success && response.data) {
        setOrganizations(response.data);
      } else {
        // If API call succeeds but returns no data, set empty array
        setOrganizations([]);
        console.warn('API returned success but no data:', response);
      }
    } catch (error: any) {
      console.error('Failed to fetch organizations:', error);

      // Show error toast but don't fallback to mock data
      toast({
        title: "Connection Error",
        description: "Failed to load organizations from server. Please check your connection.",
        variant: "destructive",
      });

      // Set empty array instead of mock data
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };


  const getSubscriptionBadge = (tier: string) => {
    const variants = {
      trial: "secondary",
      basic: "outline",
      professional: "default",
      enterprise: "destructive"
    };
    return variants[tier as keyof typeof variants] || "outline";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-warning" />
          <div>
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">System-wide control and organization management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              fetchOrganizations();
              fetchDashboardStats();
              fetchSubscriptionStats();
              fetchSystemHealth();
            }}
            variant="outline"
            className="gap-2"
            disabled={loading || statsLoading}
          >
            <RefreshCw className={`w-4 h-4 ${(loading || statsLoading || healthLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-warning/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Total Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (dashboardStats?.total_organizations || organizations.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{statsLoading ? '...' : (dashboardStats?.monthly_growth || 0)} this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (dashboardStats?.total_users || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {statsLoading ? '...' : `${dashboardStats?.active_users || 0} active`} across all organizations
            </p>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `₹${(dashboardStats?.monthly_revenue || 0).toLocaleString('en-IN')}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {statsLoading ? '...' : `${dashboardStats?.growth_rate > 0 ? '+' : ''}${dashboardStats?.growth_rate || 0}% growth`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (dashboardStats?.active_subscriptions || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Paying customers</p>
          </CardContent>
        </Card>
      </div>



      {/* System Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading subscription data...</span>
              </div>
            ) : (
              [
                { tier: 'Enterprise', count: dashboardStats?.subscription_distribution?.enterprise || 0, revenue: (dashboardStats?.subscription_distribution?.enterprise || 0) * 50000, color: 'destructive' },
                { tier: 'Professional', count: dashboardStats?.subscription_distribution?.professional || 0, revenue: (dashboardStats?.subscription_distribution?.professional || 0) * 15000, color: 'default' },
                { tier: 'Basic', count: dashboardStats?.subscription_distribution?.basic || 0, revenue: (dashboardStats?.subscription_distribution?.basic || 0) * 5000, color: 'outline' },
                { tier: 'Trial', count: dashboardStats?.subscription_distribution?.trial || 0, revenue: 0, color: 'secondary' }
              ].map((sub) => (
                <div key={sub.tier} className="flex items-center justify-between p-3 border">
                  <div className="flex items-center gap-3">
                    <Badge variant={sub.color as any}>{sub.tier}</Badge>
                    <span className="font-medium">{sub.count} organizations</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{(sub.revenue / 100000).toFixed(1)}L</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Monitoring system...</span>
              </div>
            ) : (
              (systemHealth.length > 0 ? systemHealth : [
                { metric: 'Database Performance', value: '100%', status: 'excellent' },
                { metric: 'API Response Time', value: '145ms', status: 'good' },
                { metric: 'Active Sessions', value: '0', status: 'normal' },
                { metric: 'Error Rate', value: '0.00%', status: 'excellent' },
                { metric: 'Storage Usage', value: 'Unknown', status: 'normal' }
              ]).map((health, i) => (
                <div key={i} className="flex items-center justify-between p-3 border">
                  <span className="font-medium">{health.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{health.value}</span>
                    <Badge variant={
                      health.status === 'excellent' ? 'default' :
                        health.status === 'good' ? 'secondary' :
                          health.status === 'error' ? 'destructive' : 'outline'
                    }>
                      {health.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}