import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, Building, Phone, Mail, MapPin, Calendar,
  DollarSign, TrendingUp, CreditCard, Receipt, Package, Eye,
  Printer, Download, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';

// Mock data
const supplierData = {
  id: 1,
  name: "MediCorp Nepal Pvt. Ltd.",
  email: "contact@medicorp.com.np",
  phone: "+977-1-4567890",
  organization: "MediCorp Nepal",
  branch: "Kathmandu Branch",
  address: "New Baneshwor, Kathmandu",
  type: "Pharmacy",
  status: "Active",
  joinDate: "2023-01-15",
  totalCredit: 250000,
  pendingCredit: 85000,
  clearedCredit: 165000
};

const allTransactions = [
  { id: 1, date: "2024-01-15", type: "Purchase", amount: 45000, status: "Pending", invoice: "INV-001", items: ["Paracetamol 500mg", "Amoxicillin 250mg"] },
  { id: 2, date: "2024-01-10", type: "Payment", amount: -25000, status: "Cleared", invoice: "PAY-001", items: [] },
  { id: 3, date: "2024-01-05", type: "Purchase", amount: 35000, status: "Cleared", invoice: "INV-002", items: ["Ibuprofen 400mg", "Cetirizine 10mg"] },
  { id: 4, date: "2024-01-01", type: "Purchase", amount: 55000, status: "Cleared", invoice: "INV-003", items: ["Metformin 500mg", "Atorvastatin 20mg"] },
  { id: 5, date: "2023-12-28", type: "Payment", amount: -30000, status: "Cleared", invoice: "PAY-002", items: [] },
  { id: 6, date: "2023-12-25", type: "Purchase", amount: 42000, status: "Cleared", invoice: "INV-004", items: ["Aspirin 75mg", "Omeprazole 20mg"] },
  { id: 7, date: "2023-12-20", type: "Purchase", amount: 38000, status: "Pending", invoice: "INV-005", items: ["Losartan 50mg", "Amlodipine 5mg"] },
  { id: 8, date: "2023-12-15", type: "Payment", amount: -20000, status: "Cleared", invoice: "PAY-003", items: [] }
];

const allPaymentRecords = [
  { id: 1, date: "2024-01-10", amount: 25000, method: "Bank Transfer", reference: "TXN123456", invoices: ["INV-002", "INV-003"] },
  { id: 2, date: "2023-12-25", amount: 75000, method: "Cash", reference: "CASH001", invoices: ["INV-001"] },
  { id: 3, date: "2023-12-15", amount: 40000, method: "Cheque", reference: "CHQ789", invoices: ["INV-004"] },
  { id: 4, date: "2023-12-01", amount: 30000, method: "Bank Transfer", reference: "TXN789012", invoices: ["INV-005"] },
  { id: 5, date: "2023-11-20", amount: 50000, method: "Online Payment", reference: "ONL456789", invoices: ["INV-006", "INV-007"] },
  { id: 6, date: "2023-11-10", amount: 35000, method: "Cash", reference: "CASH002", invoices: ["INV-008"] }
];

const allCreditSummary = [
  { id: 1, date: "2024-01-15", description: "Purchase - INV-001", purchase: 45000, payment: 0, balance: 45000, status: "Pending" },
  { id: 2, date: "2024-01-10", description: "Payment Received", purchase: 0, payment: 25000, balance: 40000, status: "Cleared" },
  { id: 3, date: "2024-01-05", description: "Purchase - INV-002", purchase: 35000, payment: 0, balance: 65000, status: "Pending" },
  { id: 4, date: "2023-12-25", description: "Payment Received", purchase: 0, payment: 30000, balance: 30000, status: "Cleared" },
  { id: 5, date: "2023-12-20", description: "Purchase - INV-003", purchase: 55000, payment: 0, balance: 60000, status: "Pending" },
  { id: 6, date: "2023-12-15", description: "Payment Received", purchase: 0, payment: 25000, balance: 5000, status: "Cleared" },
  { id: 7, date: "2023-12-10", description: "Purchase - INV-004", purchase: 42000, payment: 0, balance: 30000, status: "Cleared" },
  { id: 8, date: "2023-12-05", description: "Purchase - INV-005", purchase: 38000, payment: 0, balance: 50000, status: "Pending" },
  { id: 9, date: "2023-11-28", description: "Payment Received", purchase: 0, payment: 20000, balance: 12000, status: "Cleared" },
  { id: 10, date: "2023-11-25", description: "Purchase - INV-006", purchase: 32000, payment: 0, balance: 32000, status: "Cleared" },
  { id: 11, date: "2023-11-20", description: "Purchase - INV-007", purchase: 28000, payment: 0, balance: 60000, status: "Pending" },
  { id: 12, date: "2023-11-15", description: "Payment Received", purchase: 0, payment: 15000, balance: 32000, status: "Cleared" },
  { id: 13, date: "2023-11-10", description: "Purchase - INV-008", purchase: 47000, payment: 0, balance: 47000, status: "Pending" },
  { id: 14, date: "2023-11-05", description: "Purchase - INV-009", purchase: 33000, payment: 0, balance: 80000, status: "Cleared" },
  { id: 15, date: "2023-10-30", description: "Payment Received", purchase: 0, payment: 35000, balance: 47000, status: "Cleared" }
];

export default function SupplierDetail() {
  const { id } = useParams();

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [supplierData, setSupplierData] = useState(null);
  const [ledgerData, setLedgerData] = useState({ transactions: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Pagination state
  const [overviewPage, setOverviewPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal state
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState({ items: [] });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsPage, setDetailsPage] = useState(1);
  const detailsItemsPerPage = 10;
  
  // Print/Export state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  
  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        
        // Check if this is a custom supplier ID
        if (id.toString().startsWith('custom_')) {
          // For custom suppliers, use the supplier transactions endpoint directly
          const transactionResponse = await fetch(`${API_BASE_URL}/inventory/suppliers/${id}/transactions/`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          });
          
          if (transactionResponse.ok) {
            const transactionData = await transactionResponse.json();
            
            // Use supplier_info from API response if available
            if (transactionData.supplier_info) {
              setSupplierData({
                id: transactionData.supplier_info.id,
                first_name: transactionData.supplier_info.name.split(' ')[0] || '',
                last_name: transactionData.supplier_info.name.split(' ').slice(1).join(' ') || '',
                organization_name: transactionData.supplier_info.organization_name,
                email: transactionData.supplier_info.email,
                phone: transactionData.supplier_info.phone,
                address: transactionData.supplier_info.address,
                contact_person: transactionData.supplier_info.contact_person,
                branch_name: transactionData.supplier_info.branch_name,
                created_at: transactionData.supplier_info.created_at,
                is_active: transactionData.supplier_info.is_active,
                supplier_type: transactionData.supplier_info.supplier_type
              });
            } else {
              // Fallback to creating supplier data from ID
              const supplierName = id.toString().replace('custom_', '').replace(/_/g, ' ');
              setSupplierData({
                id: id,
                first_name: supplierName.split(' ')[0] || '',
                last_name: supplierName.split(' ').slice(1).join(' ') || '',
                organization_name: supplierName,
                email: 'N/A',
                phone: 'N/A',
                address: 'N/A',
                supplier_type: 'custom',
                is_active: true,
                created_at: new Date().toISOString()
              });
            }
            
            setLedgerData({
              summary: transactionData.summary || {},
              transactions: transactionData.transactions || []
            });
          } else {
            // If the new endpoint fails, try the old approach
            const supplierName = id.toString().replace('custom_', '').replace(/_/g, ' ');
            
            setSupplierData({
              id: id,
              first_name: supplierName.split(' ')[0] || '',
              last_name: supplierName.split(' ').slice(1).join(' ') || '',
              organization_name: supplierName,
              email: 'N/A',
              phone: 'N/A',
              address: 'N/A',
              supplier_type: 'custom',
              is_active: true,
              joinDate: new Date().toISOString()
            });
            
            // Fallback to old endpoint
            const ledgerResponse = await fetch(`${API_BASE_URL}/inventory/supplier-ledger/detail/?supplier_name=${encodeURIComponent(supplierName)}`, {
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
              },
            });
            
            if (ledgerResponse.ok) {
              const ledgerData = await ledgerResponse.json();
              setLedgerData(ledgerData);
            }
          }

        } else {
          // Handle regular user suppliers - use list API to get full data
          const supplierResponse = await fetch(`${API_BASE_URL}/auth/users/?role=supplier_admin`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          });
          
          if (supplierResponse.ok) {
            const response = await supplierResponse.json();
            const data = response.results.find(supplier => supplier.id === parseInt(id));
            if (data) {
              console.log('Supplier data:', data);
              setSupplierData(data);
            

            
            const supplierName = data.organization_name || `${data.first_name} ${data.last_name}`;
            
            // Use supplier detail endpoint
            const supplierResponse = await fetch(`${API_BASE_URL}/inventory/suppliers/${data.id}/`, {
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
              },
            });
            
            if (supplierResponse.ok) {
              const supplierData = await supplierResponse.json();
              setLedgerData({
                summary: supplierData.summary || {},
                transactions: supplierData.transactions || []
              });
            }
            } else {
              // If supplier not found in list, show error
              toast({
                title: "Supplier Not Found",
                description: "This supplier no longer exists in the system.",
                variant: "destructive"
              });
              setSupplierData(null);
            }
          } else {
            // If API call failed, show error
            toast({
              title: "Error",
              description: "Failed to load supplier data",
              variant: "destructive"
            });
            setSupplierData(null);
          }
        }
      } catch (error) {
        console.error('Error fetching supplier data:', error);
        toast({
          title: "Error",
          description: "Failed to load supplier data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchSupplierData();
  }, [id]);
  
  // Paginated data - show all transactions (purchases and payments)
  const allTransactions = (ledgerData.transactions || []);
  const paginatedCreditSummary = allTransactions.slice(
    (overviewPage - 1) * itemsPerPage,
    overviewPage * itemsPerPage
  );
  
  const totalOverviewPages = Math.ceil(allTransactions.length / itemsPerPage);
  
  // Fetch transaction details
  const fetchTransactionDetails = async (transaction) => {
    try {
      setDetailsLoading(true);
      setSelectedTransaction(transaction);
      setDetailsPage(1);
      
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/inventory/transaction-details/?transaction_id=${encodeURIComponent(transaction.reference_id)}&source_type=${transaction.source_type}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactionDetails(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load transaction details",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      toast({
        title: "Error",
        description: "Failed to load transaction details",
        variant: "destructive"
      });
    } finally {
      setDetailsLoading(false);
    }
  };
  
  // Paginated details
  const paginatedDetails = transactionDetails.items.slice(
    (detailsPage - 1) * detailsItemsPerPage,
    detailsPage * detailsItemsPerPage
  );
  const totalDetailsPages = Math.ceil(transactionDetails.items.length / detailsItemsPerPage);
  
  // Filter transactions by date range
  const getFilteredTransactions = () => {
    const transactions = ledgerData.transactions || [];
    if (!startDate && !endDate) return transactions;
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const start = startDate ? new Date(startDate) : new Date('1900-01-01');
      const end = endDate ? new Date(endDate) : new Date('2100-12-31');
      
      return transactionDate >= start && transactionDate <= end;
    });
  };
  
  // Print statement
  const handlePrint = () => {
    const transactions = ledgerData.transactions || [];
    const dataToUse = startDate || endDate ? getFilteredTransactions() : transactions;
    
    const printContent = `
      <html>
        <head>
          <title>Transaction Data</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 10px; font-size: 10px; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: left; font-size: 9px; word-wrap: break-word; }
            th { background-color: #f5f5f5; font-weight: bold; }
            th:nth-child(1), td:nth-child(1) { width: 12%; } /* Date */
            th:nth-child(2), td:nth-child(2) { width: 25%; } /* Description */
            th:nth-child(3), td:nth-child(3) { width: 13%; } /* Purchase Amount */
            th:nth-child(4), td:nth-child(4) { width: 13%; } /* Payment Made */
            th:nth-child(5), td:nth-child(5) { width: 15%; } /* Payment Method */
            th:nth-child(6), td:nth-child(6) { width: 13%; } /* Remaining Balance */
            th:nth-child(7), td:nth-child(7) { width: 9%; } /* Status */
            @media print { 
              body { margin: 5px; } 
              table { font-size: 8px; }
              th, td { padding: 2px; }
            }
          </style>
        </head>
        <body>
          <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px;">Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 10px;">
              <div><strong>Total Purchase:</strong><br>NPR ${(ledgerData.summary?.total_purchases || 0).toLocaleString()}</div>
              <div><strong>Total Payment:</strong><br>NPR ${(ledgerData.summary?.total_paid || 0).toLocaleString()}</div>
              <div><strong>Remaining Balance:</strong><br>NPR ${(ledgerData.summary?.total_credit || 0).toLocaleString()}</div>
              <div><strong>Total Orders:</strong><br>${ledgerData.transactions?.filter(t => t.transaction_type === 'purchase')?.length || 0}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Purchase Amount</th>
                <th>Payment Made</th>
                <th>Payment Method</th>
                <th>Remaining Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${dataToUse.map(item => `
                <tr>
                  <td>${new Date(item.date).toLocaleDateString()}</td>
                  <td>${item.description}</td>
                  <td>${(item.purchase || 0) > 0 ? `NPR ${(item.purchase || 0).toLocaleString()}` : '-'}</td>
                  <td>${(item.payment || 0) > 0 ? `NPR ${(item.payment || 0).toLocaleString()}` : '-'}</td>
                  <td>${item.transaction_type === 'payment' ? (item.payment_method || 'Cash') + (item.payment_reference ? ' - ' + item.payment_reference : '') : '-'}</td>
                  <td>${item.transaction_type === 'payment' && (item.balance || 0) === 0 ? '-' : `NPR ${(item.balance || 0).toLocaleString()}`}</td>
                  <td>${item.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    setShowExportDialog(false);
  };
  
  // Export to CSV
  const handleExportCSV = () => {
    const transactions = ledgerData.transactions || [];
    const dataToUse = startDate || endDate ? getFilteredTransactions() : transactions;
    const supplierName = supplierData.organization_name || `${supplierData.first_name} ${supplierData.last_name}`;
    
    const csvContent = [
      ['Date', 'Description', 'Purchase Amount', 'Payment Made', 'Payment Method', 'Remaining Balance', 'Status'],
      ...dataToUse.map(item => [
        new Date(item.date).toLocaleDateString(),
        item.description,
        (item.purchase || 0) > 0 ? `NPR ${(item.purchase || 0).toLocaleString()}` : '-',
        (item.payment || 0) > 0 ? `NPR ${(item.payment || 0).toLocaleString()}` : '-',
        item.transaction_type === 'payment' ? (item.payment_method || 'Cash') + (item.payment_reference ? ' - ' + item.payment_reference : '') : '-',
        item.transaction_type === 'payment' && (item.balance || 0) === 0 ? '-' : `NPR ${(item.balance || 0).toLocaleString()}`,
        item.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${supplierName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setShowExportDialog(false);
  };
  
  // Handle payment recording
  const handleRecordPayment = async () => {
    if (!paymentAmount || !paymentMethod || !supplierData) {
      return;
    }
    
    try {
      setPaymentLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const supplierName = supplierData.organization_name || `${supplierData.first_name} ${supplierData.last_name}`;
      
      const response = await fetch(`${API_BASE_URL}/inventory/supplier-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          supplier_name: supplierName,
          payment_amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          notes: `Payment recorded from supplier detail page`
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Payment Recorded",
          description: `Payment of NPR ${parseFloat(paymentAmount).toLocaleString()} recorded successfully`,
        });
        
        // Clear form
        setPaymentAmount("");
        setPaymentMethod("");
        setPaymentReference("");
        
        // Refresh ledger data for both custom and regular suppliers
        if (supplierData.id && !supplierData.id.toString().startsWith('custom_')) {
          // Refresh using supplier detail endpoint for regular suppliers
          const refreshResponse = await fetch(`${API_BASE_URL}/inventory/suppliers/${supplierData.id}/`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          });
          
          if (refreshResponse.ok) {
            const updatedSupplierData = await refreshResponse.json();
            setLedgerData({
              summary: updatedSupplierData.summary || {},
              transactions: updatedSupplierData.transactions || []
            });
          }
        } else {
          // Refresh for custom suppliers
          const transactionResponse = await fetch(`${API_BASE_URL}/inventory/suppliers/${supplierData.id}/transactions/`, {
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
        }
      } else {
        const error = await response.json();
        toast({
          title: "Payment Failed",
          description: error.error || "Failed to record payment",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  if (!supplierData) {
    return <div className="text-center text-muted-foreground">Supplier not found</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <NavLink to="/suppliers/management">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </NavLink>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{supplierData.organization_name || `${supplierData.first_name} ${supplierData.last_name}`}</h1>
          <p className="text-sm text-muted-foreground">Supplier ID: {id}</p>
        </div>
      </div>

      {/* Supplier Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-lg font-bold text-red-600">NPR {ledgerData.summary?.total_purchases?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">Total Purchase Amount</p>
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
                <p className="text-xs text-muted-foreground">Total Payment Made</p>
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
                <p className="text-xs text-muted-foreground">Total Remaining Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{ledgerData.transactions?.filter(t => t.transaction_type === 'purchase')?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Contact Information Card */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Mail size={12} />
                      <span>{supplierData.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={12} />
                      <span>{supplierData.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} />
                      <span>{supplierData.address || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Business Details</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Building size={12} />
                      <span>Organization: {supplierData?.organization_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={12} />
                      <span>Branch: {supplierData?.branch_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={12} />
                      <span>Joined: {supplierData?.created_at ? new Date(supplierData.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">{supplierData?.role_display || 'Supplier'}</Badge>
                      <Badge variant={supplierData?.status === 'active' ? 'default' : 'secondary'} className="text-xs">{supplierData?.status === 'active' ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Summary Table - Plain without card */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium">Credit Summary & Payment History</h3>
              <div className="flex gap-2">
                <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Printer size={12} className="mr-1" />
                      Print
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Print/Export Statement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Date Range (Optional)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Start Date</Label>
                            <Input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">End Date</Label>
                            <Input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Leave empty to include all transactions
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handlePrint}
                          disabled={exportLoading}
                          className="flex-1 text-xs"
                        >
                          <Printer size={12} className="mr-1" />
                          Print
                        </Button>
                        <Button 
                          onClick={handleExportCSV}
                          disabled={exportLoading}
                          variant="outline"
                          className="flex-1 text-xs"
                        >
                          <Download size={12} className="mr-1" />
                          Export CSV
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setShowExportDialog(true)}
                >
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
                              <TableHead className="text-xs py-2">Purchase Amount</TableHead>
                              <TableHead className="text-xs py-2">Payment Made</TableHead>
                              <TableHead className="text-xs py-2">Payment Method</TableHead>
                              <TableHead className="text-xs py-2">Remaining Balance</TableHead>
                              <TableHead className="text-xs py-2">Status</TableHead>
                              <TableHead className="text-xs py-2">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedCreditSummary.map((item) => (
                              <TableRow key={item.id} className="border-b hover:bg-muted/50">
                                <TableCell className="py-2 text-xs">{new Date(item.date).toLocaleDateString()}</TableCell>
                                <TableCell className="py-2 text-xs">{item.description}</TableCell>
                                <TableCell className="py-2 text-xs font-medium text-red-600">
                                  {(item.purchase || 0) > 0 ? `NPR ${(item.purchase || 0).toLocaleString()}` : '-'}
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
                                  {item.transaction_type === 'purchase' && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 w-6 p-0"
                                          onClick={() => fetchTransactionDetails(item)}
                                        >
                                          <Eye size={12} />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle className="text-lg">
                                            Transaction Details - {selectedTransaction?.reference_id}
                                          </DialogTitle>
                                        </DialogHeader>
                                        
                                        {detailsLoading ? (
                                          <div className="flex justify-center items-center h-32">
                                            <div className="text-sm text-muted-foreground">Loading details...</div>
                                          </div>
                                        ) : (
                                          <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <span className="font-medium">Transaction ID:</span>
                                                  <div>{selectedTransaction?.reference_id}</div>
                                                </div>
                                                <div>
                                                  <span className="font-medium">Date:</span>
                                                  <div>{selectedTransaction ? new Date(selectedTransaction.date).toLocaleDateString() : ''}</div>
                                                </div>
                                                <div>
                                                  <span className="font-medium">Total Items:</span>
                                                  <div>{transactionDetails.total_items || 0}</div>
                                                </div>
                                                <div>
                                                  <span className="font-medium">Total Amount:</span>
                                                  <div className="font-bold text-blue-600">NPR {(transactionDetails.total_amount || 0).toLocaleString()}</div>
                                                </div>
                                              </div>
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <span className="font-medium">Total Paid:</span>
                                                  <div className="font-bold text-green-600">NPR {(transactionDetails.total_paid || 0).toLocaleString()}</div>
                                                </div>
                                                <div>
                                                  <span className="font-medium">Total Credit:</span>
                                                  <div className="font-bold text-orange-600">NPR {(transactionDetails.total_credit || 0).toLocaleString()}</div>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div className="overflow-x-auto">
                                              <Table>
                                                <TableHeader>
                                                  <TableRow>
                                                    <TableHead className="text-xs">Medicine Name</TableHead>
                                                    <TableHead className="text-xs">Generic Name</TableHead>
                                                    <TableHead className="text-xs">Strength</TableHead>
                                                    <TableHead className="text-xs">Form</TableHead>
                                                    <TableHead className="text-xs">Quantity</TableHead>
                                                    <TableHead className="text-xs">Unit Price</TableHead>
                                                    <TableHead className="text-xs">Total</TableHead>
                                                    <TableHead className="text-xs">Batch</TableHead>
                                                    <TableHead className="text-xs">Expiry</TableHead>
                                                  </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                  {paginatedDetails.map((detail, index) => (
                                                    <TableRow key={detail.id || index} className="border-b">
                                                      <TableCell className="py-2 text-xs font-medium">{detail.name}</TableCell>
                                                      <TableCell className="py-2 text-xs text-muted-foreground">{detail.generic_name || '-'}</TableCell>
                                                      <TableCell className="py-2 text-xs">{detail.strength || '-'}</TableCell>
                                                      <TableCell className="py-2 text-xs">{detail.dosage_form || '-'}</TableCell>
                                                      <TableCell className="py-2 text-xs">
                                                        {detail.quantity || detail.quantity_requested || '-'} {detail.unit || ''}
                                                      </TableCell>
                                                      <TableCell className="py-2 text-xs">
                                                        NPR {(detail.cost_price || detail.unit_price || 0).toLocaleString()}
                                                      </TableCell>
                                                      <TableCell className="py-2 text-xs font-medium">
                                                        NPR {(detail.total_cost || detail.total_price || 0).toLocaleString()}
                                                      </TableCell>
                                                      <TableCell className="py-2 text-xs">{detail.batch_number || '-'}</TableCell>
                                                      <TableCell className="py-2 text-xs">
                                                        {detail.expiry_date ? new Date(detail.expiry_date).toLocaleDateString() : '-'}
                                                      </TableCell>
                                                    </TableRow>
                                                  ))}
                                                </TableBody>
                                              </Table>
                                            </div>
                                            
                                            {/* Pagination for Details */}
                                            {totalDetailsPages > 1 && (
                                              <div className="flex items-center justify-between mt-4">
                                                <p className="text-xs text-muted-foreground">
                                                  Showing {((detailsPage - 1) * detailsItemsPerPage) + 1} to {Math.min(detailsPage * detailsItemsPerPage, transactionDetails.items.length)} of {transactionDetails.items.length} items
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDetailsPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={detailsPage === 1}
                                                    className="h-7 px-2 text-xs"
                                                  >
                                                    Previous
                                                  </Button>
                                                  {Array.from({ length: totalDetailsPages }, (_, i) => i + 1).map((page) => (
                                                    <Button
                                                      key={page}
                                                      variant={page === detailsPage ? "default" : "outline"}
                                                      size="sm"
                                                      onClick={() => setDetailsPage(page)}
                                                      className="h-7 w-7 text-xs"
                                                    >
                                                      {page}
                                                    </Button>
                                                  ))}
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDetailsPage(prev => Math.min(prev + 1, totalDetailsPages))}
                                                    disabled={detailsPage === totalDetailsPages}
                                                    className="h-7 px-2 text-xs"
                                                  >
                                                    Next
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Pagination for Overview */}
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

          </div>
        </div>

        {/* Sidebar - Credit Management */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="mr-2" size={18} />
                Credit Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Credit Balance</p>
                <p className="text-lg font-bold text-orange-600">NPR {(ledgerData.summary?.pending_credit || 0).toLocaleString()}</p>
              </div>
              
              {/* Payment Form */}
              <div className="space-y-2 p-3 border rounded-lg">
                <Label className="text-xs font-medium">Record Payment</Label>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const maxCredit = ledgerData.summary?.total_credit || 0;
                        if (value <= maxCredit) {
                          setPaymentAmount(e.target.value);
                        }
                      }}
                      className="h-7 text-xs"
                      max={ledgerData.summary?.total_credit || 0}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: NPR {(ledgerData.summary?.total_credit || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Reference</Label>
                    <Input
                      placeholder="Reference number"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full text-xs" 
                    disabled={!paymentAmount || !paymentMethod || paymentLoading || parseFloat(paymentAmount) > (ledgerData.summary?.total_credit || 0)}
                    onClick={handleRecordPayment}
                  >
                    <Receipt size={12} className="mr-2" />
                    {paymentLoading ? 'Recording...' : 'Record Payment'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}