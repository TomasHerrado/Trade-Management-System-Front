import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CustomerService } from '../../../core/services/customer';
import { AppStateService } from '../../../core/services/app-state';
import { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-list.html',
})
export class CustomerList implements OnInit {
  private svc  = inject(CustomerService);
  appState     = inject(AppStateService);
  private fb   = inject(FormBuilder);

  customers = signal<Customer[]>([]);
  loading   = signal(true);
  showForm  = signal(false);
  saving    = signal(false);
  search    = signal('');

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     [''],
    phone:     [''],
    dni:       [''],
  });

  ngOnInit(): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) { this.loading.set(false); return; }
    this.load();
  }

  load(): void {
    const cId = this.appState.commerce()?.id!;
    this.svc.getByCommerce(cId).subscribe({
      next: d => { this.customers.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const cId = this.appState.commerce()?.id!;
    this.saving.set(true);
    this.svc.create(cId, this.form.value as any).subscribe({
      next: () => { this.showForm.set(false); this.form.reset(); this.saving.set(false); this.load(); },
      error: () => this.saving.set(false)
    });
  }

  filtered() {
    const q = this.search().toLowerCase();
    return this.customers().filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || (c.dni ?? '').includes(q)
    );
  }
}