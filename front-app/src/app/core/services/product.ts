import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductRequest, ProductVariant, ProductVariantRequest, Category, CategoryRequest } from '../models/product.model';
import { BulkPriceUpdateRequest, BulkPriceUpdateResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = (cId: string) => `${environment.apiUrl}/commerces/${cId}/products`;
  private catBase = (cId: string) => `${environment.apiUrl}/commerces/${cId}/categories`;
  constructor(private http: HttpClient) {}

  create(commerceId: string, req: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.base(commerceId), req);
  }
  getByCommerce(commerceId: string, supplierId?: string): Observable<Product[]> {
    const url = supplierId
      ? `${this.base(commerceId)}?supplierId=${supplierId}`
      : this.base(commerceId);
    return this.http.get<Product[]>(url);
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

  activate(commerceId: string, id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.base(commerceId)}/${id}/activate`, {});
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
  activateVariant(commerceId: string, productId: string, variantId: string): Observable<ProductVariant> {
    return this.http.patch<ProductVariant>(`${this.base(commerceId)}/${productId}/variants/${variantId}/activate`, {});
  }
  deleteVariant(commerceId: string, productId: string, variantId: string): Observable<void> {
    return this.http.delete<void>(`${this.base(commerceId)}/${productId}/variants/${variantId}/permanent`);
  }

  createCategory(commerceId: string, req: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.catBase(commerceId), req);
  }
  getCategories(commerceId: string): Observable<Category[]> {
    return this.http.get<Category[]>(this.catBase(commerceId));
  }

  delete(commerceId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.base(commerceId)}/${id}/permanent`);
  }

  bulkPriceUpdate(commerceId: string, req: BulkPriceUpdateRequest): Observable<BulkPriceUpdateResponse> {
    return this.http.post<BulkPriceUpdateResponse>(`${this.base(commerceId)}/bulk-price-update`, req);
  }
}