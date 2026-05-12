export type BranchStatus = 'ACTIVE' | 'INACTIVE';

export interface Branch {
  id: string;
  commerceId: string;
  commerceName: string;
  name: string;
  address?: string;
  phone?: string;
  status: BranchStatus;
  createdAt: string;
}

export interface BranchRequest {
  name: string;
  address?: string;
  phone?: string;
}