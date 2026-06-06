import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../services/role';

export const ownerGuard: CanActivateFn = () => {
  const role = inject(RoleService);
  const router = inject(Router);
  if (role.isOwner()) return true;
  return router.createUrlTree(['/']);
};

export const adminGuard: CanActivateFn = () => {
  const role = inject(RoleService);
  const router = inject(Router);
  if (role.isAdmin()) return true;
  return router.createUrlTree(['/']);
};