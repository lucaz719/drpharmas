import { useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useNotification } from '@/contexts/NotificationContext';

export function usePrint() {
  const { showSuccess, showError } = useNotification();

  const handlePrint = useReactToPrint({
    onAfterPrint: () => showSuccess('Document printed successfully'),
    onPrintError: () => showError('Failed to print document'),
  });

  const printElement = useCallback((elementRef: React.RefObject<HTMLElement>) => {
    if (elementRef.current) {
      const printContent = elementRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Print Document</title>
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              @media print {
                body { 
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                .no-print { 
                  display: none !important; 
                }
                .print-break { 
                  page-break-before: always; 
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
        showSuccess('Document printed successfully');
      }
    } else {
      showError('Element not found for printing');
    }
  }, [showSuccess, showError]);

  const printInvoice = useCallback((invoiceData: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${invoiceData.number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .total { text-align: right; margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>${invoiceData.company || 'Your Company'}</h2>
          </div>
          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${invoiceData.number}</p>
            <p><strong>Date:</strong> ${invoiceData.date}</p>
            <p><strong>Customer:</strong> ${invoiceData.customer}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items?.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price}</td>
                  <td>$${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          <div class="total">
            <p>Total: $${invoiceData.total}</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
      showSuccess('Invoice printed successfully');
    }
  }, [showSuccess]);

  return {
    printElement,
    printInvoice
  };
}