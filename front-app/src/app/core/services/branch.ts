import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Branch, BranchRequest } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private base = (cId: string) => `${environment.apiUrl}/commerces/${cId}/branches`;
  constructor(private http: HttpClient) {}

  create(commerceId: string, req: BranchRequest): Observable<Branch> {
    return this.http.post<Branch>(this.base(commerceId), req);
  }
  getByCommerce(commerceId: string): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.base(commerceId));
  }
  getById(commerceId: string, id: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.base(commerceId)}/${id}`);
  }
  update(commerceId: string, id: string, req: BranchRequest): Observable<Branch> {
    return this.http.put<Branch>(`${this.base(commerceId)}/${id}`, req);
  }
  deactivate(commerceId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.base(commerceId)}/${id}`);
  }
}