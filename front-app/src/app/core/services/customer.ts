import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Customer, CustomerRequest, CustomerAccount } from '../models/customer.model';
import { PaymentRequest } from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private base = (cId: string) => `${environment.apiUrl}/commerces/${cId}/customers`;
  constructor(private http: HttpClient) {}

  create(commerceId: string, req: CustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(this.base(commerceId), req);
  }
  getByCommerce(commerceId: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.base(commerceId));
  }
  getById(commerceId: string, id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.base(commerceId)}/${id}`);
  }
  update(commerceId: string, id: string, req: CustomerRequest): Observable<Customer> {
    return this.http.put<Customer>(`${this.base(commerceId)}/${id}`, req);
  }
  deactivate(commerceId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.base(commerceId)}/${id}`);
  }
  getAccount(commerceId: string, id: string): Observable<CustomerAccount> {
    return this.http.get<CustomerAccount>(`${this.base(commerceId)}/${id}/account`);
  }
  registerPayment(commerceId: string, id: string, branchId: string, req: PaymentRequest): Observable<CustomerAccount> {
    return this.http.post<CustomerAccount>(`${this.base(commerceId)}/${id}/account/payment?branchId=${branchId}`, req);
  }
  getDebtors(commerceId: string, branchId: string): Observable<CustomerAccount[]> {
    return this.http.get<CustomerAccount[]>(`${this.base(commerceId)}/debtors?branchId=${branchId}`);
  }
}