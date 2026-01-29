import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Building2, Users, DollarSign, Package, 
  Target, Filter, Calendar, Download, Shield
} from "lucide-react";
import { type User, getUsersByBranch } from "@/data/mockData";

interface BranchSpecificReportsProps {
  user: User;
}

export function BranchSpecificReports({ user }: BranchSpecificReportsProps) {
  const branchUsers = getUsersByBranch(user.branchId!);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branch-Specific Reports</h1>
          <p className="text-muted-foreground">Detailed analytics for {user.branchId} branch operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter Data
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Branch Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Branch Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{user.collectionAmount?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month performance</p>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(((user.collectionAmount || 0) / (user.targets?.monthly || 1)) * 100)}%</div>
            <p className="text-xs text-muted-foreground">Monthly target progress</p>
          </CardContent>
        </Card>

        <Card className="border-warning/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Staff Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchUsers.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Overall branch rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Staff Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Staff Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {branchUsers.filter(u => u.id !== user.id).map((staffUser) => (
              <div key={staffUser.id} className="flex items-center justify-between p-4 border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {staffUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium">{staffUser.name}</div>
                    <div className="text-sm text-muted-foreground">{staffUser.role.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-sm font-medium">₹{staffUser.collectionAmount?.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Monthly Collection</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{Math.round(((staffUser.collectionAmount || 0) / (staffUser.targets?.monthly || 1)) * 100)}%</div>
                    <div className="text-xs text-muted-foreground">Target Achievement</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">₹{((staffUser.targets?.monthly || 0) - (staffUser.collectionAmount || 0)).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Remaining Target</div>
                  </div>
                  <Badge variant={(staffUser.collectionAmount || 0) > (staffUser.targets?.monthly || 0) * 0.8 ? "default" : "secondary"}>
                    {(staffUser.collectionAmount || 0) > (staffUser.targets?.monthly || 0) * 0.8 ? "On Track" : "Needs Support"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department-wise Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { dept: "Pharmacy", staff: 3, collection: 45000, target: 50000 },
              { dept: "Cash Counter", staff: 2, collection: 18000, target: 20000 },
              { dept: "Customer Service", staff: 1, collection: 8000, target: 10000 }
            ].map((dept, i) => (
              <div key={i} className="flex items-center justify-between p-3 border">
                <div>
                  <div className="font-medium">{dept.dept}</div>
                  <div className="text-sm text-muted-foreground">{dept.staff} staff members</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">₹{dept.collection.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{Math.round((dept.collection / dept.target) * 100)}% of target</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { month: "January", revenue: 68000, growth: "+12%" },
              { month: "February", revenue: 71000, growth: "+4.4%" },
              { month: "March", revenue: user.collectionAmount || 75000, growth: "+5.6%" }
            ].map((trend, i) => (
              <div key={i} className="flex items-center justify-between p-3 border">
                <div className="font-medium">{trend.month}</div>
                <div className="text-right">
                  <div className="text-sm font-medium">₹{trend.revenue.toLocaleString()}</div>
                  <div className="text-xs text-success">{trend.growth}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Daily Sales Report</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Package className="w-6 h-6" />
              <span className="text-sm">Inventory Status</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Users className="w-6 h-6" />
              <span className="text-sm">Staff Attendance</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Shield className="w-6 h-6" />
              <span className="text-sm">Compliance Check</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}