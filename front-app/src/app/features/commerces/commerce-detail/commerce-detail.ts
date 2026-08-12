import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommerceService } from '../../../core/services/commerce';
import { RoleService } from '../../../core/services/role';
import { Commerce } from '../../../core/models/commerce.model';

@Component({
  selector: 'app-commerce-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './commerce-detail.html',
})
export class CommerceDetail implements OnInit {
  private svc    = inject(CommerceService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  role           = inject(RoleService);

  commerce      = signal<Commerce | null>(null);
  loading       = signal(true);
  deactivating  = signal(false);
  activating    = signal(false);
  deleting      = signal(false);
  confirmingDelete = signal(false);
  error         = signal('');

  typeLabel: Record<string, string> = {
    FERRETERIA: 'Ferretería', KIOSCO: 'Kiosco', ROPA: 'Indumentaria',
    LIBRERIA: 'Librería', ELECTRONICA: 'Electrónica', BAZAR: 'Bazar', OTRO: 'Otro'
  };
  typeEmoji: Record<string, string> = {
    FERRETERIA: '🔧', KIOSCO: '🏪', ROPA: '👗',
    LIBRERIA: '📚', ELECTRONICA: '💻', BAZAR: '🛒', OTRO: '🏢'
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getById(id).subscribe({
      next: c => { this.commerce.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  deactivate(): void {
    const c = this.commerce();
    if (!c) return;
    if (!confirm(`¿Seguro que querés desactivar "${c.name}"?`)) return;

    this.deactivating.set(true);
    this.svc.deactivate(c.id).subscribe({
      next: () => { this.commerce.set({ ...c, status: 'INACTIVE' }); this.deactivating.set(false); },
      error: () => this.deactivating.set(false)
    });
  }

  activate(): void {
    const c = this.commerce();
    if (!c) return;

    this.activating.set(true);
    this.svc.activate(c.id).subscribe({
      next: () => { this.commerce.set({ ...c, status: 'ACTIVE' }); this.activating.set(false); },
      error: () => this.activating.set(false)
    });
  }

  openDeleteConfirm(): void {
    this.confirmingDelete.set(true);
  }

  closeDeleteConfirm(): void {
    this.confirmingDelete.set(false);
  }

  confirmDelete(): void {
    const c = this.commerce();
    if (!c) return;

    this.confirmingDelete.set(false);
    this.deleting.set(true);
    this.error.set('');

    this.svc.delete(c.id).subscribe({
      next: () => this.router.navigate(['/commerces']),
      error: e => {
        this.error.set(e.error?.message ?? 'No se pudo eliminar el comercio');
        this.deleting.set(false);
      }
    });
  }
}