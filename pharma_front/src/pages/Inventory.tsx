import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Plus, Filter, Download, Package, 
  AlertTriangle, Calendar, Edit, Trash2 
} from "lucide-react";

const inventoryData = [
  {
    id: "MED001",
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    stock: 150,
    minStock: 50,
    price: 8.99,
    supplier: "MedSupply Co",
    expiry: "2025-06-15",
    status: "In Stock"
  },
  {
    id: "MED002", 
    name: "Amoxicillin 500mg",
    category: "Antibiotics",
    stock: 25,
    minStock: 30,
    price: 12.50,
    supplier: "PharmaDist",
    expiry: "2024-12-20",
    status: "Low Stock"
  },
  {
    id: "MED003",
    name: "Vitamin D3 1000IU",
    category: "Vitamins",
    stock: 89,
    minStock: 100,
    price: 15.99,
    supplier: "HealthWare",
    expiry: "2025-03-10",
    status: "Low Stock"
  },
  {
    id: "MED004",
    name: "Insulin Pen",
    category: "Diabetes",
    stock: 45,
    minStock: 20,
    price: 89.99,
    supplier: "DiabetesCare",
    expiry: "2024-08-30",
    status: "In Stock"
  },
  {
    id: "MED005",
    name: "Blood Pressure Monitor",
    category: "Medical Devices",
    stock: 12,
    minStock: 10,
    price: 45.00,
    supplier: "MedTech",
    expiry: "N/A",
    status: "In Stock"
  }
];

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredInventory = inventoryData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === "all" || item.category === filterCategory)
  );

  const getStatusBadge = (status: string, stock: number, minStock: number) => {
    if (stock <= minStock) {
      return <Badge variant="destructive">Low Stock</Badge>;
    }
    return <Badge variant="default">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground">Manage your pharmacy stock and product information</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus size={16} className="mr-2" />
          Add Product
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
                  placeholder="Search products..."
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

      {/* Inventory Table */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Package className="mr-2 text-primary" size={20} />
            Product Inventory ({filteredInventory.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Expiry</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-panel transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground">{item.category}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className={`font-medium ${item.stock <= item.minStock ? 'text-destructive' : 'text-foreground'}`}>
                          {item.stock}
                        </span>
                        <span className="text-muted-foreground ml-1">/ {item.minStock}</span>
                        {item.stock <= item.minStock && (
                          <AlertTriangle className="ml-2 text-warning" size={14} />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">${item.price}</td>
                    <td className="py-3 px-4 text-foreground">{item.supplier}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-muted-foreground" />
                        <span className="text-foreground">{item.expiry}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(item.status, item.stock, item.minStock)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 size={14} className="text-destructive" />
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold text-foreground">{inventoryData.length}</p>
              </div>
              <Package className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-destructive">
                  {inventoryData.filter(item => item.stock <= item.minStock).length}
                </p>
              </div>
              <AlertTriangle className="text-warning" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${inventoryData.reduce((sum, item) => sum + (item.stock * item.price), 0).toLocaleString()}
                </p>
              </div>
              <Package className="text-success" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(inventoryData.map(item => item.category)).size}
                </p>
              </div>
              <Package className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}