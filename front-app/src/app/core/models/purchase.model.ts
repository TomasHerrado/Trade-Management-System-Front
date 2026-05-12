export type PurchaseStatus = 'COMPLETED' | 'CANCELLED';

export interface PurchaseItem {
  id: string;
  productVariantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  branchId: string;
  branchName: string;
  supplierId: string;
  supplierName: string;
  userName: string;
  total: number;
  status: PurchaseStatus;
  note?: string;
  items: PurchaseItem[];
  createdAt: string;
}

export interface PurchaseItemRequest {
  productVariantId: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseRequest {
  supplierId: string;
  items: PurchaseItemRequest[];
  note?: string;
}