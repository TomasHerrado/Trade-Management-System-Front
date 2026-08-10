import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify-code.html'
})
export class VerifyCodeComponent {
  loading = signal(false);
  error = signal('');
  email: string;

  form;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    const nav = this.router.getCurrentNavigation();
    this.email = nav?.extras.state?.['email'] ?? window.history.state?.email ?? '';

    if (!this.email) {
      this.router.navigate(['/auth/forgot-password']);
    }

    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const code = this.form.value.code as string;

    this.auth.verifyResetCode(this.email, code).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/reset-password'], { state: { email: this.email, code } });
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Código inválido o expirado.');
        this.loading.set(false);
      }
    });
  }

  get code() {
    return this.form.get('code')!;
  }
}