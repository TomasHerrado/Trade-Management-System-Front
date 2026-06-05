import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockService } from '../../../core/services/stock';
import { AppStateService } from '../../../core/services/app-state';
import { Stock } from '../../../core/models/stock.model';
import { RouterLink, RouterPreloader } from '@angular/router';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stock-list.html',
})
export class StockList implements OnInit {
  private svc  = inject(StockService);
  appState     = inject(AppStateService);

  stock    = signal<Stock[]>([]);
  loading  = signal(true);
  filter   = signal<'all' | 'low'>('all');
  search   = signal('');

  ngOnInit(): void {
    const bId = this.appState.branch()?.id;
    if (!bId) { this.loading.set(false); return; }
    this.svc.getByBranch(bId).subscribe({
      next: d => { this.stock.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filteredStock() {
    const q = this.search().toLowerCase();
    return this.stock().filter(s => {
      const matchSearch = s.productName.toLowerCase().includes(q) || s.variantName.toLowerCase().includes(q);
      const matchFilter = this.filter() === 'all' || s.lowStock;
      return matchSearch && matchFilter;
    });
  }

  lowStockCount() { return this.stock().filter(s => s.lowStock).length; }
}