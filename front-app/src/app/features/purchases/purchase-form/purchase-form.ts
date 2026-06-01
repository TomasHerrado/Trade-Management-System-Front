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
import { PurchaseItemRequest } from '../../../core/models/purchase.model';

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
  note        = signal('');

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

    this.productSvc.getByCommerce(cId).subscribe(products => {
      const calls = products.map(p => this.productSvc.getVariants(cId, p.id));
      let done = 0;
      const all: ProductVariant[] = [];
      if (calls.length === 0) { this.loading.set(false); return; }
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
      this.cart.update(c => c.map(i => i.variant.id === v.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      this.cart.update(c => [...c, { variant: v, qty: 1, unitCost: Number(v.cost) }]);
      this.editingCost[v.id] = String(v.cost);
    }
  }

  updateQty(id: string, qty: number): void {
    if (qty < 1) { this.removeFromCart(id); return; }
    this.cart.update(c => c.map(i => i.variant.id === id ? { ...i, qty } : i));
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
      items,
      note: this.note() || undefined
    }).subscribe({
      next: () => this.router.navigate(['/purchases']),
      error: e => { this.error.set(e.error?.message ?? 'Error al registrar'); this.saving.set(false); }
    });
  }
}