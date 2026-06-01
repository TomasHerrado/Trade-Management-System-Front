import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Commerce, CommerceRequest} from '../models/commerce.model';

@Injectable({ providedIn: 'root' })
export class CommerceService {
  private base = `${environment.apiUrl}/commerces`;
  constructor(private http: HttpClient) {}

  create(req: CommerceRequest): Observable<Commerce> {
    return this.http.post<Commerce>(this.base, req);
  }
  getMyCommerces(): Observable<Commerce[]> {
    return this.http.get<Commerce[]>(this.base);
  }
  getById(id: string): Observable<Commerce> {
    return this.http.get<Commerce>(`${this.base}/${id}`);
  }
  update(id: string, req: CommerceRequest): Observable<Commerce> {
    return this.http.put<Commerce>(`${this.base}/${id}`, req);
  }
  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
export type { Commerce };

