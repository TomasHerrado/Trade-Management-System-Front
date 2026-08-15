import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TeamService } from '../../../core/services/team';
import { BranchService } from '../../../core/services/branch';
import { AppStateService } from '../../../core/services/app-state';
import { AuthService } from '../../../core/services/auth';
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
  private authSvc   = inject(AuthService);
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

  // ── Registro de usuario nuevo (sin perder la sesión actual) ──────────
  showRegisterForm = signal(false);
  registering       = signal(false);
  registerError     = signal('');
  justRegisteredEmail = signal<string | null>(null);
  showRegisterPassword = signal(false);

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
  });

  get rFirstName() { return this.registerForm.get('firstName')!; }
  get rLastName()  { return this.registerForm.get('lastName')!; }
  get rEmail()     { return this.registerForm.get('email')!; }
  get rPassword()  { return this.registerForm.get('password')!; }

  toggleRegisterPassword(): void {
    this.showRegisterPassword.update(v => !v);
  }

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

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (this.showForm()) this.showRegisterForm.set(false);
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
        this.justRegisteredEmail.set(null);
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

  // ── Registro de usuario nuevo ─────────────────────────────────────

  toggleRegisterForm(): void {
    this.showRegisterForm.update(v => !v);
    if (this.showRegisterForm()) {
      this.showForm.set(false);
      this.registerError.set('');
      this.justRegisteredEmail.set(null);
      this.showRegisterPassword.set(false);
    }
  }

  submitRegister(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.registering.set(true);
    this.registerError.set('');

    const { firstName, lastName, email, password } = this.registerForm.value;

    this.authSvc.registerUser({ firstName, lastName, email, password } as any).subscribe({
      next: () => {
        this.registering.set(false);
        this.justRegisteredEmail.set(email!);
        this.registerForm.reset();
        this.showRegisterForm.set(false);
      },
      error: e => {
        this.registerError.set(e.error?.message ?? 'Error al registrar el usuario');
        this.registering.set(false);
      },
    });
  }

  // Atajo: abre el formulario de invitación con el email recién registrado
  inviteJustRegistered(): void {
    const email = this.justRegisteredEmail();
    if (!email) return;
    this.form.patchValue({ userEmail: email });
    this.showForm.set(true);
    this.showRegisterForm.set(false);
  }

  dismissJustRegistered(): void {
    this.justRegisteredEmail.set(null);
  }
}