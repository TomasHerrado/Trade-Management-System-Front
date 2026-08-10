import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html'
})
export class ForgotPasswordComponent {
  loading = signal(false);
  error = signal('');

  form;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const email = this.form.value.email as string;

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/verify-code'], { state: { email } });
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'No pudimos enviar el código. Intentá nuevamente.');
        this.loading.set(false);
      }
    });
  }

  get email() {
    return this.form.get('email')!;
  }
}