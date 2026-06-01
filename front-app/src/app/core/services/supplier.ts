import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Supplier, SupplierRequest, PaymentRequest } from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private base = (cId: string) => `${environment.apiUrl}/commerces/${cId}/suppliers`;
  constructor(private http: HttpClient) {}

  create(commerceId: string, req: SupplierRequest): Observable<Supplier> {
    return this.http.post<Supplier>(this.base(commerceId), req);
  }
  getByCommerce(commerceId: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.base(commerceId));
  }
  getById(commerceId: string, id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.base(commerceId)}/${id}`);
  }
  update(commerceId: string, id: string, req: SupplierRequest): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.base(commerceId)}/${id}`, req);
  }
  deactivate(commerceId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.base(commerceId)}/${id}`);
  }
  registerPayment(commerceId: string, id: string, branchId: string, req: PaymentRequest): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.base(commerceId)}/${id}/payment?branchId=${branchId}`, req);
  }
  getWithDebt(commerceId: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.base(commerceId)}/with-debt`);
  }
}