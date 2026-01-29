import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Package, TrendingUp, Star, 
  Phone, Mail, MapPin, Calendar,
  ArrowUpRight, ArrowDownRight, DollarSign,
  CreditCard, RotateCcw, BarChart3
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Mock data for supplier dashboard
const supplierStats = {
  totalSuppliers: 45,
  customSuppliers: 28,
  pharmacySuppliers: 17,
  totalOrderValue: 2500000
};

const supplierInventoryData = [
  { name: 'MediCorp Nepal', value: 35, color: '#8884d8' },
  { name: 'PharmaCo Ltd', value: 25, color: '#82ca9d' },
  { name: 'HealthPlus Supply', value: 20, color: '#ffc658' },
  { name: 'NutriMed Pharma', value: 12, color: '#ff7300' },
  { name: 'Others', value: 8, color: '#8dd1e1' }
];

const topSuppliers = [
  { id: 1, name: "MediCorp Nepal", rating: 4.8, orders: 45, value: 650000, status: "active" },
  { id: 2, name: "PharmaCo Ltd", rating: 4.6, orders: 38, value: 580000, status: "active" },
  { id: 3, name: "HealthPlus Supply", rating: 4.4, orders: 32, value: 420000, status: "active" },
  { id: 4, name: "NutriMed Pharma", rating: 4.2, orders: 28, value: 380000, status: "active" }
];

const recentActivity = [
  { id: 1, type: "order_placed", supplier: "MediCorp Nepal", amount: 125000, time: "2 hours ago", icon: ArrowUpRight, color: "text-green-600" },
  { id: 2, type: "delivery", supplier: "PharmaCo Ltd", amount: 85000, time: "4 hours ago", icon: Package, color: "text-blue-600" },
  { id: 3, type: "payment", supplier: "HealthPlus Supply", amount: 65000, time: "6 hours ago", icon: DollarSign, color: "text-purple-600" },
  { id: 4, type: "communication", supplier: "NutriMed Pharma", amount: 0, time: "8 hours ago", icon: Mail, color: "text-orange-600" }
];



export default function SuppliersDashboard() {
  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive",
      medium: "secondary", 
      low: "outline"
    };
    return <Badge variant={variants[priority] as any}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      pending: "outline"
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Supplier Management</h1>
          <p className="text-sm text-muted-foreground">Comprehensive supplier relationship management and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" asChild>
            <NavLink to="/suppliers/directory">
              <Users size={14} className="mr-2" />
              Manage Suppliers
            </NavLink>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Suppliers</p>
                <p className="text-lg font-bold">{supplierStats.totalSuppliers}</p>
              </div>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Custom Suppliers</p>
                <p className="text-lg font-bold text-green-600">{supplierStats.customSuppliers}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pharmacy Suppliers</p>
                <p className="text-lg font-bold text-purple-600">{supplierStats.pharmacySuppliers}</p>
              </div>
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Order Value</p>
                <p className="text-lg font-bold">NPR {supplierStats.totalOrderValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <NavLink to="/suppliers/credit-management" className="block">
              <div className="text-center">
                <CreditCard className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <p className="text-xs font-medium">Credit Management</p>
                <p className="text-xs text-muted-foreground">Manage credits</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <NavLink to="/suppliers/purchase-return" className="block">
              <div className="text-center">
                <RotateCcw className="h-5 w-5 mx-auto text-green-600 mb-1" />
                <p className="text-xs font-medium">Purchase Return</p>
                <p className="text-xs text-muted-foreground">Handle returns</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <NavLink to="/suppliers/communications" className="block">
              <div className="text-center">
                <Mail className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                <p className="text-xs font-medium">Communication</p>
                <p className="text-xs text-muted-foreground">Interaction history</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <NavLink to="/suppliers/analytics" className="block">
              <div className="text-center">
                <BarChart3 className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                <p className="text-xs font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">Performance metrics</p>
              </div>
            </NavLink>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Supplier Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center justify-between p-2 bg-card rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                      <div>
                        <p className="text-sm font-medium">{activity.supplier}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.type.replace('_', ' ')}
                          {activity.amount > 0 && ` • NPR ${activity.amount.toLocaleString()}`}
                          • {activity.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{activity.type.replace('_', ' ')}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Inventory Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Package className="mr-2 text-blue-600" size={18} />
              Inventory by Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={supplierInventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {supplierInventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}