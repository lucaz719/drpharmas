import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNotification } from '@/contexts/NotificationContext';

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  title?: string;
}

export function useExport() {
  const { showSuccess, showError } = useNotification();

  const exportToCSV = useCallback((data: ExportData) => {
    try {
      const csvContent = [
        data.headers.join(','),
        ...data.rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${data.filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      showSuccess('CSV file exported successfully');
    } catch (error) {
      showError('Failed to export CSV file');
    }
  }, [showSuccess, showError]);

  const exportToPDF = useCallback(async (elementId: string, filename: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        showError('Element not found for PDF export');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename}.pdf`);
      showSuccess('PDF file exported successfully');
    } catch (error) {
      showError('Failed to export PDF file');
    }
  }, [showSuccess, showError]);

  const importFromCSV = useCallback((file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
          
          const data = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',').map(v => v.replace(/"/g, ''));
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = values[index] || '';
              });
              return obj;
            });
          
          resolve(data);
          showSuccess('CSV file imported successfully');
        } catch (error) {
          reject(error);
          showError('Failed to import CSV file');
        }
      };
      reader.readAsText(file);
    });
  }, [showSuccess, showError]);

  return {
    exportToCSV,
    exportToPDF,
    importFromCSV
  };
}