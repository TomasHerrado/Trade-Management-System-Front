export type PaymentType = 'CASH' | 'CARD' | 'TRANSFER' | 'MIXED' | 'ACCOUNT';
export type SaleStatus = 'COMPLETED' | 'CANCELLED';

export interface SaleItem {
  id: string;
  productVariantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  branchId: string;
  branchName: string;
  cashRegisterId: string;
  customerId?: string;
  customerName?: string;
  userName: string;
  total: number;
  paymentType: PaymentType;
  status: SaleStatus;
  note?: string;
  items: SaleItem[];
  createdAt: string;
}

export interface SaleItemRequest {
  productVariantId: string;
  quantity: number;
}

export interface SaleRequest {
  customerId?: string;
  paymentType: PaymentType;
  items: SaleItemRequest[];
  note?: string;
}