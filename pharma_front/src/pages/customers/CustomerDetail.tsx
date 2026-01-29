import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, Building, Phone, Mail, MapPin, Calendar,
  DollarSign, TrendingUp, CreditCard, Receipt, Package, Eye,
  Printer, Download, Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDetail() {
  const { id } = useParams();
  const [customerData, setCustomerData] = useState(null);
  const [ledgerData, setLedgerData] = useState({ transactions: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [overviewPage, setOverviewPage] = useState(1);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'cash', reference: '' });
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        
        // Extract customer info from ID (format: "OrganizationName-BranchName")
        const [organizationName, branchName] = id.split('-');
        
        // Create customer data from ID
        setCustomerData({
          id: id,
          organization_name: organizationName,
          branch_name: branchName,
          customer_type: 'buyer'
        });
        
        // Fetch customer transaction history
        const response = await fetch(`http://localhost:8000/api/inventory/customers/${encodeURIComponent(id)}/transactions/`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });
        
        if (response.ok) {
          const transactionData = await response.json();
          setLedgerData({
            summary: transactionData.summary || {},
            transactions: transactionData.transactions || []
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load customer transaction data",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
        toast({
          title: "Error",
          description: "Failed to load customer data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchCustomerData();
  }, [id]);

  const handleCollectPayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid payment amount", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/inventory/customers/${encodeURIComponent(id)}/collect-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          payment_amount: parseFloat(paymentForm.amount),
          payment_method: paymentForm.method,
          payment_reference: paymentForm.reference
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({ title: "Success", description: `Payment of NPR ${parseFloat(paymentForm.amount).toLocaleString()} collected successfully` });
        setPaymentDialog(false);
        setPaymentForm({ amount: '', method: 'cash', reference: '' });
        
        // Refresh data
        const transactionResponse = await fetch(`http://localhost:8000/api/inventory/customers/${encodeURIComponent(id)}/transactions/`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });
        
        if (transactionResponse.ok) {
          const transactionData = await transactionResponse.json();
          setLedgerData({
            summary: transactionData.summary || {},
            transactions: transactionData.transactions || []
          });
        }
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.error || "Failed to collect payment", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to collect payment", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Paginated data
  const allTransactions = (ledgerData.transactions || []);
  const paginatedTransactions = allTransactions.slice(
    (overviewPage - 1) * itemsPerPage,
    overviewPage * itemsPerPage
  );
  const totalOverviewPages = Math.ceil(allTransactions.length / itemsPerPage);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  if (!customerData) {
    return <div className="text-center text-muted-foreground">Customer not found</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <NavLink to="/customers">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </NavLink>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{customerData.organization_name}</h1>
          <p className="text-sm text-muted-foreground">Customer ID: {id}</p>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold text-blue-600">NPR {ledgerData.summary?.total_orders?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">Total Order Amount</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold text-green-600">NPR {ledgerData.summary?.total_paid?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">Total Payment Received</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-lg font-bold text-orange-600">NPR {ledgerData.summary?.total_credit?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">Outstanding Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{ledgerData.transactions?.filter(t => t.transaction_type === 'order')?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Contact Information Card */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Customer Information</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Building size={12} />
                    <span>Organization: {customerData?.organization_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building size={12} />
                    <span>Branch: {customerData?.branch_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    <span>Customer Type: Buyer Organization</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Transaction Summary</h3>
                <div className="space-y-2 text-xs">
                  <div>Total Transactions: {allTransactions.length}</div>
                  <div>Orders: {ledgerData.transactions?.filter(t => t.transaction_type === 'order')?.length || 0}</div>
                  <div>Payments: {ledgerData.transactions?.filter(t => t.transaction_type === 'payment')?.length || 0}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History Table */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Transaction History & Payment Records</h3>
            <div className="flex gap-2">
              <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="text-xs">
                    <Plus size={12} className="mr-1" />
                    Collect Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Collect Payment from {customerData?.organization_name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                      <div className="font-medium">Outstanding Balance</div>
                      <div className="text-lg font-bold text-orange-600">NPR {ledgerData.summary?.total_credit?.toLocaleString() || '0'}</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="amount">Payment Amount (NPR)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="method">Payment Method</Label>
                        <Select value={paymentForm.method} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, method: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="reference">Reference/Notes (Optional)</Label>
                        <Input
                          id="reference"
                          placeholder="Transaction reference or notes"
                          value={paymentForm.reference}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" onClick={() => setPaymentDialog(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleCollectPayment} disabled={submitting} className="flex-1">
                        {submitting ? 'Processing...' : 'Collect Payment'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" className="text-xs">
                <Printer size={12} className="mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Download size={12} className="mr-1" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs py-2">Date</TableHead>
                  <TableHead className="text-xs py-2">Description</TableHead>
                  <TableHead className="text-xs py-2">Order Amount</TableHead>
                  <TableHead className="text-xs py-2">Payment Received</TableHead>
                  <TableHead className="text-xs py-2">Payment Method</TableHead>
                  <TableHead className="text-xs py-2">Outstanding Balance</TableHead>
                  <TableHead className="text-xs py-2">Status</TableHead>
                  <TableHead className="text-xs py-2">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((item) => (
                  <TableRow key={item.id} className="border-b hover:bg-muted/50">
                    <TableCell className="py-2 text-xs">{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell className="py-2 text-xs">{item.description}</TableCell>
                    <TableCell className="py-2 text-xs font-medium text-blue-600">
                      {(item.order_amount || 0) > 0 ? `NPR ${(item.order_amount || 0).toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="py-2 text-xs font-medium text-green-600">
                      {(item.payment || 0) > 0 ? `NPR ${(item.payment || 0).toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="py-2 text-xs">
                      {item.transaction_type === 'payment' ? (
                        <div>
                          <div className="font-medium">{item.payment_method || 'Cash'}</div>
                          {item.payment_reference && (
                            <div className="text-muted-foreground text-xs">{item.payment_reference}</div>
                          )}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell className={`py-2 text-xs font-medium ${(item.balance || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {item.transaction_type === 'payment' && (item.balance || 0) === 0 ? '-' : `NPR ${(item.balance || 0).toLocaleString()}`}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge variant={item.status === 'Cleared' ? 'default' : 'secondary'} className="text-xs">
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      {item.transaction_type === 'order' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                            >
                              <Eye size={12} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-lg">
                                Order Details - {item.reference_id}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
                                <div>
                                  <span className="font-medium">Order ID:</span>
                                  <div>{item.reference_id}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Date:</span>
                                  <div>{new Date(item.date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Total Amount:</span>
                                  <div className="font-bold text-blue-600">NPR {(item.order_amount || 0).toLocaleString()}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span>
                                  <div>{item.status}</div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalOverviewPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                Showing {((overviewPage - 1) * itemsPerPage) + 1} to {Math.min(overviewPage * itemsPerPage, allTransactions.length)} of {allTransactions.length} entries
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOverviewPage(prev => Math.max(prev - 1, 1))}
                  disabled={overviewPage === 1}
                  className="h-7 px-2 text-xs"
                >
                  Previous
                </Button>
                {Array.from({ length: totalOverviewPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === overviewPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOverviewPage(page)}
                    className="h-7 w-7 text-xs"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOverviewPage(prev => Math.min(prev + 1, totalOverviewPages))}
                  disabled={overviewPage === totalOverviewPages}
                  className="h-7 px-2 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}