export type PaymentTypeCode = 'CASH' | 'CARD' | 'TRANSFER' | 'MIXED' | 'ACCOUNT';

export interface MonthlySalesPoint {
  year: number;
  month: number;
  label: string;
  total: number;
}

export interface TopProductPoint {
  productName: string;
  variantName: string;
  quantity: number;
  revenue: number;
}

export interface BranchSalesPoint {
  branchName: string;
  total: number;
}

export interface PaymentTypeSalesPoint {
  paymentType: PaymentTypeCode;
  total: number;
}

export interface LowStockPoint {
  productName: string;
  variantName: string;
  branchName: string;
  quantity: number;
  minQuantity: number;
}

export interface Statistics {
  currentMonthTotal: number;
  previousMonthTotal: number;
  variationPercent: number | null;
  salesEvolution: MonthlySalesPoint[];
  topProductsByQuantity: TopProductPoint[];
  topProductsByRevenue: TopProductPoint[];
  salesByBranch: BranchSalesPoint[];
  salesByPaymentType: PaymentTypeSalesPoint[];
  lowStock: LowStockPoint[];
}