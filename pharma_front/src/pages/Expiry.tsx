import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, AlertTriangle, Calendar, Package, 
  Trash2, RotateCcw, Download, Bell
} from "lucide-react";

const expiryData = [
  {
    id: "MED001",
    name: "Aspirin 325mg",
    batch: "BTH001",
    supplier: "MedSupply Co",
    category: "Pain Relief",
    currentStock: 25,
    originalStock: 100,
    expiryDate: "2024-01-15",
    daysToExpiry: 2,
    cost: 4.50,
    sellPrice: 6.99,
    location: "Aisle A, Shelf 3",
    severity: "Critical"
  },
  {
    id: "MED002",
    name: "Cough Syrup",
    batch: "BTH002", 
    supplier: "PharmaDist",
    category: "Cold & Flu",
    currentStock: 12,
    originalStock: 24,
    expiryDate: "2024-01-20",
    daysToExpiry: 7,
    cost: 8.25,
    sellPrice: 18.50,
    location: "Aisle B, Shelf 1",
    severity: "High"
  },
  {
    id: "MED003",
    name: "Insulin Pens",
    batch: "BTH003",
    supplier: "DiabetesCare",
    category: "Diabetes",
    currentStock: 8,
    originalStock: 20,
    expiryDate: "2024-01-25",
    daysToExpiry: 12,
    cost: 45.00,
    sellPrice: 89.99,
    location: "Refrigerated Section",
    severity: "High"
  },
  {
    id: "MED004",
    name: "Antibiotic Cream",
    batch: "BTH004",
    supplier: "HealthWare",
    category: "Topical",
    currentStock: 15,
    originalStock: 30,
    expiryDate: "2024-02-15",
    daysToExpiry: 33,
    cost: 3.75,
    sellPrice: 12.99,
    location: "Aisle C, Shelf 2",
    severity: "Medium"
  },
  {
    id: "MED005",
    name: "Vitamin C Tablets",
    batch: "BTH005",
    supplier: "HealthWare",
    category: "Vitamins",
    currentStock: 45,
    originalStock: 100,
    expiryDate: "2024-03-10",
    daysToExpiry: 57,
    cost: 6.50,
    sellPrice: 15.99,
    location: "Aisle D, Shelf 1",
    severity: "Low"
  },
  {
    id: "MED006",
    name: "Eye Drops",
    batch: "BTH006",
    supplier: "MedTech",
    category: "Eye Care",
    currentStock: 22,
    originalStock: 36,
    expiryDate: "2024-04-05",
    daysToExpiry: 83,
    cost: 5.25,
    sellPrice: 14.50,
    location: "Aisle A, Shelf 1",
    severity: "Low"
  }
];

export default function Expiry() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);

  const filteredExpiry = expiryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSeverity === "all" || item.severity.toLowerCase() === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  const getSeverityBadge = (severity) => {
    const variants = {
      "Critical": "destructive",
      "High": "secondary", 
      "Medium": "outline",
      "Low": "default"
    };
    return <Badge variant={variants[severity]}>{severity}</Badge>;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      "Critical": "text-destructive",
      "High": "text-warning",
      "Medium": "text-secondary",
      "Low": "text-success"
    };
    return colors[severity];
  };

  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) {
      alert("Please select items first");
      return;
    }
    alert(`${action} applied to ${selectedItems.length} items`);
    setSelectedItems([]);
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredExpiry.length 
        ? [] 
        : filteredExpiry.map(item => item.id)
    );
  };

  const criticalCount = expiryData.filter(item => item.severity === "Critical").length;
  const highCount = expiryData.filter(item => item.severity === "High").length;
  const totalValue = expiryData.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Expiry Management</h2>
          <p className="text-muted-foreground">Monitor and manage medication expiry dates</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Bell size={16} className="mr-2" />
            Set Alerts
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical (≤7 days)</p>
                <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
              </div>
              <AlertTriangle className="text-destructive" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk (≤30 days)</p>
                <p className="text-2xl font-bold text-warning">{highCount}</p>
              </div>
              <Calendar className="text-warning" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground">{expiryData.length}</p>
              </div>
              <Package className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk Value</p>
                <p className="text-2xl font-bold text-destructive">${totalValue.toFixed(2)}</p>
              </div>
              <Trash2 className="text-destructive" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-card border border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search by product name, batch, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              {selectedItems.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction("Mark as Disposed")}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Dispose ({selectedItems.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction("Return to Supplier")}
                  >
                    <RotateCcw size={14} className="mr-1" />
                    Return ({selectedItems.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiry Table */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-card-foreground">
              <AlertTriangle className="mr-2 text-warning" size={20} />
              Expiry Tracking ({filteredExpiry.length} items)
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={selectAll}
            >
              {selectedItems.length === filteredExpiry.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Select</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Batch/Location</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Expiry Date</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Days Left</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Value at Risk</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Severity</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpiry.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-panel transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <p className="text-xs text-muted-foreground">{item.supplier}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.batch}</p>
                        <p className="text-xs text-muted-foreground">{item.location}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{item.currentStock}</p>
                        <p className="text-xs text-muted-foreground">of {item.originalStock}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-muted-foreground" />
                        <span className="text-foreground">{item.expiryDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getSeverityColor(item.severity)}`}>
                        {item.daysToExpiry} days
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">
                          ${(item.currentStock * item.cost).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cost: ${item.cost} each
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getSeverityBadge(item.severity)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" title="Return to Supplier">
                          <RotateCcw size={14} className="text-warning" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Mark as Disposed">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">Quick Disposal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Mark expired items for safe disposal following regulations.
            </p>
            <Button className="w-full" variant="outline">
              <Trash2 size={14} className="mr-2" />
              Start Disposal Process
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">Supplier Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Process returns to suppliers for items within return window.
            </p>
            <Button className="w-full" variant="outline">
              <RotateCcw size={14} className="mr-2" />
              Initiate Returns
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">Discount Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Create discount campaigns for items nearing expiry.
            </p>
            <Button className="w-full" variant="outline">
              <Package size={14} className="mr-2" />
              Create Sale Campaign
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}