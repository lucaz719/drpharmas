import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import AutocompleteInput from "@/components/AutocompleteInput";
import OrderAdjustmentDialog from "@/components/OrderAdjustmentDialog";
import { 
  Search, Plus, Edit, Eye, Trash2, Package, 
  ShoppingCart, Calendar, DollarSign, Truck,
  CheckCircle, Clock, AlertCircle, FileText, XCircle, Settings,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';

// Status display mapping
const getStatusDisplay = (status: string) => {
  const statusMap = {
    'draft': { label: 'Draft', variant: 'secondary' },
    'submitted': { label: 'Submitted', variant: 'outline' },
    'supplier_reviewing': { label: 'Under Review', variant: 'outline' },
    'supplier_confirmed': { label: 'Quote Received', variant: 'default' },
    'buyer_reviewing': { label: 'Reviewing Quote', variant: 'default' },
    'buyer_confirmed': { label: 'Confirmed', variant: 'default' },
    'buyer_reconfirming': { label: 'Reconfirming', variant: 'outline' },
    'payment_pending': { label: 'Payment Pending', variant: 'destructive' },
    'payment_partial': { label: 'Partial Payment', variant: 'outline' },
    'payment_completed': { label: 'Payment Complete', variant: 'default' },
    'ready_to_ship': { label: 'Ready to Ship', variant: 'default' },
    'shipped': { label: 'Shipped', variant: 'outline' },
    'delivered': { label: 'Delivered', variant: 'default' },
    'completed': { label: 'Completed', variant: 'default' },
    'cancelled': { label: 'Cancelled', variant: 'destructive' },
    'supplier_rejected': { label: 'Rejected', variant: 'destructive' }
  };
  return statusMap[status] || { label: status, variant: 'secondary' };
};



export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [supplierInput, setSupplierInput] = useState("");
  const [orderItems, setOrderItems] = useState([{ id: 1, product: null, quantity: "", productInput: "" }]);
  const [products, setProducts] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expectedDate, setExpectedDate] = useState(getDefaultExpectedDate());
  const [notes, setNotes] = useState("");
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [orderToAdjust, setOrderToAdjust] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [orderToImport, setOrderToImport] = useState(null);
  const [importItems, setImportItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Fetch bulk orders
  const fetchBulkOrders = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/bulk-orders/?page=${page}&page_size=${itemsPerPage}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBulkOrders(data.results || data || []);
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
        setCurrentPage(page);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching bulk orders:', error);
      toast({
        title: "Error",
        description: "Failed to load purchase orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkOrders(1);
  }, []);

// Get default date (3 days from today)
function getDefaultExpectedDate() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().split('T')[0];
}

  // Fetch products for purchase order
  const fetchProducts = async (query) => {
    if (!query.trim() || !selectedSupplier) return [];
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/products/purchase-order/?q=${query}&supplier_id=${selectedSupplier}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  // Handle import stock
  const handleImportStock = async (orderId) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      // First get import preview
      const previewResponse = await fetch(`${API_BASE_URL}/inventory/purchase-orders/${orderId}/import-preview/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (previewResponse.ok) {
        const previewData = await previewResponse.json();
        setOrderToImport({ id: orderId, ...previewData });
        setImportItems(previewData.items.map(item => ({
          ...item,
          selling_price: item.suggested_selling_price
        })));
        setImportDialogOpen(true);
      } else {
        throw new Error('Failed to get import preview');
      }
    } catch (error) {
      console.error('Error getting import preview:', error);
      toast({
        title: "Error",
        description: "Failed to get import preview",
        variant: "destructive"
      });
    }
  };

  // Confirm import
  const confirmImport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/inventory/purchase-orders/${orderToImport.id}/import-stock/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          items: importItems.map(item => ({
            order_item_id: item.order_item_id,
            selling_price: item.selling_price
          }))
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Import Successful",
          description: result.message,
        });
        setImportDialogOpen(false);
        fetchBulkOrders(currentPage);
      } else {
        throw new Error('Failed to import stock');
      }
    } catch (error) {
      console.error('Error importing stock:', error);
      toast({
        title: "Error",
        description: "Failed to import stock to inventory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove order item
  const removeOrderItem = (id) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    }
  };

  // Update order item
  const updateOrderItem = (id, field, value) => {
    setOrderItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Add new order item
  const addOrderItem = () => {
    const newId = Math.max(...orderItems.map(item => item.id)) + 1;
    setOrderItems([...orderItems, { id: newId, product: null, quantity: "", productInput: "" }]);
  };

  // Fetch suppliers (users with supplier role)
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/users/?role=supplier_admin&external_only=true`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.results) {
          const supplierUsers = data.results.map(user => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`.trim(),
            contact: user.phone || user.email || 'N/A',
            organization: user.organization_name || 'N/A'
          }));
          setSuppliers(supplierUsers);
        }
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive"
      });
    }
  };

  const filteredOrders = bulkOrders.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier_organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusDisplay = getStatusDisplay(status);
    const iconMap = {
      'submitted': Clock,
      'supplier_reviewing': Eye,
      'supplier_confirmed': CheckCircle,
      'buyer_confirmed': CheckCircle,
      'payment_pending': AlertCircle,
      'shipped': Truck,
      'delivered': Package,
      'completed': CheckCircle,
      'cancelled': XCircle,
      'supplier_rejected': XCircle
    };
    
    const Icon = iconMap[status] || Clock;
    
    return (
      <Badge variant={statusDisplay.variant as any} className="flex items-center gap-1">
        <Icon size={12} />
        {statusDisplay.label}
      </Badge>
    );
  };

  const handleCreateOrder = async () => {
    if (!selectedSupplier) {
      toast({
        title: "Error",
        description: "Please select a supplier",
        variant: "destructive"
      });
      return;
    }

    const validItems = orderItems.filter(item => {
      return item.product && item.product.id && item.quantity > 0;
    });
    
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select products and set quantities",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        supplier_user_id: selectedSupplier,
        expected_delivery_date: expectedDate,
        buyer_notes: notes,
        items: validItems.map(item => ({
          product_id: item.product.id,
          quantity_requested: item.quantity
        }))
      };

      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/bulk-orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      toast({
        title: "Purchase Order Created",
        description: "New purchase order has been submitted to supplier.",
      });
      
      // Reset form
      setSelectedSupplier("");
      setSupplierInput("");
      setOrderItems([{ id: 1, product: null, quantity: "", productInput: "" }]);
      setExpectedDate(getDefaultExpectedDate());
      setNotes("");
      setIsCreateDialogOpen(false);
      
      // Refresh orders
      fetchBulkOrders(currentPage);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create purchase order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, action: string) => {
    try {
      setLoading(true);
      
      let endpoint = `/api/inventory/bulk-orders/${orderId}/status/`;
      let payload = { action };
      
      // Handle different actions
      if (action === 'accept_quote') {
        payload = { 
          action: 'buyer_confirm',
          notes: 'Quote accepted by buyer'
        };
      } else if (action === 'make_payment') {
        // For now, just mark as payment pending - you can add payment dialog later
        payload = {
          action: 'payment_pending',
          notes: 'Payment process initiated'
        };
      }
      
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${endpoint.replace('/api', '')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      
      toast({
        title: "Order Updated",
        description: `Order action completed successfully.`,
      });
      
      fetchBulkOrders(currentPage);
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustOrder = (order) => {
    console.log('Selected order for adjustment:', order);
    // Ensure items have the correct structure
    const adjustedOrder = {
      ...order,
      items: order.items?.map(item => ({
        id: item.id,
        product: {
          name: item.product?.name || item.product_name,
          strength: item.product?.strength || item.product_strength
        },
        quantity_requested: item.quantity_requested,
        quantity_confirmed: item.quantity_confirmed,
        unit_price: item.unit_price,
        total_price: item.total_price,
        is_available: item.is_available
      })) || []
    };
    console.log('Adjusted order structure:', adjustedOrder);
    setOrderToAdjust(adjustedOrder);
    setAdjustmentDialogOpen(true);
  };

  // Get available actions based on current status
  const getStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'supplier_confirmed':
        return [
          { value: 'accept_quote', label: 'Accept Quote & Proceed' },
          { value: 'cancel', label: 'Cancel Order' }
        ];
      case 'buyer_confirmed':
      case 'payment_pending':
      case 'payment_partial':
        return [
          { value: 'make_payment', label: 'Make Payment' },
          { value: 'cancel', label: 'Cancel Order' }
        ];
      case 'shipped':
        return [
          { value: 'mark_delivered', label: 'Mark as Delivered' }
        ];
      case 'delivered':
        return [
          { value: 'complete', label: 'Complete Order' }
        ];
      default:
        return [];
    }
  };

  const totalOrders = bulkOrders.length;
  const pendingOrders = bulkOrders.filter(order => 
    ['submitted', 'supplier_reviewing', 'supplier_confirmed'].includes(order.status)
  ).length;
  const confirmedOrders = bulkOrders.filter(order => 
    ['buyer_confirmed', 'payment_pending', 'payment_partial', 'ready_to_ship'].includes(order.status)
  ).length;
  const totalValue = bulkOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
  const averageOrderValue = totalOrders > 0 ? (totalValue / totalOrders) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage supplier orders and procurement</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Purchase Order</DialogTitle>
              <DialogDescription>
                Create a new purchase order for supplier procurement
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <AutocompleteInput
                    value={supplierInput}
                    onChange={setSupplierInput}
                    onSelect={(supplier) => {
                      setSelectedSupplier(supplier.id);
                      setSupplierInput(supplier.name);
                    }}
                    onSearch={async (query) => {
                      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
                      const response = await fetch(`${API_BASE_URL}/auth/users/?role=supplier_admin&search=${query}&external_only=true`, {
                        headers: {
                          'Content-Type': 'application/json',
                          ...(token && { 'Authorization': `Bearer ${token}` }),
                        },
                      });
                      const data = await response.json();
                      return data.results?.map(user => ({
                        id: user.id,
                        name: `${user.first_name} ${user.last_name}`.trim(),
                        contact: user.phone || user.email,
                        organization: user.organization_name
                      })) || [];
                    }}
                    placeholder="Search suppliers..."
                  />
                </div>
                <div>
                  <Label htmlFor="expectedDate">Expected Delivery</Label>
                  <Input 
                    type="date" 
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Order Items</Label>
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-2 text-sm font-medium mb-3">
                    <span>Product</span>
                    <span>Quantity</span>
                    <span>Actions</span>
                    <span></span>
                  </div>
                  
                  <div className={`space-y-3 ${orderItems.length > 5 ? 'max-h-80 overflow-y-auto' : ''}`}>
                    {orderItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-4 gap-2 items-center">
                        <AutocompleteInput
                          value={item.productInput || ""}
                          onChange={(value) => updateOrderItem(item.id, 'productInput', value)}
                          onSelect={(product) => {
                            updateOrderItem(item.id, 'product', product);
                            updateOrderItem(item.id, 'productInput', product.name);
                          }}
                          onSearch={fetchProducts}
                          placeholder={selectedSupplier ? "Search products..." : "Select supplier first"}
                          disabled={!selectedSupplier}
                          className="w-full"
                        />
                        
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || "")}
                          placeholder="Qty"
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOrderItem(item.id)}
                          disabled={orderItems.length === 1}
                        >
                          <Trash2 size={12} />
                        </Button>
                        
                        <div></div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" size="sm" onClick={addOrderItem} className="mt-3">
                    <Plus size={12} className="mr-1" />
                    Add Item
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  placeholder="Additional notes for this order..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrder} disabled={loading}>
                {loading ? "Creating..." : "Create Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{totalOrders}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-lg font-bold">{pendingOrders}</p>
                <p className="text-xs text-muted-foreground">Awaiting Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold">{confirmedOrders}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold">NPR {totalValue.toFixed(2).replace(/\.00$/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold">NPR {isNaN(averageOrderValue) ? '0' : averageOrderValue.toFixed(2).replace(/\.00$/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                <p className="text-xs text-muted-foreground">Avg Order Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by ID or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="supplier_confirmed">Quote Received</SelectItem>
                <SelectItem value="buyer_confirmed">Confirmed</SelectItem>
                <SelectItem value="payment_pending">Payment Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Purchase Orders ({totalCount})</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No purchase orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.supplier_organization_name}</TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(order.expected_delivery_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="font-medium">NPR {(order.total_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye size={12} className="mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Purchase Order Details - {order.order_number}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Supplier</Label>
                                  <p className="font-medium">{order.supplier_organization_name}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                                </div>
                                <div>
                                  <Label>Order Date</Label>
                                  <p>{new Date(order.order_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <Label>Expected Date</Label>
                                  <p>{new Date(order.expected_delivery_date).toLocaleDateString()}</p>
                                </div>
                              </div>
                              
                              <div>
                                <Label>Order Items ({order.total_items || 0})</Label>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Product</TableHead>
                                      <TableHead>Requested</TableHead>
                                      <TableHead>Confirmed</TableHead>
                                      <TableHead>Unit Price</TableHead>
                                      <TableHead>Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {order.items?.map((item) => (
                                      <TableRow key={item.id}>
                                        <TableCell>{item.product?.name}</TableCell>
                                        <TableCell>{item.quantity_requested}</TableCell>
                                        <TableCell>{item.quantity_confirmed || '-'}</TableCell>
                                        <TableCell>{item.unit_price ? `NPR ${item.unit_price}` : '-'}</TableCell>
                                        <TableCell>{item.total_price ? `NPR ${item.total_price.toLocaleString()}` : '-'}</TableCell>
                                      </TableRow>
                                    )) || (
                                      <TableRow>
                                        <TableCell colSpan={5} className="text-center">No items found</TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                              
                              <div>
                                <Label>Notes</Label>
                                <p className="text-sm">{order.buyer_notes || 'No notes'}</p>
                              </div>
                              
                              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                <span className="font-medium">Total Amount:</span>
                                <span className="text-xl font-bold">NPR {(order.total_amount || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <div className="flex items-center gap-2">
                          {order.status === 'supplier_confirmed' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAdjustOrder(order)}
                            className="h-7 px-2 text-xs"
                          >
                            <Settings size={10} className="mr-1" />
                            Adjust
                          </Button>
                        )}
                        
                        {order.available_actions?.includes('import_stock') && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleImportStock(order.id)}
                            className="h-7 px-2 text-xs"
                          >
                            <Package size={10} className="mr-1" />
                            Import
                          </Button>
                        )}
                        
                        {(() => {
                          const statusOptions = getStatusOptions(order.status);
                          return statusOptions.length > 0 ? (
                            <Select onValueChange={(value) => handleStatusUpdate(order.id, value)}>
                              <SelectTrigger className="w-28 h-7 text-xs">
                                <SelectValue placeholder="Actions" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value} className="text-xs">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : null;
                        })()}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} orders
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchBulkOrders(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, currentPage - 2);
                    if (page > totalPages) return null;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => fetchBulkOrders(page)}
                        disabled={loading}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchBulkOrders(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Order Adjustment Dialog */}
      <OrderAdjustmentDialog
        open={adjustmentDialogOpen}
        onOpenChange={setAdjustmentDialogOpen}
        order={orderToAdjust}
        onOrderUpdated={() => fetchBulkOrders(currentPage)}
      />

      {/* Import Stock Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Stock to Inventory</DialogTitle>
            <DialogDescription>
              Set selling prices for items from order {orderToImport?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier</Label>
                <p className="font-medium">{orderToImport?.supplier_name}</p>
              </div>
              <div>
                <Label>Total Order Cost</Label>
                <p className="font-medium">NPR {orderToImport?.total_order_cost?.toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <Label>Items to Import</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importItems.map((item, index) => (
                    <TableRow key={item.order_item_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.product_strength} {item.product_dosage_form}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>NPR {item.cost_price}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.selling_price}
                          onChange={(e) => {
                            const newItems = [...importItems];
                            newItems[index].selling_price = parseFloat(e.target.value) || 0;
                            setImportItems(newItems);
                          }}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>NPR {item.total_cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmImport} disabled={loading}>
              {loading ? "Importing..." : "Import to Inventory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}