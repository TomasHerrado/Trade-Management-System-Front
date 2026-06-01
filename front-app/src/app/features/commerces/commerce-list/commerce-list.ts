import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommerceService } from '../../../core/services/commerce';
import { AppStateService } from '../../../core/services/app-state';
import { Commerce } from '../../../core/models/commerce.model';

@Component({
  selector: 'app-commerce-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './commerce-list.html',
})
export class CommerceList implements OnInit {
  private svc      = inject(CommerceService);
  appState         = inject(AppStateService);

  commerces  = signal<Commerce[]>([]);
  loading    = signal(true);

  ngOnInit(): void {
    this.svc.getMyCommerces().subscribe({
      next: data => { this.commerces.set(data); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  select(c: Commerce): void {
    this.appState.setCommerce(c);
  }

  isActive(c: Commerce): boolean {
    return this.appState.commerce()?.id === c.id;
  }

  typeLabel: Record<string, string> = {
    FERRETERIA: 'Ferretería', KIOSCO: 'Kiosco', ROPA: 'Indumentaria',
    LIBRERIA: 'Librería', ELECTRONICA: 'Electrónica', BAZAR: 'Bazar', OTRO: 'Otro'
  };
}