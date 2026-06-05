import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SupplierService } from '../../../core/services/supplier';
import { AppStateService } from '../../../core/services/app-state';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './supplier-form.html',
})
export class SupplierForm implements OnInit {
  private svc    = inject(SupplierService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private fb     = inject(FormBuilder);
  appState       = inject(AppStateService);

  loading = signal(false);
  error   = signal('');
  editId  = signal<string | null>(null);

  form = this.fb.group({
    name:        ['', Validators.required],
    contactName: [''],
    email:       [''],
    phone:       [''],
    address:     [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      const cId = this.appState.commerce()?.id!;
      this.svc.getById(cId, id).subscribe(s => this.form.patchValue(s));
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
      next: () => this.router.navigate(['/suppliers']),
      error: e => { this.error.set(e.error?.message ?? 'Error'); this.loading.set(false); }
    });
  }
}