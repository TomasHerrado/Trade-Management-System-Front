import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { AppStateService } from '../../../core/services/app-state';
import { Product, ProductVariant, Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit {
  private svc  = inject(ProductService);
  appState     = inject(AppStateService);

  products   = signal<Product[]>([]);
  variants   = signal<Record<string, ProductVariant[]>>({});
  categories = signal<Category[]>([]);
  loading    = signal(true);
  expanded   = signal<string | null>(null);
  search     = signal('');
  deletingId = signal<string | null>(null);
  error      = signal('');

  ngOnInit(): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) { this.loading.set(false); return; }
    this.svc.getByCommerce(cId).subscribe({
      next: d => { this.products.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.svc.getCategories(cId).subscribe(d => this.categories.set(d));
  }

  toggleExpand(id: string): void {
    if (this.expanded() === id) { this.expanded.set(null); return; }
    this.expanded.set(id);
    const cId = this.appState.commerce()?.id;
    if (!cId || this.variants()[id]) return;
    this.svc.getVariants(cId, id).subscribe(d => {
      this.variants.update(v => ({ ...v, [id]: d }));
    });
  }

  deleteProduct(product: Product): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) return;
    if (!confirm(`¿Eliminar el producto "${product.name}"? Esta acción lo desactiva y ya no aparecerá disponible.`)) return;

    this.deletingId.set(product.id);
    this.error.set('');

    this.svc.deactivate(cId, product.id).subscribe({
      next: () => {
        this.products.update(list =>
          list.map(p => p.id === product.id ? { ...p, status: 'INACTIVE' } : p)
        );
        this.deletingId.set(null);
      },
      error: () => {
        this.error.set('No se pudo eliminar el producto');
        this.deletingId.set(null);
      }
    });
  }

  filteredProducts() {
    const q = this.search().toLowerCase();
    return this.products().filter(p => p.name.toLowerCase().includes(q));
  }
}