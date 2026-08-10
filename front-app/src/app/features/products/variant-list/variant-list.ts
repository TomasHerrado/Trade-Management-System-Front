import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { AppStateService } from '../../../core/services/app-state';
import { Product, ProductVariant } from '../../../core/models/product.model';

@Component({
  selector: 'app-variant-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './variant-list.html',
})
export class VariantList implements OnInit {
  private svc   = inject(ProductService);
  private route = inject(ActivatedRoute);
  appState      = inject(AppStateService);

  productId = this.route.snapshot.paramMap.get('productId')!;

  product    = signal<Product | null>(null);
  variants   = signal<ProductVariant[]>([]);
  loading    = signal(true);
  deletingId = signal<string | null>(null);
  activatingId = signal<string | null>(null);
  confirmingVariant = signal<ProductVariant | null>(null);
  error      = signal('');

  ngOnInit(): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) { this.loading.set(false); return; }

    this.svc.getById(cId, this.productId).subscribe(p => this.product.set(p));
    this.svc.getVariants(cId, this.productId).subscribe({
      next: d => { this.variants.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  margin(v: ProductVariant): number {
    if (!v.price) return 0;
    return ((v.price - v.cost) / v.price) * 100;
  }

  openDeleteConfirm(variant: ProductVariant): void {
    this.confirmingVariant.set(variant);
  }

  closeDeleteConfirm(): void {
    this.confirmingVariant.set(null);
  }

  confirmDeactivate(): void {
    const variant = this.confirmingVariant();
    const cId = this.appState.commerce()?.id;
    if (!variant || !cId) return;

    this.confirmingVariant.set(null);
    this.deletingId.set(variant.id);
    this.error.set('');

    this.svc.deactivateVariant(cId, this.productId, variant.id).subscribe({
      next: () => {
        this.variants.update(list =>
          list.map(v => v.id === variant.id ? { ...v, status: 'INACTIVE' } : v)
        );
        this.deletingId.set(null);
      },
      error: () => {
        this.error.set('No se pudo desactivar la variante');
        this.deletingId.set(null);
      }
    });
  }

  confirmDelete(): void {
    const variant = this.confirmingVariant();
    const cId = this.appState.commerce()?.id;
    if (!variant || !cId) return;

    this.confirmingVariant.set(null);
    this.deletingId.set(variant.id);
    this.error.set('');

    this.svc.deleteVariant(cId, this.productId, variant.id).subscribe({
      next: () => {
        this.variants.update(list => list.filter(v => v.id !== variant.id));
        this.deletingId.set(null);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'No se pudo eliminar la variante');
        this.deletingId.set(null);
      }
    });
  }

  activateVariant(variant: ProductVariant): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) return;

    this.activatingId.set(variant.id);
    this.error.set('');

    this.svc.activateVariant(cId, this.productId, variant.id).subscribe({
      next: () => {
        this.variants.update(list =>
          list.map(v => v.id === variant.id ? { ...v, status: 'ACTIVE' } : v)
        );
        this.activatingId.set(null);
      },
      error: () => {
        this.error.set('No se pudo activar la variante');
        this.activatingId.set(null);
      }
    });
  }
}