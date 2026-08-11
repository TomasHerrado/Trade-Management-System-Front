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

  commerce     = signal<Commerce | null>(null);
  loading      = signal(true);
  deactivating = signal(false);

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
    if (!confirm(`¿Seguro que querés desactivar "${c.name}"? Esta acción no se puede deshacer.`)) return;

    this.deactivating.set(true);
    this.svc.deactivate(c.id).subscribe({
      next: () => this.router.navigate(['/commerces']),
      error: () => this.deactivating.set(false)
    });
  }
}