import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
})
export class HomeComponent {
  appState = inject(AppStateService);
  auth     = inject(AuthService);

  quickCards = [
  { label: 'Nueva Venta',  desc: 'Registrar venta',    path: '/sales/new',   emoji: '💸', bg: 'rgba(99,102,241,0.15)' },
  { label: 'Productos',    desc: 'Ver catálogo',        path: '/products',    emoji: '📦', bg: 'rgba(16,185,129,0.15)' },
  { label: 'Stock',        desc: 'Control de stock',    path: '/stock',       emoji: '🗂️', bg: 'rgba(245,158,11,0.15)' },
  { label: 'Clientes',     desc: 'Gestión clientes',    path: '/customers',   emoji: '👥', bg: 'rgba(239,68,68,0.15)'  },
];
}
