import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SaleService } from '../../../core/services/sale';
import { AppStateService } from '../../../core/services/app-state';
import { Sale } from '../../../core/models/sale.model';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sale-list.html',
})
export class SaleList implements OnInit {
  private svc  = inject(SaleService);
  appState     = inject(AppStateService);

  sales    = signal<Sale[]>([]);
  loading  = signal(true);
  expanded = signal<string | null>(null);

  paymentLabel: Record<string, string> = {
    CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', MIXED: 'Mixto', ACCOUNT: 'Fiado'
  };

  ngOnInit(): void {
    const bId = this.appState.branch()?.id;
    if (!bId) { this.loading.set(false); return; }
    this.svc.getByBranch(bId).subscribe({
      next: d => { this.sales.set(d.reverse()); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  totalToday(): number {
    const today = new Date().toDateString();
    return this.sales()
      .filter(s => new Date(s.createdAt).toDateString() === today && s.status === 'COMPLETED')
      .reduce((sum, s) => sum + s.total, 0);
  }
}