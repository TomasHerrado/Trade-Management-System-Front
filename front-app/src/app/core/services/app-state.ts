import { Injectable, signal, computed, inject } from '@angular/core';
import { Commerce } from '../models/commerce.model';
import { Branch } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly COMMERCE_KEY = 'tsm_commerce';
  private readonly BRANCH_KEY   = 'tsm_branch';

  private _commerce = signal<Commerce | null>(
    this.load<Commerce>(this.COMMERCE_KEY));
  private _branch = signal<Branch | null>(
    this.load<Branch>(this.BRANCH_KEY));

  readonly commerce    = this._commerce.asReadonly();
  readonly branch      = this._branch.asReadonly();
  readonly hasCommerce = computed(() => !!this._commerce());
  readonly hasBranch   = computed(() => !!this._branch());

  // Callback para que RoleService recargue cuando cambia el comercio
  private onCommerceChange?: (commerceId: string) => void;

  registerRoleLoader(fn: (commerceId: string) => void): void {
    this.onCommerceChange = fn;
    // Si ya hay un comercio en sesión, cargar el rol
    const c = this._commerce();
    if (c) fn(c.id);
  }

  setCommerce(c: Commerce): void {
    localStorage.setItem(this.COMMERCE_KEY, JSON.stringify(c));
    this._commerce.set(c);
    this._branch.set(null);
    localStorage.removeItem(this.BRANCH_KEY);
    this.onCommerceChange?.(c.id);
  }

  setBranch(b: Branch): void {
    localStorage.setItem(this.BRANCH_KEY, JSON.stringify(b));
    this._branch.set(b);
  }

  clear(): void {
    localStorage.removeItem(this.COMMERCE_KEY);
    localStorage.removeItem(this.BRANCH_KEY);
    this._commerce.set(null);
    this._branch.set(null);
  }

  private load<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }
}