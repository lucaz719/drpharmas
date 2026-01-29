import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Calendar, Download, Filter, BarChart3, TrendingUp, Users, Building2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockPerformanceData = [
  { month: "Jan", central: 450000, branchA: 280000, branchB: 190000, express: 150000 },
  { month: "Feb", central: 520000, branchA: 310000, branchB: 220000, express: 180000 },
  { month: "Mar", central: 480000, branchA: 295000, branchB: 205000, express: 165000 },
  { month: "Apr", central: 630000, branchA: 340000, branchB: 250000, express: 200000 },
  { month: "May", central: 590000, branchA: 325000, branchB: 235000, express: 195000 },
  { month: "Jun", central: 680000, branchA: 380000, branchB: 280000, express: 220000 }
];

const mockNetworkMetrics = [
  { name: "Sales Performance", value: 85, target: 90, status: "good" },
  { name: "Inventory Turnover", value: 78, target: 80, status: "warning" },
  { name: "Staff Efficiency", value: 92, target: 85, status: "excellent" },
  { name: "Customer Satisfaction", value: 88, target: 90, status: "good" },
  { name: "Compliance Score", value: 95, target: 95, status: "excellent" },
  { name: "Sync Reliability", value: 82, target: 98, status: "critical" }
];

const mockBranchComparison = [
  { name: "Central Pharmacy", revenue: 680000, efficiency: 92, customers: 1250, growth: 15.2 },
  { name: "Branch Pharmacy A", revenue: 380000, efficiency: 88, customers: 850, growth: 12.8 },
  { name: "Branch Pharmacy B", revenue: 280000, efficiency: 85, customers: 620, growth: 18.5 },
  { name: "Express Pharmacy", revenue: 220000, efficiency: 78, customers: 480, growth: 22.1 }
];

const mockMarketShare = [
  { name: "Central Pharmacy", value: 42, color: "#8884d8" },
  { name: "Branch A", value: 23, color: "#82ca9d" },
  { name: "Branch B", value: 18, color: "#ffc658" },
  { name: "Express", value: 17, color: "#ff7300" }
];

const mockTopProducts = [
  { product: "Paracetamol 500mg", central: 450, branchA: 320, branchB: 280, express: 190, total: 1240 },
  { product: "Amoxicillin 250mg", central: 380, branchA: 250, branchB: 220, express: 150, total: 1000 },
  { product: "Omeprazole 20mg", central: 320, branchA: 200, branchB: 180, express: 120, total: 820 },
  { product: "Metformin 500mg", central: 280, branchA: 180, branchB: 160, express: 100, total: 720 },
  { product: "Cetirizine 10mg", central: 250, branchA: 150, branchB: 140, express: 90, total: 630 }
];

const reportTypes = ["Performance", "Financial", "Operational", "Compliance", "Custom"];
const timePeriods = ["Last 7 days", "Last 30 days", "Last 3 months", "Last 6 months", "Last year"];

export default function NetworkReports() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("Last 6 months");
  const [selectedReportType, setSelectedReportType] = useState("Performance");
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "warning": return "text-yellow-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      excellent: "bg-green-100 text-green-800 border-green-200",
      good: "bg-blue-100 text-blue-800 border-blue-200", 
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      critical: "bg-red-100 text-red-800 border-red-200"
    };
    return <Badge className={styles[status] || styles.good}>{status}</Badge>;
  };

  const handleExportReport = () => {
    toast({
      title: "Export Started",
      description: "Report is being generated and will be downloaded shortly"
    });
  };

  const totalRevenue = mockBranchComparison.reduce((sum, branch) => sum + branch.revenue, 0);
  const avgEfficiency = (mockBranchComparison.reduce((sum, branch) => sum + Number(branch.efficiency), 0) / mockBranchComparison.length).toFixed(1);
  const totalCustomers = mockBranchComparison.reduce((sum, branch) => sum + branch.customers, 0);
  const avgGrowth = (mockBranchComparison.reduce((sum, branch) => sum + Number(branch.growth), 0) / mockBranchComparison.length).toFixed(1);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Network Reports</h1>
          <p className="text-muted-foreground">Comprehensive analytics across all pharmacy branches</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timePeriods.map(period => (
                <SelectItem key={period} value={period}>{period}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {(totalRevenue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Network-wide monthly revenue</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEfficiency}%</div>
            <p className="text-xs text-muted-foreground">Across all branches</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Active customer base</p>
          </CardContent>
        </Card>
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Growth</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{avgGrowth}%</div>
            <p className="text-xs text-muted-foreground">Month-over-month growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="comparison">Branch Comparison</TabsTrigger>
              <TabsTrigger value="products">Product Analysis</TabsTrigger>
              <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue across all branches</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`Rs. ${(Number(value)/1000).toFixed(0)}K`, ""]} />
                      <Legend />
                      <Line type="monotone" dataKey="central" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="branchA" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="branchB" stroke="#ffc658" strokeWidth={2} />
                      <Line type="monotone" dataKey="express" stroke="#ff7300" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Share Distribution</CardTitle>
                  <CardDescription>Revenue contribution by branch</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockMarketShare}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockMarketShare.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance Comparison</CardTitle>
                <CardDescription>Revenue performance across branches over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`Rs. ${(Number(value)/1000).toFixed(0)}K`, ""]} />
                    <Legend />
                    <Bar dataKey="central" stackId="a" fill="#8884d8" name="Central Pharmacy" />
                    <Bar dataKey="branchA" stackId="a" fill="#82ca9d" name="Branch A" />
                    <Bar dataKey="branchB" stackId="a" fill="#ffc658" name="Branch B" />
                    <Bar dataKey="express" stackId="a" fill="#ff7300" name="Express" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead>Efficiency Score</TableHead>
                    <TableHead>Active Customers</TableHead>
                    <TableHead>Growth Rate</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBranchComparison.map((branch, index) => (
                    <TableRow key={index} className="animate-fade-in">
                      <TableCell>
                        <div className="font-medium">{branch.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">Rs. {(branch.revenue / 100000).toFixed(1)}L</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">{branch.efficiency}%</div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${branch.efficiency}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{branch.customers}</TableCell>
                      <TableCell>
                        <div className="text-green-600 font-medium">+{branch.growth}%</div>
                      </TableCell>
                      <TableCell>
                        {branch.efficiency >= 90 ? getStatusBadge("excellent") :
                         branch.efficiency >= 85 ? getStatusBadge("good") :
                         branch.efficiency >= 80 ? getStatusBadge("warning") :
                         getStatusBadge("critical")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Product sales across all branches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Central</TableHead>
                        <TableHead>Branch A</TableHead>
                        <TableHead>Branch B</TableHead>
                        <TableHead>Express</TableHead>
                        <TableHead>Total Sales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTopProducts.map((product, index) => (
                        <TableRow key={index} className="animate-fade-in">
                          <TableCell className="font-medium">{product.product}</TableCell>
                          <TableCell>{product.central}</TableCell>
                          <TableCell>{product.branchA}</TableCell>
                          <TableCell>{product.branchB}</TableCell>
                          <TableCell>{product.express}</TableCell>
                          <TableCell className="font-bold">{product.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockNetworkMetrics.map((metric, index) => (
                <Card key={index} className="hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    {metric.status === "critical" && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                          {metric.value}%
                        </div>
                        {getStatusBadge(metric.status)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Current</span>
                          <span>Target: {metric.target}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              metric.status === "excellent" ? "bg-green-500" :
                              metric.status === "good" ? "bg-blue-500" :
                              metric.status === "warning" ? "bg-yellow-500" :
                              "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(metric.value, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
}