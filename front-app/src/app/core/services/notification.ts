import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _message = signal<string | null>(null);
  readonly message = this._message.asReadonly();
  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  showError(message: string): void {
    this._message.set(message);
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this._message.set(null), 6000);
  }

  clear(): void {
    this._message.set(null);
    clearTimeout(this.timeoutId);
  }
}