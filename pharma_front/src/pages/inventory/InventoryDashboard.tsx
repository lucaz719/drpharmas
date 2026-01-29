import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, AlertTriangle, TrendingUp, TrendingDown, 
  ShoppingCart, Truck, Calendar, DollarSign,
  ArrowUpRight, ArrowDownRight, Plus, FileText
} from "lucide-react";
import { NavLink } from "react-router-dom";

// Mock data for dashboard overview
const inventoryStats = {
  totalProducts: 1247,
  totalValue: 850000,
  lowStockItems: 23,
  criticalExpiry: 8,
  pendingOrders: 12,
  inTransit: 5,
  monthlyMovement: {
    inbound: 45000,
    outbound: 38000,
    variance: 7000
  }
};

const recentActivity = [
  { id: 1, type: "stock_in", product: "Paracetamol 500mg", quantity: 200, time: "2 hours ago", icon: ArrowUpRight, color: "text-green-600" },
  { id: 2, type: "stock_out", product: "Amoxicillin 250mg", quantity: 50, time: "4 hours ago", icon: ArrowDownRight, color: "text-red-600" },
  { id: 3, type: "order", product: "Insulin Pen", quantity: 100, time: "6 hours ago", icon: ShoppingCart, color: "text-blue-600" },
  { id: 4, type: "transfer", product: "Cetirizine 10mg", quantity: 75, time: "8 hours ago", icon: Truck, color: "text-orange-600" },
];

const lowStockAlerts = [
  { id: "MED001", name: "Aspirin 100mg", currentStock: 12, minStock: 50, severity: "critical" },
  { id: "MED002", name: "Cough Syrup", currentStock: 8, minStock: 25, severity: "critical" },
  { id: "MED003", name: "Band-Aid Strips", currentStock: 18, minStock: 30, severity: "warning" },
  { id: "MED004", name: "Thermometer", currentStock: 5, minStock: 10, severity: "warning" },
];

const expiryAlerts = [
  { id: "MED005", name: "Vitamin C 1000mg", batch: "BTH001", daysLeft: 5, severity: "critical" },
  { id: "MED006", name: "Eye Drops", batch: "BTH002", daysLeft: 12, severity: "warning" },
  { id: "MED007", name: "Antibiotic Cream", batch: "BTH003", daysLeft: 25, severity: "caution" },
];

export default function InventoryDashboard() {
  const [timeRange, setTimeRange] = useState("30d");

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "destructive",
      warning: "secondary",
      caution: "outline"
    };
    return <Badge variant={variants[severity] as any}>{severity}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
          <p className="text-muted-foreground">Overview of your pharmacy inventory and key metrics</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <NavLink to="/inventory/purchase-orders">
              <Plus size={16} className="mr-2" />
              New Purchase Order
            </NavLink>
          </Button>
          <Button variant="outline" asChild>
            <NavLink to="/reports">
              <FileText size={16} className="mr-2" />
              Generate Report
            </NavLink>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{inventoryStats.totalProducts.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +5.2% from last month
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">NPR {inventoryStats.totalValue.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +2.8% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-red-600">{inventoryStats.lowStockItems}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown size={12} className="mr-1" />
                  Requires attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiry Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{inventoryStats.criticalExpiry}</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Calendar size={12} className="mr-1" />
                  Within 30 days
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <NavLink to="/inventory/stock-management" className="block">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="font-medium">Stock Management</p>
                <p className="text-sm text-muted-foreground">Manage inventory levels</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <NavLink to="/inventory/purchase-orders" className="block">
              <div className="text-center">
                <ShoppingCart className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="font-medium">Purchase Orders</p>
                <p className="text-sm text-muted-foreground">Create and track orders</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <NavLink to="/inventory/stock-transfers" className="block">
              <div className="text-center">
                <Truck className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="font-medium">Stock Transfers</p>
                <p className="text-sm text-muted-foreground">Move stock between locations</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <NavLink to="/inventory/expiry-tracking" className="block">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <p className="font-medium">Expiry Tracking</p>
                <p className="text-sm text-muted-foreground">Monitor expiration dates</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 text-red-600" size={20} />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockAlerts.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {item.currentStock} / Min: {item.minStock}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(item.severity)}
                    <Button size="sm" variant="outline">Reorder</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <NavLink to="/inventory/stock-management">View All Low Stock Items</NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expiry Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 text-orange-600" size={20} />
              Expiry Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiryAlerts.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Batch: {item.batch} • {item.daysLeft} days left
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(item.severity)}
                    <Button size="sm" variant="outline">Manage</Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <NavLink to="/inventory/expiry-tracking">View All Expiring Items</NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Inventory Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${activity.color}`} />
                    <div>
                      <p className="font-medium">{activity.product}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {activity.quantity} • {activity.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{activity.type.replace('_', ' ')}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}