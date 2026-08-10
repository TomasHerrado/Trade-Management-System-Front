import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PurchaseService } from '../../../core/services/purchase';
import { AppStateService } from '../../../core/services/app-state';
import { Purchase } from '../../../core/models/purchase.model';
import { ExportService } from '../../../core/services/export';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './purchase-list.html',
})
export class PurchaseList implements OnInit {
  private svc  = inject(PurchaseService);
  appState     = inject(AppStateService);
  private exportSvc = inject(ExportService);
  printingPurchase = signal<Purchase | null>(null);

  purchases = signal<Purchase[]>([]);
  loading   = signal(true);
  expanded  = signal<string | null>(null);

  ngOnInit(): void {
    const bId = this.appState.branch()?.id;
    if (!bId) { this.loading.set(false); return; }
    this.svc.getByBranch(bId).subscribe({
      next: d => { this.purchases.set(d.reverse()); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  totalPurchases(): number {
    return this.purchases()
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.total, 0);
  }
  preparePrint(p: Purchase): void {
    this.printingPurchase.set(p);
    setTimeout(() => this.exportSvc.print(), 50);
  }

  preparePdf(p: Purchase): void {
    this.printingPurchase.set(p);
    setTimeout(() => {
      this.exportSvc.exportToPdf('invoice-print', `compra-${p.id.slice(0, 8)}.pdf`);
    }, 50);
  }

  exportExcel(p: Purchase): void {
    this.exportSvc.exportPurchaseToExcel(p);
  }
}