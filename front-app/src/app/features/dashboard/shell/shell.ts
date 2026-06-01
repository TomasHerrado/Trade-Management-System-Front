import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { AppStateService } from '../../../core/services/app-state';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class ShellComponent {
  auth     = inject(AuthService);
  appState = inject(AppStateService);
  router   = inject(Router);

  sidebarOpen  = signal(true);
  userMenuOpen = signal(false);

  nav = [
    { label: 'Inicio',      icon: 'home',      path: '/' },
    { label: 'Comercios',   icon: 'store',     path: '/commerces' },
    { label: 'Productos',   icon: 'box',       path: '/products' },
    { label: 'Stock',       icon: 'layers',    path: '/stock' },
    { label: 'Ventas',      icon: 'trending',  path: '/sales' },
    { label: 'Compras',     icon: 'truck',     path: '/purchases' },
    { label: 'Clientes',    icon: 'users',     path: '/customers' },
    { label: 'Proveedores', icon: 'supplier',  path: '/suppliers' },
    { label: 'Caja',        icon: 'cash',      path: '/cash-register' },
  ];

  logout(): void {
    this.appState.clear();
    this.auth.logout();
  }
}