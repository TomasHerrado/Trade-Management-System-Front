import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { SupplierService } from '../../../core/services/supplier';
import { AppStateService } from '../../../core/services/app-state';
import { Product, ProductVariant, Category, PriceUpdateTarget } from '../../../core/models/product.model';
import { Supplier } from '../../../core/models/supplier.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit {
  private svc         = inject(ProductService);
  private supplierSvc = inject(SupplierService);
  appState            = inject(AppStateService);

  products         = signal<Product[]>([]);
  variants         = signal<Record<string, ProductVariant[]>>({});
  categories       = signal<Category[]>([]);
  suppliers        = signal<Supplier[]>([]);
  loading          = signal(true);
  expanded         = signal<string | null>(null);
  search           = signal('');
  deletingId       = signal<string | null>(null);
  activatingId     = signal<string | null>(null);
  confirmingProduct = signal<Product | null>(null);
  error            = signal('');

  // Actualización masiva de precios
  showBulkUpdate   = signal(false);
  bulkSupplierId   = signal<string | null>(null);
  bulkPercentage   = signal<number | null>(null);
  bulkTarget       = signal<PriceUpdateTarget>('PRICE');
  bulkSaving       = signal(false);
  bulkError        = signal('');
  bulkResult       = signal<string | null>(null);

  readonly bulkTargetOptions: { value: PriceUpdateTarget; label: string }[] = [
    { value: 'PRICE', label: 'Precio de venta' },
    { value: 'COST',  label: 'Costo' },
    { value: 'BOTH',  label: 'Ambos' },
  ];

  ngOnInit(): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) { this.loading.set(false); return; }
    this.loadProducts();
    this.svc.getCategories(cId).subscribe(d => this.categories.set(d));
    this.supplierSvc.getByCommerce(cId).subscribe(d => this.suppliers.set(d));
  }

  private loadProducts(): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) return;
    this.loading.set(true);
    this.svc.getByCommerce(cId).subscribe({
      next: d => { this.products.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
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

  openDeleteConfirm(product: Product): void {
    this.confirmingProduct.set(product);
  }

  closeDeleteConfirm(): void {
    this.confirmingProduct.set(null);
  }

  confirmDeactivate(): void {
    const product = this.confirmingProduct();
    const cId = this.appState.commerce()?.id;
    if (!product || !cId) return;

    this.confirmingProduct.set(null);
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
        this.error.set('No se pudo desactivar el producto');
        this.deletingId.set(null);
      }
    });
  }
  activateProduct(product: Product): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) return;

    this.activatingId.set(product.id);
    this.error.set('');

    this.svc.activate(cId, product.id).subscribe({
      next: () => {
        this.products.update(list =>
          list.map(p => p.id === product.id ? { ...p, status: 'ACTIVE' } : p)
        );
        this.activatingId.set(null);
      },
      error: () => {
        this.error.set('No se pudo activar el producto');
        this.activatingId.set(null);
      }
    });
  }

  confirmDelete(): void {
    const product = this.confirmingProduct();
    const cId = this.appState.commerce()?.id;
    if (!product || !cId) return;

    this.confirmingProduct.set(null);
    this.deletingId.set(product.id);
    this.error.set('');

    this.svc.delete(cId, product.id).subscribe({
      next: () => {
        this.products.update(list => list.filter(p => p.id !== product.id));
        this.deletingId.set(null);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'No se pudo eliminar el producto');
        this.deletingId.set(null);
      }
    });
  }

  filteredProducts() {
    const q = this.search().toLowerCase();
    return this.products().filter(p => p.name.toLowerCase().includes(q));
  }

  // ── Actualización masiva de precios ──────────────────────────────

  openBulkUpdate(): void {
    this.bulkSupplierId.set(null);
    this.bulkPercentage.set(null);
    this.bulkTarget.set('PRICE');
    this.bulkError.set('');
    this.bulkResult.set(null);
    this.showBulkUpdate.set(true);
  }

  closeBulkUpdate(): void {
    if (this.bulkSaving()) return;
    this.showBulkUpdate.set(false);
  }

  submitBulkUpdate(): void {
    const cId = this.appState.commerce()?.id;
    const supplierId = this.bulkSupplierId();
    const percentage = this.bulkPercentage();

    if (!cId) return;
    if (!supplierId) { this.bulkError.set('Seleccioná un proveedor'); return; }
    if (percentage === null || percentage === undefined || isNaN(percentage) || percentage === 0) {
      this.bulkError.set('Ingresá un porcentaje válido (puede ser negativo)');
      return;
    }

    this.bulkSaving.set(true);
    this.bulkError.set('');
    this.bulkResult.set(null);

    this.svc.bulkPriceUpdate(cId, {
      supplierId,
      percentage,
      applyTo: this.bulkTarget(),
    }).subscribe({
      next: (res) => {
        this.bulkSaving.set(false);
        this.bulkResult.set(`Se actualizaron ${res.updatedCount} variante${res.updatedCount === 1 ? '' : 's'}.`);
        // Limpiamos el cache de variantes expandidas para que la próxima vez
        // que se abran muestren los precios actualizados.
        this.variants.set({});
        this.expanded.set(null);
      },
      error: e => {
        this.bulkError.set(e.error?.message ?? 'Error al actualizar los precios');
        this.bulkSaving.set(false);
      }
    });
  }

  supplierName(id: string | null): string {
    if (!id) return '';
    return this.suppliers().find(s => s.id === id)?.name ?? '';
  }
}