import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer';
import { SaleService } from '../../../core/services/sale';
import { AppStateService } from '../../../core/services/app-state';
import { CustomerAccount as CustomerAccountModel } from '../../../core/models/customer.model';
import { Sale } from '../../../core/models/sale.model';

@Component({
  selector: 'app-customer-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-account.html',
})
export class CustomerAccount implements OnInit{
  private customerSvc = inject(CustomerService);
  private saleSvc     = inject(SaleService);
  private route       = inject(ActivatedRoute);
  appState            = inject(AppStateService);
  private fb          = inject(FormBuilder);

  account  = signal<CustomerAccountModel | null>(null);
  sales    = signal<Sale[]>([]);
  loading  = signal(true);
  saving   = signal(false);
  error    = signal('');
  success  = signal('');

  paymentForm = this.fb.group({
    amount:      [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: [''],
  });

  ngOnInit(): void {
    const customerId = this.route.snapshot.paramMap.get('id')!;
    const cId = this.appState.commerce()?.id!;
    const bId = this.appState.branch()?.id!;

    this.customerSvc.getAccount(cId, customerId).subscribe({
      next: a => { this.account.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });

    if (bId) {
      this.saleSvc.getByCustomer(bId, customerId).subscribe(d => this.sales.set(d));
    }
  }

  registerPayment(): void {
    if (this.paymentForm.invalid) return;
    const customerId = this.route.snapshot.paramMap.get('id')!;
    const cId = this.appState.commerce()?.id!;
    const bId = this.appState.branch()?.id!;
    this.saving.set(true);
    this.error.set('');

    this.customerSvc.registerPayment(cId, customerId, bId, this.paymentForm.value as any).subscribe({
      next: a => {
        this.account.set(a);
        this.saving.set(false);
        this.success.set('Pago registrado correctamente');
        this.paymentForm.reset();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: e => { this.error.set(e.error?.message ?? 'Error'); this.saving.set(false); }
    });
  }
}
