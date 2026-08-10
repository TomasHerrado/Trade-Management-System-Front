import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private svc    = inject(ProductService);
  private route  = inject(ActivatedRoute);
  appState       = inject(AppStateService);

  product     = signal<Product | null>(null);
  variants    = signal<ProductVariant[]>([]);
  loading     = signal(true);
  error       = signal('');
  deactivatingId = signal<string | null>(null);

  productId = '';

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('productId')!;
    const cId = this.appState.commerce()?.id;
    if (!cId || !this.productId) { this.loading.set(false); return; }

    this.svc.getById(cId, this.productId).subscribe(p => this.product.set(p));
    this.loadVariants(cId);
  }

  private loadVariants(cId: string): void {
    this.loading.set(true);
    this.svc.getVariants(cId, this.productId).subscribe({
      next: d => { this.variants.set(d); this.loading.set(false); },
      error: () => { this.error.set('No se pudieron cargar las variantes'); this.loading.set(false); }
    });
  }

  deactivate(variant: ProductVariant): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) return;
    if (!confirm(`¿Desactivar la variante "${variant.name}"?`)) return;

    this.deactivatingId.set(variant.id);
    this.svc.deactivateVariant(cId, this.productId, variant.id).subscribe({
      next: () => {
        this.variants.update(list =>
          list.map(v => v.id === variant.id ? { ...v, status: 'INACTIVE' } : v)
        );
        this.deactivatingId.set(null);
      },
      error: () => {
        this.error.set('No se pudo desactivar la variante');
        this.deactivatingId.set(null);
      }
    });
  }

  margin(v: ProductVariant): number {
    if (!v.cost) return 0;
    return ((v.price - v.cost) / v.cost) * 100;
  }
}