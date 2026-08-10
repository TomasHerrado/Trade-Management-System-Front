import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { AppStateService } from '../../../core/services/app-state';

@Component({
  selector: 'app-variant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './variant-form.html',
})
export class VariantForm implements OnInit {
  private svc    = inject(ProductService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private fb     = inject(FormBuilder);
  appState       = inject(AppStateService);

  loading      = signal(false);
  loadingData  = signal(false);
  error        = signal('');
  isEditMode   = signal(false);

  productId = '';
  variantId: string | null = null;

  form = this.fb.group({
    name:  ['', Validators.required],
    sku:   [''],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    cost:  [null as number | null, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('productId')!;
    this.variantId = this.route.snapshot.paramMap.get('variantId');

    if (this.variantId) {
      this.isEditMode.set(true);
      this.loadVariant();
    }
  }

  private loadVariant(): void {
    const cId = this.appState.commerce()?.id;
    if (!cId || !this.variantId) return;

    this.loadingData.set(true);
    this.svc.getVariants(cId, this.productId).subscribe({
      next: (variants) => {
        const v = variants.find(x => x.id === this.variantId);
        if (v) {
          this.form.patchValue({
            name: v.name,
            sku: v.sku ?? '',
            price: v.price,
            cost: v.cost,
          });
        } else {
          this.error.set('No se encontró la variante');
        }
        this.loadingData.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la variante');
        this.loadingData.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const cId = this.appState.commerce()?.id;
    if (!cId) { this.error.set('Seleccioná un comercio'); return; }

    this.loading.set(true);
    this.error.set('');

    const req = this.form.value as any;

    const obs = this.isEditMode()
      ? this.svc.updateVariant(cId, this.productId, this.variantId!, req)
      : this.svc.createVariant(cId, this.productId, req);

    obs.subscribe({
      next: () => this.router.navigate(['/products', this.productId, 'variants']),
      error: e => {
        this.error.set(e.error?.message ?? (this.isEditMode() ? 'Error al actualizar' : 'Error al crear'));
        this.loading.set(false);
      }
    });
  }
}