import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BranchService } from '../../../core/services/branch';
import { AppStateService } from '../../../core/services/app-state';
import { Branch } from '../../../core/models/branch.model';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './branch-list.html',
})
export class BranchList implements OnInit {
  private svc      = inject(BranchService);
  private route    = inject(ActivatedRoute);
  appState         = inject(AppStateService);
  private fb       = inject(FormBuilder);

  commerceId = '';
  branches   = signal<Branch[]>([]);
  loading    = signal(true);
  showForm   = signal(false);
  saving     = signal(false);

  form = this.fb.group({
    name:    ['', Validators.required],
    address: [''],
    phone:   [''],
  });

  ngOnInit(): void {
    this.commerceId = this.route.snapshot.paramMap.get('commerceId') ?? '';
    this.load();
  }

  load(): void {
    this.svc.getByCommerce(this.commerceId).subscribe({
      next: d => { this.branches.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.svc.create(this.commerceId, this.form.value as any).subscribe({
      next: () => { this.showForm.set(false); this.form.reset(); this.saving.set(false); this.load(); },
      error: () => this.saving.set(false)
    });
  }

  selectBranch(b: Branch): void {
    this.appState.setBranch(b);
  }

  isActive(b: Branch): boolean {
    return this.appState.branch()?.id === b.id;
  }
}