import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PurchaseService } from '../../../core/services/purchase';
import { AppStateService } from '../../../core/services/app-state';
import { Purchase } from '../../../core/models/purchase.model';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './purchase-list.html',
})
export class PurchaseList implements OnInit {
  private svc  = inject(PurchaseService);
  appState     = inject(AppStateService);

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
}