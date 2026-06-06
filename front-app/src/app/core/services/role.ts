import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppStateService } from './app-state';
import { environment } from '../../../environments/environment';
import { UserRole } from '../models/team.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private appState = inject(AppStateService);

  private _role = signal<UserRole | null>(null);
  readonly role = this._role.asReadonly();

  readonly isOwner = computed(() => this._role() === 'OWNER');
  readonly isAdmin = computed(() =>
    this._role() === 'OWNER' || this._role() === 'ADMIN');
  readonly isEmployee = computed(() => this._role() === 'EMPLOYEE');

  loadRole(commerceId: string): void {
    this.http.get<{ role: UserRole }>(
      `${environment.apiUrl}/users/me/role?commerceId=${commerceId}`
    ).subscribe({
      next: res => this._role.set(res.role),
      error: () => this._role.set(null),
    });
  }

  clearRole(): void {
    this._role.set(null);
  }
}