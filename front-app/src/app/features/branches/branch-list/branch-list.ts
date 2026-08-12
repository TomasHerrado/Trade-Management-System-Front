import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BranchService } from '../../../core/services/branch';
import { AppStateService } from '../../../core/services/app-state';
import { RoleService } from '../../../core/services/role';
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
  role             = inject(RoleService);
  private fb       = inject(FormBuilder);

  commerceId = '';
  branches   = signal<Branch[]>([]);
  loading    = signal(true);
  showForm   = signal(false);
  saving     = signal(false);

  deletingId       = signal<string | null>(null);
  activatingId     = signal<string | null>(null);
  confirmingBranch = signal<Branch | null>(null);
  error            = signal('');

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
      next: d => {
        const filtered = this.role.isEmployee()
          ? d.filter(b => this.role.myBranches().some(mb => mb.id === b.id))
          : d;
        this.branches.set(filtered);
        this.loading.set(false);
      },
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
    if (b.status !== 'ACTIVE') return;
    this.appState.setBranch(b);
  }

  isSelected(b: Branch): boolean {
    return this.appState.branch()?.id === b.id;
  }

  openDeleteConfirm(b: Branch, event: Event): void {
    event.stopPropagation();
    this.confirmingBranch.set(b);
  }

  closeDeleteConfirm(): void {
    this.confirmingBranch.set(null);
  }

  confirmDeactivate(): void {
    const b = this.confirmingBranch();
    if (!b) return;

    this.confirmingBranch.set(null);
    this.deletingId.set(b.id);
    this.error.set('');

    this.svc.deactivate(this.commerceId, b.id).subscribe({
      next: () => {
        if (this.appState.branch()?.id === b.id) this.appState.clearBranch();
        this.branches.update(list =>
          list.map(x => x.id === b.id ? { ...x, status: 'INACTIVE' } : x)
        );
        this.deletingId.set(null);
      },
      error: () => {
        this.error.set('No se pudo desactivar la sucursal');
        this.deletingId.set(null);
      }
    });
  }

  confirmDelete(): void {
    const b = this.confirmingBranch();
    if (!b) return;

    this.confirmingBranch.set(null);
    this.deletingId.set(b.id);
    this.error.set('');

    this.svc.delete(this.commerceId, b.id).subscribe({
      next: () => {
        if (this.appState.branch()?.id === b.id) this.appState.clearBranch();
        this.branches.update(list => list.filter(x => x.id !== b.id));
        this.deletingId.set(null);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'No se pudo eliminar la sucursal');
        this.deletingId.set(null);
      }
    });
  }

  activateBranch(b: Branch, event: Event): void {
    event.stopPropagation();
    this.activatingId.set(b.id);
    this.error.set('');

    this.svc.activate(this.commerceId, b.id).subscribe({
      next: () => {
        this.branches.update(list =>
          list.map(x => x.id === b.id ? { ...x, status: 'ACTIVE' } : x)
        );
        this.activatingId.set(null);
      },
      error: () => {
        this.error.set('No se pudo activar la sucursal');
        this.activatingId.set(null);
      }
    });
  }
}