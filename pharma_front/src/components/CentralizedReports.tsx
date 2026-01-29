import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Building2, Users, DollarSign, TrendingUp, Package,
  Filter, Calendar, Download, RefreshCw, Eye, Target
} from "lucide-react";
import { type User, getOrganizationById, getUsersByOrganization, getUsersByBranch } from "@/data/mockData";

interface CentralizedReportsProps {
  user: User;
}

export function CentralizedReports({ user }: CentralizedReportsProps) {
  const organization = getOrganizationById(user.organizationId!);
  
  // Mock report data
  const reportMetrics = {
    totalRevenue: 2456000,
    monthlyGrowth: 12.5,
    totalBranches: organization?.branches.length || 1,
    activeUsers: getUsersByOrganization(user.organizationId!).length,
    avgCollectionPerUser: 25000,
    complianceScore: 94
  };

  const branchPerformance = organization?.branches.map(branch => {
    const branchUsers = getUsersByBranch(branch.id);
    const totalCollection = branchUsers.reduce((sum, u) => sum + (u.collectionAmount || 0), 0);
    return {
      branchId: branch.id,
      branchName: branch.name,
      userCount: branchUsers.length,
      totalCollection,
      target: 50000,
      compliance: Math.floor(Math.random() * 20) + 80
    };
  }) || [];

  if (user.role === 'super_admin') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System-Wide Analytics</h1>
            <p className="text-muted-foreground">Centralized reporting across all organizations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* System-wide KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹12.4M</div>
              <p className="text-xs text-muted-foreground">+15.2% growth</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">Across all orgs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">Target achievement</p>
            </CardContent>
          </Card>
        </div>

        {/* Organization Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['MediCare Hospital Network', 'HealthPlus Pharmacy Chain', 'CityMed Group', 'WellCare Clinics'].map((orgName, i) => (
                <div key={i} className="flex items-center justify-between p-4 border">
                  <div className="flex items-center gap-4">
                    <Building2 className="w-8 h-8 p-1.5 bg-primary/10 text-primary" />
                    <div>
                      <div className="font-medium">{orgName}</div>
                      <div className="text-sm text-muted-foreground">{Math.floor(Math.random() * 5) + 2} branches • {Math.floor(Math.random() * 50) + 20} users</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">₹{(Math.random() * 500000 + 200000).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Monthly revenue</div>
                    </div>
                    <Badge variant={Math.random() > 0.3 ? "default" : "secondary"}>
                      {Math.random() > 0.3 ? "Active" : "Trial"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role === 'owner') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Multi-Branch Analytics</h1>
            <p className="text-muted-foreground">Centralized reporting for {organization?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Organization Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Total Branches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportMetrics.totalBranches}</div>
              <p className="text-xs text-muted-foreground">All active locations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{reportMetrics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{reportMetrics.monthlyGrowth}% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportMetrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Across all branches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Avg Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{reportMetrics.avgCollectionPerUser.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Per staff member</p>
            </CardContent>
          </Card>
        </div>

        {/* Branch Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Branch Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {branchPerformance.map((branch) => (
                <div key={branch.branchId} className="flex items-center justify-between p-4 border">
                  <div className="flex items-center gap-4">
                    <Building2 className="w-8 h-8 p-1.5 bg-secondary/10 text-secondary-foreground" />
                    <div>
                      <div className="font-medium">{branch.branchName}</div>
                      <div className="text-sm text-muted-foreground">{branch.userCount} staff members</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-medium">₹{branch.totalCollection.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Monthly collection</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{Math.round((branch.totalCollection / branch.target) * 100)}%</div>
                      <div className="text-xs text-muted-foreground">Target achieved</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{branch.compliance}%</div>
                      <div className="text-xs text-muted-foreground">Compliance</div>
                    </div>
                    <Badge variant={branch.totalCollection > branch.target * 0.8 ? "default" : "secondary"}>
                      {branch.totalCollection > branch.target * 0.8 ? "On Track" : "Needs Attention"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <BarChart3 className="w-6 h-6" />
                <span>Sales Comparison</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Package className="w-6 h-6" />
                <span>Inventory Status</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Users className="w-6 h-6" />
                <span>Staff Performance</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <TrendingUp className="w-6 h-6" />
                <span>Growth Analysis</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Branch-specific reports for Branch Manager
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branch Reports</h1>
          <p className="text-muted-foreground">Performance analytics for your branch</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            This Month
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Branch KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Branch Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{user.collectionAmount?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Target Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(((user.collectionAmount || 0) / (user.targets?.monthly || 1)) * 100)}%</div>
            <p className="text-xs text-muted-foreground">Monthly target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getUsersByBranch(user.branchId!).length}</div>
            <p className="text-xs text-muted-foreground">Active staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg per Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round((user.collectionAmount || 0) / getUsersByBranch(user.branchId!).length).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getUsersByBranch(user.branchId!).filter(u => u.id !== user.id).map((staffUser) => (
              <div key={staffUser.id} className="flex items-center justify-between p-4 border">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {staffUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium">{staffUser.name}</div>
                    <div className="text-sm text-muted-foreground">{staffUser.role.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-medium">₹{staffUser.collectionAmount?.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Monthly collection</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{Math.round(((staffUser.collectionAmount || 0) / (staffUser.targets?.monthly || 1)) * 100)}%</div>
                    <div className="text-xs text-muted-foreground">Target achieved</div>
                  </div>
                  <Badge variant={(staffUser.collectionAmount || 0) > (staffUser.targets?.monthly || 0) * 0.8 ? "default" : "secondary"}>
                    {(staffUser.collectionAmount || 0) > (staffUser.targets?.monthly || 0) * 0.8 ? "On Track" : "Behind"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}