import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, 
  Calendar, Download, FileText, BarChart3,
  Clock, CreditCard, Percent, Package, RefreshCw
} from "lucide-react";

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';



const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function POSReports() {
  const [dateRange, setDateRange] = useState("30days");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [salesSummary, setSalesSummary] = useState(null);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [hourlySalesData, setHourlySalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const { toast } = useToast();

  // Set date range based on selection
  useEffect(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (dateRange) {
      case 'today':
        start = today;
        end = today;
        break;
      case '7days':
        start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      case '30days':
        start = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      case 'all':
        start = new Date('2024-01-01');
        end = today;
        break;
      case 'custom':
        return; // Don't auto-set dates for custom range
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, [dateRange]);

  // Fetch data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchReportsData();
    }
  }, [startDate, endDate]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });

      // Fetch all reports data
      const [summaryRes, dailyRes, hourlyRes, productsRes, paymentsRes, staffRes, customerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/pos/reports/sales-summary/?${params}`, { headers }),
        fetch(`${API_BASE_URL}/pos/reports/daily-trend/?${params}`, { headers }),
        fetch(`${API_BASE_URL}/pos/reports/hourly-pattern/?date=${endDate}`, { headers }),
        fetch(`${API_BASE_URL}/pos/reports/top-products/?${params}&limit=10`, { headers }),
        fetch(`${API_BASE_URL}/pos/reports/payment-methods/?${params}`, { headers }),
        fetch(`${API_BASE_URL}/pos/reports/staff-performance/?${params}`, { headers }),
        fetch(`${API_BASE_URL}/pos/reports/customer-analytics/?${params}`, { headers })
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSalesSummary(data.summary);
      }

      if (dailyRes.ok) {
        const data = await dailyRes.json();
        setDailySalesData(data.daily_sales);
      }

      if (hourlyRes.ok) {
        const data = await hourlyRes.json();
        setHourlySalesData(data.hourly_sales);
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setTopProducts(data.top_products);
      }

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPaymentMethodData(data.payment_methods);
      }

      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaffPerformance(data.staff_performance);
      }

      if (customerRes.ok) {
        const data = await customerRes.json();
        setCustomerAnalytics(data.customer_analytics);
      }

    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: "Error",
        description: "Failed to load reports data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportType) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        type: reportType
      });

      const response = await fetch(`${API_BASE_URL}/pos/reports/export/?${params}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${startDate}_${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Successful",
          description: `${reportType} report exported successfully`
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <BarChart3 className="mr-2 text-primary" />
            POS Reports & Analytics
          </h2>
          <p className="text-muted-foreground">Comprehensive sales analytics and performance metrics</p>
        </div>
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {dateRange === 'custom' && (
            <>
              <div className="flex items-center space-x-2">
                <Label className="text-sm">From:</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label className="text-sm">To:</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </>
          )}
          
          <Button variant="outline" onClick={fetchReportsData} disabled={loading}>
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Select onValueChange={handleExport}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales Report</SelectItem>
              <SelectItem value="products">Products Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-foreground">
                  NPR {salesSummary?.total_sales?.toLocaleString() || '0'}
                </p>
                <p className={`text-xs flex items-center mt-1 ${
                  (salesSummary?.sales_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp size={12} className="mr-1" />
                  {salesSummary?.sales_growth >= 0 ? '+' : ''}{salesSummary?.sales_growth?.toFixed(1) || '0'}% from previous period
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sales Returns</p>
                <p className="text-2xl font-bold text-red-600">
                  NPR {salesSummary?.total_returns?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {salesSummary?.total_return_transactions || 0} return transactions
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Sales</p>
                <p className="text-2xl font-bold text-green-600">
                  NPR {salesSummary?.net_sales?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  After deducting returns
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-foreground">{salesSummary?.total_transactions || 0}</p>
                <p className={`text-xs flex items-center mt-1 ${
                  (salesSummary?.transaction_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp size={12} className="mr-1" />
                  {salesSummary?.transaction_growth >= 0 ? '+' : ''}{salesSummary?.transaction_growth?.toFixed(1) || '0'}% from previous period
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Customers</p>
                <p className="text-2xl font-bold text-foreground">{salesSummary?.unique_customers || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: NPR {salesSummary?.avg_transaction_value?.toFixed(0) || '0'}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Trend */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Daily Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySalesData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))'
                      }} 
                    />
                    <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hourly Sales Pattern */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Hourly Sales Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlySalesData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))'
                      }} 
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Package className="mr-2" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.product_id}>
                      <TableCell className="font-medium">
                        {product.name}
                        {product.strength && <div className="text-xs text-muted-foreground">{product.strength} {product.dosage_form}</div>}
                      </TableCell>
                      <TableCell>{product.quantity_sold}</TableCell>
                      <TableCell>NPR {product.total_revenue?.toLocaleString()}</TableCell>
                      <TableCell>NPR {product.total_profit?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={product.profit_margin > 30 ? "default" : product.profit_margin > 15 ? "secondary" : "outline"}>
                          {product.profit_margin?.toFixed(1)}% margin
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <CreditCard className="mr-2" />
                  Payment Method Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ payment_method, percentage }) => `${payment_method}: ${percentage?.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {(paymentMethodData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Payment Method Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(paymentMethodData || []).map((method, index) => (
                    <div key={method.payment_method} className="flex items-center justify-between p-3 border border-border rounded">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-foreground capitalize">{method.payment_method}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">NPR {method.total_amount?.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{method.percentage?.toFixed(1)}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Users className="mr-2" />
                Cashier Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cashier Name</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Avg Transaction</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(staffPerformance || []).map((staff, index) => (
                    <TableRow key={staff.staff_id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.transaction_count}</TableCell>
                      <TableCell>NPR {staff.total_sales?.toLocaleString()}</TableCell>
                      <TableCell>NPR {staff.avg_transaction_value?.toFixed(0)}</TableCell>
                      <TableCell>
                        <Badge variant={index === 0 ? "default" : index < 2 ? "secondary" : "outline"}>
                          {index === 0 ? "Top Performer" : index < 2 ? "Good" : "Average"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Customer Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border border-border rounded">
                  <span className="text-foreground">New Customers</span>
                  <span className="font-bold text-primary">{customerAnalytics?.new_customers || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 border border-border rounded">
                  <span className="text-foreground">Returning Customers</span>
                  <span className="font-bold text-primary">{customerAnalytics?.returning_customers || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 border border-border rounded">
                  <span className="text-foreground">High Value Customers</span>
                  <span className="font-bold text-primary">{customerAnalytics?.high_value_customers || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 border border-border rounded">
                  <span className="text-foreground">Customer Retention Rate</span>
                  <span className="font-bold text-success">{customerAnalytics?.retention_rate?.toFixed(1) || '0'}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Purchase Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Total Customers</span>
                    <span className="font-bold text-primary">{customerAnalytics?.total_customers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">New Customers</span>
                    <span className="font-bold text-primary">{customerAnalytics?.new_customers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Returning Customers</span>
                    <span className="font-bold text-primary">{customerAnalytics?.returning_customers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">High Value Customers</span>
                    <span className="font-bold text-success">{customerAnalytics?.high_value_customers || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}