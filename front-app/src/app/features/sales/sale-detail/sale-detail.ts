import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SaleService } from '../../../core/services/sale';
import { AppStateService } from '../../../core/services/app-state';
import { Sale } from '../../../core/models/sale.model';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sale-detail.html',
})
export class SaleDetail implements OnInit {
  private svc  = inject(SaleService);
  private route = inject(ActivatedRoute);
  appState      = inject(AppStateService);

  sale    = signal<Sale | null>(null);
  loading = signal(true);

  paymentLabel: Record<string, string> = {
    CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', MIXED: 'Mixto', ACCOUNT: 'Fiado'
  };

  ngOnInit(): void {
    const bId = this.appState.branch()?.id;
    const id  = this.route.snapshot.paramMap.get('id')!;
    if (!bId) { this.loading.set(false); return; }
    this.svc.getById(bId, id).subscribe({
      next: s => { this.sale.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}