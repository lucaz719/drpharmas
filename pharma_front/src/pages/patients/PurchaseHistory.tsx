import { useState } from "react";
import { Search, Calendar, DollarSign, Package, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Purchase {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'credit';
  status: 'completed' | 'partial' | 'refunded';
}

const mockPurchases: Purchase[] = [
  {
    id: "BILL001",
    patientId: "PAT001",
    patientName: "Ram Bahadur Thapa",
    date: "2024-01-15",
    items: [
      { name: "Amlodipine 5mg", quantity: 30, price: 2.50, total: 75.00 },
      { name: "Losartan 50mg", quantity: 30, price: 3.00, total: 90.00 }
    ],
    subtotal: 165.00,
    discount: 8.25,
    tax: 20.38,
    total: 177.13,
    paymentMethod: "cash",
    status: "completed"
  },
  {
    id: "BILL002",
    patientId: "PAT002",
    patientName: "Sita Devi Sharma",
    date: "2024-01-10",
    items: [
      { name: "Metformin 500mg", quantity: 60, price: 1.50, total: 90.00 },
      { name: "Glimepiride 2mg", quantity: 30, price: 4.00, total: 120.00 }
    ],
    subtotal: 210.00,
    discount: 10.50,
    tax: 25.94,
    total: 225.44,
    paymentMethod: "card",
    status: "completed"
  }
];

export default function PurchaseHistory() {
  const [purchases] = useState<Purchase[]>(mockPurchases);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || purchase.paymentMethod === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-blue-100 text-blue-800';
      case 'card': return 'bg-purple-100 text-purple-800';
      case 'credit': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const totalTransactions = filteredPurchases.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Purchase History</h1>
          <p className="text-muted-foreground">Track patient purchase history and transactions</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">NPR {totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Transaction</p>
                <p className="text-2xl font-bold">
                  NPR {totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : '0.00'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Purchase Transactions</CardTitle>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search purchases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPurchases.map((purchase) => (
              <Card key={purchase.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-green-100 text-green-800">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Bill {purchase.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {purchase.patientName} ({purchase.patientId})
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {purchase.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          NPR {purchase.total.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Items Purchased:</h4>
                        <div className="space-y-1">
                          {purchase.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                              <span>{item.name}</span>
                              <span>{item.quantity} × NPR {item.price.toFixed(2)} = NPR {item.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Subtotal:</span>
                          <p className="font-medium">NPR {purchase.subtotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Discount:</span>
                          <p className="font-medium text-green-600">-NPR {purchase.discount.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tax:</span>
                          <p className="font-medium">NPR {purchase.tax.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <p className="font-bold">NPR {purchase.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(purchase.status)}>
                          {purchase.status}
                        </Badge>
                        <Badge className={getPaymentMethodColor(purchase.paymentMethod)}>
                          {purchase.paymentMethod}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View Receipt
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredPurchases.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No purchase history found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}