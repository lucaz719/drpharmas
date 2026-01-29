import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, Download, Calendar, 
  DollarSign, Package, ShoppingCart, Users, 
  AlertTriangle, Star, FileText, Eye 
} from "lucide-react";

const salesData = [
  { month: "Jan", sales: 12450, orders: 145, profit: 3680 },
  { month: "Feb", sales: 13200, orders: 156, profit: 3920 },
  { month: "Mar", sales: 11800, orders: 138, profit: 3540 },
  { month: "Apr", sales: 14500, orders: 167, profit: 4350 },
  { month: "May", sales: 15200, orders: 178, profit: 4560 },
  { month: "Jun", sales: 13900, orders: 162, profit: 4170 }
];

const topProducts = [
  { name: "Ibuprofen 400mg", sales: 2450, units: 340, category: "Pain Relief" },
  { name: "Vitamin D3", sales: 1890, units: 210, category: "Vitamins" },
  { name: "Amoxicillin 500mg", sales: 1650, units: 132, category: "Antibiotics" },
  { name: "Blood Pressure Monitor", sales: 1420, units: 89, category: "Devices" },
  { name: "Insulin Pen", sales: 1280, units: 67, category: "Diabetes" }
];

const supplierPerformance = [
  { name: "MedSupply Co", orders: 45, onTime: 42, rating: 4.8, value: 12450 },
  { name: "PharmaDist", orders: 32, onTime: 30, rating: 4.6, value: 8900 },
  { name: "HealthWare", orders: 28, onTime: 27, rating: 4.9, value: 7650 },
  { name: "MedTech", orders: 15, onTime: 13, rating: 4.3, value: 4200 },
  { name: "DiabetesCare", orders: 22, onTime: 21, rating: 4.7, value: 6800 }
];

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>
          <p className="text-muted-foreground">Business insights and performance analytics</p>
        </div>
        <div className="flex gap-2">
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
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-foreground">$15,200</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp size={10} className="mr-1" />
                  +8.5% from last month
                </p>
              </div>
              <DollarSign className="text-success" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">178</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp size={10} className="mr-1" />
                  +12% from last month
                </p>
              </div>
              <ShoppingCart className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Products Sold</p>
                <p className="text-2xl font-bold text-foreground">2,847</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp size={10} className="mr-1" />
                  +15% from last month
                </p>
              </div>
              <Package className="text-warning" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold text-foreground">28.5%</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp size={10} className="mr-1" />
                  +2.1% from last month
                </p>
              </div>
              <BarChart3 className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <BarChart3 className="mr-2 text-primary" size={20} />
              6-Month Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.map((month) => (
                <div key={month.month} className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium text-panel-foreground">{month.month}</div>
                    <div className="flex-1">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(month.sales / 16000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-panel-foreground">${month.sales.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{month.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Package className="mr-2 text-warning" size={20} />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-panel-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-panel-foreground">${product.sales}</p>
                    <p className="text-sm text-muted-foreground">{product.units} units</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Performance */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Users className="mr-2 text-success" size={20} />
            Supplier Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Total Orders</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">On-Time Delivery</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Total Value</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Performance</th>
                </tr>
              </thead>
              <tbody>
                {supplierPerformance.map((supplier) => {
                  const onTimePercentage = Math.round((supplier.onTime / supplier.orders) * 100);
                  const performanceColor = onTimePercentage >= 95 ? "text-success" : 
                                          onTimePercentage >= 85 ? "text-warning" : "text-destructive";
                  
                  return (
                    <tr key={supplier.name} className="border-b border-border hover:bg-panel transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{supplier.name}</td>
                      <td className="py-3 px-4 text-foreground">{supplier.orders}</td>
                      <td className="py-3 px-4">
                        <span className="text-foreground">{supplier.onTime}/{supplier.orders}</span>
                        <span className={`ml-2 text-sm ${performanceColor}`}>({onTimePercentage}%)</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-warning text-warning mr-1" />
                          <span className="text-foreground">{supplier.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">${supplier.value.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={onTimePercentage >= 95 ? "default" : 
                                  onTimePercentage >= 85 ? "secondary" : "destructive"}
                        >
                          {onTimePercentage >= 95 ? "Excellent" : 
                           onTimePercentage >= 85 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="mr-2 text-primary" size={20} />
                <h3 className="font-medium text-card-foreground">Inventory Report</h3>
              </div>
              <Button variant="ghost" size="sm">
                <Eye size={14} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Complete inventory analysis with stock levels, expiry dates, and reorder recommendations.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Download size={14} className="mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BarChart3 className="mr-2 text-success" size={20} />
                <h3 className="font-medium text-card-foreground">Financial Report</h3>
              </div>
              <Button variant="ghost" size="sm">
                <Eye size={14} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Monthly financial summary including revenue, expenses, profit margins, and cash flow.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Download size={14} className="mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 text-warning" size={20} />
                <h3 className="font-medium text-card-foreground">Compliance Report</h3>
              </div>
              <Button variant="ghost" size="sm">
                <Eye size={14} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Regulatory compliance status, expiry tracking, and audit trail documentation.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Download size={14} className="mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}