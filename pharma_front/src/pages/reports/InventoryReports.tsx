import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowLeft, Download, Filter, Calendar,
  Package, AlertTriangle, TrendingDown, TrendingUp,
  Clock, DollarSign, RefreshCw, AlertCircle, Search, Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';

interface InventoryItem {
  id: number;
  medicine: {
    id: number;
    name: string;
    category?: { name: string };
  };
  current_stock: number;
  min_stock: number;
  max_stock: number;
  cost_price: number;
  selling_price: number;
  batch_number: string;
  expiry_date: string;
  location: string;
  supplier_name: string;
}

interface InventoryMetrics {
  total_stock_value: number;
  total_items: number;
  low_stock_count: number;
  expiring_soon_count: number;
  expired_count: number;
  inventory_turnover: number;
}

const chartConfig = {
  stockValue: {
    label: "Stock Value",
    color: "hsl(var(--primary))",
  },
  turnover: {
    label: "Turnover",
    color: "hsl(var(--success))",
  },
  incoming: {
    label: "Incoming",
    color: "hsl(var(--warning))",
  },
  outgoing: {
    label: "Outgoing",
    color: "hsl(var(--destructive))",
  },
};

export default function InventoryReports() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for real data
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get current user's branch
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userBranchId = currentUser?.branch_id;

  // Load data on component mount and when filters change
  useEffect(() => {
    loadInventoryData();
  }, [dateRange, searchTerm, categoryFilter]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');

      // Build query parameters
      const params = new URLSearchParams({
        days: dateRange,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(userBranchId && { branch_id: userBranchId.toString() })
      });

      // Fetch inventory data - use the working endpoint
      const inventoryResponse = await fetch(`${API_BASE_URL}/inventory/inventory-items/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (inventoryResponse.ok) {
        const inventoryResult = await inventoryResponse.json();
        console.log('Inventory API Response:', inventoryResult);
        const items = inventoryResult.results || inventoryResult || [];
        setInventoryData(items);

        // Calculate metrics from the data
        const calculatedMetrics = {
          total_stock_value: items.reduce((sum: number, item: any) => sum + ((item.current_stock || 0) * (item.cost_price || 0)), 0),
          total_items: items.length,
          low_stock_count: items.filter((item: any) => (item.current_stock || 0) <= (item.min_stock || 10)).length,
          expiring_soon_count: items.filter((item: any) => {
            if (!item.expiry_date) return false;
            const expiryDate = new Date(item.expiry_date);
            const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
          }).length,
          expired_count: items.filter((item: any) => {
            if (!item.expiry_date) return false;
            return new Date(item.expiry_date) <= new Date();
          }).length,
          inventory_turnover: 4.2 // Mock for now
        };
        setMetrics(calculatedMetrics);
      } else {
        console.error('Failed to fetch inventory data');
        setInventoryData([]);
        setMetrics(null);
      }
    } catch (error) {
      console.error('Error loading inventory data:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts and tables
  const processInventoryData = () => {
    if (!inventoryData.length) return {
      stockValueData: [],
      expiryData: [],
      lowStockItems: [],
      topMovingItems: [],
      categoryData: []
    };

    // Group by medicine for stock value analysis
    const medicineGroups = {};
    inventoryData.forEach(item => {
      const medicineId = item.medicine?.id;
      if (!medicineId) return;

      if (!medicineGroups[medicineId]) {
        medicineGroups[medicineId] = {
          medicine: item.medicine,
          totalStock: 0,
          totalValue: 0,
          batches: []
        };
      }

      medicineGroups[medicineId].totalStock += item.current_stock || 0;
      medicineGroups[medicineId].totalValue += (item.current_stock || 0) * (item.cost_price || 0);
      medicineGroups[medicineId].batches.push(item);
    });

    // Stock value trend (mock data for now - would need historical data)
    const stockValueData = [
      { month: "Jan", stockValue: 145000, turnover: 4.2 },
      { month: "Feb", stockValue: 152000, turnover: 3.8 },
      { month: "Mar", stockValue: 138000, turnover: 4.5 },
      { month: "Apr", stockValue: 165000, turnover: 3.9 },
      { month: "May", stockValue: 158000, turnover: 4.1 },
      { month: "Jun", stockValue: 172000, turnover: 4.3 }
    ];

    // Expiry analysis
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringSoon = inventoryData.filter(item =>
      item.expiry_date && new Date(item.expiry_date) <= thirtyDaysFromNow && new Date(item.expiry_date) > now
    );

    const expired = inventoryData.filter(item =>
      item.expiry_date && new Date(item.expiry_date) <= now
    );

    const expiryData = [
      { month: "Current", expiring: expiringSoon.length, expired: expired.length, value: expiringSoon.reduce((sum, item) => sum + ((item.current_stock || 0) * (item.cost_price || 0)), 0) }
    ];

    // Low stock items
    const lowStockItems = Object.values(medicineGroups)
      .filter((group: any) => group.totalStock <= (group.batches[0]?.min_stock || 10))
      .map((group: any) => ({
        name: group.medicine?.name || 'Unknown',
        current: group.totalStock,
        minimum: group.batches[0]?.min_stock || 10,
        status: group.totalStock <= (group.batches[0]?.min_stock || 10) * 0.5 ? 'critical' : 'low',
        category: group.medicine?.category?.name || 'Unknown'
      }))
      .slice(0, 10); // Limit to top 10

    // Top moving items (mock data - would need sales data)
    const topMovingItems = Object.values(medicineGroups)
      .sort((a: any, b: any) => b.totalStock - a.totalStock)
      .slice(0, 5)
      .map((group: any) => ({
        name: group.medicine?.name || 'Unknown',
        movement: group.totalStock,
        trend: "+12%",
        value: group.totalValue
      }));

    // Category distribution
    const categoryStats: any = {};
    inventoryData.forEach(item => {
      const category = item.medicine?.category?.name || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, value: 0 };
      }
      categoryStats[category].count += item.current_stock || 0;
      categoryStats[category].value += (item.current_stock || 0) * (item.cost_price || 0);
    });

    const categoryData = Object.entries(categoryStats).map(([name, data]: [string, any]) => ({
      name,
      value: data.count,
      totalValue: data.value
    }));

    return {
      stockValueData,
      expiryData,
      lowStockItems,
      topMovingItems,
      categoryData
    };
  };

  const processedData = processInventoryData();

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-destructive';
      case 'low': return 'text-warning';
      default: return 'text-success';
    }
  };

  const getStockStatusVariant = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

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
            <h2 className="text-3xl font-bold text-foreground">Inventory Reports</h2>
            <p className="text-muted-foreground">Stock management and movement analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-48"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Array.from(new Set(inventoryData.map(item => item.medicine?.category?.name).filter(Boolean))).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadInventoryData}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button className="bg-primary hover:bg-primary-hover">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          [
            {
              label: "Total Stock Value",
              value: metrics ? `NPR ${(metrics.total_stock_value || 0).toLocaleString()}` : "NPR 0",
              change: "+8.9%",
              trend: "up",
              icon: DollarSign
            },
            {
              label: "Inventory Turnover",
              value: metrics ? `${(metrics.inventory_turnover || 0).toFixed(1)}x` : "0x",
              change: "+0.2",
              trend: "up",
              icon: RefreshCw
            },
            {
              label: "Low Stock Items",
              value: metrics?.low_stock_count || 0,
              change: "-3",
              trend: "down",
              icon: AlertTriangle
            },
            {
              label: "Expiring Soon",
              value: metrics?.expiring_soon_count || 0,
              change: "+5",
              trend: "up",
              icon: Clock
            }
          ].map((metric) => (
            <Card key={metric.label} className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <p className={`text-xs flex items-center mt-1 ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                      {metric.trend === 'up' ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                      {metric.change} from last month
                    </p>
                  </div>
                  <metric.icon className="text-primary" size={24} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-panel">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="movement">Movement</TabsTrigger>
          <TabsTrigger value="expiry">Expiry Tracking</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Value Trend */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Stock Value Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">Loading chart...</div>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processedData.stockValueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="stockValue" stroke="var(--color-stockValue)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Category Distribution Pie Chart */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Stock by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">Loading chart...</div>
                  </div>
                ) : processedData.categoryData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={processedData.categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {processedData.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">No category data available</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Inventory Table */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Current Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-sm text-muted-foreground">Loading inventory...</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min/Max Stock</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No inventory data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventoryData.slice(0, 10).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.medicine?.name || 'Unknown'}</TableCell>
                          <TableCell>{item.medicine?.category?.name || 'Uncategorized'}</TableCell>
                          <TableCell>{item.current_stock || 0}</TableCell>
                          <TableCell>{item.min_stock || 0} / {item.max_stock || 0}</TableCell>
                          <TableCell>NPR {(item.cost_price || 0).toLocaleString()}</TableCell>
                          <TableCell>NPR {(item.selling_price || 0).toLocaleString()}</TableCell>
                          <TableCell>NPR {((item.current_stock || 0) * (item.cost_price || 0)).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={
                              (item.current_stock || 0) <= (item.min_stock || 0) ? 'destructive' :
                              (item.current_stock || 0) <= ((item.min_stock || 0) * 1.5) ? 'secondary' : 'default'
                            }>
                              {(item.current_stock || 0) <= (item.min_stock || 0) ? 'Low Stock' :
                               (item.current_stock || 0) >= (item.max_stock || 0) ? 'Overstock' : 'Normal'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movement" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Stock Movement */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Stock Movement Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">Loading chart...</div>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData.stockValueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="stockValue" fill="var(--color-stockValue)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Top Moving Items */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Fast Moving Items</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-sm text-muted-foreground">Loading items...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {processedData.topMovingItems.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between p-4 bg-panel rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-panel-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.movement} units in stock</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-panel-foreground">NPR {item.value.toLocaleString()}</p>
                          <Badge variant="secondary" className="text-success">
                            {item.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expiry" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Expiry Tracking */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Expiry Tracking Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">Loading chart...</div>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData.expiryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="expiring" fill="hsl(var(--warning))" />
                        <Bar dataKey="expired" fill="hsl(var(--destructive))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Expiry Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="mx-auto text-warning mb-2" size={32} />
                    <p className="text-2xl font-bold text-foreground">28</p>
                    <p className="text-sm text-muted-foreground">Expiring This Month</p>
                    <p className="text-xs text-warning mt-1">Value: $18,200</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertCircle className="mx-auto text-destructive mb-2" size={32} />
                    <p className="text-2xl font-bold text-foreground">9</p>
                    <p className="text-sm text-muted-foreground">Already Expired</p>
                    <p className="text-xs text-destructive mt-1">Loss: $3,400</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingDown className="mx-auto text-success mb-2" size={32} />
                    <p className="text-2xl font-bold text-foreground">2.1%</p>
                    <p className="text-sm text-muted-foreground">Waste Reduction</p>
                    <p className="text-xs text-success mt-1">vs Last Month</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Low Stock Alerts */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <AlertTriangle className="mr-2 text-warning" size={20} />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-sm text-muted-foreground">Loading alerts...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {processedData.lowStockItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No low stock alerts
                    </div>
                  ) : (
                    processedData.lowStockItems.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-4 bg-panel rounded-lg border-l-4 border-destructive">
                        <div className="flex items-center space-x-4">
                          <AlertTriangle className={getStockStatusColor(item.status)} size={20} />
                          <div>
                            <p className="font-medium text-panel-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right space-x-4 flex items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Current: {item.current}</p>
                            <p className="text-sm text-muted-foreground">Minimum: {item.minimum}</p>
                          </div>
                          <Badge variant={getStockStatusVariant(item.status)}>
                            {item.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reorder Recommendations */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Reorder Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Ibuprofen 400mg", supplier: "MedSupply Co", leadTime: "3-5 days", suggestedQty: 500, cost: 1250 },
                  { name: "Insulin Pens", supplier: "DiabetesCare", leadTime: "7-10 days", suggestedQty: 100, cost: 2800 },
                  { name: "Thermometer Digital", supplier: "HealthTech", leadTime: "2-3 days", suggestedQty: 50, cost: 890 }
                ].map((item) => (
                  <div key={item.name} className="p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Supplier: {item.supplier}</p>
                        <p className="text-sm text-muted-foreground">Lead Time: {item.leadTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">Qty: {item.suggestedQty}</p>
                        <p className="text-sm text-muted-foreground">Cost: ${item.cost}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Create PO
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}