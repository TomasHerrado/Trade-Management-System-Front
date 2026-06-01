import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductRequest, ProductVariant, ProductVariantRequest, Category, CategoryRequest } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = (cId: string) => `${environment.apiUrl}/commerces/${cId}/products`;
  private catBase = (cId: string) => `${environment.apiUrl}/commerces/${cId}/categories`;
  constructor(private http: HttpClient) {}

  create(commerceId: string, req: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.base(commerceId), req);
  }
  getByCommerce(commerceId: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.base(commerceId));
  }
  getById(commerceId: string, id: string): Observable<Product> {
    return this.http.get<Product>(`${this.base(commerceId)}/${id}`);
  }
  update(commerceId: string, id: string, req: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.base(commerceId)}/${id}`, req);
  }
  deactivate(commerceId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.base(commerceId)}/${id}`);
  }

  createVariant(commerceId: string, productId: string, req: ProductVariantRequest): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(`${this.base(commerceId)}/${productId}/variants`, req);
  }
  getVariants(commerceId: string, productId: string): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(`${this.base(commerceId)}/${productId}/variants`);
  }
  updateVariant(commerceId: string, productId: string, variantId: string, req: ProductVariantRequest): Observable<ProductVariant> {
    return this.http.put<ProductVariant>(`${this.base(commerceId)}/${productId}/variants/${variantId}`, req);
  }
  deactivateVariant(commerceId: string, productId: string, variantId: string): Observable<void> {
    return this.http.delete<void>(`${this.base(commerceId)}/${productId}/variants/${variantId}`);
  }

  createCategory(commerceId: string, req: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.catBase(commerceId), req);
  }
  getCategories(commerceId: string): Observable<Category[]> {
    return this.http.get<Category[]>(this.catBase(commerceId));
  }
}