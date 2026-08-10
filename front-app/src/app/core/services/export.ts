import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Sale } from '../models/sale.model';
import { Purchase } from '../models/purchase.model';

@Injectable({ providedIn: 'root' })
export class ExportService {

  print(): void {
    window.print();
  }

  async exportToPdf(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(filename);
  }

  exportSaleToExcel(sale: Sale): void {
    interface Row {
      Producto: string;
      Variante: string;
      Cantidad: number | string;
      'Precio Unitario': number | string;
      Subtotal: number | string;
    }

    const rows: Row[] = sale.items.map(i => ({
      Producto: i.productName,
      Variante: i.variantName !== 'DEFAULT' ? i.variantName : '',
      Cantidad: i.quantity,
      'Precio Unitario': i.unitPrice,
      Subtotal: i.subtotal,
    }));
    rows.push({ Producto: '', Variante: '', Cantidad: '', 'Precio Unitario': 'TOTAL', Subtotal: sale.total });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Venta');
    XLSX.writeFile(wb, `venta-${sale.id.slice(0, 8)}.xlsx`);
  }

  exportPurchaseToExcel(purchase: Purchase): void {
    interface Row {
      Producto: string;
      Variante: string;
      Cantidad: number | string;
      'Costo Unitario': number | string;
      Subtotal: number | string;
    }

    const rows: Row[] = purchase.items.map(i => ({
      Producto: i.productName,
      Variante: i.variantName !== 'DEFAULT' ? i.variantName : '',
      Cantidad: i.quantity,
      'Costo Unitario': i.unitCost,
      Subtotal: i.subtotal,
    }));
    rows.push({ Producto: '', Variante: '', Cantidad: '', 'Costo Unitario': 'TOTAL', Subtotal: purchase.total });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Compra');
    XLSX.writeFile(wb, `compra-${purchase.id.slice(0, 8)}.xlsx`);
  }
}