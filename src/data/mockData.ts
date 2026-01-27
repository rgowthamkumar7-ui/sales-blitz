import { User, Outlet, SKU, IncentiveSlab } from '@/types';

export const mockUsers: User[] = [
  { id: '1', name: 'Rahul Kumar', phone: '9876543210', pin: '1234', role: 'salesman', teamLeaderId: '4' },
  { id: '2', name: 'Amit Singh', phone: '9876543211', pin: '2345', role: 'salesman', teamLeaderId: '4' },
  { id: '3', name: 'Priya Sharma', phone: '9876543212', pin: '3456', role: 'salesman', teamLeaderId: '4' },
  { id: '4', name: 'Vikram Patel', phone: '9876543213', pin: '4567', role: 'team_leader' },
  { id: '5', name: 'Sunita Reddy', phone: '9876543214', pin: '5678', role: 'manager' },
];

export const mockOutlets: Outlet[] = [
  { id: '1', name: 'Krishna General Store', address: '123 Main Road', area: 'Sector 15' },
  { id: '2', name: 'Lakshmi Supermart', address: '456 Market Street', area: 'Gandhi Nagar' },
  { id: '3', name: 'Sharma Kirana', address: '789 Temple Road', area: 'Old City' },
  { id: '4', name: 'Modern Mart', address: '321 Ring Road', area: 'New Colony' },
  { id: '5', name: 'City Provisions', address: '654 Station Road', area: 'Railway Area' },
  { id: '6', name: 'Quick Stop', address: '987 Highway Junction', area: 'Bypass Road' },
];

export const mockSKUs: SKU[] = [
  { id: '1', name: 'Premium Soap 100g', imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=200&h=200&fit=crop', pointsPerUnit: 5, isActive: true },
  { id: '2', name: 'Shampoo 200ml', imageUrl: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=200&h=200&fit=crop', pointsPerUnit: 10, isActive: true },
  { id: '3', name: 'Face Cream 50g', imageUrl: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200&h=200&fit=crop', pointsPerUnit: 15, isActive: true },
  { id: '4', name: 'Body Lotion 250ml', imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&h=200&fit=crop', pointsPerUnit: 12, isActive: true },
  { id: '5', name: 'Hair Oil 100ml', imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=200&h=200&fit=crop', pointsPerUnit: 8, isActive: true },
  { id: '6', name: 'Toothpaste 150g', imageUrl: 'https://images.unsplash.com/photo-1628359355624-855f8e81734c?w=200&h=200&fit=crop', pointsPerUnit: 6, isActive: true },
];

export const mockIncentiveSlabs: IncentiveSlab[] = [
  { id: '1', minPoints: 0, maxPoints: 100, incentiveAmount: 0 },
  { id: '2', minPoints: 101, maxPoints: 300, incentiveAmount: 500 },
  { id: '3', minPoints: 301, maxPoints: 500, incentiveAmount: 1200 },
  { id: '4', minPoints: 501, maxPoints: 800, incentiveAmount: 2500 },
  { id: '5', minPoints: 801, maxPoints: 99999, incentiveAmount: 5000 },
];
