import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',

    loadComponent: () =>
      import('./register/register').then(m => m.RegisterComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'verify-code',
    loadComponent: () => import('./verify-code/verify-code').then(m => m.VerifyCodeComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password').then(m => m.ResetPasswordComponent)
}
];