import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Stock, StockRequest, StockMovement, StockAdjustmentRequest } from '../models/stock.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private base = (bId: string) => `${environment.apiUrl}/branches/${bId}/stock`;
  constructor(private http: HttpClient) {}

  createOrUpdate(branchId: string, req: StockRequest): Observable<Stock> {
    return this.http.post<Stock>(this.base(branchId), req);
  }
  getByBranch(branchId: string): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.base(branchId));
  }
  getLowStock(branchId: string): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.base(branchId)}/low`);
  }
  adjust(branchId: string, variantId: string, req: StockAdjustmentRequest): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.base(branchId)}/${variantId}/adjust`, req);
  }
  getMovements(branchId: string, variantId: string): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.base(branchId)}/${variantId}/movements`);
  }
}