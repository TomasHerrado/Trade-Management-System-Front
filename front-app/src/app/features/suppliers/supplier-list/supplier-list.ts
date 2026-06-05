import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SupplierService } from '../../../core/services/supplier';
import { AppStateService } from '../../../core/services/app-state';
import { Supplier } from '../../../core/models/supplier.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './supplier-list.html',
})
export class SupplierList implements OnInit {
  private svc  = inject(SupplierService);
  appState     = inject(AppStateService);
  private fb   = inject(FormBuilder);

  suppliers = signal<Supplier[]>([]);
  loading   = signal(true);
  showForm  = signal(false);
  saving    = signal(false);

  form = this.fb.group({
    name:        ['', Validators.required],
    contactName: [''],
    email:       [''],
    phone:       [''],
  });

  ngOnInit(): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) { this.loading.set(false); return; }
    this.load();
  }

  load(): void {
    const cId = this.appState.commerce()!.id;
    this.svc.getByCommerce(cId).subscribe({
      next: d => { this.suppliers.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const cId = this.appState.commerce()!.id;
    this.saving.set(true);
    this.svc.create(cId, this.form.value as any).subscribe({
      next: () => { this.showForm.set(false); this.form.reset(); this.saving.set(false); this.load(); },
      error: () => this.saving.set(false)
    });
  }

  totalDebt(): number {
    return this.suppliers().reduce((s, sup) => s + sup.debt, 0);
  }
}