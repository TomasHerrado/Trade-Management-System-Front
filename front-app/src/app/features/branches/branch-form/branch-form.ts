import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BranchService } from '../../../core/services/branch';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './branch-form.html',
})
export class BranchForm implements OnInit {
  private svc     = inject(BranchService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);
  private fb      = inject(FormBuilder);

  commerceId = '';
  branchId   = '';
  loading    = signal(false);
  loadingData = signal(true);
  error      = signal('');

  form = this.fb.group({
    name:    ['', Validators.required],
    address: [''],
    phone:   [''],
  });

  ngOnInit(): void {
    this.commerceId = this.route.snapshot.paramMap.get('commerceId') ?? '';
    this.branchId   = this.route.snapshot.paramMap.get('id') ?? '';

    this.svc.getById(this.commerceId, this.branchId).subscribe({
      next: b => {
        this.form.patchValue(b);
        this.loadingData.set(false);
      },
      error: () => this.loadingData.set(false)
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.svc.update(this.commerceId, this.branchId, this.form.value as any).subscribe({
      next: () => this.router.navigate(['/commerces', this.commerceId, 'branches']),
      error: e => { this.error.set(e.error?.message ?? 'Error al guardar'); this.loading.set(false); }
    });
  }
}