export type CommerceType = 'FERRETERIA' | 'KIOSCO' | 'ROPA' | 'LIBRERIA' | 'ELECTRONICA' | 'BAZAR' | 'OTRO';
export type CommerceStatus = 'ACTIVE' | 'INACTIVE';

export interface Commerce {
  id: string;
  name: string;
  type: CommerceType;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  status: CommerceStatus;
  createdAt: string;
}

export interface CommerceRequest {
  name: string;
  type: CommerceType;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
}