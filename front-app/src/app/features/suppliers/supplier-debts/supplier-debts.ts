import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupplierService } from '../../../core/services/supplier';
import { PurchaseService } from '../../../core/services/purchase';
import { AppStateService } from '../../../core/services/app-state';
import { Supplier } from '../../../core/models/supplier.model';
import { Purchase } from '../../../core/models/purchase.model';

@Component({
  selector: 'app-supplier-debts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './supplier-debts.html',
})
export class SupplierDebts implements OnInit {
  private supplierSvc = inject(SupplierService);
  private purchaseSvc = inject(PurchaseService);
  private route        = inject(ActivatedRoute);
  appState             = inject(AppStateService);

  supplier  = signal<Supplier | null>(null);
  purchases = signal<Purchase[]>([]);
  loading   = signal(true);

  showPayForm = signal(false);
  payAmount   = signal(0);
  payNote     = signal('');
  paying      = signal(false);
  payError    = signal('');

  ngOnInit(): void {
    const cId = this.appState.commerce()?.id;
    const bId = this.appState.branch()?.id;
    const id  = this.route.snapshot.paramMap.get('id')!;
    if (!cId) { this.loading.set(false); return; }

    this.supplierSvc.getById(cId, id).subscribe(s => {
      this.supplier.set(s);
      this.payAmount.set(s.debt);
    });

    if (!bId) { this.loading.set(false); return; }
    this.purchaseSvc.getBySupplier(bId, id).subscribe({
      next: d => { this.purchases.set(d.reverse()); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openPayForm(): void {
    const s = this.supplier();
    if (s) this.payAmount.set(s.debt);
    this.payError.set('');
    this.showPayForm.set(true);
  }

  settleDebt(): void {
    const s = this.supplier();
    const cId = this.appState.commerce()?.id;
    const bId = this.appState.branch()?.id;
    if (!s || !cId) return;
    if (!bId) { this.payError.set('Seleccioná una sucursal para registrar el pago'); return; }
    if (this.payAmount() <= 0) { this.payError.set('Ingresá un monto válido'); return; }
    if (this.payAmount() > s.debt) { this.payError.set('El pago no puede superar la deuda'); return; }

    this.paying.set(true);
    this.supplierSvc.registerPayment(cId, s.id, bId, {
      amount: this.payAmount(),
      description: this.payNote() || undefined
    }).subscribe({
      next: updated => {
        this.supplier.set(updated);
        this.paying.set(false);
        this.showPayForm.set(false);
        this.payNote.set('');
      },
      error: e => {
        this.payError.set(e.error?.message ?? 'Error al registrar el pago');
        this.paying.set(false);
      }
    });
  }
}