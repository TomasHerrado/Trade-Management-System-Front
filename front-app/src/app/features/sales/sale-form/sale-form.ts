import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SaleService } from '../../../core/services/sale';
import { ProductService } from '../../../core/services/product';
import { CustomerService } from '../../../core/services/customer';
import { AppStateService } from '../../../core/services/app-state';
import { ProductVariant } from '../../../core/models/product.model';
import { Customer } from '../../../core/models/customer.model';
import { PaymentType, SaleItemRequest } from '../../../core/models/sale.model';

interface CartItem { variant: ProductVariant; qty: number; }

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sale-form.html',
})
export class SaleForm implements OnInit {
  private saleSvc      = inject(SaleService);
  private productSvc   = inject(ProductService);
  private customerSvc  = inject(CustomerService);
  appState             = inject(AppStateService);
  private router       = inject(Router);

  variants   = signal<ProductVariant[]>([]);
  customers  = signal<Customer[]>([]);
  cart       = signal<CartItem[]>([]);
  loading    = signal(true);
  saving     = signal(false);
  error      = signal('');
  search     = signal('');

  paymentType = signal<PaymentType>('CASH');
  customerId  = signal<string | null>(null);
  note        = signal('');

  paymentTypes: { value: PaymentType; label: string; emoji: string }[] = [
    { value: 'CASH',     label: 'Efectivo',     emoji: '💵' },
    { value: 'CARD',     label: 'Tarjeta',      emoji: '💳' },
    { value: 'TRANSFER', label: 'Transferencia',emoji: '🏦' },
    { value: 'ACCOUNT',  label: 'Fiado',        emoji: '📒' },
  ];

  total = computed(() =>
    this.cart().reduce((s, i) => s + i.variant.price * i.qty, 0)
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

    this.customerSvc.getByCommerce(cId).subscribe(d => this.customers.set(d));
  }

  addToCart(v: ProductVariant): void {
    const existing = this.cart().find(i => i.variant.id === v.id);
    if (existing) {
      this.cart.update(c => c.map(i => i.variant.id === v.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      this.cart.update(c => [...c, { variant: v, qty: 1 }]);
    }
  }

  updateQty(id: string, qty: number): void {
    if (qty < 1) { this.removeFromCart(id); return; }
    this.cart.update(c => c.map(i => i.variant.id === id ? { ...i, qty } : i));
  }

  removeFromCart(id: string): void {
    this.cart.update(c => c.filter(i => i.variant.id !== id));
  }

  submit(): void {
    if (this.cart().length === 0) { this.error.set('Agregá al menos un producto'); return; }
    const bId = this.appState.branch()?.id;
    if (!bId) { this.error.set('Seleccioná una sucursal'); return; }
    this.saving.set(true);
    const items: SaleItemRequest[] = this.cart().map(i => ({
      productVariantId: i.variant.id, quantity: i.qty
    }));
    this.saleSvc.create(bId, {
      paymentType: this.paymentType(),
      customerId: this.customerId() ?? undefined,
      items,
      note: this.note() || undefined
    }).subscribe({
      next: () => this.router.navigate(['/sales']),
      error: e => { this.error.set(e.error?.message ?? 'Error al registrar'); this.saving.set(false); }
    });
  }
}