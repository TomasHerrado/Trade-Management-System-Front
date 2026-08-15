export type ProductStatus = 'ACTIVE' | 'INACTIVE';
export type PriceUpdateTarget = 'PRICE' | 'COST' | 'BOTH';

export interface Product {
  id: string;
  commerceId: string;
  categoryId?: string;
  supplierId?: string;
  supplierName?: string;
  categoryName?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  status: ProductStatus;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  productName: string;
  name: string;
  sku?: string;
  price: number;
  cost: number;
  status: ProductStatus;
  createdAt: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId?: string;
  supplierId?: string;
}

export interface ProductVariantRequest {
  name: string;
  sku?: string;
  price: number;
  cost: number;
}

export interface Category {
  id: string;
  commerceId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface BulkPriceUpdateRequest {
  supplierId: string;
  percentage: number;
  applyTo: PriceUpdateTarget;
}

export interface BulkPriceUpdateResponse {
  updatedCount: number;
}
