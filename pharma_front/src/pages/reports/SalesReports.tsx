import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { 
  ArrowLeft, Download, Filter, Calendar,
  TrendingUp, DollarSign, ShoppingCart, Users,
  Target, Clock, Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const salesData = [
  { month: "Jan", revenue: 124500, orders: 456, profit: 36800, customers: 234 },
  { month: "Feb", revenue: 132000, orders: 523, profit: 42100, customers: 267 },
  { month: "Mar", revenue: 118000, orders: 478, profit: 35400, customers: 245 },
  { month: "Apr", revenue: 145000, orders: 567, profit: 47300, customers: 298 },
  { month: "May", revenue: 152000, orders: 634, profit: 51200, customers: 321 },
  { month: "Jun", revenue: 139000, orders: 589, profit: 44700, customers: 289 }
];

const dailySales = [
  { day: "Mon", sales: 18500, orders: 45 },
  { day: "Tue", sales: 22300, orders: 52 },
  { day: "Wed", sales: 25100, orders: 61 },
  { day: "Thu", sales: 21800, orders: 48 },
  { day: "Fri", sales: 28900, orders: 73 },
  { day: "Sat", sales: 31200, orders: 78 },
  { day: "Sun", sales: 15600, orders: 38 }
];

const salesByCategory = [
  { name: "Prescription Drugs", value: 45, color: "#1f77b4" },
  { name: "OTC Medicines", value: 25, color: "#ff7f0e" },
  { name: "Health Products", value: 15, color: "#2ca02c" },
  { name: "Personal Care", value: 10, color: "#d62728" },
  { name: "Equipment", value: 5, color: "#9467bd" }
];

const topProducts = [
  { name: "Ibuprofen 400mg", revenue: 12450, units: 340, growth: "+12%" },
  { name: "Vitamin D3", revenue: 8900, units: 210, growth: "+8%" },
  { name: "Amoxicillin 500mg", revenue: 7650, units: 132, growth: "+15%" },
  { name: "Blood Pressure Monitor", revenue: 6420, units: 89, growth: "+5%" },
  { name: "Insulin Pen", revenue: 5280, units: 67, growth: "+18%" }
];

const salesMetrics = [
  { label: "Total Revenue", value: "$152,000", change: "+15.2%", trend: "up", icon: DollarSign },
  { label: "Total Orders", value: "634", change: "+8.7%", trend: "up", icon: ShoppingCart },
  { label: "Avg Order Value", value: "$239.75", change: "+6.1%", trend: "up", icon: Target },
  { label: "New Customers", value: "89", change: "+22%", trend: "up", icon: Users }
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--warning))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--success))",
  },
};

export default function SalesReports() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/reports')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Reports
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Sales Analytics</h2>
            <p className="text-muted-foreground">Revenue tracking and sales performance insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar size={16} className="mr-2" />
            Date Range
          </Button>
          <Button className="bg-primary hover:bg-primary-hover">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {salesMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-success flex items-center mt-1">
                    <TrendingUp size={10} className="mr-1" />
                    {metric.change} from last month
                  </p>
                </div>
                <metric.icon className="text-primary" size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-panel">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Trend */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByCategory}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Daily Sales Trend */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Weekly Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="sales" stroke="var(--color-revenue)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Revenue vs Profit */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Revenue vs Profit Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" />
                      <Bar dataKey="profit" fill="var(--color-profit)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Top Selling Products */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 bg-panel rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-panel-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-panel-foreground">${product.revenue.toLocaleString()}</p>
                      <Badge variant="secondary" className="text-success">
                        {product.growth}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sales Target Achievement</span>
                    <span className="font-medium text-success">112%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Customer Retention Rate</span>
                    <span className="font-medium text-primary">87%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Deal Size Growth</span>
                    <span className="font-medium text-warning">65%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sales Team Performance */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Sales Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Johnson", sales: 45600, target: 40000, percentage: 114 },
                    { name: "Mike Chen", sales: 38900, target: 35000, percentage: 111 },
                    { name: "Emily Davis", sales: 42300, target: 45000, percentage: 94 },
                    { name: "James Wilson", sales: 33800, target: 30000, percentage: 113 }
                  ].map((member) => (
                    <div key={member.name} className="p-3 bg-panel rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-panel-foreground">{member.name}</span>
                        <Badge variant={member.percentage >= 100 ? "default" : "secondary"}>
                          {member.percentage}%
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>${member.sales.toLocaleString()}</span>
                        <span>Target: ${member.target.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${member.percentage >= 100 ? 'bg-success' : 'bg-warning'}`}
                          style={{ width: `${Math.min(member.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}