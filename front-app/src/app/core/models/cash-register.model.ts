export type CashRegisterStatus = 'OPEN' | 'CLOSED';
export type CashMovementType = 'SALE' | 'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYMENT' | 'EXPENSE' | 'OPENING' | 'CLOSING';

export interface CashRegister {
  id: string;
  branchId: string;
  branchName: string;
  openedByName: string;
  closedByName?: string;
  openingBalance: number;
  closingBalance?: number;
  currentBalance: number;
  status: CashRegisterStatus;
  openedAt: string;
  closedAt?: string;
}

export interface CashMovement {
  id: string;
  cashRegisterId: string;
  type: CashMovementType;
  amount: number;
  description?: string;
  referenceId?: string;
  createdAt: string;
}

export interface CashRegisterOpenRequest {
  openingBalance: number;
}