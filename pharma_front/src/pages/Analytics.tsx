import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  Package, ShoppingCart, Calendar, Download 
} from "lucide-react";

const salesData = {
  daily: [
    { date: "2024-01-01", sales: 1450, customers: 32, items: 89 },
    { date: "2024-01-02", sales: 1680, customers: 28, items: 95 },
    { date: "2024-01-03", sales: 1220, customers: 25, items: 67 },
    { date: "2024-01-04", sales: 1890, customers: 41, items: 112 },
    { date: "2024-01-05", sales: 2100, customers: 38, items: 124 },
    { date: "2024-01-06", sales: 1750, customers: 35, items: 98 },
    { date: "2024-01-07", sales: 1980, customers: 42, items: 108 }
  ],
  topProducts: [
    { name: "Ibuprofen 400mg", sales: 145, revenue: 1305.55, trend: "up" },
    { name: "Vitamin D3", sales: 89, revenue: 1423.11, trend: "up" },
    { name: "Blood Pressure Monitor", sales: 23, revenue: 1035.00, trend: "down" },
    { name: "Amoxicillin 500mg", sales: 67, revenue: 837.50, trend: "up" },
    { name: "Insulin Pen", sales: 34, revenue: 3059.66, trend: "up" }
  ],
  customerSegments: [
    { segment: "Regular", count: 456, percentage: 65, revenue: 45780 },
    { segment: "VIP", count: 89, percentage: 13, revenue: 28950 },
    { segment: "Senior", count: 123, percentage: 17, revenue: 18640 },
    { segment: "New", count: 34, percentage: 5, revenue: 5430 }
  ]
};

export default function Analytics() {
  const totalSales = salesData.daily.reduce((sum, day) => sum + day.sales, 0);
  const avgDailySales = totalSales / salesData.daily.length;
  const totalCustomers = salesData.daily.reduce((sum, day) => sum + day.customers, 0);
  const totalItems = salesData.daily.reduce((sum, day) => sum + day.items, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics & Insights</h2>
          <p className="text-muted-foreground">Detailed performance analytics and business insights</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar size={16} className="mr-2" />
            Date Range
          </Button>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Sales (7 days)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalSales.toLocaleString()}</div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Average Daily Sales
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${avgDailySales.toFixed(0)}</div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" />
              +8% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalCustomers}</div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" />
              +15% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Items Sold
            </CardTitle>
            <Package className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalItems}</div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" />
              +9% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Package className="mr-2 text-primary" size={20} />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-panel rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-panel-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-panel-foreground">${product.revenue.toFixed(2)}</p>
                    <div className="flex items-center">
                      {product.trend === "up" ? (
                        <TrendingUp size={14} className="text-success mr-1" />
                      ) : (
                        <TrendingDown size={14} className="text-destructive mr-1" />
                      )}
                      <span className={`text-xs ${product.trend === "up" ? "text-success" : "text-destructive"}`}>
                        {product.trend === "up" ? "↗" : "↘"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Users className="mr-2 text-secondary" size={20} />
              Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.customerSegments.map((segment, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant={segment.segment === "VIP" ? "secondary" : "outline"}>
                        {segment.segment}
                      </Badge>
                      <span className="text-sm text-foreground">{segment.count} customers</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">${segment.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${segment.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{segment.percentage}% of total customers</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Chart */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <TrendingUp className="mr-2 text-success" size={20} />
            Daily Sales Trend (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesData.daily.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">{new Date(day.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">{day.customers} customers | {day.items} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">${day.sales.toLocaleString()}</p>
                  <div className="w-24 bg-border rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(day.sales / Math.max(...salesData.daily.map(d => d.sales))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Morning (9-12)</span>
                <span className="text-sm font-medium text-foreground">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Afternoon (12-17)</span>
                <span className="text-sm font-medium text-foreground">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Evening (17-20)</span>
                <span className="text-sm font-medium text-foreground">20%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cash</span>
                <span className="text-sm font-medium text-foreground">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Card</span>
                <span className="text-sm font-medium text-foreground">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Insurance</span>
                <span className="text-sm font-medium text-foreground">20%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">Inventory Turnover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fast Moving</span>
                <span className="text-sm font-medium text-success">67%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Normal</span>
                <span className="text-sm font-medium text-warning">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Slow Moving</span>
                <span className="text-sm font-medium text-destructive">8%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}