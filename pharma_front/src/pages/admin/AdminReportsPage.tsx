import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, TrendingUp, Users, Building2, DollarSign,
  Calendar, Download, RefreshCw, Loader2, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { organizationsAPI, usersAPI } from "@/services/api";

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);

      const [statsResponse, usersResponse, orgsResponse] = await Promise.all([
        organizationsAPI.getDashboardStats(),
        usersAPI.getUsers(),
        organizationsAPI.getOrganizations()
      ]);

      if (statsResponse.success && statsResponse.data) {
        setDashboardStats(statsResponse.data);
      }

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }

      if (orgsResponse.success && orgsResponse.data) {
        setOrganizations(orgsResponse.data);
      }

    } catch (error: any) {
      console.error('Failed to fetch report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  const exportReport = (reportType: string) => {
    toast({
      title: "Export Started",
      description: `${reportType} report export has been initiated.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-warning" />
          <div>
            <h1 className="text-3xl font-bold">Admin Reports</h1>
            <p className="text-muted-foreground">Comprehensive system analytics and insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAllData} variant="outline" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${(loading || statsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : (dashboardStats?.total_users || users.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              {statsLoading ? '...' : `${dashboardStats?.active_users || 0} active`}
            </p>
          </CardContent>
        </Card>

        <Card>
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
              {statsLoading ? '...' : `${dashboardStats?.growth_percentage || 0 > 0 ? '+' : ''}${dashboardStats?.growth_percentage || 0}% growth`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading data...</span>
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
                        <div className={`w-3 h-3 rounded-full bg-${sub.color === 'destructive' ? 'red' : sub.color === 'default' ? 'blue' : sub.color === 'outline' ? 'gray' : 'yellow'}-500`}></div>
                        <span className="font-medium">{sub.tier}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{sub.count} organizations</div>
                        <div className="text-xs text-muted-foreground">₹{(sub.revenue / 100000).toFixed(1)}L/month</div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { metric: 'Database Performance', value: '98.5%', status: 'excellent' },
                  { metric: 'API Response Time', value: '145ms', status: 'good' },
                  { metric: 'Active Connections', value: '1,247', status: 'normal' },
                  { metric: 'Error Rate', value: '0.02%', status: 'excellent' },
                  { metric: 'Storage Usage', value: '67%', status: 'normal' }
                ].map((health, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border">
                    <span className="font-medium">{health.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{health.value}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        health.status === 'excellent' ? 'bg-green-500' :
                        health.status === 'good' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Organization Analytics</CardTitle>
              <Button onClick={() => exportReport("Organizations")} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading organizations...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{organizations.length}</div>
                      <div className="text-sm text-muted-foreground">Total Organizations</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {organizations.filter(org => org.status === 'active').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Organizations</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {organizations.filter(org => org.status === 'pending').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Pending Organizations</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Analytics</CardTitle>
              <Button onClick={() => exportReport("Users")} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading users...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{users.length}</div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {users.filter(u => u.status === 'active' && u.is_active).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {users.filter(u => u.role === 'super_admin').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Super Admins</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {users.filter(u => u.role === 'owner').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Pharmacy Owners</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Financial Reports</CardTitle>
              <Button onClick={() => exportReport("Financial")} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Financial Analytics</h3>
                <p className="text-muted-foreground">Detailed financial reports coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>System Reports</CardTitle>
              <Button onClick={() => exportReport("System")} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">System Analytics</h3>
                <p className="text-muted-foreground">Detailed system reports coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}