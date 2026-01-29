import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, Search, ShoppingCart, CreditCard, DollarSign, 
  Clock, Star, Users, Smartphone, Receipt, Plus
} from "lucide-react";

const quickSaleProducts = [
  { id: "QS001", name: "Paracetamol 500mg", price: 25.50, category: "Pain Relief", isFavorite: true },
  { id: "QS002", name: "Ibuprofen 400mg", price: 45.00, category: "Pain Relief", isFavorite: true },
  { id: "QS003", name: "Cough Syrup", price: 120.00, category: "Cold & Flu", isFavorite: true },
  { id: "QS004", name: "Vitamin C 1000mg", price: 180.00, category: "Vitamins", isFavorite: true },
  { id: "QS005", name: "Hand Sanitizer", price: 85.00, category: "Hygiene", isFavorite: true },
  { id: "QS006", name: "Face Mask (10pcs)", price: 150.00, category: "Protection", isFavorite: true },
  { id: "QS007", name: "Thermometer", price: 450.00, category: "Devices", isFavorite: false },
  { id: "QS008", name: "Blood Pressure Monitor", price: 2500.00, category: "Devices", isFavorite: false },
];

const recentCustomers = [
  { phone: "9841234567", name: "Ram Sharma", lastVisit: "2024-01-15" },
  { phone: "9876543210", name: "Sita Thapa", lastVisit: "2024-01-14" },
  { phone: "9812345678", name: "Hari Poudel", lastVisit: "2024-01-13" },
  { phone: "9823456789", name: "Gita Rai", lastVisit: "2024-01-12" },
];

const recentTransactions = [
  { id: "TXN001", items: ["Paracetamol", "Cough Syrup"], total: 145.50, time: "10:30 AM" },
  { id: "TXN002", items: ["Vitamin C"], total: 180.00, time: "11:15 AM" },
  { id: "TXN003", items: ["Hand Sanitizer", "Face Mask"], total: 235.00, time: "12:00 PM" },
];

export default function QuickSale() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const categories = ["all", "Pain Relief", "Cold & Flu", "Vitamins", "Hygiene", "Protection", "Devices"];

  const filteredProducts = quickSaleProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteProducts = quickSaleProducts.filter(product => product.isFavorite);

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const selectCustomer = (customer) => {
    setCustomerPhone(customer.phone);
  };

  const repeatTransaction = (transaction) => {
    // Simulate adding transaction items to cart
    toast({
      title: "Transaction Repeated",
      description: `Added ${transaction.items.join(", ")} to cart`,
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.13; // 13% VAT for Nepal
  const total = subtotal + tax;

  const handleQuickCheckout = () => {
    if (cartItems.length === 0) return;
    
    toast({
      title: "Quick Sale Completed!",
      description: `Transaction of NPR ${total.toFixed(2)} completed successfully`,
    });
    
    setCartItems([]);
    setCustomerPhone("");
    setSearchTerm("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <Zap className="mr-2 text-primary" />
            Quick Sale
          </h2>
          <p className="text-muted-foreground">Fast checkout for walk-in customers</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Clock size={16} className="mr-2" />
            Transaction History
          </Button>
          <Button variant="outline">
            <Receipt size={16} className="mr-2" />
            Print Receipt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Quick Access Products */}
        <div className="xl:col-span-2 space-y-4">
          {/* Favorite Products */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Star className="mr-2 text-warning" />
                Quick Access Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {favoriteProducts.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center space-y-2 hover:bg-primary/5 hover:border-primary"
                    onClick={() => addToCart(product)}
                  >
                    <div className="text-center">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-primary font-bold">NPR {product.price}</p>
                    </div>
                    <Plus size={16} className="text-primary" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Search */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Product Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="p-3 border border-border rounded-lg hover:bg-panel cursor-pointer transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">NPR {product.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Cart */}
        <div className="xl:col-span-2 space-y-4">
          {/* Recent Customers */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Users className="mr-2" />
                Recent Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentCustomers.map((customer) => (
                  <div 
                    key={customer.phone}
                    className="flex justify-between items-center p-2 rounded border border-border hover:bg-panel cursor-pointer"
                    onClick={() => selectCustomer(customer)}
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{customer.lastVisit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Smartphone className="mr-2" />
                Customer Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Enter phone number (optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center justify-between">
                <span className="flex items-center">
                  <ShoppingCart className="mr-2" />
                  Cart ({cartItems.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Add items for quick checkout
                </p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-panel rounded">
                      <div className="flex-1">
                        <p className="font-medium text-panel-foreground text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">NPR {item.price} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-foreground">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-foreground">
                      <span>Subtotal:</span>
                      <span>NPR {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-foreground">
                      <span>VAT (13%):</span>
                      <span>NPR {tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-foreground">
                      <span>Total:</span>
                      <span>NPR {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={paymentMethod === "cash" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <DollarSign size={14} className="mr-1" />
                      Cash
                    </Button>
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaymentMethod("card")}
                    >
                      <CreditCard size={14} className="mr-1" />
                      Card
                    </Button>
                  </div>

                  <Button 
                    className="w-full bg-success hover:bg-success/90 text-success-foreground"
                    onClick={handleQuickCheckout}
                  >
                    Quick Checkout - NPR {total.toFixed(2)}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center">
                <Clock className="mr-2" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex justify-between items-center p-2 rounded border border-border hover:bg-panel cursor-pointer"
                    onClick={() => repeatTransaction(transaction)}
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{transaction.items.join(", ")}</p>
                      <p className="text-xs text-muted-foreground">{transaction.time}</p>
                    </div>
                    <p className="text-sm font-bold text-primary">NPR {transaction.total}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}