export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  commerceId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  dni?: string;
  status: CustomerStatus;
  createdAt: string;
}

export interface CustomerAccount {
  id: string;
  customer: Customer;
  branchId: string;
  branchName: string;
  balance: number;
  updatedAt: string;
}

export interface CustomerRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  dni?: string;
}