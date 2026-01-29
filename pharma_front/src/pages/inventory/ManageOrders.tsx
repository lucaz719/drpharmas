import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Eye, CheckCircle, XCircle, Clock, 
  Package, ShoppingCart, AlertCircle, Truck, FileText,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';

interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    strength: string;
    dosage_form: string;
    generic_name: string;
    brand_name: string;
  };
  quantity_requested: number;
  quantity_confirmed: number;
  unit_price: number;
  total_price: number;
  is_available: boolean;
  supplier_notes: string;
  buyer_notes: string;
}

interface Order {
  id: number;
  order_number: string;
  buyer_organization_name: string;
  buyer_branch_name: string;
  order_date: string;
  expected_delivery_date: string;
  status: string;
  total_amount: number;
  total_items: number;
  buyer_notes: string;
  supplier_notes: string;
  items: OrderItem[];
}

export default function ManageOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [supplierNotes, setSupplierNotes] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [inventoryPrices, setInventoryPrices] = useState<Record<string, number>>({});
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
  const [shippingData, setShippingData] = useState({ method: '', tracking: '', notes: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Fetch orders
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/supplier/orders/?page=${page}&page_size=${itemsPerPage}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.results || data || []);
        setFilteredOrders(data.results || data || []);
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
        setCurrentPage(page);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to load orders",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_branch_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { variant: "secondary", icon: Clock, label: "New Order" },
      supplier_reviewing: { variant: "outline", icon: Eye, label: "Reviewing" },
      supplier_confirmed: { variant: "default", icon: CheckCircle, label: "Quote Sent" },
      supplier_rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
      buyer_confirmed: { variant: "default", icon: CheckCircle, label: "Buyer Accepted" },
      buyer_reconfirming: { variant: "outline", icon: Clock, label: "Buyer Reconfirming" },
      payment_pending: { variant: "destructive", icon: AlertCircle, label: "Payment Pending" },
      payment_partial: { variant: "outline", icon: AlertCircle, label: "Partial Payment" },
      payment_completed: { variant: "default", icon: CheckCircle, label: "Payment Complete" },
      ready_to_ship: { variant: "default", icon: Package, label: "Ready to Ship" },
      shipped: { variant: "outline", icon: Truck, label: "Shipped" },
      delivered: { variant: "default", icon: Package, label: "Delivered" },
      completed: { variant: "default", icon: CheckCircle, label: "Completed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  // Fetch supplier's inventory prices for the products
  const fetchInventoryPrices = async (productsData: any[]) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/supplier/inventory-prices/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ products: productsData })
      });

      if (response.ok) {
        const prices = await response.json();
        setInventoryPrices(prices);
        setPricesLoaded(true);
        return prices;
      }
    } catch (error) {
      console.error('Error fetching inventory prices:', error);
    }
    setPricesLoaded(true);
    return {};
  };

  // Auto-populate unit prices when dialog opens
  useEffect(() => {
    if (isUpdateDialogOpen && selectedOrder && orderItems.length > 0 && !pricesLoaded) {
      // Send product details for matching
      const productsData = orderItems.map(item => ({
        order_item_id: item.id,
        name: item.product?.name || '',
        strength: item.product?.strength || '',
        dosage_form: item.product?.dosage_form || '',
        batch_number: item.batch_number || ''
      }));
      fetchInventoryPrices(productsData);
    }
  }, [isUpdateDialogOpen, selectedOrder, orderItems, pricesLoaded]);

  // Update unit prices when inventory prices are loaded
  useEffect(() => {
    if (pricesLoaded && Object.keys(inventoryPrices).length > 0 && orderItems.length > 0) {
      setOrderItems(prev => 
        prev.map(item => {
          const inventoryPrice = inventoryPrices[item.id];
          
          return {
            ...item,
            unit_price: inventoryPrice || item.unit_price || 0
          };
        })
      );
    }
  }, [inventoryPrices, pricesLoaded]);

  const handleUpdateOrder = async (order: Order) => {
    setSelectedOrder(order);
    setSupplierNotes(order.supplier_notes || "");
    setPricesLoaded(false); // Reset prices loaded state
    setInventoryPrices({}); // Clear previous prices
    
    // Set the items
    setOrderItems(order.items.map(item => ({ ...item })));
    setIsUpdateDialogOpen(true);
  };

  const updateOrderItem = (itemId: number, field: string, value: any) => {
    setOrderItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/inventory/supplier/orders/${selectedOrder.id}/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          action: 'confirm',
          supplier_notes: supplierNotes,
          items: orderItems.map(item => ({
            id: item.id,
            quantity_confirmed: item.quantity_confirmed,
            unit_price: item.unit_price,
            is_available: item.is_available,
            supplier_notes: item.supplier_notes
          }))
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order confirmed successfully",
        });
        setIsUpdateDialogOpen(false);
        fetchOrders(currentPage);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to confirm order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      toast({
        title: "Error",
        description: "Failed to confirm order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/inventory/supplier/orders/${selectedOrder.id}/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          action: 'reject',
          supplier_notes: supplierNotes
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order rejected successfully",
        });
        setIsUpdateDialogOpen(false);
        fetchOrders(currentPage);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to reject order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "Error",
        description: "Failed to reject order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canUpdateOrder = (status: string) => {
    console.log('Checking canUpdateOrder for status:', status);
    return status === 'submitted' || status === 'supplier_reviewing';
  };

  const canShipOrder = (status: string) => {
    return status === 'ready_to_ship' || status === 'payment_completed' || status === 'buyer_confirmed' || status === 'payment_partial';
  };

  const canMarkDelivered = (status: string) => {
    return status === 'shipped';
  };

  const canReleaseStock = (status: string) => {
    return status === 'delivered';
  };

  const handleShipOrder = (order: Order) => {
    setSelectedOrder(order);
    setShippingData({ method: '', tracking: '', notes: '' });
    setIsShipDialogOpen(true);
  };

  const handleMarkDelivered = async (order: Order) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      await fetch(`${API_BASE_URL}/inventory/bulk-orders/${order.id}/status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          action: 'mark_delivered',
          notes: 'Order delivered by supplier'
        }),
      });

      toast({
        title: "Success",
        description: "Order marked as delivered",
      });
      
      fetchOrders(currentPage);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmShipping = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      await fetch(`${API_BASE_URL}/inventory/purchase-orders/${selectedOrder.id}/ship/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          shipping_method: shippingData.method,
          tracking_number: shippingData.tracking,
          shipping_notes: shippingData.notes
        }),
      });

      toast({
        title: "Success",
        description: "Order shipped successfully",
      });
      
      setIsShipDialogOpen(false);
      fetchOrders(currentPage);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ship order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseStock = async (order: Order) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/inventory/purchase-orders/${order.id}/release-stock/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Stock released and transferred to buyer",
        });
        fetchOrders(currentPage);
      } else {
        const errorData = await response.json();
        if (errorData.insufficient_items) {
          toast({
            title: "Insufficient Stock",
            description: `Please add inventory for: ${errorData.insufficient_items.map((item: any) => item.product_name).join(', ')}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorData.error || "Failed to release stock",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to release stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => 
    order.status === 'submitted' || order.status === 'supplier_reviewing'
  ).length;
  const confirmedOrders = orders.filter(order => 
    ['supplier_confirmed', 'buyer_confirmed', 'ready_to_ship'].includes(order.status)
  ).length;
  const shippedOrders = orders.filter(order => 
    ['shipped', 'delivered'].includes(order.status)
  ).length;
  const totalValue = orders.reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Orders</h1>
          <p className="text-muted-foreground">Review and manage orders from pharmacy buyers</p>
        </div>
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
                <p className="text-xs text-muted-foreground">Pending</p>
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
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold">{shippedOrders}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{totalValue > 0 ? Math.round(totalValue).toLocaleString() : '0'}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, buyer organization..."
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
                <SelectItem value="submitted">New Orders</SelectItem>
                <SelectItem value="supplier_confirmed">Quote Sent</SelectItem>
                <SelectItem value="buyer_confirmed">Buyer Accepted</SelectItem>
                <SelectItem value="payment_completed">Payment Complete</SelectItem>
                <SelectItem value="ready_to_ship">Ready to Ship</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Orders ({totalCount})</CardTitle>
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
                  <TableHead>Order Number</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.buyer_organization_name}</TableCell>
                      <TableCell>{order.buyer_branch_name}</TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(order.expected_delivery_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.total_items}</TableCell>
                      <TableCell className="font-medium text-sm">{order.total_amount > 0 ? Math.round(order.total_amount).toLocaleString() : '0'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewOrder(order)}
                            className="h-7 px-2 text-xs"
                          >
                            <Eye size={10} className="mr-1" />
                            View
                          </Button>
                          {(canUpdateOrder(order.status) || order.status === 'Pending') && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrder(order)}
                              className="h-7 px-2 text-xs"
                            >
                              <FileText size={10} className="mr-1" />
                              {order.status === 'submitted' || order.status === 'Pending' ? 'Quote' : 'Update'}
                            </Button>
                          )}
                          {canShipOrder(order.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShipOrder(order)}
                              className="h-7 px-2 text-xs"
                            >
                              <Truck size={10} className="mr-1" />
                              Ship
                            </Button>
                          )}
                          {canMarkDelivered(order.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkDelivered(order)}
                              className="h-7 px-2 text-xs"
                            >
                              <Package size={10} className="mr-1" />
                              Delivered
                            </Button>
                          )}
                          {canReleaseStock(order.status) && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleReleaseStock(order)}
                              className="h-7 px-2 text-xs"
                            >
                              <CheckCircle size={10} className="mr-1" />
                              Release
                            </Button>
                          )}
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
                  onClick={() => fetchOrders(currentPage - 1)}
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
                        onClick={() => fetchOrders(page)}
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
                  onClick={() => fetchOrders(currentPage + 1)}
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

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              View complete order information and items
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Buyer Organization</Label>
                  <p className="font-medium">{selectedOrder.buyer_organization_name}</p>
                </div>
                <div>
                  <Label>Branch</Label>
                  <p className="font-medium">{selectedOrder.buyer_branch_name}</p>
                </div>
                <div>
                  <Label>Order Date</Label>
                  <p>{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Expected Delivery</Label>
                  <p>{new Date(selectedOrder.expected_delivery_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <p className="font-bold text-lg">{selectedOrder.total_amount > 0 ? Math.round(selectedOrder.total_amount).toLocaleString() : '0'}</p>
                </div>
              </div>

              <div>
                <Label>Buyer Notes</Label>
                <p className="text-sm bg-gray-50 p-2 rounded">{selectedOrder.buyer_notes || 'No notes'}</p>
              </div>

              <div>
                <Label>Order Items ({selectedOrder.items.length})</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Confirmed</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.product?.name || 'Product not found'}</div>
                            <div className="text-sm text-gray-500">
                              {item.product?.strength} - {item.product?.dosage_form}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity_requested}</TableCell>
                        <TableCell>{item.quantity_confirmed || '-'}</TableCell>
                        <TableCell className="text-sm">{item.unit_price ? Math.round(item.unit_price).toLocaleString() : '-'}</TableCell>
                        <TableCell className="text-sm">{item.total_price ? Math.round(item.total_price).toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_available ? "default" : "destructive"}>
                            {item.is_available ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Order Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Order - {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Confirm quantities, set prices, and update order status
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-medium mb-2">Order Information</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Buyer: {selectedOrder.buyer_organization_name}</div>
                  <div>Branch: {selectedOrder.buyer_branch_name}</div>
                  <div>Expected: {new Date(selectedOrder.expected_delivery_date).toLocaleDateString()}</div>
                </div>
              </div>

              <div>
                <Label>Order Items</Label>
                <div className="border rounded p-4 max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Confirm Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{item.product?.name || 'Product not found'}</div>
                              <div className="text-xs text-gray-500">
                                {item.product?.strength} - {item.product?.dosage_form}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity_requested}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={item.quantity_requested}
                              value={item.quantity_confirmed}
                              onChange={(e) => updateOrderItem(item.id, 'quantity_confirmed', parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) => updateOrderItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-24"
                              placeholder="Set price"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.is_available ? "true" : "false"}
                              onValueChange={(value) => updateOrderItem(item.id, 'is_available', value === "true")}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.supplier_notes}
                              onChange={(e) => updateOrderItem(item.id, 'supplier_notes', e.target.value)}
                              placeholder="Item notes..."
                              className="w-32"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <Label>Supplier Notes</Label>
                <Textarea
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  placeholder="Add notes about this order..."
                  rows={3}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Total Confirmed Amount:</span>
                  <span className="text-lg font-bold">
                    {Math.round(orderItems.reduce((sum, item) => sum + (item.quantity_confirmed * item.unit_price), 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectOrder} disabled={loading}>
              Reject Order
            </Button>
            <Button onClick={handleConfirmOrder} disabled={loading}>
              Confirm Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ship Order Dialog */}
      <Dialog open={isShipDialogOpen} onOpenChange={setIsShipDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ship Order - {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Update shipping details for this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Shipping Method</Label>
              <Input
                value={shippingData.method}
                onChange={(e) => setShippingData(prev => ({ ...prev, method: e.target.value }))}
                placeholder="e.g., Express Delivery, Standard Post"
              />
            </div>
            <div>
              <Label>Tracking Number</Label>
              <Input
                value={shippingData.tracking}
                onChange={(e) => setShippingData(prev => ({ ...prev, tracking: e.target.value }))}
                placeholder="Enter tracking number"
              />
            </div>
            <div>
              <Label>Shipping Notes</Label>
              <Textarea
                value={shippingData.notes}
                onChange={(e) => setShippingData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional shipping notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShipDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmShipping} disabled={loading || !shippingData.method}>
              Ship Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}