import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommerceService } from '../../../core/services/commerce';
import { CommerceType } from '../../../core/models/commerce.model';

@Component({
  selector: 'app-commerce-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './commerce-form.html',
})
export class CommerceForm implements OnInit {
  private svc    = inject(CommerceService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private fb     = inject(FormBuilder);

  loading     = signal(false);
  loadingData = signal(false);
  error       = signal('');
  editId      = signal<string | null>(null);

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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.loadingData.set(true);
      this.svc.getById(id).subscribe({
        next: c => { this.form.patchValue(c); this.loadingData.set(false); },
        error: () => this.loadingData.set(false)
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const obs = this.editId()
      ? this.svc.update(this.editId()!, this.form.value as any)
      : this.svc.create(this.form.value as any);

    obs.subscribe({
      next: c => this.router.navigate(['/commerces', c.id]),
      error: e => { this.error.set(e.error?.message ?? 'Error'); this.loading.set(false); }
    });
  }
}