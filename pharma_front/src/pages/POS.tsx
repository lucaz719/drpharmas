import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, Plus, Minus, Trash2, ShoppingCart, 
  CreditCard, DollarSign, Receipt, User, Phone, Eye 
} from "lucide-react";

const availableProducts = [
  { id: "MED001", name: "Ibuprofen 400mg", price: 8.99, stock: 150, barcode: "123456789001" },
  { id: "MED002", name: "Amoxicillin 500mg", price: 12.50, stock: 25, barcode: "123456789002" },
  { id: "MED003", name: "Vitamin D3 1000IU", price: 15.99, stock: 89, barcode: "123456789003" },
  { id: "MED004", name: "Insulin Pen", price: 89.99, stock: 45, barcode: "123456789004" },
  { id: "MED005", name: "Blood Pressure Monitor", price: 45.00, stock: 12, barcode: "123456789005" },
  { id: "MED006", name: "Aspirin 325mg", price: 6.99, stock: 200, barcode: "123456789006" },
  { id: "MED007", name: "Cough Syrup", price: 18.50, stock: 67, barcode: "123456789007" },
  { id: "MED008", name: "Band-Aids", price: 4.99, stock: 150, barcode: "123456789008" }
];

export default function POS() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showPreview, setShowPreview] = useState(false);

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

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
      removeFromCart(id);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const showPreviewModal = () => {
    if (cartItems.length === 0) return;
    setShowPreview(true);
  };

  const handleConfirmSale = () => {
    // Complete the transaction
    alert(`Transaction completed! Total: $${total.toFixed(2)}`);
    setCartItems([]);
    setCustomerInfo({ name: "", phone: "" });
    setSearchTerm("");
    setShowPreview(false);
  };

  const handleCancelSale = () => {
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Point of Sale</h2>
          <p className="text-muted-foreground">Process customer transactions and sales</p>
        </div>
        <Button variant="outline">
          <Receipt size={16} className="mr-2" />
          Print Last Receipt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search & Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Product Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search by name or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="p-3 border border-border rounded-lg hover:bg-panel cursor-pointer transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                        <p className="text-sm text-muted-foreground">#{product.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${product.price}</p>
                        <Button size="sm" className="mt-1">
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shopping Cart & Checkout */}
        <div className="space-y-4">
          {/* Customer Info */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <User className="mr-2" size={18} />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input
                  placeholder="Customer name (optional)"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input
                  placeholder="Phone number (optional)"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-card-foreground">
                <span className="flex items-center">
                  <ShoppingCart className="mr-2" size={18} />
                  Cart ({cartItems.length})
                </span>
                {cartItems.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCartItems([])}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Cart is empty. Add products to start a sale.
                </p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-panel rounded">
                      <div className="flex-1">
                        <p className="font-medium text-panel-foreground text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={12} />
                        </Button>
                        <span className="w-8 text-center text-foreground">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={12} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={12} className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          {cartItems.length > 0 && (
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Tax (8%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Payment Method</label>
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
                </div>

                <Button 
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  onClick={showPreviewModal}
                >
                  Complete Sale - ${total.toFixed(2)}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sale Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2" size={18} />
              Sale Preview
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Customer Info */}
            {(customerInfo.name || customerInfo.phone) && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Customer Information</h4>
                {customerInfo.name && <p className="text-sm">Name: {customerInfo.name}</p>}
                {customerInfo.phone && <p className="text-sm">Phone: {customerInfo.phone}</p>}
              </div>
            )}
            
            {/* Items */}
            <div>
              <h4 className="font-medium mb-2">Items ({cartItems.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">${item.price} × {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Summary */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Payment Method:</span>
                  <Badge variant="outline">
                    {paymentMethod === 'cash' ? (
                      <><DollarSign size={12} className="mr-1" />Cash</>
                    ) : (
                      <><CreditCard size={12} className="mr-1" />Card</>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleCancelSale} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirmSale} className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
                Confirm Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}