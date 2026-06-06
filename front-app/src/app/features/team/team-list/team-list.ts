import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TeamService } from '../../../core/services/team';
import { BranchService } from '../../../core/services/branch';
import { AppStateService } from '../../../core/services/app-state';
import { TeamMember, UserRole } from '../../../core/models/team.model';
import { Branch } from '../../../core/models/branch.model';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './team-list.html',
})
export class TeamList implements OnInit {
  private teamSvc   = inject(TeamService);
  private branchSvc = inject(BranchService);
  appState          = inject(AppStateService);
  private fb        = inject(FormBuilder);

  members  = signal<TeamMember[]>([]);
  branches = signal<Branch[]>([]);
  loading  = signal(true);
  saving   = signal(false);
  showForm = signal(false);
  error    = signal('');

  form = this.fb.group({
    userEmail: ['', [Validators.required, Validators.email]],
    role:      ['ADMIN' as UserRole, Validators.required],
    branchId:  [null as string | null],
  });

  readonly roleOptions: { value: UserRole; label: string }[] = [
    { value: 'ADMIN',    label: 'Administrador' },
    { value: 'EMPLOYEE', label: 'Empleado' },
  ];

  ngOnInit(): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) { this.loading.set(false); return; }
    this.load();
    this.branchSvc.getByCommerce(cId).subscribe(d => this.branches.set(d));
  }

  load(): void {
    const cId = this.appState.commerce()!.id;
    this.teamSvc.getTeam(cId).subscribe({
      next: d => { this.members.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  isEmployee(): boolean {
    return this.form.get('role')?.value === 'EMPLOYEE';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const cId = this.appState.commerce()!.id;
    this.saving.set(true);
    this.error.set('');
    this.teamSvc.invite(cId, this.form.value as any).subscribe({
      next: () => {
        this.showForm.set(false);
        this.form.reset({ role: 'ADMIN' });
        this.saving.set(false);
        this.load();
      },
      error: e => {
        this.error.set(e.error?.message ?? 'Error al invitar');
        this.saving.set(false);
      },
    });
  }

  remove(member: TeamMember): void {
    const cId = this.appState.commerce()!.id;
    this.teamSvc.remove(cId, member.user.id).subscribe({
      next: () => this.load(),
    });
  }

  roleLabel(role: UserRole): string {
    return { OWNER: 'Propietario', ADMIN: 'Administrador', EMPLOYEE: 'Empleado' }[role];
  }

  roleBadgeClass(role: UserRole): string {
    return {
      OWNER:    'bg-indigo-500/20 text-indigo-400',
      ADMIN:    'bg-amber-500/20 text-amber-400',
      EMPLOYEE: 'bg-emerald-500/20 text-emerald-400',
    }[role];
  }
}