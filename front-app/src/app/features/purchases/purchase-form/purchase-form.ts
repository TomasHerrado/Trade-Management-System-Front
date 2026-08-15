import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PurchaseService } from '../../../core/services/purchase';
import { ProductService } from '../../../core/services/product';
import { SupplierService } from '../../../core/services/supplier';
import { AppStateService } from '../../../core/services/app-state';
import { ProductVariant } from '../../../core/models/product.model';
import { Supplier } from '../../../core/models/supplier.model';
import { PurchaseItemRequest, PaymentType } from '../../../core/models/purchase.model';

interface CartItem { variant: ProductVariant; qty: number; unitCost: number; }

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './purchase-form.html',
})
export class PurchaseForm implements OnInit {
  private purchaseSvc  = inject(PurchaseService);
  private productSvc   = inject(ProductService);
  private supplierSvc  = inject(SupplierService);
  appState             = inject(AppStateService);
  private router       = inject(Router);
  private fb           = inject(FormBuilder);

  variants   = signal<ProductVariant[]>([]);
  suppliers  = signal<Supplier[]>([]);
  cart       = signal<CartItem[]>([]);
  loading    = signal(true);
  saving     = signal(false);
  error      = signal('');
  search     = signal('');

  supplierId  = signal<string | null>(null);
  paymentType = signal<PaymentType>('CASH');
  note        = signal('');
  editingQty: Record<string, string> = {};

  paymentOptions: { value: PaymentType; label: string }[] = [
    { value: 'CASH', label: 'Efectivo' },
    { value: 'CARD', label: 'Tarjeta' },
    { value: 'TRANSFER', label: 'Transferencia' },
    { value: 'MIXED', label: 'Mixto' },
    { value: 'ACCOUNT', label: 'Cuenta corriente (queda a deber)' },
  ];

  // Para editar el costo de cada item en carrito
  editingCost: Record<string, string> = {};

  total = computed(() =>
    this.cart().reduce((s, i) => s + i.unitCost * i.qty, 0)
  );

  filteredVariants() {
    const q = this.search().toLowerCase();
    return this.variants().filter(v =>
      v.productName.toLowerCase().includes(q) || v.name.toLowerCase().includes(q)
    );
  }

  ngOnInit(): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) { this.loading.set(false); return; }
    this.supplierSvc.getByCommerce(cId).subscribe(d => this.suppliers.set(d));
    this.loading.set(false); // ya no esperamos variantes acá
  }

  onSupplierChange(id: string | null): void {
    this.supplierId.set(id);
    this.cart.set([]);
    this.editingCost = {};
    this.editingQty = {};
    this.variants.set([]);
    if (!id) return;

    const cId = this.appState.commerce()?.id;
    if (!cId) return;

    this.loading.set(true);
    this.productSvc.getByCommerce(cId, id).subscribe(products => {
      const calls = products.map(p => this.productSvc.getVariants(cId, p.id));
      if (calls.length === 0) { this.variants.set([]); this.loading.set(false); return; }
      let done = 0;
      const all: ProductVariant[] = [];
      calls.forEach(obs => obs.subscribe(vv => {
        all.push(...vv);
        done++;
        if (done === calls.length) { this.variants.set(all); this.loading.set(false); }
      }));
    });
  }

  addToCart(v: ProductVariant): void {
    const existing = this.cart().find(i => i.variant.id === v.id);
    if (existing) {
      const qty = existing.qty + 1;
      this.cart.update(c => c.map(i => i.variant.id === v.id ? { ...i, qty } : i));
      this.editingQty[v.id] = String(qty);
    } else {
      this.cart.update(c => [...c, { variant: v, qty: 1, unitCost: Number(v.cost) }]);
      this.editingCost[v.id] = String(v.cost);
      this.editingQty[v.id] = '1';
    }
  }

  updateQty(id: string, qty: number): void {
    if (qty < 1) { this.removeFromCart(id); return; }
    this.cart.update(c => c.map(i => i.variant.id === id ? { ...i, qty } : i));
    this.editingQty[id] = String(qty);
  }

  onQtyInput(id: string, value: string): void {
    this.editingQty[id] = value;
    const val = parseInt(value, 10);
    if (!isNaN(val) && val >= 1) {
      this.cart.update(c => c.map(i => i.variant.id === id ? { ...i, qty: val } : i));
    }
  }

  onQtyBlur(id: string): void {
    const item = this.cart().find(i => i.variant.id === id);
    if (!item) return;
    const val = parseInt(this.editingQty[id], 10);
    if (isNaN(val) || val < 1) {
      this.editingQty[id] = String(item.qty);
    }
  }

  updateCost(id: string, cost: string): void {
    this.editingCost[id] = cost;
    const val = parseFloat(cost);
    if (!isNaN(val) && val >= 0) {
      this.cart.update(c => c.map(i => i.variant.id === id ? { ...i, unitCost: val } : i));
    }
  }

  removeFromCart(id: string): void {
    this.cart.update(c => c.filter(i => i.variant.id !== id));
    delete this.editingCost[id];
    delete this.editingQty[id];
  }

  submit(): void {
    if (this.cart().length === 0) { this.error.set('Agregá al menos un producto'); return; }
    if (!this.supplierId()) { this.error.set('Seleccioná un proveedor'); return; }
    const bId = this.appState.branch()?.id;
    if (!bId) { this.error.set('Seleccioná una sucursal'); return; }
    this.saving.set(true);
    const items: PurchaseItemRequest[] = this.cart().map(i => ({
      productVariantId: i.variant.id,
      quantity: i.qty,
      unitCost: i.unitCost
    }));
    this.purchaseSvc.create(bId, {
      supplierId: this.supplierId()!,
      paymentType: this.paymentType(),
      items,
      note: this.note() || undefined
    }).subscribe({
      next: () => this.router.navigate(['/purchases']),
      error: e => { this.error.set(e.error?.message ?? 'Error al registrar'); this.saving.set(false); }
    });
  }
}