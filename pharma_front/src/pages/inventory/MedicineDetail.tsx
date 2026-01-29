import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Calendar, AlertTriangle } from 'lucide-react';

interface MedicineDetail {
  id: number;
  name: string;
  generic_name: string;
  product_code: string;
  strength: string;
  dosage_form: string;
  unit: string;
  manufacturer_name: string;
  category_name: string;
  description: string;
  requires_prescription: boolean;
  is_controlled: boolean;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  cost_price: number;
  selling_price: number;
  mrp: number;
  total_stock: number;
  is_low_stock: boolean;
  stock_items: Array<{
    id: number;
    batch_number: string;
    quantity: number;
    expiry_date: string;
    cost_price: number;
    selling_price: number;
    branch_name: string;
  }>;
}

interface SaleHistory {
  sale_number: string;
  patient_name: string;
  patient_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  batch_number: string;
  sale_date: string;
  created_by: string;
}

export default function MedicineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<MedicineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);

  useEffect(() => {
    fetchMedicineDetail();
    fetchSalesHistory();
  }, [id]);

  const fetchMedicineDetail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/inventory/products/${id}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMedicine(data);
      }
    } catch (error) {
      console.error('Failed to fetch medicine details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesHistory = async () => {
    try {
      setLoadingSales(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/pos/medicine/${id}/sales-history/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSalesHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch sales history:', error);
    } finally {
      setLoadingSales(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading medicine details...</div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Medicine not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{medicine.name}</h1>
          <p className="text-muted-foreground">{medicine.generic_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Medicine Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Product Code</label>
                <p className="font-medium">{medicine.product_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Strength</label>
                <p className="font-medium">{medicine.strength}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dosage Form</label>
                <p className="font-medium">{medicine.dosage_form}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit</label>
                <p className="font-medium">{medicine.unit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Manufacturer</label>
                <p className="font-medium">{medicine.manufacturer_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="font-medium">{medicine.category_name}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {medicine.requires_prescription && (
                <Badge variant="secondary">Prescription Required</Badge>
              )}
              {medicine.is_controlled && (
                <Badge variant="destructive">Controlled Substance</Badge>
              )}
              {medicine.is_low_stock && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Low Stock
                </Badge>
              )}
            </div>

            {medicine.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{medicine.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Stock Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cost Price</label>
              <p className="text-lg font-bold">₹{medicine.cost_price}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Selling Price</label>
              <p className="text-lg font-bold text-green-600">₹{medicine.selling_price}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">MRP</label>
              <p className="text-lg font-bold">₹{medicine.mrp}</p>
            </div>
            
            <hr />
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Stock</label>
              <p className="text-2xl font-bold">{medicine.total_stock} {medicine.unit}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Min Stock Level</label>
              <p className="font-medium">{medicine.min_stock_level}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Reorder Point</label>
              <p className="font-medium">{medicine.reorder_point}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Details by Batch */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Stock Details by Batch
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medicine.stock_items && medicine.stock_items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Batch</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-left p-2">Expiry</th>
                      <th className="text-left p-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicine.stock_items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2 font-medium">{item.batch_number}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">{new Date(item.expiry_date).toLocaleDateString()}</td>
                        <td className="p-2">₹{item.selling_price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No stock available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <div className="text-center py-4 text-muted-foreground">Loading sales...</div>
            ) : salesHistory.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {salesHistory.map((sale, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{sale.patient_name}</p>
                        <p className="text-sm text-muted-foreground">Bill #{sale.sale_number}</p>
                        <p className="text-xs text-muted-foreground">{sale.sale_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{sale.quantity} units</p>
                        <p className="text-sm text-green-600">₹{sale.total_amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sales history found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}