export type StockMovementType = 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'TRANSFER';

export interface Stock {
  id: string;
  branchId: string;
  branchName: string;
  productVariantId: string;
  productName: string;
  variantName: string;
  sku?: string;
  quantity: number;
  minQuantity: number;
  lowStock: boolean;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  stockId: string;
  type: StockMovementType;
  quantity: number;
  quantityAfter: number;
  note?: string;
  createdAt: string;
}

export interface StockRequest {
  productVariantId: string;
  quantity: number;
  minQuantity?: number;
}

export interface StockAdjustmentRequest {
  type: StockMovementType;
  quantity: number;
  note?: string;
}