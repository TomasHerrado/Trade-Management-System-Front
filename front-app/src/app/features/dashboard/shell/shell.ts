import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { AppStateService } from '../../../core/services/app-state';
import { RoleService } from '../../../core/services/role';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class ShellComponent {
  auth     = inject(AuthService);
  appState = inject(AppStateService);
  role     = inject(RoleService);
  router   = inject(Router);

  sidebarOpen = signal(true);

  readonly nav = computed(() => {
    const all = [
      { label: 'Inicio',      icon: 'home',      path: '/',             roles: ['OWNER','ADMIN','EMPLOYEE'] },
      { label: 'Comercios',   icon: 'store',     path: '/commerces',    roles: ['OWNER','ADMIN','EMPLOYEE'] },
      { label: 'Equipo',      icon: 'team',      path: '/team',         roles: ['OWNER'] },
      { label: 'Productos',   icon: 'box',       path: '/products',     roles: ['OWNER','ADMIN'] },
      { label: 'Stock',       icon: 'layers',    path: '/stock',        roles: ['OWNER','ADMIN','EMPLOYEE'] },
      { label: 'Ventas',      icon: 'trending',  path: '/sales',        roles: ['OWNER','ADMIN','EMPLOYEE'] },
      { label: 'Compras',     icon: 'truck',     path: '/purchases',    roles: ['OWNER','ADMIN'] },
      { label: 'Clientes',    icon: 'users',     path: '/customers',    roles: ['OWNER','ADMIN','EMPLOYEE'] },
      { label: 'Proveedores', icon: 'supplier',  path: '/suppliers',    roles: ['OWNER','ADMIN'] },
      { label: 'Caja',        icon: 'cash',      path: '/cash-register',roles: ['OWNER','ADMIN','EMPLOYEE'] },
    ];

    const currentRole = this.role.role();
    if (!currentRole) return all;
    return all.filter(item => item.roles.includes(currentRole));
  });

  logout(): void {
    this.appState.clear();
    this.role.clearRole();
    this.auth.logout();
  }
}