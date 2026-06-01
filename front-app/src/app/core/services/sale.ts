import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sale, SaleRequest } from '../models/sale.model';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private base = (bId: string) => `${environment.apiUrl}/branches/${bId}/sales`;
  constructor(private http: HttpClient) {}

  create(branchId: string, req: SaleRequest): Observable<Sale> {
    return this.http.post<Sale>(this.base(branchId), req);
  }
  getByBranch(branchId: string): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.base(branchId));
  }
  getById(branchId: string, id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.base(branchId)}/${id}`);
  }
  getByCustomer(branchId: string, customerId: string): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.base(branchId)}/customer/${customerId}`);
  }
}