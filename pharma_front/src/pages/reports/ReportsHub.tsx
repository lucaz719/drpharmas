import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, Download, Calendar, 
  DollarSign, Package, Users, FileText, 
  PieChart, Activity, Settings, Filter,
  ArrowRight, Clock, Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const reportCategories = [
  {
    title: "Sales Analytics",
    description: "Revenue tracking, sales trends, and performance metrics",
    icon: BarChart3,
    color: "text-primary",
    bgColor: "bg-primary/10",
    count: 12,
    lastUpdated: "2 hours ago",
    path: "/reports/sales"
  },
  {
    title: "Inventory Reports",
    description: "Stock levels, expiry tracking, and movement analysis",
    icon: Package,
    color: "text-warning",
    bgColor: "bg-warning/10",
    count: 8,
    lastUpdated: "1 hour ago",
    path: "/reports/inventory"
  },
  {
    title: "Financial Analysis",
    description: "Profit margins, expenses, cash flow, and financial health",
    icon: DollarSign,
    color: "text-success",
    bgColor: "bg-success/10",
    count: 15,
    lastUpdated: "30 minutes ago",
    path: "/reports/financial"
  },
  {
    title: "Compliance Reports",
    description: "Regulatory compliance, audit trails, and documentation",
    icon: FileText,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    count: 6,
    lastUpdated: "4 hours ago",
    path: "/reports/compliance"
  }
];

const quickStats = [
  { label: "Total Reports Generated", value: "2,847", trend: "+12%", icon: FileText },
  { label: "Scheduled Reports", value: "24", trend: "+3", icon: Clock },
  { label: "Active Dashboards", value: "8", trend: "0", icon: Activity },
  { label: "Custom Reports", value: "156", trend: "+8%", icon: Settings }
];

export default function ReportsHub() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Reports & Analytics Hub</h2>
          <p className="text-muted-foreground">Comprehensive business insights and data analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar size={16} className="mr-2" />
            Schedule Report
          </Button>
          <Button 
            className="bg-primary hover:bg-primary-hover"
            onClick={() => navigate('/reports/custom')}
          >
            <Settings size={16} className="mr-2" />
            Custom Report Builder
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-success flex items-center mt-1">
                    <TrendingUp size={10} className="mr-1" />
                    {stat.trend} this month
                  </p>
                </div>
                <stat.icon className="text-primary" size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportCategories.map((category) => (
          <Card key={category.title} className="bg-card border border-border hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${category.bgColor}`}>
                    <category.icon className={`${category.color}`} size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-card-foreground">{category.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <Badge variant="secondary">{category.count} reports</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">
                    Last updated: {category.lastUpdated}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(category.path)}
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  View Reports
                  <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Clock className="mr-2 text-primary" size={20} />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Monthly Sales Summary", type: "Sales", time: "2 hours ago", status: "completed" },
                { name: "Inventory Audit Report", type: "Inventory", time: "4 hours ago", status: "completed" },
                { name: "Financial Statement Q1", type: "Financial", time: "1 day ago", status: "completed" },
                { name: "Compliance Check", type: "Compliance", time: "2 days ago", status: "scheduled" }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <div>
                    <p className="font-medium text-panel-foreground">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.type} • {report.time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Target className="mr-2 text-success" size={20} />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-success">Revenue Growth</span>
                  <span className="text-sm text-success">+15.2%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Strong performance this quarter with consistent growth across all categories.
                </p>
              </div>
              
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-warning">Inventory Turnover</span>
                  <span className="text-sm text-warning">Attention Needed</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Some slow-moving items detected. Consider promotional strategies.
                </p>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-primary">Customer Satisfaction</span>
                  <span className="text-sm text-primary">4.8/5.0</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Excellent customer feedback and loyalty program engagement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}