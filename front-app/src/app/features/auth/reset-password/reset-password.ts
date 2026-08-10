import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html'
})
export class ResetPasswordComponent {
  loading = signal(false);
  error = signal('');
  success = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  email: string;
  code: string;

  form;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state ?? window.history.state ?? {};
    this.email = state['email'] ?? '';
    this.code = state['code'] ?? '';

    if (!this.email || !this.code) {
      this.router.navigate(['/auth/forgot-password']);
    }

    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatchValidator });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const newPassword = this.form.value.newPassword as string;

    this.auth.resetPassword(this.email, this.code, newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'No pudimos actualizar la contraseña.');
        this.loading.set(false);
      }
    });
  }

  get newPassword() {
    return this.form.get('newPassword')!;
  }

  get confirmPassword() {
    return this.form.get('confirmPassword')!;
  }
}