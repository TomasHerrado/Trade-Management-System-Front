import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { AppStateService } from '../../../core/services/app-state';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
})
export class ProductForm implements OnInit {
  private svc    = inject(ProductService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);
  appState       = inject(AppStateService);

  loading  = signal(false);
  error    = signal('');
  categories = signal<any[]>([]);

  form = this.fb.group({
    name:        ['', Validators.required],
    description: [''],
    categoryId:  [null as string | null],
  });

  variantsForm = this.fb.array([
    this.newVariantGroup()
  ]);

  ngOnInit(): void {
    const cId = this.appState.commerce()?.id;
    if (cId) {
      this.svc.getCategories(cId).subscribe(d => this.categories.set(d));
    }
  }

  newVariantGroup() {
    return this.fb.group({
      name:  ['DEFAULT', Validators.required],
      sku:   [''],
      price: [null as number | null, [Validators.required, Validators.min(0.01)]],
      cost:  [null as number | null, [Validators.required, Validators.min(0)]],
    });
  }

  get variants() { return this.variantsForm; }

  addVariant(): void {
    this.variantsForm.push(this.newVariantGroup());
  }

  removeVariant(i: number): void {
    if (this.variantsForm.length > 1) this.variantsForm.removeAt(i);
  }

  submit(): void {
    if (this.form.invalid || this.variantsForm.invalid) {
      this.form.markAllAsTouched();
      this.variantsForm.markAllAsTouched();
      return;
    }
    const cId = this.appState.commerce()?.id;
    if (!cId) { this.error.set('Seleccioná un comercio'); return; }
    this.loading.set(true);

    this.svc.create(cId, this.form.value as any).subscribe({
      next: (product) => {
        const calls = (this.variantsForm.value as any[]).map(v =>
          this.svc.createVariant(cId, product.id, v)
        );
        let done = 0;
        calls.forEach(obs => obs.subscribe({
          next: () => { done++; if (done === calls.length) this.router.navigate(['/products']); },
          error: () => { this.error.set('Producto creado pero falló alguna variante'); this.loading.set(false); }
        }));
      },
      error: e => { this.error.set(e.error?.message ?? 'Error'); this.loading.set(false); }
    });
  }
}