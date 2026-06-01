import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppStateService } from '../../core/services/app-state';
import { AuthService } from '../../core/services/auth';
import { environment } from '../../../environments/environment';

interface CashRegisterState {
  id: string;
  status: 'OPEN' | 'CLOSED';
  openingBalance: number;
  currentBalance: number;
  openedByName: string;
  openedAt: string;
}

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cash-register.html',
})
export class CashRegisterPage implements OnInit {
  private http     = inject(HttpClient);
  appState         = inject(AppStateService);
  auth             = inject(AuthService);
  private fb       = inject(FormBuilder);

  cashRegister = signal<CashRegisterState | null>(null);
  loading      = signal(true);
  saving       = signal(false);
  error        = signal('');

  openForm = this.fb.group({
    openingBalance: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const bId = this.appState.branch()?.id;
    if (!bId) { this.loading.set(false); return; }
    this.http.get<CashRegisterState>(`${environment.apiUrl}/branches/${bId}/cash-register/current`)
      .subscribe({
        next: d => { this.cashRegister.set(d); this.loading.set(false); },
        error: () => { this.cashRegister.set(null); this.loading.set(false); }
      });
  }

  openCash(): void {
    if (this.openForm.invalid) return;
    const bId = this.appState.branch()?.id;
    if (!bId) return;
    this.saving.set(true);
    this.http.post<CashRegisterState>(
      `${environment.apiUrl}/branches/${bId}/cash-register/open`,
      this.openForm.value
    ).subscribe({
      next: d => { this.cashRegister.set(d); this.saving.set(false); this.openForm.reset({ openingBalance: 0 }); },
      error: e => { this.error.set(e.error?.message ?? 'Error'); this.saving.set(false); }
    });
  }

  closeCash(): void {
    const bId = this.appState.branch()?.id;
    if (!bId) return;
    this.saving.set(true);
    this.http.post<CashRegisterState>(
      `${environment.apiUrl}/branches/${bId}/cash-register/close`, {}
    ).subscribe({
      next: d => { this.cashRegister.set(d); this.saving.set(false); },
      error: e => { this.error.set(e.error?.message ?? 'Error'); this.saving.set(false); }
    });
  }
}