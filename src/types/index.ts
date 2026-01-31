export type UserRole = 'salesman' | 'team_leader' | 'manager';
export type ManagerLevel = 'AM2' | 'AM1' | 'AE';

export interface Distributor {
  id: string;
  wdCode: string;
  name: string;
  section: string;
  aeId?: string;  // Assigned AE's ID
}

export interface User {
  id: string;
  name: string;
  phone?: string;  // Optional now - for future use
  role: UserRole;
  managerLevel?: ManagerLevel;  // For managers: AM2, AM1, or AE
  teamLeaderId?: string;        // For DS: their TL's ID
  distributorId?: string;       // For TL and DS: their WD's ID
  distributorIds?: string[];    // For AE: their assigned WD IDs
  totalMappedOutlets?: number;
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
  outletId: string | null;
  skuId: string;
  quantity: number;
  outletCount: number; // Number of outlets where this SKU was sold
  points: number;
  timestamp: string;
}

// Focus product for rewards
export interface FocusProduct {
  id: string;
  skuId: string;
  name: string;
  rewardPerUnit: number; // ₹ reward per unit sold
  color: string; // For UI display
}

// Salesman-specific monthly target for focus products
export interface SalesmanTarget {
  id: string;
  salesmanId: string;
  focusProductId: string;
  targetQuantity: number;
  month: string; // Format: YYYY-MM
  maxReward: number; // Maximum reward achievable
}

export interface SaleEntry {
  skuId: string;
  quantity: number;
}

// DS Target uploaded by manager
export interface DSTarget {
  id: string;
  wdCode: string;
  wdName: string;
  tlName: string;
  tlId: string;
  dsName: string;
  dsId: string;
  skuName: string;
  month: string; // Format: YYYY-MM or Month Name like "January 2026"
  targetQty: number;
  uploadedAt: string;
  uploadedBy: string;
}

// Salesman's total mapped outlets
export interface SalesmanMappedOutlets {
  salesmanId: string;
  totalMappedOutlets: number;
  updatedAt: string;
  updatedBy: string;
}
