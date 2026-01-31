import { User, Distributor, ManagerLevel } from '@/types';

// Import product images
import americanClub from '@/Images/American Club Lit.png';
import classicClove from '@/Images/Classic Clove.png';

// ============================================
// DISTRIBUTORS (WD) - From Excel Data
// ============================================
export const mockDistributors: Distributor[] = [
  { id: 'wd-0001', wdCode: 'MU3680', name: 'Shivam Impex', section: 'MUU001', aeId: 'mgr-0003' },
  { id: 'wd-0002', wdCode: 'MU3786', name: 'Prime Enterprises', section: 'MUU001', aeId: 'mgr-0003' },
  { id: 'wd-0003', wdCode: 'MU3800', name: 'Shree Siddhanath Marketing', section: 'MUU001', aeId: 'mgr-0004' },
  { id: 'wd-0004', wdCode: 'MU3666', name: 'Sahil Enterprises', section: 'MUU003', aeId: 'mgr-0005' },
  { id: 'wd-0005', wdCode: 'MU3695', name: 'Kranti Mercantile Pvt. Ltd.', section: 'MUU003', aeId: 'mgr-0005' },
  { id: 'wd-0006', wdCode: 'MU3765', name: 'PARSHVANATH TRADEZONE LLP', section: 'MUU003', aeId: 'mgr-0006' },
  { id: 'wd-0007', wdCode: 'MU3612', name: 'Sai Enterprises', section: 'MUU004', aeId: 'mgr-0007' },
  { id: 'wd-0008', wdCode: 'MU3713', name: 'Ambika Traders', section: 'MUU004', aeId: 'mgr-0007' },
];

// ============================================
// MANAGERS (AM2, AM1, AE) - From Excel Data
// ============================================
const managers: User[] = [
  // AM2 - sees everything
  { id: 'mgr-0001', name: 'Gowtham Kumar', role: 'manager', managerLevel: 'AM2' },
  // AM1 - sees everything
  { id: 'mgr-0002', name: 'Pankaj Sonawane', role: 'manager', managerLevel: 'AM1' },
  // AEs - see only their assigned WDs
  { id: 'mgr-0003', name: 'Navin Mandhare', role: 'manager', managerLevel: 'AE', distributorIds: ['wd-0001', 'wd-0002'] },
  { id: 'mgr-0004', name: 'Gaus', role: 'manager', managerLevel: 'AE', distributorIds: ['wd-0003'] },
  { id: 'mgr-0005', name: 'Sachin Devadiga', role: 'manager', managerLevel: 'AE', distributorIds: ['wd-0004', 'wd-0005'] },
  { id: 'mgr-0006', name: 'Raghavendra', role: 'manager', managerLevel: 'AE', distributorIds: ['wd-0006'] },
  { id: 'mgr-0007', name: 'Shreyas Prabhu', role: 'manager', managerLevel: 'AE', distributorIds: ['wd-0007', 'wd-0008'] },
];

// ============================================
// TEAM LEADERS - From Excel Data
// ============================================
const teamLeaders: User[] = [
  { id: 'tl-0001', name: 'DILIP_MU3680', role: 'team_leader', distributorId: 'wd-0001' },
  { id: 'tl-0002', name: 'SHAILENDRA GUPTA', role: 'team_leader', distributorId: 'wd-0001' },
  { id: 'tl-0003', name: 'ABBAS', role: 'team_leader', distributorId: 'wd-0002' },
  { id: 'tl-0004', name: 'PRAVEEN_MU3573', role: 'team_leader', distributorId: 'wd-0002' },
  { id: 'tl-0005', name: 'UMASHANKAR SINGH', role: 'team_leader', distributorId: 'wd-0002' },
  { id: 'tl-0006', name: '395 ASLAM', role: 'team_leader', distributorId: 'wd-0003' },
  { id: 'tl-0007', name: '96 NAZIR(OPL) 1', role: 'team_leader', distributorId: 'wd-0003' },
  { id: 'tl-0008', name: 'IMRAN', role: 'team_leader', distributorId: 'wd-0003' },
  { id: 'tl-0009', name: 'SANTOSH PRADHAN', role: 'team_leader', distributorId: 'wd-0004' },
  { id: 'tl-0010', name: 'VIJAY GAMRE', role: 'team_leader', distributorId: 'wd-0004' },
  { id: 'tl-0011', name: 'AWDESH SHUKLA', role: 'team_leader', distributorId: 'wd-0005' },
  { id: 'tl-0012', name: 'FAROOK 1 (VMC)', role: 'team_leader', distributorId: 'wd-0005' },
  { id: 'tl-0013', name: 'RAHUL KUSHWAHA', role: 'team_leader', distributorId: 'wd-0005' },
  { id: 'tl-0014', name: 'RAJESH', role: 'team_leader', distributorId: 'wd-0005' },
  { id: 'tl-0015', name: 'BAVISKAR_MU3714', role: 'team_leader', distributorId: 'wd-0006' },
  { id: 'tl-0016', name: 'NAMEER_MU3714', role: 'team_leader', distributorId: 'wd-0006' },
  { id: 'tl-0017', name: 'PRAKASH_MU3714', role: 'team_leader', distributorId: 'wd-0006' },
  { id: 'tl-0018', name: 'VIRENDRA', role: 'team_leader', distributorId: 'wd-0007' },
  { id: 'tl-0019', name: 'SHANKAR KRISHNA SHARMA', role: 'team_leader', distributorId: 'wd-0004' },
  { id: 'tl-0020', name: 'JAIPRAKASH JAISWAL', role: 'team_leader', distributorId: 'wd-0005' },
  { id: 'tl-0021', name: 'AJAY', role: 'team_leader', distributorId: 'wd-0008' },
  { id: 'tl-0022', name: 'DHARMENDRA_MU3713', role: 'team_leader', distributorId: 'wd-0008' },
];

// ============================================
// SALESMEN (DS) - From Excel Data (sample)
// ============================================
const salesmen: User[] = [
  // TL-0001 (DILIP_MU3680) team
  { id: 'ds-0001', name: 'ALTAF', role: 'salesman', teamLeaderId: 'tl-0001', distributorId: 'wd-0001', totalMappedOutlets: 22 },
  { id: 'ds-0002', name: 'GHANSHYAM GUPTA', role: 'salesman', teamLeaderId: 'tl-0001', distributorId: 'wd-0001', totalMappedOutlets: 31 },
  { id: 'ds-0003', name: 'HANUMAN GUPTA', role: 'salesman', teamLeaderId: 'tl-0001', distributorId: 'wd-0001', totalMappedOutlets: 32 },
  { id: 'ds-0004', name: 'RAJENDRA DUBEY', role: 'salesman', teamLeaderId: 'tl-0001', distributorId: 'wd-0001', totalMappedOutlets: 41 },
  { id: 'ds-0005', name: 'RAKESH YADAV', role: 'salesman', teamLeaderId: 'tl-0001', distributorId: 'wd-0001', totalMappedOutlets: 21 },
  { id: 'ds-0006', name: 'SWD', role: 'salesman', teamLeaderId: 'tl-0001', distributorId: 'wd-0001', totalMappedOutlets: 41 },
  { id: 'ds-0007', name: 'VINOD GUPTA', role: 'salesman', teamLeaderId: 'tl-0001', distributorId: 'wd-0001', totalMappedOutlets: 40 },
  // TL-0002 (SHAILENDRA GUPTA) team
  { id: 'ds-0008', name: 'A.K.GUPTA', role: 'salesman', teamLeaderId: 'tl-0002', distributorId: 'wd-0001', totalMappedOutlets: 36 },
  { id: 'ds-0009', name: 'MUKESH GUPTA', role: 'salesman', teamLeaderId: 'tl-0002', distributorId: 'wd-0001', totalMappedOutlets: 55 },
  { id: 'ds-0010', name: 'OMPRAKASH', role: 'salesman', teamLeaderId: 'tl-0002', distributorId: 'wd-0001', totalMappedOutlets: 63 },
  { id: 'ds-0011', name: 'RUPENDRA', role: 'salesman', teamLeaderId: 'tl-0002', distributorId: 'wd-0001', totalMappedOutlets: 38 },
  { id: 'ds-0012', name: 'SANTOSH JAISWAL', role: 'salesman', teamLeaderId: 'tl-0002', distributorId: 'wd-0001', totalMappedOutlets: 68 },
  { id: 'ds-0013', name: 'SIYARAM', role: 'salesman', teamLeaderId: 'tl-0002', distributorId: 'wd-0001', totalMappedOutlets: 53 },
  { id: 'ds-0014', name: 'VIRENDRA', role: 'salesman', teamLeaderId: 'tl-0002', distributorId: 'wd-0001', totalMappedOutlets: 27 },
  // TL-0003 (ABBAS) team
  { id: 'ds-0015', name: 'BM YADAV', role: 'salesman', teamLeaderId: 'tl-0003', distributorId: 'wd-0002', totalMappedOutlets: 24 },
  { id: 'ds-0016', name: 'MUNNALAL 2', role: 'salesman', teamLeaderId: 'tl-0003', distributorId: 'wd-0002', totalMappedOutlets: 28 },
  { id: 'ds-0017', name: 'RAHUL GUPTA', role: 'salesman', teamLeaderId: 'tl-0003', distributorId: 'wd-0002', totalMappedOutlets: 45 },
  { id: 'ds-0018', name: 'SAROJ', role: 'salesman', teamLeaderId: 'tl-0003', distributorId: 'wd-0002', totalMappedOutlets: 34 },
  { id: 'ds-0019', name: 'SHIVKUMAR', role: 'salesman', teamLeaderId: 'tl-0003', distributorId: 'wd-0002', totalMappedOutlets: 42 },
  { id: 'ds-0020', name: 'SHUBHAM', role: 'salesman', teamLeaderId: 'tl-0003', distributorId: 'wd-0002', totalMappedOutlets: 45 },
  { id: 'ds-0021', name: 'SUMIT', role: 'salesman', teamLeaderId: 'tl-0003', distributorId: 'wd-0002', totalMappedOutlets: 56 },
  // TL-0004 (PRAVEEN_MU3573) team
  { id: 'ds-0022', name: 'ALOK', role: 'salesman', teamLeaderId: 'tl-0004', distributorId: 'wd-0002', totalMappedOutlets: 47 },
  { id: 'ds-0023', name: 'BASANT', role: 'salesman', teamLeaderId: 'tl-0004', distributorId: 'wd-0002', totalMappedOutlets: 38 },
  { id: 'ds-0024', name: 'PRAKASH', role: 'salesman', teamLeaderId: 'tl-0004', distributorId: 'wd-0002', totalMappedOutlets: 43 },
  { id: 'ds-0025', name: 'S.K GUPTA', role: 'salesman', teamLeaderId: 'tl-0004', distributorId: 'wd-0002', totalMappedOutlets: 36 },
  { id: 'ds-0026', name: 'SURESH GONGE', role: 'salesman', teamLeaderId: 'tl-0004', distributorId: 'wd-0002', totalMappedOutlets: 56 },
  { id: 'ds-0027', name: 'VIJAY GUPTA', role: 'salesman', teamLeaderId: 'tl-0004', distributorId: 'wd-0002', totalMappedOutlets: 43 },
  // TL-0005 (UMASHANKAR SINGH) team
  { id: 'ds-0028', name: 'ANIL', role: 'salesman', teamLeaderId: 'tl-0005', distributorId: 'wd-0002', totalMappedOutlets: 41 },
  { id: 'ds-0029', name: 'KAMLA', role: 'salesman', teamLeaderId: 'tl-0005', distributorId: 'wd-0002', totalMappedOutlets: 37 },
  { id: 'ds-0030', name: 'KB GUPTA', role: 'salesman', teamLeaderId: 'tl-0005', distributorId: 'wd-0002', totalMappedOutlets: 43 },
  { id: 'ds-0031', name: 'PINTOO GUPTA', role: 'salesman', teamLeaderId: 'tl-0005', distributorId: 'wd-0002', totalMappedOutlets: 49 },
  { id: 'ds-0032', name: 'PRADEEP JAISWAL', role: 'salesman', teamLeaderId: 'tl-0005', distributorId: 'wd-0002', totalMappedOutlets: 37 },
  { id: 'ds-0033', name: 'SHEESHNATH', role: 'salesman', teamLeaderId: 'tl-0005', distributorId: 'wd-0002', totalMappedOutlets: 65 },
  { id: 'ds-0034', name: 'SP CHOUDARY', role: 'salesman', teamLeaderId: 'tl-0005', distributorId: 'wd-0002', totalMappedOutlets: 54 },
  // TL-0006 (395 ASLAM) team
  { id: 'ds-0036', name: 'AJAY GUPTA', role: 'salesman', teamLeaderId: 'tl-0006', distributorId: 'wd-0003', totalMappedOutlets: 40 },
  { id: 'ds-0037', name: 'ARUN JAISWAL', role: 'salesman', teamLeaderId: 'tl-0006', distributorId: 'wd-0003', totalMappedOutlets: 53 },
  { id: 'ds-0038', name: 'DILIP AGARWAL', role: 'salesman', teamLeaderId: 'tl-0006', distributorId: 'wd-0003', totalMappedOutlets: 68 },
  { id: 'ds-0039', name: 'JAYPRAKASH', role: 'salesman', teamLeaderId: 'tl-0006', distributorId: 'wd-0003', totalMappedOutlets: 51 },
  { id: 'ds-0040', name: 'KATYA (OPL)', role: 'salesman', teamLeaderId: 'tl-0006', distributorId: 'wd-0003', totalMappedOutlets: 55 },
  { id: 'ds-0041', name: 'OM PRAKASH 1', role: 'salesman', teamLeaderId: 'tl-0006', distributorId: 'wd-0003', totalMappedOutlets: 46 },
  // TL-0007 (96 NAZIR(OPL) 1) team
  { id: 'ds-0043', name: 'GUDDU', role: 'salesman', teamLeaderId: 'tl-0007', distributorId: 'wd-0003', totalMappedOutlets: 67 },
  { id: 'ds-0044', name: 'KAMLA 1', role: 'salesman', teamLeaderId: 'tl-0007', distributorId: 'wd-0003', totalMappedOutlets: 41 },
  { id: 'ds-0045', name: 'KUMAR', role: 'salesman', teamLeaderId: 'tl-0007', distributorId: 'wd-0003', totalMappedOutlets: 62 },
  { id: 'ds-0046', name: 'PATIL', role: 'salesman', teamLeaderId: 'tl-0007', distributorId: 'wd-0003', totalMappedOutlets: 21 },
  { id: 'ds-0047', name: 'SHYAMLAL', role: 'salesman', teamLeaderId: 'tl-0007', distributorId: 'wd-0003', totalMappedOutlets: 24 },
  // TL-0008 (IMRAN) team
  { id: 'ds-0048', name: 'DHIRAJ KASHYAP (OPL)', role: 'salesman', teamLeaderId: 'tl-0008', distributorId: 'wd-0003', totalMappedOutlets: 49 },
  { id: 'ds-0049', name: 'PRASHANT 2', role: 'salesman', teamLeaderId: 'tl-0008', distributorId: 'wd-0003', totalMappedOutlets: 38 },
  { id: 'ds-0050', name: 'RAMASHANKAR', role: 'salesman', teamLeaderId: 'tl-0008', distributorId: 'wd-0003', totalMappedOutlets: 67 },
  { id: 'ds-0051', name: 'SHAILENDRA', role: 'salesman', teamLeaderId: 'tl-0008', distributorId: 'wd-0003', totalMappedOutlets: 68 },
  { id: 'ds-0052', name: 'SURESH KANT KASHYUP', role: 'salesman', teamLeaderId: 'tl-0008', distributorId: 'wd-0003', totalMappedOutlets: 37 },
  // TL-0009 (SANTOSH PRADHAN) team
  { id: 'ds-0054', name: 'AWDESH', role: 'salesman', teamLeaderId: 'tl-0009', distributorId: 'wd-0004', totalMappedOutlets: 61 },
  { id: 'ds-0055', name: 'DINESH GUPTA', role: 'salesman', teamLeaderId: 'tl-0009', distributorId: 'wd-0004', totalMappedOutlets: 33 },
  { id: 'ds-0056', name: 'PRAMOD GUPTA', role: 'salesman', teamLeaderId: 'tl-0009', distributorId: 'wd-0004', totalMappedOutlets: 59 },
  { id: 'ds-0057', name: 'RAMJI', role: 'salesman', teamLeaderId: 'tl-0009', distributorId: 'wd-0004', totalMappedOutlets: 37 },
  { id: 'ds-0058', name: 'SUNIL GUPTA', role: 'salesman', teamLeaderId: 'tl-0009', distributorId: 'wd-0004', totalMappedOutlets: 40 },
  { id: 'ds-0060', name: 'UMASHANKAR', role: 'salesman', teamLeaderId: 'tl-0009', distributorId: 'wd-0004', totalMappedOutlets: 38 },
  // TL-0010 (VIJAY GAMRE) team
  { id: 'ds-0061', name: 'ARUN GUPTA', role: 'salesman', teamLeaderId: 'tl-0010', distributorId: 'wd-0004', totalMappedOutlets: 68 },
  { id: 'ds-0062', name: 'DAYASHANKAR', role: 'salesman', teamLeaderId: 'tl-0010', distributorId: 'wd-0004', totalMappedOutlets: 34 },
  { id: 'ds-0063', name: 'SANTOSH GUPTA', role: 'salesman', teamLeaderId: 'tl-0010', distributorId: 'wd-0004', totalMappedOutlets: 21 },
  { id: 'ds-0064', name: 'SATYAPRAKASH', role: 'salesman', teamLeaderId: 'tl-0010', distributorId: 'wd-0004', totalMappedOutlets: 26 },
  { id: 'ds-0065', name: 'SUGREW', role: 'salesman', teamLeaderId: 'tl-0010', distributorId: 'wd-0004', totalMappedOutlets: 50 },
  // TL-0011 (AWDESH SHUKLA) team
  { id: 'ds-0066', name: 'AMIR', role: 'salesman', teamLeaderId: 'tl-0011', distributorId: 'wd-0005', totalMappedOutlets: 24 },
  { id: 'ds-0067', name: 'ANIL KUMAR', role: 'salesman', teamLeaderId: 'tl-0011', distributorId: 'wd-0005', totalMappedOutlets: 34 },
  { id: 'ds-0068', name: 'IRFAN AHMED ISAQ ATTAR', role: 'salesman', teamLeaderId: 'tl-0011', distributorId: 'wd-0005', totalMappedOutlets: 51 },
  { id: 'ds-0069', name: 'SHAKIL', role: 'salesman', teamLeaderId: 'tl-0011', distributorId: 'wd-0005', totalMappedOutlets: 40 },
  // TL-0012 (FAROOK 1 VMC) team
  { id: 'ds-0070', name: 'ABDUL REHMAN', role: 'salesman', teamLeaderId: 'tl-0012', distributorId: 'wd-0005', totalMappedOutlets: 36 },
  { id: 'ds-0071', name: 'AJAY 1', role: 'salesman', teamLeaderId: 'tl-0012', distributorId: 'wd-0005', totalMappedOutlets: 45 },
  { id: 'ds-0072', name: 'SANJAY SHARMA', role: 'salesman', teamLeaderId: 'tl-0012', distributorId: 'wd-0005', totalMappedOutlets: 38 },
  // TL-0015 (BAVISKAR) team - WD0006
  { id: 'ds-0080', name: 'BALIRAM', role: 'salesman', teamLeaderId: 'tl-0015', distributorId: 'wd-0006', totalMappedOutlets: 42 },
  { id: 'ds-0081', name: 'GANESH', role: 'salesman', teamLeaderId: 'tl-0015', distributorId: 'wd-0006', totalMappedOutlets: 55 },
  { id: 'ds-0082', name: 'HEMANT', role: 'salesman', teamLeaderId: 'tl-0015', distributorId: 'wd-0006', totalMappedOutlets: 48 },
  // TL-0018 (VIRENDRA) team - WD0007
  { id: 'ds-0090', name: 'ASHOK', role: 'salesman', teamLeaderId: 'tl-0018', distributorId: 'wd-0007', totalMappedOutlets: 33 },
  { id: 'ds-0091', name: 'DEVENDRA', role: 'salesman', teamLeaderId: 'tl-0018', distributorId: 'wd-0007', totalMappedOutlets: 44 },
  { id: 'ds-0092', name: 'MANOJ', role: 'salesman', teamLeaderId: 'tl-0018', distributorId: 'wd-0007', totalMappedOutlets: 39 },
  // TL-0021 (AJAY) team - WD0008
  { id: 'ds-0100', name: 'BHARAT', role: 'salesman', teamLeaderId: 'tl-0021', distributorId: 'wd-0008', totalMappedOutlets: 29 },
  { id: 'ds-0101', name: 'CHANDAN', role: 'salesman', teamLeaderId: 'tl-0021', distributorId: 'wd-0008', totalMappedOutlets: 47 },
  { id: 'ds-0102', name: 'DEEPAK', role: 'salesman', teamLeaderId: 'tl-0021', distributorId: 'wd-0008', totalMappedOutlets: 52 },
  // TL-0022 (DHARMENDRA) team - WD0008
  { id: 'ds-0103', name: 'FIROZ', role: 'salesman', teamLeaderId: 'tl-0022', distributorId: 'wd-0008', totalMappedOutlets: 35 },
  { id: 'ds-0104', name: 'GOVIND', role: 'salesman', teamLeaderId: 'tl-0022', distributorId: 'wd-0008', totalMappedOutlets: 41 },
  { id: 'ds-0105', name: 'HARISH', role: 'salesman', teamLeaderId: 'tl-0022', distributorId: 'wd-0008', totalMappedOutlets: 58 },
];

// Combined users array
export const mockUsers: User[] = [...managers, ...teamLeaders, ...salesmen];

// ============================================
// OUTLETS (kept for demo)
// ============================================
export interface Outlet {
  id: string;
  name: string;
  address: string;
  area: string;
}

export const mockOutlets: Outlet[] = [
  { id: '1', name: 'Krishna General Store', address: '123 Main Road', area: 'Sector 15' },
  { id: '2', name: 'Lakshmi Supermart', address: '456 Market Street', area: 'Gandhi Nagar' },
  { id: '3', name: 'Sharma Kirana', address: '789 Temple Road', area: 'Old City' },
  { id: '4', name: 'Modern Mart', address: '321 Ring Road', area: 'New Colony' },
  { id: '5', name: 'City Provisions', address: '654 Station Road', area: 'Railway Area' },
  { id: '6', name: 'Quick Stop', address: '987 Highway Junction', area: 'Bypass Road' },
];

// ============================================
// SKUs (Products)
// ============================================
const placeholderImage = 'https://placehold.co/100x100/6366f1/white?text=SKU';

export interface SKU {
  id: string;
  name: string;
  imageUrl: string;
  pointsPerUnit: number;
  isActive: boolean;
}

export const mockSKUs: SKU[] = [
  { id: '1', name: 'American Club', imageUrl: americanClub, pointsPerUnit: 5, isActive: true },
  { id: '2', name: 'Classic Clove', imageUrl: classicClove, pointsPerUnit: 10, isActive: true },
  { id: '3', name: 'Neo Smart', imageUrl: placeholderImage, pointsPerUnit: 8, isActive: true },
  { id: '4', name: 'Special Mint', imageUrl: placeholderImage, pointsPerUnit: 7, isActive: true },
  { id: '5', name: 'Super Star', imageUrl: placeholderImage, pointsPerUnit: 12, isActive: true },
];

// ============================================
// FOCUS PRODUCTS
// ============================================
export interface FocusProduct {
  id: string;
  skuId: string;
  name: string;
  rewardPerUnit: number;
  color: string;
}

export const mockFocusProducts: FocusProduct[] = [
  { id: 'fp1', skuId: '1', name: 'American Club', rewardPerUnit: 5, color: 'from-blue-500 to-cyan-500' },
  { id: 'fp2', skuId: '2', name: 'Classic Clove', rewardPerUnit: 10, color: 'from-amber-500 to-orange-500' },
  { id: 'fp3', skuId: '3', name: 'Neo Smart', rewardPerUnit: 8, color: 'from-purple-500 to-pink-500' },
  { id: 'fp4', skuId: '4', name: 'Special Mint', rewardPerUnit: 7, color: 'from-green-500 to-emerald-500' },
  { id: 'fp5', skuId: '5', name: 'Super Star', rewardPerUnit: 12, color: 'from-yellow-500 to-red-500' },
];

// ============================================
// SALESMAN TARGETS
// ============================================
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export interface SalesmanTarget {
  id: string;
  salesmanId: string;
  focusProductId: string;
  targetQuantity: number;
  month: string;
  maxReward: number;
}

export const mockSalesmanTargets: SalesmanTarget[] = salesmen.slice(0, 10).flatMap((sm, smIdx) =>
  mockFocusProducts.slice(0, 3).map((fp, fpIdx) => ({
    id: `st${smIdx + 1}-${fpIdx + 1}`,
    salesmanId: sm.id,
    focusProductId: fp.id,
    targetQuantity: Math.floor(Math.random() * 50) + 50,
    month: getCurrentMonth(),
    maxReward: Math.floor(Math.random() * 300) + 200,
  }))
);

// ============================================
// SAMPLE TRANSACTIONS GENERATOR
// ============================================
export const generateSampleTransactions = () => {
  const transactions: any[] = [];
  const salesmenList = mockUsers.filter(u => u.role === 'salesman');
  const skus = mockSKUs.filter(s => s.isActive).slice(0, 3);

  // Generate transactions for last 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);

    salesmenList.slice(0, 20).forEach(salesman => {
      const numTransactions = Math.floor(Math.random() * 4);

      for (let i = 0; i < numTransactions; i++) {
        const sku = skus[Math.floor(Math.random() * skus.length)];
        const quantity = Math.floor(Math.random() * 10) + 1;
        const outlet = mockOutlets[Math.floor(Math.random() * mockOutlets.length)];

        transactions.push({
          id: `txn-${salesman.id}-${dayOffset}-${i}`,
          salesmanId: salesman.id,
          outletId: outlet.id,
          skuId: sku.id,
          quantity,
          outletCount: Math.floor(Math.random() * 5) + 1,
          points: quantity * sku.pointsPerUnit,
          timestamp: date.toISOString(),
        });
      }
    });
  }

  return transactions;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get managers (for login dropdown)
export const getAEsAndAMs = () => mockUsers.filter(u => u.role === 'manager');

// Get team leaders (for login dropdown)
export const getTeamLeaders = () => mockUsers.filter(u => u.role === 'team_leader');

// Get distributors accessible by a manager
export const getDistributorsForManager = (managerId: string): Distributor[] => {
  const manager = mockUsers.find(u => u.id === managerId);
  if (!manager || manager.role !== 'manager') return [];

  // AM1 and AM2 see all distributors
  if (manager.managerLevel === 'AM1' || manager.managerLevel === 'AM2') {
    return mockDistributors;
  }

  // AE sees only their assigned distributors
  if (manager.managerLevel === 'AE' && manager.distributorIds) {
    return mockDistributors.filter(d => manager.distributorIds?.includes(d.id));
  }

  return [];
};
