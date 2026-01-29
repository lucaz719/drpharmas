import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Receipt, User, Calendar, CreditCard, Printer } from 'lucide-react';

interface BillDetail {
  id: string;
  patientName: string;
  patientId: string;
  patientAge: string;
  patientPhone: string;
  patientGender: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    batch: string;
    total: number;
  }>;
  subtotal: number;
  total: number;
  discountAmount: number;
  taxAmount: number;
  paymentMethod: string;
  paidAmount: number;
  creditAmount: number;
  completedAt: string;
  completedBy: string;
  status: string;
  payments: Array<{
    id: number;
    amount: number;
    method: string;
    reference: string;
    date: string;
    receivedBy: string;
  }>;
}

export default function BillDetail() {
  const { billNumber } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillDetail();
  }, [billNumber]);

  const fetchBillDetail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/pos/sales/${billNumber}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBill(data);
      }
    } catch (error) {
      console.error('Failed to fetch bill details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading bill details...</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Bill not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bill #{bill.id}</h1>
            <p className="text-muted-foreground">{bill.completedAt}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={bill.status === 'completed' ? 'default' : 'secondary'}>
            {bill.status}
          </Badge>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="font-medium">{bill.patientName}</p>
            </div>
            {bill.patientId && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                <p className="font-medium">{bill.patientId}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <p className="font-medium">{bill.patientAge || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                <p className="font-medium">{bill.patientGender || 'N/A'}</p>
              </div>
            </div>
            {bill.patientPhone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="font-medium">{bill.patientPhone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bill Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Bill Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{bill.subtotal.toFixed(2)}</span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{bill.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>₹{bill.taxAmount.toFixed(2)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{bill.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid</span>
              <span>₹{bill.paidAmount.toFixed(2)}</span>
            </div>
            {bill.creditAmount > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Credit</span>
                <span>₹{bill.creditAmount.toFixed(2)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
              <p className="font-medium capitalize">{bill.paymentMethod}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Completed By</label>
              <p className="font-medium">{bill.completedBy}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
              <p className="font-medium">{bill.completedAt}</p>
            </div>
            
            {bill.payments && bill.payments.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment History</label>
                <div className="space-y-2 mt-2">
                  {bill.payments.map((payment) => (
                    <div key={payment.id} className="text-sm border rounded p-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{payment.method}</span>
                        <span className="font-medium">₹{payment.amount.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payment.date} • {payment.receivedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Medicine</th>
                  <th className="text-left p-2">Batch</th>
                  <th className="text-right p-2">Qty</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="p-2 text-muted-foreground">{item.batch}</td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    <td className="p-2 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="p-2 text-right font-medium">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}