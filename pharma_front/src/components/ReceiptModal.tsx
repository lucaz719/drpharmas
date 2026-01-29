import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState, useEffect } from "react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: any;
}

export default function ReceiptModal({ isOpen, onClose, receiptData }: ReceiptModalProps) {
  const [posSettings, setPosSettings] = useState({
    business_name: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    receipt_footer: '',
    receipt_logo: null,
    tax_rate: 13
  });

  // Fetch POS settings when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPOSSettings();
    }
  }, [isOpen]);

  const fetchPOSSettings = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/pos/settings/', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosSettings({
          business_name: data.business_name || '',
          business_address: data.business_address || '',
          business_phone: data.business_phone || '',
          business_email: data.business_email || '',
          receipt_footer: data.receipt_footer || '',
          receipt_logo: data.receipt_logo || null,
          tax_rate: data.tax_rate || 13
        });
      }
    } catch (error) {
      console.error('Error fetching POS settings:', error);
    }
  };

  if (!receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Receipt
            <Button onClick={handlePrint} size="sm" className="ml-2">
              <Printer size={16} className="mr-1" />
              Print
            </Button>
          </DialogTitle>
          <DialogDescription>
            Receipt for sale {receiptData.sale.sale_number}
          </DialogDescription>
        </DialogHeader>
        
        <div className="receipt-content font-mono text-sm print:text-xs print:w-full print:max-w-none" id="receipt-print">
          {/* Organization Header */}
          <div className="text-center border-b pb-2 mb-2">
            {posSettings.receipt_logo && (
              <div className="mb-2">
                <img 
                  src={posSettings.receipt_logo} 
                  alt="Business Logo" 
                  className="mx-auto max-h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <h2 className="font-bold text-lg">
              {posSettings.business_name || receiptData.organization.name}
              {receiptData.branch.name && receiptData.branch.name !== (posSettings.business_name || receiptData.organization.name) && (
                <span> ({receiptData.branch.name})</span>
              )}
            </h2>
            {(posSettings.business_address || receiptData.organization.address) && (
              <p className="text-xs">{posSettings.business_address || receiptData.organization.address}</p>
            )}
            {(posSettings.business_phone || receiptData.organization.phone) && (
              <p className="text-xs">Phone: {posSettings.business_phone || receiptData.organization.phone}</p>
            )}
            {posSettings.business_email && (
              <p className="text-xs">Email: {posSettings.business_email}</p>
            )}
          </div>

          {/* Sale Info */}
          <div className="border-b pb-2 mb-2">
            <div className="flex justify-between">
              <span>Bill No:</span>
              <span>{receiptData.sale.sale_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{receiptData.sale.sale_date}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{receiptData.sale.cashier}</span>
            </div>
          </div>

          {/* Patient Info */}
          <div className="border-b pb-2 mb-2">
            <div className="flex justify-between">
              <span>Patient:</span>
              <span>{receiptData.patient.name}</span>
            </div>
            {receiptData.patient.patient_id && (
              <div className="flex justify-between">
                <span>ID:</span>
                <span>{receiptData.patient.patient_id}</span>
              </div>
            )}
            {receiptData.patient.phone && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{receiptData.patient.phone}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border-b pb-2 mb-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left">Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="text-left">
                      <div>{item.name}</div>
                      {item.batch && <div className="text-xs text-gray-500">Batch: {item.batch}</div>}
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{item.unit_price.toFixed(2)}</td>
                    <td className="text-right">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>NPR {receiptData.totals.subtotal.toFixed(2)}</span>
            </div>
            {receiptData.totals.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax ({posSettings.tax_rate}%):</span>
                <span>NPR {receiptData.totals.tax.toFixed(2)}</span>
              </div>
            )}
            {receiptData.totals.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-NPR {receiptData.totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-1">
              <span>Total:</span>
              <span>NPR {receiptData.totals.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid ({receiptData.payment_method}):</span>
              <span>NPR {receiptData.totals.paid.toFixed(2)}</span>
            </div>
            {receiptData.totals.change > 0 && (
              <div className="flex justify-between">
                <span>Change:</span>
                <span>NPR {receiptData.totals.change.toFixed(2)}</span>
              </div>
            )}
            {receiptData.totals.credit > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Credit Due:</span>
                <span>NPR {receiptData.totals.credit.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-4 pt-2 border-t text-xs">
            {posSettings.receipt_footer ? (
              <p>{posSettings.receipt_footer}</p>
            ) : (
              <p>Thank you for your business!</p>
            )}
            <p>Please keep this receipt for your records</p>
          </div>
        </div>
      </DialogContent>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
            body * {
              visibility: hidden;
            }
            #receipt-print, #receipt-print * {
              visibility: visible;
            }
            #receipt-print {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 80mm !important;
              max-width: 80mm !important;
              font-size: 10px !important;
              line-height: 1.1 !important;
              margin: 0 !important;
              padding: 5mm !important;
              box-sizing: border-box !important;
            }
            @page {
              size: 80mm auto !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `
      }} />
    </Dialog>
  );
}