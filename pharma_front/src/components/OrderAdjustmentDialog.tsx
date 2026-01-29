import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit3, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';

interface OrderItem {
  id: number;
  product: {
    name: string;
    strength: string;
  };
  quantity_requested: number;
  quantity_confirmed: number;
  unit_price: number;
  total_price: number;
  is_available: boolean;
}

interface OrderAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: number;
    order_number: string;
    items: OrderItem[];
    total_amount: number;
  } | null;
  onOrderUpdated: () => void;
}

export default function OrderAdjustmentDialog({ 
  open, 
  onOpenChange, 
  order, 
  onOrderUpdated 
}: OrderAdjustmentDialogProps) {
  const [adjustedItems, setAdjustedItems] = useState<any[]>([]);
  const [buyerNotes, setBuyerNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const { toast } = useToast();

  // Initialize adjusted items when dialog opens
  React.useEffect(() => {
    if (order && open) {
      console.log('Order data:', order);
      console.log('Order items:', order.items);
      const items = order.items.map(item => ({
        id: item.id,
        quantity: item.quantity_confirmed,
        delete: false,
        notes: "",
        original: item
      }));
      console.log('Adjusted items:', items);
      setAdjustedItems(items);
      setBuyerNotes("");
      setPaymentAmount(0);
      setPaymentNotes("");
    }
  }, [order, open]);

  const updateItem = (itemId: number, field: string, value: any) => {
    setAdjustedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateNewTotal = () => {
    return adjustedItems.reduce((total, item) => {
      if (item.delete) return total;
      return total + (item.quantity * item.original.unit_price);
    }, 0);
  };

  const calculateRemainingAmount = () => {
    const newTotal = calculateNewTotal();
    return Math.max(0, newTotal - paymentAmount);
  };

  const handleSaveAdjustments = async () => {
    try {
      setLoading(true);
      
      const payload = {
        items: adjustedItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          delete: item.delete,
          notes: item.notes
        })),
        buyer_notes: buyerNotes,
        payment: paymentAmount > 0 ? {
          amount: paymentAmount,
          payment_method: paymentMethod,
          notes: paymentNotes,
          payment_type: 'installment'
        } : {}
      };

      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/purchase-orders/${order?.id}/adjust/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to adjust order');
      }

      toast({
        title: "Order Adjusted",
        description: "Order items have been successfully adjusted.",
      });

      onOrderUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adjusting order:', error);
      toast({
        title: "Error",
        description: "Failed to adjust order items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const newTotal = calculateNewTotal();
  const savings = order.total_amount - newTotal;
  const remainingAmount = calculateRemainingAmount();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Reconfirm Order - {order.order_number}</DialogTitle>
          <DialogDescription className="text-sm">
            Adjust quantities, remove items, and make payment for this order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Order Summary */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-muted rounded text-sm">
            <div>
              <Label className="text-xs font-medium">Original Total</Label>
              <p className="text-base font-bold">NPR {order.total_amount.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-xs font-medium">Adjusted Total</Label>
              <p className="text-base font-bold text-blue-600">NPR {newTotal.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-xs font-medium">Savings</Label>
              <p className={`text-base font-bold ${savings > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                NPR {savings.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-3 p-3 border rounded-lg">
            <Label className="text-sm font-semibold">Payment Information</Label>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="paymentAmount" className="text-xs">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="0"
                  max={newTotal}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod" className="text-xs">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Remaining Due</Label>
                <div className="p-2 bg-gray-100 rounded text-right font-bold text-sm">
                  NPR {remainingAmount.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="paymentNotes" className="text-xs">Payment Notes</Label>
              <Textarea
                id="paymentNotes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Payment reference, transaction ID, etc..."
                rows={2}
                className="text-sm"
              />
            </div>
            
            {paymentAmount > 0 && (
              <div className="p-3 bg-blue-50 rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Payment: NPR {paymentAmount.toLocaleString()}</div>
                  <div>Remaining: NPR {remainingAmount.toLocaleString()}</div>
                  <div>Method: {paymentMethod.replace('_', ' ').toUpperCase()}</div>
                  <div>Status: {remainingAmount <= 0 ? 'PAID IN FULL' : 'PARTIAL PAYMENT'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div>
            <Label className="text-sm font-semibold">Order Items ({adjustedItems.length})</Label>
            <div className="border rounded mt-1">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Confirmed</TableHead>
                    <TableHead>Adjusted Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustedItems.map((item) => (
                    <TableRow key={item.id} className={item.delete ? 'opacity-50 bg-red-50' : ''}>
                      <TableCell className="p-2">
                        <div>
                          <p className="font-medium text-xs">{item.original.product.name}</p>
                          <p className="text-xs text-muted-foreground">{item.original.product.strength}</p>
                        </div>
                      </TableCell>
                      <TableCell className="p-2 text-xs">{item.original.quantity_requested}</TableCell>
                      <TableCell className="p-2 text-xs">{item.original.quantity_confirmed}</TableCell>
                      <TableCell className="p-2">
                        {item.delete ? (
                          <span className="text-red-600 font-medium text-xs">REMOVED</span>
                        ) : (
                          <Input
                            type="number"
                            min="0"
                            max={item.original.quantity_confirmed}
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-16 h-7 text-xs"
                          />
                        )}
                      </TableCell>
                      <TableCell className="p-2 text-xs">NPR {item.original.unit_price}</TableCell>
                      <TableCell className="p-2">
                        <span className={`text-xs ${item.delete ? 'line-through text-red-600' : 'font-medium'}`}>
                          NPR {(item.delete ? 0 : item.quantity * item.original.unit_price).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="p-2">
                        {item.delete ? (
                          <Badge variant="destructive" className="text-xs px-1 py-0">Removed</Badge>
                        ) : item.quantity < item.original.quantity_confirmed ? (
                          <Badge variant="outline" className="text-xs px-1 py-0">Reduced</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs px-1 py-0">Unchanged</Badge>
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-1">
                          {item.delete ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItem(item.id, 'delete', false)}
                              className="h-6 px-2 text-xs"
                            >
                              <Save size={10} className="mr-1" />
                              Restore
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateItem(item.id, 'delete', true)}
                              className="h-6 px-2 text-xs"
                            >
                              <Trash2 size={10} className="mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* General Notes */}
          <div>
            <Label htmlFor="buyerNotes" className="text-sm font-semibold">Reconfirmation Notes</Label>
            <Textarea
              id="buyerNotes"
              placeholder="Notes about order adjustments and payment..."
              value={buyerNotes}
              onChange={(e) => setBuyerNotes(e.target.value)}
              className="mt-1 text-sm"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveAdjustments} disabled={loading}>
            {loading ? "Processing..." : paymentAmount > 0 ? "Reconfirm & Pay" : "Reconfirm Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}