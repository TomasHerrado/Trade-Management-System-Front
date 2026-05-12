export type SupplierStatus = 'ACTIVE' | 'INACTIVE';

export interface Supplier {
  id: string;
  commerceId: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  debt: number;
  status: SupplierStatus;
  createdAt: string;
}

export interface SupplierRequest {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PaymentRequest {
  amount: number;
  description?: string;
}