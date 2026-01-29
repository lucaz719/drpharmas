import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Plus, RotateCcw, AlertTriangle,
  Calendar, DollarSign, Package, FileText, Eye, Check, X
} from "lucide-react";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';

export default function Returns() {
  const location = useLocation();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [returnsData, setReturnsData] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [newReturn, setNewReturn] = useState({
    items: [],
    reason: "",
    notes: "",
    refundAmount: 0
  });
  const [showNewReturnForm, setShowNewReturnForm] = useState(false);
  const [processingReturn, setProcessingReturn] = useState(false);

  // Check if we have sale data from navigation
  useEffect(() => {
    const saleData = location.state;
    if (saleData) {
      setSelectedSale(saleData);
      setShowNewReturnForm(true);
      // Fetch sale details to get items
      fetchSaleDetails(saleData.saleId);
    }
  }, [location.state]);

  // Fetch returns data
  useEffect(() => {
    fetchReturns();
    fetchRecentSales();
  }, []);

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pos/returns/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReturnsData(data);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentSales = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/pos/sales/?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentSales(data.slice(0, 4)); // Show only 4 recent sales
      }
    } catch (error) {
      console.error('Error fetching recent sales:', error);
    }
  };

  const fetchSaleDetails = async (saleId) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');

      // Fetch sale details
       const saleResponse = await fetch(`${API_BASE_URL}/pos/sales/${saleId}/`, {
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });

       console.log('Fetching sale details for ID:', saleId);

      if (saleResponse.ok) {
        const saleData = await saleResponse.json();
        console.log('Sale data:', saleData);
        console.log('Sale items:', saleData.items);
        setSelectedSale({
          id: saleData.id,
          sale_number: saleData.sale_number || saleData.id,
          patient_name: saleData.patientName || saleData.patient_name,
          total_amount: saleData.total || saleData.total_amount,
          items: saleData.items || []
        });

        // Fetch returns for this sale to calculate available quantities
        const returnsResponse = await fetch(`${API_BASE_URL}/pos/returns/?sale_id=${saleId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        let returnData = [];
        if (returnsResponse.ok) {
          const responseData = await returnsResponse.json();
          returnData = Array.isArray(responseData) ? responseData : [responseData];
          console.log('Return data for sale:', returnData);
        }

        // Calculate available quantities for each item
         const returnItems = saleData.items.map(item => {
           console.log('Processing item:', item);

           // Find all returns for this specific item
           const itemReturns = returnData.filter(ret => {
             const hasItem = ret.return_items && ret.return_items.some(returnItem =>
               returnItem.product_name === item.name &&
               returnItem.batch_number === item.batch_number &&
               ret.status === 'completed'
             );
             console.log(`Return ${ret.return_number || ret.id} has item ${item.name}?`, hasItem);
             return hasItem;
           });

           console.log(`Item returns for ${item.name}:`, itemReturns);

           // Calculate total returned quantity for this item
           const totalReturned = itemReturns.reduce((sum, ret) => {
             const returnItem = ret.return_items.find(ri =>
               ri.product_name === item.name && ri.batch_number === item.batch_number
             );
             const acceptedQty = returnItem ? returnItem.quantity_accepted || 0 : 0;
             console.log(`Return ${ret.return_number || ret.id} accepted quantity for ${item.name}:`, acceptedQty);
             return sum + acceptedQty;
           }, 0);

           console.log(`Total returned for ${item.name}:`, totalReturned);
           const availableQuantity = Math.max(0, item.quantity - totalReturned);
           console.log(`Available quantity for ${item.name}:`, availableQuantity);

           return {
             id: item.id || `${item.name}_${item.batch_number}`,
             product_id: item.product?.id || item.name, // Use product ID if available
             product_name: item.name,
             batch_number: item.batch_number || item.batch,
             unit_price: item.unit_price || item.price,
             quantity: availableQuantity, // Available quantity after previous returns
             original_quantity: item.quantity, // Keep original for reference
             returnQuantity: 0,
             reason: ""
           };
         }).filter(item => item.quantity > 0); // Only show items that can still be returned

        console.log('Final return items:', returnItems);

        setNewReturn({
          items: returnItems,
          reason: "",
          notes: "",
          refundAmount: 0
        });
      }
    } catch (error) {
      console.error('Error fetching sale details:', error);
    }
  };

  const filteredReturns = returnsData.filter(returnItem =>
    returnItem.return_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.original_sale?.sale_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const variants = {
      "pending": "secondary",
      "approved": "outline",
      "completed": "default",
      "rejected": "destructive"
    };
    const labels = {
      "pending": "Pending",
      "approved": "Approved",
      "completed": "Completed",
      "rejected": "Rejected"
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  // Remove the old handleProcessReturn function

  const startNewReturn = (sale) => {
     setSelectedSale(sale);
     // Fetch sale details to get items
     fetchSaleDetails(sale.sale_number || sale.id);
     setShowNewReturnForm(true);
   };

  const handleProcessReturn = async (returnId, action) => {
    try {
      setProcessingReturn(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');

      const endpoint = action === 'approve'
        ? `${API_BASE_URL}/pos/returns/${returnId}/approve/`
        : action === 'process'
        ? `${API_BASE_URL}/pos/returns/${returnId}/process/`
        : `${API_BASE_URL}/pos/returns/${returnId}/reject/`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: action === 'reject' ? JSON.stringify({ reason: 'Rejected by user' }) : undefined
      });

      if (response.ok) {
        toast({
          title: `Return ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          description: `Return has been ${action}ed successfully`,
        });
        fetchReturns(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || `Failed to ${action} return`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing return:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} return`,
        variant: "destructive",
      });
    } finally {
      setProcessingReturn(false);
    }
  };

  const handleCreateReturn = async () => {
    try {
      setProcessingReturn(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');

      // Filter items that have return quantity > 0
      const returnItems = newReturn.items.filter(item => item.returnQuantity > 0);

      if (returnItems.length === 0) {
        toast({
          title: "No Items Selected",
          description: "Please select at least one item to return",
          variant: "destructive",
        });
        return;
      }

      const returnData = {
        sale_id: selectedSale.sale_number,
        items: returnItems.map(item => ({
          product_id: item.product_id || item.name,
          batch_number: item.batch_number,
          quantity: item.returnQuantity,
          reason: item.reason || newReturn.reason
        })),
        refund_amount: newReturn.refundAmount,
        notes: newReturn.notes
      };

      const response = await fetch(`${API_BASE_URL}/pos/returns/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(returnData)
      });

      if (response.ok) {
        toast({
          title: "Return Created",
          description: "Return request has been created successfully",
        });
        setShowNewReturnForm(false);
        setSelectedSale(null);
        fetchReturns(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to create return",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating return:', error);
      toast({
        title: "Error",
        description: "Failed to create return",
        variant: "destructive",
      });
    } finally {
      setProcessingReturn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Returns Management</h2>
          <p className="text-muted-foreground">Process customer returns and refunds</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-hover"
          onClick={() => setShowNewReturnForm(true)}
        >
          <Plus size={16} className="mr-2" />
          New Return
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold text-foreground">{returnsData.length}</p>
              </div>
              <RotateCcw className="text-primary" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">
                  {returnsData.filter(r => r.status === "pending").length}
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
                <p className="text-sm text-muted-foreground">Refund Amount</p>
                <p className="text-2xl font-bold text-destructive">
                  NPR {returnsData.filter(r => r.status === "completed").reduce((sum, r) => sum + (r.refund_amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-destructive" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">
                  {returnsData.filter(r => r.status === "completed").length}
                </p>
              </div>
              <Package className="text-success" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Returns List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-card-foreground">Return Requests</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search returns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReturns.map((returnItem) => (
                   <div key={returnItem.id} className="p-4 border border-border rounded-lg">
                     <div className="flex justify-between items-start mb-3">
                       <div>
                         <h4 className="font-medium text-foreground">{returnItem.return_number}</h4>
                         <p className="text-sm text-muted-foreground">
                           Original Sale: {returnItem.original_sale?.sale_number}
                         </p>
                         <p className="text-sm text-muted-foreground">
                           Customer: {returnItem.patient_name}
                         </p>
                       </div>
                       <div className="text-right">
                         {getStatusBadge(returnItem.status)}
                         <p className="text-sm text-muted-foreground mt-1">
                           <Calendar size={12} className="inline mr-1" />
                           {returnItem.created_at ? new Date(returnItem.created_at).toLocaleDateString() : 'Invalid Date'}
                         </p>
                       </div>
                     </div>

                     <div className="space-y-2 mb-3">
                       {returnItem.return_items?.map((item, index) => (
                         <div key={index} className="flex justify-between items-center text-sm p-2 bg-panel rounded">
                           <span className="text-panel-foreground">{item.quantity}x {item.product_name}</span>
                           <div className="text-right">
                             <span className="font-medium text-panel-foreground">NPR {(item.quantity * item.unit_price).toFixed(2)}</span>
                             <p className="text-xs text-muted-foreground">{item.reason}</p>
                           </div>
                         </div>
                       ))}
                     </div>

                     <div className="flex justify-between items-center pt-2 border-t border-border">
                       <div>
                         <p className="text-sm text-foreground">
                           <span className="font-medium">Refund Amount: NPR {returnItem.refund_amount?.toFixed(2)}</span>
                         </p>
                         <p className="text-xs text-muted-foreground">
                           Created by: {returnItem.created_by_name || 'Unknown'}
                         </p>
                       </div>
                       {returnItem.status === "pending" && (
                         <div className="space-x-2">
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleProcessReturn(returnItem.id, "approve")}
                             disabled={processingReturn}
                           >
                             <Check size={14} className="mr-1" />
                             Approve
                           </Button>
                           <Button
                             size="sm"
                             variant="destructive"
                             onClick={() => handleProcessReturn(returnItem.id, "reject")}
                             disabled={processingReturn}
                           >
                             <X size={14} className="mr-1" />
                             Reject
                           </Button>
                         </div>
                       )}
                       {returnItem.status === "approved" && (
                         <Button
                           size="sm"
                           className="bg-green-600 hover:bg-green-700"
                           onClick={() => handleProcessReturn(returnItem.id, "process")}
                           disabled={processingReturn}
                         >
                           <Package size={14} className="mr-1" />
                           Process Return
                         </Button>
                       )}
                     </div>

                     {returnItem.notes && (
                       <div className="mt-3 p-2 bg-panel rounded text-sm">
                         <p className="text-panel-foreground">{returnItem.notes}</p>
                       </div>
                     )}
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Return / Recent Sales */}
          <div className="space-y-4">
            {showNewReturnForm ? (
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    {selectedSale ? `Return for ${selectedSale.sale_number}` : "New Return"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSale && (
                    <div className="p-3 bg-panel rounded">
                      <p className="font-medium text-panel-foreground">Sale: {selectedSale.sale_number}</p>
                      <p className="text-sm text-muted-foreground">Customer: {selectedSale.patient_name}</p>
                      <p className="text-sm text-muted-foreground">Total: NPR {selectedSale.total_amount?.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Items: {selectedSale.items?.length || 0}</p>
                    </div>
                  )}
  
                  {/* Return Items Selection */}
                  {selectedSale && newReturn.items.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Select Items to Return</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {newReturn.items.map((item, index) => (
                          <div key={item.id} className="p-3 border border-border rounded">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-sm">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Batch: {item.batch_number} | Price: NPR {item.unit_price}
                                </p>
                                {item.original_quantity !== item.quantity && (
                                  <p className="text-xs text-orange-600">
                                    Originally: {item.original_quantity} | Remaining: {item.quantity}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">Available to return: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                {/* Available quantity moved above */}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <label className="text-xs">Return Qty:</label>
                              <Input
                                type="number"
                                min="0"
                                max={item.quantity}
                                value={item.returnQuantity || 0}
                                onChange={(e) => {
                                  const qty = Math.min(parseInt(e.target.value) || 0, item.quantity);
                                  const updatedItems = [...newReturn.items];
                                  updatedItems[index] = { ...item, returnQuantity: qty };
                                  setNewReturn({ ...newReturn, items: updatedItems });
                                }}
                                className="w-20 h-7 text-xs"
                              />
                              <Input
                                placeholder="Reason"
                                value={item.reason || ""}
                                onChange={(e) => {
                                  const updatedItems = [...newReturn.items];
                                  updatedItems[index] = { ...item, reason: e.target.value };
                                  setNewReturn({ ...newReturn, items: updatedItems });
                                }}
                                className="flex-1 h-7 text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
  
                  <div>
                    <label className="text-sm font-medium text-foreground">General Notes</label>
                    <Textarea
                      placeholder="Additional notes about the return"
                      value={newReturn.notes}
                      onChange={(e) => setNewReturn({...newReturn, notes: e.target.value})}
                    />
                  </div>
  
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      onClick={handleCreateReturn}
                      disabled={processingReturn || !newReturn.items.some(item => item.returnQuantity > 0)}
                    >
                      {processingReturn ? "Creating..." : "Create Return Request"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewReturnForm(false);
                        setSelectedSale(null);
                        setNewReturn({ items: [], reason: "", notes: "", refundAmount: 0 });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <FileText className="mr-2" size={18} />
                  Recent Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="p-3 border border-border rounded hover:bg-panel transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-foreground">{sale.sale_number}</p>
                          <p className="text-sm text-muted-foreground">{sale.patient_name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(sale.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">NPR {sale.total_amount?.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{sale.items?.length || 0} items</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-1"
                            onClick={() => startNewReturn(sale)}
                          >
                            Return
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}