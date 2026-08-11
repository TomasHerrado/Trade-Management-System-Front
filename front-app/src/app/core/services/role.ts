import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppStateService } from './app-state';
import { AuthService } from './auth';
import { TeamService } from './team';
import { environment } from '../../../environments/environment';
import { UserRole } from '../models/team.model';
import { Branch } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http     = inject(HttpClient);
  private appState = inject(AppStateService);
  private auth     = inject(AuthService);
  private teamSvc  = inject(TeamService);

  private _role = signal<UserRole | null>(null);
  readonly role = this._role.asReadonly();

  private _myBranches = signal<Branch[]>([]);
  readonly myBranches = this._myBranches.asReadonly();

  readonly isOwner = computed(() => this._role() === 'OWNER');
  readonly isAdmin = computed(() =>
    this._role() === 'OWNER' || this._role() === 'ADMIN');
  readonly isEmployee = computed(() => this._role() === 'EMPLOYEE');

  loadRole(commerceId: string): void {
    this.http.get<{ role: UserRole }>(
      `${environment.apiUrl}/users/me/role?commerceId=${commerceId}`
    ).subscribe({
      next: res => {
        this._role.set(res.role);
        if (res.role === 'EMPLOYEE') {
          this.loadMyBranches(commerceId);
        } else {
          this._myBranches.set([]);
        }
      },
      error: () => { this._role.set(null); this._myBranches.set([]); },
    });
  }

  // El endpoint de equipo es accesible por cualquier miembro del comercio,
  // así que lo usamos para que el empleado sepa cuáles son SUS sucursales.
  private loadMyBranches(commerceId: string): void {
    const myId = this.auth.currentUser()?.id;
    this.teamSvc.getTeam(commerceId).subscribe({
      next: team => {
        const me = team.find(m => m.user.id === myId);
        const branches = me?.assignedBranches ?? [];
        this._myBranches.set(branches);

        // Auto-corrección: si tiene una sola sucursal asignada, la activamos
        // directamente. Si la sucursal que tenía activa (persistida en
        // localStorage, ej. de una sesión anterior de otro rol) ya no es
        // válida para este empleado, la limpiamos.
        const current = this.appState.branch();
        if (branches.length === 1) {
          if (!current || current.id !== branches[0].id) {
            this.appState.setBranch(branches[0]);
          }
        } else if (current && !branches.some(b => b.id === current.id)) {
          this.appState.clearBranch();
        }
      },
      error: () => this._myBranches.set([]),
    });
  }

  clearRole(): void {
    this._role.set(null);
    this._myBranches.set([]);
  }
}