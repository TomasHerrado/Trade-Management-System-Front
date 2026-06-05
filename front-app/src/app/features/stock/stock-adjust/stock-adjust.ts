import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { StockService } from '../../../core/services/stock';
import { AppStateService } from '../../../core/services/app-state';
import { StockMovementType } from '../../../core/models/stock.model';

@Component({
  selector: 'app-stock-adjust',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './stock-adjust.html',
})
export class StockAdjust implements OnInit {
  private svc    = inject(StockService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private fb     = inject(FormBuilder);
  appState       = inject(AppStateService);

  loading    = signal(false);
  error      = signal('');
  variantId  = signal('');
  variantName = signal('');

  types: { value: StockMovementType; label: string; emoji: string }[] = [
    { value: 'ADJUSTMENT', label: 'Ajuste manual', emoji: '🔧' },
    { value: 'TRANSFER',   label: 'Transferencia', emoji: '🔄' },
  ];

  form = this.fb.group({
    type:     ['ADJUSTMENT' as StockMovementType, Validators.required],
    quantity: [null as number | null, [Validators.required]],
    note:     [''],
  });

  ngOnInit(): void {
    this.variantId.set(this.route.snapshot.paramMap.get('variantId') ?? '');
    this.variantName.set(
      this.route.snapshot.queryParamMap.get('name') ?? 'Variante'
    );
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const bId = this.appState.branch()?.id;
    if (!bId) { this.error.set('Seleccioná una sucursal'); return; }
    this.loading.set(true);
    this.svc.adjust(bId, this.variantId(), this.form.value as any).subscribe({
      next: () => this.router.navigate(['/stock']),
      error: e => { this.error.set(e.error?.message ?? 'Error'); this.loading.set(false); }
    });
  }
}