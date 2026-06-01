import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Purchase, PurchaseRequest } from '../models/purchase.model';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private base = (bId: string) => `${environment.apiUrl}/branches/${bId}/purchases`;
  constructor(private http: HttpClient) {}

  create(branchId: string, req: PurchaseRequest): Observable<Purchase> {
    return this.http.post<Purchase>(this.base(branchId), req);
  }
  getByBranch(branchId: string): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(this.base(branchId));
  }
  getById(branchId: string, id: string): Observable<Purchase> {
    return this.http.get<Purchase>(`${this.base(branchId)}/${id}`);
  }
}