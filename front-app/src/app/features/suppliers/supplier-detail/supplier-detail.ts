import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupplierService } from '../../../core/services/supplier';
import { AppStateService } from '../../../core/services/app-state';
import { Supplier } from '../../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './supplier-detail.html',
})
export class SupplierDetail implements OnInit {
  private svc   = inject(SupplierService);
  private route = inject(ActivatedRoute);
  appState      = inject(AppStateService);

  supplier = signal<Supplier | null>(null);
  loading  = signal(true);

  ngOnInit(): void {
    const cId = this.appState.commerce()?.id;
    const id  = this.route.snapshot.paramMap.get('id')!;
    if (!cId) { this.loading.set(false); return; }
    this.svc.getById(cId, id).subscribe({
      next: s => { this.supplier.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}