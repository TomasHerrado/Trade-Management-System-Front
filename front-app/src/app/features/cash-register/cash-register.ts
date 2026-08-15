import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppStateService } from '../../core/services/app-state';
import { AuthService } from '../../core/services/auth';
import { environment } from '../../../environments/environment';
import { CashRegister, CashRegisterOpenRequest } from '../../core/models/cash-register.model';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cash-register.html',
})
export class CashRegisterPage implements OnInit {
  private http = inject(HttpClient);
  appState     = inject(AppStateService);
  auth         = inject(AuthService);
  private fb   = inject(FormBuilder);

  cashRegister = signal<CashRegister | null>(null);
  loading      = signal(true);
  saving       = signal(false);
  error        = signal('');

  // Historial de aperturas/cierres
  history        = signal<CashRegister[]>([]);
  historyLoading = signal(false);
  historyError   = signal('');
  filterFrom     = signal('');
  filterTo       = signal('');

  openForm = this.fb.group({
    openingBalance: [0, [Validators.required, Validators.min(0)]]
  });

  private base(): string {
    const bId = this.appState.branch()?.id;
    return `${environment.apiUrl}/branches/${bId}/cash-register`;
  }

  ngOnInit(): void {
    this.load();
    this.loadHistory();
  }

  load(): void {
    if (!this.appState.branch()?.id) { this.loading.set(false); return; }
    this.http.get<CashRegister>(`${this.base()}/current`).subscribe({
      next: d => { this.cashRegister.set(d); this.loading.set(false); },
      error: () => { this.cashRegister.set(null); this.loading.set(false); }
    });
  }

  loadHistory(): void {
    if (!this.appState.branch()?.id) { this.history.set([]); return; }

    this.historyLoading.set(true);
    this.historyError.set('');

    let params = new HttpParams().set('limit', '3');
    if (this.filterFrom()) params = params.set('from', this.filterFrom());
    if (this.filterTo())   params = params.set('to', this.filterTo());

    this.http.get<CashRegister[]>(`${this.base()}/history`, { params }).subscribe({
      next: d => { this.history.set(d); this.historyLoading.set(false); },
      error: e => {
        this.history.set([]);
        this.historyLoading.set(false);
        this.historyError.set(e.error?.message ?? `No se pudo cargar el historial (HTTP ${e.status})`);
      }
    });
  }

  applyFilter(): void {
    this.loadHistory();
  }

  clearFilter(): void {
    this.filterFrom.set('');
    this.filterTo.set('');
    this.loadHistory();
  }

  openCash(): void {
    if (this.openForm.invalid) return;
    if (!this.appState.branch()?.id) return;
    this.saving.set(true);
    this.error.set('');
    const req: CashRegisterOpenRequest = this.openForm.value as CashRegisterOpenRequest;
    this.http.post<CashRegister>(`${this.base()}/open`, req).subscribe({
      next: d => {
        this.cashRegister.set(d);
        this.saving.set(false);
        this.openForm.reset({ openingBalance: 0 });
        this.loadHistory();
      },
      error: e => { this.error.set(e.error?.message ?? 'Error'); this.saving.set(false); }
    });
  }

  closeCash(): void {
    if (!this.appState.branch()?.id) return;
    this.saving.set(true);
    this.error.set('');
    this.http.post<CashRegister>(`${this.base()}/close`, {}).subscribe({
      next: d => {
        this.cashRegister.set(d);
        this.saving.set(false);
        this.loadHistory();
      },
      error: e => { this.error.set(e.error?.message ?? 'Error'); this.saving.set(false); }
    });
  }
}