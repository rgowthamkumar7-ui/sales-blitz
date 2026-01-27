export type UserRole = 'salesman' | 'team_leader' | 'manager';

export interface User {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: UserRole;
  teamLeaderId?: string;
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  area: string;
}

export interface SKU {
  id: string;
  name: string;
  imageUrl: string;
  pointsPerUnit: number;
  isActive: boolean;
}

export interface StockIssued {
  id: string;
  salesmanId: string;
  skuId: string;
  quantity: number;
  date: string;
  issuedBy: string;
}

export interface SaleTransaction {
  id: string;
  salesmanId: string;
  outletId: string;
  skuId: string;
  quantity: number;
  points: number;
  timestamp: string;
}

export interface IncentiveSlab {
  id: string;
  minPoints: number;
  maxPoints: number;
  incentiveAmount: number;
}

export interface SaleEntry {
  skuId: string;
  quantity: number;
}
