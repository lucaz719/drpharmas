import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Plus, Filter, Download, ShoppingCart, 
  Truck, Clock, CheckCircle, AlertCircle, Calendar, Eye 
} from "lucide-react";

const ordersData = [
  {
    id: "ORD-001",
    supplier: "MedSupply Co",
    orderDate: "2024-01-10",
    deliveryDate: "2024-01-12",
    items: 15,
    total: 1245.50,
    status: "Delivered",
    priority: "Normal"
  },
  {
    id: "ORD-002",
    supplier: "PharmaDist",
    orderDate: "2024-01-11",
    deliveryDate: "2024-01-13",
    items: 8,
    total: 890.25,
    status: "In Transit",
    priority: "High"
  },
  {
    id: "ORD-003",
    supplier: "HealthWare",
    orderDate: "2024-01-11",
    deliveryDate: "2024-01-14",
    items: 22,
    total: 2150.75,
    status: "Processing",
    priority: "Normal"
  },
  {
    id: "ORD-004",
    supplier: "MedTech",
    orderDate: "2024-01-12",
    deliveryDate: "2024-01-15",
    items: 5,
    total: 450.00,
    status: "Pending",
    priority: "Low"
  },
  {
    id: "ORD-005",
    supplier: "DiabetesCare",
    orderDate: "2024-01-12",
    deliveryDate: "2024-01-16",
    items: 12,
    total: 1680.00,
    status: "Confirmed",
    priority: "High"
  }
];

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = ordersData.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Delivered": { variant: "default", icon: CheckCircle, color: "text-success" },
      "In Transit": { variant: "secondary", icon: Truck, color: "text-warning" },
      "Processing": { variant: "outline", icon: Clock, color: "text-primary" },
      "Pending": { variant: "destructive", icon: AlertCircle, color: "text-destructive" },
      "Confirmed": { variant: "default", icon: CheckCircle, color: "text-primary" }
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;
    
    return (
      <Badge variant={config?.variant || "outline"} className="flex items-center gap-1">
        <Icon size={12} />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      "High": "bg-destructive text-destructive-foreground",
      "Normal": "bg-secondary text-secondary-foreground", 
      "Low": "bg-muted text-muted-foreground"
    } as const;

    return (
      <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.Normal}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Order Management</h2>
          <p className="text-muted-foreground">Track and manage your supplier orders</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus size={16} className="mr-2" />
          New Order
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search orders or suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter size={16} className="mr-2" />
                Filters
              </Button>
              <Button variant="outline">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { status: "Delivered", count: 1, color: "text-success" },
          { status: "In Transit", count: 1, color: "text-warning" },
          { status: "Processing", count: 1, color: "text-primary" },
          { status: "Confirmed", count: 1, color: "text-primary" },
          { status: "Pending", count: 1, color: "text-destructive" }
        ].map((item) => (
          <Card key={item.status} className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                <p className="text-sm text-muted-foreground">{item.status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <ShoppingCart className="mr-2 text-primary" size={20} />
            Recent Orders ({filteredOrders.length} orders)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Order Date</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Delivery Date</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-panel transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-primary">{order.id}</p>
                    </td>
                    <td className="py-3 px-4 text-foreground">{order.supplier}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-muted-foreground" />
                        <span className="text-foreground">{order.orderDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Truck size={14} className="mr-1 text-muted-foreground" />
                        <span className="text-foreground">{order.deliveryDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground">{order.items} items</td>
                    <td className="py-3 px-4 font-medium text-foreground">${order.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {getPriorityBadge(order.priority)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye size={14} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders This Month</p>
                <p className="text-2xl font-bold text-foreground">{ordersData.length}</p>
              </div>
              <ShoppingCart className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Order Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${ordersData.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                </p>
              </div>
              <ShoppingCart className="text-success" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Order Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${(ordersData.reduce((sum, order) => sum + order.total, 0) / ordersData.length).toFixed(2)}
                </p>
              </div>
              <ShoppingCart className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}