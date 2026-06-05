import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer';
import { AppStateService } from '../../../core/services/app-state';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.html',
})
export class CustomerForm implements OnInit {
  private svc      = inject(CustomerService);
  private router   = inject(Router);
  private route    = inject(ActivatedRoute);
  private fb       = inject(FormBuilder);
  appState         = inject(AppStateService);

  loading  = signal(false);
  error    = signal('');
  editId   = signal<string | null>(null);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     [''],
    phone:     [''],
    address:   [''],
    dni:       [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      const cId = this.appState.commerce()?.id!;
      this.svc.getById(cId, id).subscribe(c => {
        this.form.patchValue(c);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const cId = this.appState.commerce()?.id;
    if (!cId) { this.error.set('Seleccioná un comercio'); return; }
    this.loading.set(true);

    const obs = this.editId()
      ? this.svc.update(cId, this.editId()!, this.form.value as any)
      : this.svc.create(cId, this.form.value as any);

    obs.subscribe({
      next: () => this.router.navigate(['/customers']),
      error: e => { this.error.set(e.error?.message ?? 'Error'); this.loading.set(false); }
    });
  }
}
