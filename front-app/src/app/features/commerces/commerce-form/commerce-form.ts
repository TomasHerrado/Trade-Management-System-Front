import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommerceService } from '../../../core/services/commerce';
import { CommerceType } from '../../../core/models/commerce.model';

@Component({
  selector: 'app-commerce-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './commerce-form.html',
})
export class CommerceForm {
  private svc    = inject(CommerceService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  loading = signal(false);
  error   = signal('');

  types: { value: CommerceType; label: string; emoji: string }[] = [
    { value: 'FERRETERIA',  label: 'Ferretería',    emoji: '🔧' },
    { value: 'KIOSCO',      label: 'Kiosco',        emoji: '🏪' },
    { value: 'ROPA',        label: 'Indumentaria',  emoji: '👗' },
    { value: 'LIBRERIA',    label: 'Librería',       emoji: '📚' },
    { value: 'ELECTRONICA', label: 'Electrónica',   emoji: '💻' },
    { value: 'BAZAR',       label: 'Bazar',         emoji: '🛒' },
    { value: 'OTRO',        label: 'Otro',          emoji: '🏢' },
  ];

  form = this.fb.group({
    name:        ['', Validators.required],
    type:        ['FERRETERIA' as CommerceType, Validators.required],
    description: [''],
    address:     [''],
    phone:       [''],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.svc.create(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/commerces']),
      error: e  => { this.error.set(e.error?.message ?? 'Error'); this.loading.set(false); }
    });
  }
}