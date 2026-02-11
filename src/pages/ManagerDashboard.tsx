import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, Package, TrendingUp, TrendingDown,
  AlertTriangle, Download, LogOut, Calendar, ChevronDown,
  Building2, Award, AlertCircle, X, Upload, Target, FileSpreadsheet, Store, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SalesProvider, useSales } from '@/contexts/SalesContext';
import { userService } from '@/services/userService';
import { distributorService } from '@/services/distributorService';
import { skuService } from '@/services/skuService';
import PinLogin from '@/components/salesman/PinLogin';
import * as XLSX from 'xlsx';

import { DSTarget, User, Distributor, SKU } from '@/types';
import { UserManagementDialog } from '@/components/manager/UserManagementDialog';

// Main content component
const ManagerContent: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { transactions: storedTransactions, stockIssued, dsTargets, setDSTargets, isLoading: isSalesLoading } = useSales();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [selectedDays, setSelectedDays] = useState<string>('7');
  const [showTargetUploadDialog, setShowTargetUploadDialog] = useState(false);
  const [uploadedTargets, setUploadedTargets] = useState<DSTarget[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);

  // Supabase data states
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allDistributors, setAllDistributors] = useState<Distributor[]>([]);
  const [allSKUs, setAllSKUs] = useState<SKU[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [users, distributors, skus] = await Promise.all([
          userService.getAll(),
          distributorService.getAll(),
          skuService.getActive()
        ]);

        setAllUsers(users);
        setAllDistributors(distributors);
        setAllSKUs(skus);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);
  const [showWDDropdown, setShowWDDropdown] = useState(false);

  // Get accessible distributors based on manager's level
  // AM1/AM2 see all distributors, AE sees only their assigned WDs
  const accessibleDistributors = useMemo(() => {
    if (!currentUser || allDistributors.length === 0) return allDistributors;

    // AM1 and AM2 see all distributors
    if (currentUser.managerLevel === 'AM1' || currentUser.managerLevel === 'AM2') {
      return allDistributors;
    }

    // AE sees only their assigned distributors
    if (currentUser.distributorIds && currentUser.distributorIds.length > 0) {
      return allDistributors.filter(d => currentUser.distributorIds?.includes(d.id));
    }

    return allDistributors;
  }, [currentUser, allDistributors]);

  // Multi-select WD filter - default to all accessible WDs selected
  const [selectedWDs, setSelectedWDs] = useState<string[]>([]);

  // Initialize selected WDs when accessibleDistributors changes
  React.useEffect(() => {
    setSelectedWDs(accessibleDistributors.map(d => d.id));
  }, [accessibleDistributors]);

  // Distributor Sales Comparison Chart States - use accessible distributors
  const [distChartWDs, setDistChartWDs] = useState<string[]>([]);
  const [distChartStartDate, setDistChartStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [distChartEndDate, setDistChartEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [distChartSKU, setDistChartSKU] = useState<string>('all');

  // Initialize chart WDs
  React.useEffect(() => {
    setDistChartWDs(accessibleDistributors.map(d => d.id));
  }, [accessibleDistributors]);

  // SKU Sales Trend Chart States - use accessible distributors
  const [skuChartSKUs, setSkuChartSKUs] = useState<string[]>([]);
  const [skuChartWDs, setSkuChartWDs] = useState<string[]>([]);

  // Initialize SKU chart SKUs when data loads
  useEffect(() => {
    if (allSKUs.length > 0) {
      setSkuChartSKUs(allSKUs.map(s => s.id));
    }
  }, [allSKUs]);

  // Initialize SKU chart WDs
  React.useEffect(() => {
    setSkuChartWDs(accessibleDistributors.map(d => d.id));
  }, [accessibleDistributors]);

  // Export dialog state - use accessible distributors
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [exportEndDate, setExportEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [exportWDs, setExportWDs] = useState<Record<string, boolean>>({});

  // Initialize export WDs
  React.useEffect(() => {
    const initial: Record<string, boolean> = {};
    accessibleDistributors.forEach(wd => { initial[wd.id] = true; });
    setExportWDs(initial);
  }, [accessibleDistributors]);

  // Use transactions from Supabase (no more sample data)
  const allTransactions = useMemo(() => {
    return storedTransactions;
  }, [storedTransactions]);

  // Filter transactions by date range AND selected distributors
  const filteredTransactions = useMemo(() => {
    const days = parseInt(selectedDays);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Debugging: Log counts
    // console.log('All Users:', allUsers.length);
    // console.log('Selected WDs:', selectedWDs.length);

    return allTransactions.filter(t => {
      const txnDate = new Date(t.timestamp);
      if (txnDate < cutoffDate) return false;

      const salesman = allUsers.find(u => u.id === t.salesmanId);

      // Filter by selected distributors (which are already limited to accessible ones)
      if (!salesman?.distributorId || !selectedWDs.includes(salesman.distributorId)) {
        return false;
      }

      return true;
    });
  }, [allTransactions, selectedWDs, selectedDays, allUsers]);

  // Get salesmen for selected WD (only from accessible distributors)
  const getSalesmenForWD = (wdId: string) => {
    const accessibleWDIds = accessibleDistributors.map(d => d.id);
    if (wdId === 'all') {
      return allUsers.filter(u => u.role === 'salesman' && accessibleWDIds.includes(u.distributorId || ''));
    }
    return allUsers.filter(u => u.role === 'salesman' && u.distributorId === wdId && accessibleWDIds.includes(wdId));
  };

  // Calculate sales by SKU
  const salesBySku = useMemo(() => {
    const skuMap: Record<string, { name: string; quantity: number; outlets: number; imageUrl: string }> = {};

    allSKUs.filter(s => s.isActive).forEach(sku => {
      skuMap[sku.id] = { name: sku.name, quantity: 0, outlets: 0, imageUrl: sku.imageUrl };
    });

    filteredTransactions.forEach(t => {
      if (skuMap[t.skuId]) {
        skuMap[t.skuId].quantity += t.quantity;
        skuMap[t.skuId].outlets += t.outletCount || 0;
      }
    });

    return Object.entries(skuMap).map(([id, data]) => ({ id, ...data }));
  }, [filteredTransactions, allSKUs]);

  // Calculate sales by day
  const salesByDay = useMemo(() => {
    const dayMap: Record<string, number> = {};
    const days = parseInt(selectedDays);

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      dayMap[dateStr] = 0;
    }

    filteredTransactions.forEach(t => {
      const dateStr = new Date(t.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (dayMap[dateStr] !== undefined) {
        dayMap[dateStr] += t.quantity;
      }
    });

    return Object.entries(dayMap).reverse().map(([date, quantity]) => ({ date, quantity }));
  }, [filteredTransactions, selectedDays]);

  // Distributor Sales Comparison Data
  const distributorSalesData = useMemo(() => {
    const startDate = new Date(distChartStartDate);
    const endDate = new Date(distChartEndDate);
    endDate.setHours(23, 59, 59, 999);

    const wdSales: Record<string, { id: string; wdCode: string; name: string; sales: number }> = {};

    distChartWDs.forEach(wdId => {
      const wd = allDistributors.find(d => d.id === wdId);
      if (wd) {
        wdSales[wdId] = { id: wdId, wdCode: wd.wdCode, name: wd.name, sales: 0 };
      }
    });

    allTransactions.forEach(t => {
      const txnDate = new Date(t.timestamp);
      if (txnDate < startDate || txnDate > endDate) return;

      if (distChartSKU !== 'all' && t.skuId !== distChartSKU) return;

      const salesman = allUsers.find(u => u.id === t.salesmanId);
      if (!salesman?.distributorId) return;

      if (wdSales[salesman.distributorId]) {
        wdSales[salesman.distributorId].sales += t.quantity;
      }
    });

    return Object.values(wdSales);
  }, [allTransactions, distChartWDs, distChartStartDate, distChartEndDate, distChartSKU, allDistributors, allUsers]);

  // SKU Sales Trend Data (Daily)
  const skuSalesTrendData = useMemo(() => {
    const days = 14; // Show last 14 days for trend
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Initialize data structure
    const dailyData: Record<string, Record<string, number>> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      dailyData[dateStr] = {};
      skuChartSKUs.forEach(skuId => {
        dailyData[dateStr][skuId] = 0;
      });
    }

    allTransactions.forEach(t => {
      const txnDate = new Date(t.timestamp);
      if (txnDate < cutoffDate) return;

      if (!skuChartSKUs.includes(t.skuId)) return;

      const salesman = allUsers.find(u => u.id === t.salesmanId);
      if (!salesman?.distributorId) return;

      if (!skuChartWDs.includes(salesman.distributorId)) return;

      const dateStr = txnDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (dailyData[dateStr] && dailyData[dateStr][t.skuId] !== undefined) {
        dailyData[dateStr][t.skuId] += t.quantity;
      }
    });

    // Convert to array format
    return Object.entries(dailyData).reverse().map(([date, skuData]) => ({
      date,
      skuData
    }));
  }, [allTransactions, skuChartSKUs, skuChartWDs, allUsers]);

  // Colors for SKU lines
  const skuColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  // Toggle functions for multi-select
  const toggleDistChartWD = (wdId: string) => {
    setDistChartWDs(prev =>
      prev.includes(wdId) ? prev.filter(id => id !== wdId) : [...prev, wdId]
    );
  };

  const toggleSkuChartSKU = (skuId: string) => {
    setSkuChartSKUs(prev =>
      prev.includes(skuId) ? prev.filter(id => id !== skuId) : [...prev, skuId]
    );
  };

  const toggleSkuChartWD = (wdId: string) => {
    setSkuChartWDs(prev =>
      prev.includes(wdId) ? prev.filter(id => id !== wdId) : [...prev, wdId]
    );
  };

  // Calculate DS performance
  const dsPerformance = useMemo(() => {
    // Get salesmen from all selected WDs
    const salesmen = allUsers.filter(u => u.role === 'salesman' && selectedWDs.includes(u.distributorId || ''));

    return salesmen.map(salesman => {
      const salesmanTxns = filteredTransactions.filter(t => t.salesmanId === salesman.id);
      const totalSales = salesmanTxns.reduce((sum, t) => sum + t.quantity, 0);
      const totalPoints = salesmanTxns.reduce((sum, t) => sum + t.points, 0);

      const stock = stockIssued
        .filter(s => s.salesmanId === salesman.id)
        .reduce((sum, s) => sum + s.quantity, 0);

      const tl = allUsers.find(u => u.id === salesman.teamLeaderId);
      const wd = allDistributors.find(d => d.id === salesman.distributorId);

      return {
        id: salesman.id,
        name: salesman.name,
        tlName: tl?.name || 'N/A',
        wdCode: wd?.wdCode || 'N/A',
        totalSales,
        totalPoints,
        currentStock: stock,
        isLowStock: stock < 10,
        isOutOfStock: stock === 0,
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
  }, [filteredTransactions, stockIssued, selectedWDs]);

  const topPerformers = dsPerformance.slice(0, 3);
  const weakPerformers = [...dsPerformance].sort((a, b) => a.totalSales - b.totalSales).slice(0, 3);
  const lowStockDS = dsPerformance.filter(ds => ds.isLowStock || ds.isOutOfStock);

  const totalSales = filteredTransactions.reduce((sum, t) => sum + t.quantity, 0);

  // Calculate total mapped figures based on filtered distributors
  const filteredUsers = allUsers.filter(u => u.role === 'salesman' && u.distributorId && selectedWDs.includes(u.distributorId));
  const totalDsMapped = filteredUsers.length;
  const totalOutletsMapped = filteredUsers.reduce((sum, u) => sum + (u.totalMappedOutlets || 0), 0);

  // Calculate TLs directly from users with role 'team_leader'
  // We assume TLs also have a distributor_id, or we count them if they are referenced by any salesman in the current selection?
  // The user said "Total TLs in the data", implying they expect to see the count of TL entities.
  // If TLs have 'distributor_id', we use that.
  // If TLs don't have 'distributor_id' set (null), we might need another way.
  // Let's try matching 'distributor_id' if present, OR check if they manage any of the filtered salesmen.
  // But strictly speaking, if a TL is "mapped" to a manager's area, they should be counted.
  // For now, let's count TLs who are assigned to the selected distributors OR are parents of selected salesmen.

  const relevantTLs = allUsers.filter(u => {
    if (u.role !== 'team_leader') return false;
    // Condition 1: TL is directly assigned to one of the selected WDs
    if (u.distributorId && selectedWDs.includes(u.distributorId)) return true;
    // Condition 2: TL manages a salesman who is in the selected WDs
    // (This covers cases where TL might not have distributor_id explicitly set but manages salesmen who do)
    // Actually, checking if they are 'teamLeaderId' of any 'filteredUsers' is the previous logic which gave 16.
    // If the count is 22 vs 16, it implies 6 TLs are valid but not managing active salesmen or not linked via salesmen.
    // Let's assume TLs should have distributor_id.
    return false;
  });

  // Re-evaluating: Does the seed data assign distributor_id to TLs?
  // If yes, simply counting TLs in selected WDs is the correct approach.
  // If no, and they rely on salesmen linkage, then 16 is "correct" by relation, but "wrong" by expectation.
  // Let's try combining both: TLs in selected WDs UNION TLs of selected Salesmen.

  const directTLs = allUsers.filter(u => u.role === 'team_leader' && u.distributorId && selectedWDs.includes(u.distributorId));
  const derivedTLIds = new Set(filteredUsers.map(u => u.teamLeaderId).filter(Boolean));

  const allrelevantTLIds = new Set([
    ...directTLs.map(u => u.id),
    ...Array.from(derivedTLIds)
  ]);

  const totalTLsMapped = allrelevantTLIds.size;

  // Toggle WD selection for export
  const toggleExportWD = (wdId: string) => {
    setExportWDs(prev => ({ ...prev, [wdId]: !prev[wdId] }));
  };

  // Select/Deselect all WDs
  const selectAllWDs = (selected: boolean) => {
    const newState: Record<string, boolean> = {};
    accessibleDistributors.forEach(wd => { newState[wd.id] = selected; });
    setExportWDs(newState);
  };

  // Export to Excel with filters
  const exportToExcel = () => {
    const startDate = new Date(exportStartDate);
    const endDate = new Date(exportEndDate);
    endDate.setHours(23, 59, 59, 999);

    const selectedWDIds = Object.entries(exportWDs).filter(([_, selected]) => selected).map(([id]) => id);

    // Filter transactions for export
    const exportTransactions = allTransactions.filter(t => {
      const txnDate = new Date(t.timestamp);
      if (txnDate < startDate || txnDate > endDate) return false;

      const salesman = allUsers.find(u => u.id === t.salesmanId);
      if (!salesman || !selectedWDIds.includes(salesman.distributorId || '')) return false;

      return true;
    });

    // Create single sheet with all transaction data
    const reportData: any[] = [
      ['WD Code', 'TL Name', 'TL ID', 'DS Name', 'Date', 'Month', 'SKU Name', 'Quantity Sold', 'Outlets']
    ];

    exportTransactions.forEach(t => {
      const salesman = allUsers.find(u => u.id === t.salesmanId);

      // Enhanced TL lookup with role validation
      let tl = null;
      if (salesman?.teamLeaderId) {
        tl = allUsers.find(u => u.id === salesman.teamLeaderId && u.role === 'team_leader');
      }

      // Log if TL is missing (for debugging)
      if (!tl && salesman) {
        console.warn(`Missing TL for salesman ${salesman.name} (ID: ${salesman.id}, TL ID: ${salesman.teamLeaderId})`);
      }

      const wd = allDistributors.find(d => d.id === salesman?.distributorId);
      const sku = allSKUs.find(s => s.id === t.skuId);
      const txnDate = new Date(t.timestamp);

      reportData.push([
        wd?.wdCode || 'N/A',
        tl?.name || 'N/A',
        tl?.id || 'N/A',
        salesman?.name || 'N/A',
        txnDate.toLocaleDateString('en-IN'),
        txnDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        sku?.name || 'N/A',
        t.quantity,
        t.outletCount || 0
      ]);
    });

    // Log export summary for verification
    console.log('Export Summary:', {
      totalTransactions: exportTransactions.length,
      dateRange: `${exportStartDate} to ${exportEndDate}`,
      uniqueSalesmen: new Set(exportTransactions.map(t => t.salesmanId)).size,
      uniqueTLs: new Set(reportData.slice(1).map(row => row[2]).filter(id => id !== 'N/A')).size,
      uniqueWDs: new Set(reportData.slice(1).map(row => row[0]).filter(code => code !== 'N/A')).size
    });

    // Create workbook with single sheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(reportData);

    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 10 },  // WD Code
      { wch: 18 },  // TL Name
      { wch: 8 },   // TL ID
      { wch: 18 },  // DS Name
      { wch: 12 },  // Date
      { wch: 18 },  // Month
      { wch: 20 },  // SKU Name
      { wch: 12 },  // Quantity Sold
      { wch: 10 },  // Outlets
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');

    // Download
    const fileName = `sales-report-${exportStartDate}-to-${exportEndDate}.xlsx`;
    XLSX.writeFile(wb, fileName);

    setShowExportDialog(false);
  };

  // Download DS Target template Excel
  const downloadTargetTemplate = () => {
    const templateData = [
      ['WD Code', 'WD Name', 'TL Name', 'TL ID', 'DS Name', 'DS ID', 'SKU Name', 'Month', 'Target Qty']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 10 },  // WD Code
      { wch: 25 },  // WD Name
      { wch: 18 },  // TL Name
      { wch: 10 },  // TL ID
      { wch: 18 },  // DS Name
      { wch: 10 },  // DS ID
      { wch: 20 },  // SKU Name
      { wch: 15 },  // Month
      { wch: 12 },  // Target Qty
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'DS Targets Template');

    const currentDate = new Date();
    const monthName = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const fileName = `ds-target-template-${monthName.replace(' ', '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Handle DS Target file upload
  const handleTargetFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(false);
    setUploadedTargets([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Validate header row
        const expectedHeaders = ['WD Code', 'WD Name', 'TL Name', 'TL ID', 'DS Name', 'DS ID', 'SKU Name', 'Month', 'Target Qty'];
        const headerRow = jsonData[0];

        if (!headerRow || headerRow.length < 9) {
          setUploadError('Invalid file format. Please use the template provided.');
          return;
        }

        // Check if headers match (case-insensitive)
        const headersMatch = expectedHeaders.every((expected, index) =>
          headerRow[index]?.toString().toLowerCase().trim() === expected.toLowerCase()
        );

        if (!headersMatch) {
          setUploadError('Column headers do not match the template. Please download and use the correct template.');
          return;
        }

        // Parse data rows
        const targets: DSTarget[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 9 || !row[0]) continue; // Skip empty rows

          const target: DSTarget = {
            id: `target-${Date.now()}-${i}`,
            wdCode: row[0]?.toString() || '',
            wdName: row[1]?.toString() || '',
            tlName: row[2]?.toString() || '',
            tlId: row[3]?.toString() || '',
            dsName: row[4]?.toString() || '',
            dsId: row[5]?.toString() || '',
            skuName: row[6]?.toString() || '',
            month: row[7]?.toString() || '',
            targetQty: parseInt(row[8]?.toString() || '0') || 0,
            uploadedAt: new Date().toISOString(),
            uploadedBy: currentUser?.id || '',
          };

          if (target.dsId && target.skuName && target.targetQty > 0) {
            targets.push(target);
          }
        }

        if (targets.length === 0) {
          setUploadError('No valid target entries found in the file. Please check the data.');
          return;
        }

        setUploadedTargets(targets);
        setUploadSuccess(true);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setUploadError('Failed to parse the Excel file. Please ensure it is a valid .xlsx file.');
      }
    };

    reader.readAsArrayBuffer(file);
    // Reset the input so the same file can be uploaded again if needed
    event.target.value = '';
  };

  // Save uploaded targets
  const saveUploadedTargets = () => {
    if (uploadedTargets.length > 0) {
      // Merge with existing targets (replace targets for same DS+SKU+Month combination)
      const existingTargets = [...dsTargets];

      uploadedTargets.forEach(newTarget => {
        const existingIndex = existingTargets.findIndex(
          t => t.dsId === newTarget.dsId &&
            t.skuName === newTarget.skuName &&
            t.month === newTarget.month
        );

        if (existingIndex !== -1) {
          existingTargets[existingIndex] = newTarget;
        } else {
          existingTargets.push(newTarget);
        }
      });

      setDSTargets(existingTargets);
      setShowTargetUploadDialog(false);
      setUploadedTargets([]);
      setUploadSuccess(false);
    }
  };

  const maxDailySales = Math.max(...salesByDay.map(d => d.quantity), 1);
  const allWDsSelected = Object.values(exportWDs).every(v => v);
  const someWDsSelected = Object.values(exportWDs).some(v => v);

  if (isLoadingData || isSalesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">Manager Dashboard</p>
            <h1 className="text-xl font-bold">{currentUser?.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {(currentUser?.managerLevel === 'AM1' || currentUser?.managerLevel === 'AM2') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUserManagement(true)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Users size={20} />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>

        <UserManagementDialog
          open={showUserManagement}
          onOpenChange={setShowUserManagement}
        />


        {/* Filters */}
        <div className="flex gap-2">
          {/* Multi-select WD Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowWDDropdown(!showWDDropdown)}
              className="w-full h-10 px-3 rounded-md bg-white/10 border border-white/20 text-white flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <Building2 size={16} />
                <span>
                  {selectedWDs.length === accessibleDistributors.length
                    ? 'All Distributors'
                    : selectedWDs.length === 0
                      ? 'Select WD'
                      : `${selectedWDs.length} WD selected`}
                </span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${showWDDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showWDDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                {/* Select All / Deselect All */}
                <div className="p-2 border-b sticky top-0 bg-background flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedWDs.length === accessibleDistributors.length ? "default" : "outline"}
                    className="flex-1 text-xs"
                    onClick={() => setSelectedWDs(accessibleDistributors.map(d => d.id))}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedWDs.length === 0 ? "default" : "outline"}
                    className="flex-1 text-xs"
                    onClick={() => setSelectedWDs([])}
                  >
                    Clear
                  </Button>
                </div>

                {/* WD List */}
                {accessibleDistributors.map(wd => (
                  <button
                    key={wd.id}
                    onClick={() => {
                      if (selectedWDs.includes(wd.id)) {
                        setSelectedWDs(prev => prev.filter(id => id !== wd.id));
                      } else {
                        setSelectedWDs(prev => [...prev, wd.id]);
                      }
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-sm"
                  >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedWDs.includes(wd.id) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                      {selectedWDs.includes(wd.id) && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-foreground">{wd.wdCode} - {wd.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Select value={selectedDays} onValueChange={setSelectedDays}>
            <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white">
              <Calendar size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 -mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        <Card className="p-3 text-center shadow-lg">
          <Package size={20} className="mx-auto text-primary mb-1" />
          <p className="text-xl font-bold text-foreground">{totalSales}</p>
          <p className="text-[10px] text-muted-foreground">Units Sold</p>
        </Card>
        <Card className="p-3 text-center shadow-lg">
          <Store size={20} className="mx-auto text-amber-500 mb-1" />
          <p className="text-xl font-bold text-foreground">{totalOutletsMapped}</p>
          <p className="text-[10px] text-muted-foreground">Total Outlets Mapped</p>
        </Card>
        <Card className="p-3 text-center shadow-lg">
          <Users size={20} className="mx-auto text-emerald-500 mb-1" />
          <p className="text-xl font-bold text-foreground">{totalDsMapped}</p>
          <p className="text-[10px] text-muted-foreground">Total DS Mapped</p>
        </Card>
        <Card className="p-3 text-center shadow-lg">
          <Users size={20} className="mx-auto text-blue-500 mb-1" />
          <p className="text-xl font-bold text-foreground">{totalTLsMapped}</p>
          <p className="text-[10px] text-muted-foreground">Total TLs Mapped</p>
        </Card>
      </div>

      {/* Sales by SKU */}
      <div className="px-4 mb-4">
        <Card className="p-4 shadow-sm">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            Sales by Product
          </h3>
          <div className="space-y-3">
            {salesBySku.map(sku => (
              <div key={sku.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={sku.imageUrl} alt={sku.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{sku.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(sku.quantity / Math.max(...salesBySku.map(s => s.quantity), 1)) * 100}%` }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-12 text-right">{sku.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Distributor Sales Comparison Chart */}
      <div className="px-4 mb-4">
        <Card className="p-4 shadow-sm">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-500" />
            Distributor Sales Comparison
          </h3>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* Date Range */}
            <div>
              <Label className="text-xs text-muted-foreground">From Date</Label>
              <Input
                type="date"
                value={distChartStartDate}
                onChange={(e) => setDistChartStartDate(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">To Date</Label>
              <Input
                type="date"
                value={distChartEndDate}
                onChange={(e) => setDistChartEndDate(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            {/* SKU Filter */}
            <div>
              <Label className="text-xs text-muted-foreground">SKU Filter</Label>
              <Select value={distChartSKU} onValueChange={setDistChartSKU}>
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue placeholder="Select SKU" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {allSKUs.filter(s => s.isActive).map(sku => (
                    <SelectItem key={sku.id} value={sku.id}>{sku.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* WD Filter Dropdown */}
            <div>
              <Label className="text-xs text-muted-foreground">Distributors</Label>
              <Select
                value={distChartWDs.length === accessibleDistributors.length ? 'all' : distChartWDs.length === 1 ? distChartWDs[0] : 'multiple'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setDistChartWDs(accessibleDistributors.map(d => d.id));
                  } else if (value !== 'multiple') {
                    setDistChartWDs([value]);
                  }
                }}
              >
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue placeholder="Select Distributors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Distributors</SelectItem>
                  {accessibleDistributors.map(wd => (
                    <SelectItem key={wd.id} value={wd.id}>{wd.wdCode} - {wd.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vertical Bar Chart */}
          {distributorSalesData.length > 0 ? (
            <div className="mt-4">
              {/* Y-axis label */}
              <div className="text-[10px] text-muted-foreground mb-2 text-center">Packets Sold</div>

              {/* Chart container */}
              <div className="relative">
                {/* Y-axis values */}
                {(() => {
                  const maxSales = Math.max(...distributorSalesData.map(d => d.sales), 1);
                  return (
                    <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[8px] text-muted-foreground">
                      <span>{maxSales}</span>
                      <span>{Math.round(maxSales / 2)}</span>
                      <span>0</span>
                    </div>
                  );
                })()}

                {/* Bars */}
                <div className="ml-10 flex items-end justify-around gap-2" style={{ height: '140px' }}>
                  {distributorSalesData.map((wd, index) => {
                    const maxSales = Math.max(...distributorSalesData.map(d => d.sales), 1);
                    const heightPercent = (wd.sales / maxSales) * 100;
                    const colors = ['bg-gradient-to-t from-blue-600 to-blue-400', 'bg-gradient-to-t from-emerald-600 to-emerald-400', 'bg-gradient-to-t from-violet-600 to-violet-400', 'bg-gradient-to-t from-amber-600 to-amber-400'];
                    return (
                      <div key={wd.id} className="flex flex-col items-center flex-1">
                        <div className="relative w-full flex justify-center" style={{ height: '120px' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className={`w-10 ${colors[index % colors.length]} rounded-t-lg shadow-lg absolute bottom-0`}
                          />
                          <span className="absolute -top-5 text-[10px] font-semibold text-foreground">
                            {wd.sales}
                          </span>
                        </div>
                        <div className="mt-2 text-[10px] font-medium text-foreground text-center">
                          {wd.wdCode}
                        </div>
                        <div className="text-[8px] text-muted-foreground text-center truncate w-full">
                          {wd.name.split(' ')[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis label */}
              <div className="text-[10px] text-muted-foreground mt-2 text-center">Distributors</div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Select at least one distributor to view data
            </div>
          )}
        </Card>
      </div>

      {/* SKU Sales Trend Chart */}
      <div className="px-4 mb-4">
        <Card className="p-4 shadow-sm">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            SKU Sales Trend
          </h3>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* SKU Dropdown */}
            <div>
              <Label className="text-xs text-muted-foreground">Select SKUs</Label>
              <Select
                value={skuChartSKUs.length === allSKUs.filter(s => s.isActive).length ? 'all' : skuChartSKUs.length === 1 ? skuChartSKUs[0] : 'multiple'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setSkuChartSKUs(allSKUs.filter(s => s.isActive).map(s => s.id));
                  } else if (value !== 'multiple') {
                    setSkuChartSKUs([value]);
                  }
                }}
              >
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue placeholder="Select SKUs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SKUs</SelectItem>
                  {allSKUs.filter(s => s.isActive).map(sku => (
                    <SelectItem key={sku.id} value={sku.id}>{sku.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* WD Dropdown */}
            <div>
              <Label className="text-xs text-muted-foreground">Select Distributors</Label>
              <Select
                value={skuChartWDs.length === accessibleDistributors.length ? 'all' : skuChartWDs.length === 1 ? skuChartWDs[0] : 'multiple'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setSkuChartWDs(accessibleDistributors.map(d => d.id));
                  } else if (value !== 'multiple') {
                    setSkuChartWDs([value]);
                  }
                }}
              >
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue placeholder="Select Distributors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Distributors</SelectItem>
                  {accessibleDistributors.map(wd => (
                    <SelectItem key={wd.id} value={wd.id}>{wd.wdCode} - {wd.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Line Chart Legend */}
          <div className="flex flex-wrap gap-2 mb-3">
            {skuChartSKUs.map((skuId) => {
              const sku = allSKUs.find(s => s.id === skuId);
              const index = allSKUs.filter(s => s.isActive).findIndex(s => s.id === skuId);
              return sku ? (
                <div key={skuId} className="flex items-center gap-1">
                  <div
                    className="w-3 h-1 rounded"
                    style={{ backgroundColor: skuColors[index % skuColors.length] }}
                  />
                  <span className="text-[10px] text-muted-foreground">{sku.name}</span>
                </div>
              ) : null;
            })}
          </div>

          {/* Line Chart Visualization */}
          {skuChartSKUs.length > 0 && skuChartWDs.length > 0 ? (
            <div className="relative">
              {/* Y-axis label */}
              <div className="text-[10px] text-muted-foreground mb-1 text-center">Units Sold</div>

              {(() => {
                const allValues = skuSalesTrendData.flatMap(d =>
                  skuChartSKUs.map(skuId => d.skuData[skuId] || 0)
                );
                const maxValue = Math.max(...allValues, 1);
                const chartWidth = 300;
                const chartHeight = 140;
                const padding = { top: 10, right: 10, bottom: 5, left: 35 };
                const plotWidth = chartWidth - padding.left - padding.right;
                const plotHeight = chartHeight - padding.top - padding.bottom;

                return (
                  <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                    {/* Y-axis */}
                    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={chartHeight - padding.bottom} stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />

                    {/* X-axis */}
                    <line x1={padding.left} y1={chartHeight - padding.bottom} x2={chartWidth - padding.right} y2={chartHeight - padding.bottom} stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />

                    {/* Y-axis labels */}
                    <text x={padding.left - 5} y={padding.top + 4} fontSize="8" fill="currentColor" textAnchor="end" opacity="0.6">{maxValue}</text>
                    <text x={padding.left - 5} y={padding.top + plotHeight / 2 + 2} fontSize="8" fill="currentColor" textAnchor="end" opacity="0.6">{Math.round(maxValue / 2)}</text>
                    <text x={padding.left - 5} y={chartHeight - padding.bottom} fontSize="8" fill="currentColor" textAnchor="end" opacity="0.6">0</text>

                    {/* Grid lines */}
                    <line x1={padding.left} y1={padding.top + plotHeight / 4} x2={chartWidth - padding.right} y2={padding.top + plotHeight / 4} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                    <line x1={padding.left} y1={padding.top + plotHeight / 2} x2={chartWidth - padding.right} y2={padding.top + plotHeight / 2} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                    <line x1={padding.left} y1={padding.top + plotHeight * 3 / 4} x2={chartWidth - padding.right} y2={padding.top + plotHeight * 3 / 4} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />

                    {/* Lines and points for each SKU */}
                    {skuChartSKUs.map((skuId) => {
                      const skuIndex = allSKUs.filter(s => s.isActive).findIndex(s => s.id === skuId);
                      const color = skuColors[skuIndex % skuColors.length];

                      // Calculate points
                      const points = skuSalesTrendData.map((d, i) => {
                        const x = padding.left + (i / Math.max(skuSalesTrendData.length - 1, 1)) * plotWidth;
                        const y = padding.top + plotHeight - ((d.skuData[skuId] || 0) / maxValue) * plotHeight;
                        return { x, y, value: d.skuData[skuId] || 0 };
                      });

                      // Create path
                      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                      return (
                        <g key={skuId}>
                          {/* Line */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Points */}
                          {points.map((p, i) => (
                            <circle
                              key={`${skuId}-${i}`}
                              cx={p.x}
                              cy={p.y}
                              r="3"
                              fill={color}
                              stroke="white"
                              strokeWidth="1"
                            />
                          ))}
                        </g>
                      );
                    })}

                    {/* X-axis labels */}
                    {skuSalesTrendData.filter((_, i) => i % 4 === 0 || i === skuSalesTrendData.length - 1).map((d, filteredIndex) => {
                      const originalIndex = skuSalesTrendData.findIndex(item => item.date === d.date);
                      const x = padding.left + (originalIndex / Math.max(skuSalesTrendData.length - 1, 1)) * plotWidth;
                      return (
                        <text key={filteredIndex} x={x} y={chartHeight} fontSize="7" fill="currentColor" textAnchor="middle" opacity="0.6">
                          {d.date.split(' ')[0]}
                        </text>
                      );
                    })}
                  </svg>
                );
              })()}

              {/* X-axis label */}
              <div className="text-[10px] text-muted-foreground mt-1 text-center">Date</div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Select at least one SKU and distributor to view data
            </div>
          )}
        </Card>
      </div>

      {/* Top Performers */}
      <div className="px-4 mb-4">
        <Card className="p-4 shadow-sm">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Award size={16} className="text-amber-500" />
            Top Performers
          </h3>
          <div className="space-y-2">
            {topPerformers.map((ds, index) => (
              <div key={ds.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                  }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ds.name}</p>
                  <p className="text-xs text-muted-foreground">{ds.wdCode} • {ds.tlName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{ds.totalSales}</p>
                  <p className="text-xs text-muted-foreground">units</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Weak Performers */}
      <div className="px-4 mb-4">
        <Card className="p-4 shadow-sm border-amber-200">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingDown size={16} className="text-amber-500" />
            Needs Attention
          </h3>
          <div className="space-y-2">
            {weakPerformers.map((ds) => (
              <div key={ds.id} className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <TrendingDown size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ds.name}</p>
                  <p className="text-xs text-muted-foreground">{ds.wdCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-600">{ds.totalSales}</p>
                  <p className="text-xs text-muted-foreground">units</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockDS.length > 0 && (
        <div className="px-4 mb-4">
          <Card className="p-4 shadow-sm border-red-200">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              Stock Alerts ({lowStockDS.length})
            </h3>
            <div className="space-y-2">
              {lowStockDS.slice(0, 5).map((ds) => (
                <div key={ds.id} className="flex items-center gap-3 p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <AlertTriangle size={14} className="text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ds.name}</p>
                    <p className="text-xs text-muted-foreground">{ds.wdCode}</p>
                  </div>
                  <Badge variant={ds.isOutOfStock ? "destructive" : "secondary"} className="text-xs">
                    {ds.isOutOfStock ? 'OUT OF STOCK' : `${ds.currentStock} left`}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* DS Target Management Section */}
      <div className="px-4 mb-4">
        <Card className="p-4 shadow-sm border-violet-200 dark:border-violet-800">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target size={16} className="text-violet-500" />
            DS Target Management
          </h3>

          <div className="space-y-3">
            {/* Current Targets Summary */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                  <FileSpreadsheet size={18} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Active Targets</p>
                  <p className="text-xs text-muted-foreground">
                    {dsTargets.length} targets configured
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-10 text-sm border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-950"
                onClick={downloadTargetTemplate}
              >
                <Download size={14} className="mr-1.5" />
                Template
              </Button>
              <Button
                className="h-10 text-sm bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                onClick={() => setShowTargetUploadDialog(true)}
              >
                <Upload size={14} className="mr-1.5" />
                Upload
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Export Button */}
      <div className="px-4">
        <Button
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          onClick={() => setShowExportDialog(true)}
        >
          <Download className="mr-2" size={18} />
          Export Report to Excel
        </Button>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download size={20} className="text-primary" />
              Export Report
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* WD Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Distributors (WD)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => selectAllWDs(!allWDsSelected)}
                >
                  {allWDsSelected ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                {accessibleDistributors.map(wd => (
                  <div key={wd.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`wd-${wd.id}`}
                      checked={exportWDs[wd.id]}
                      onCheckedChange={() => toggleExportWD(wd.id)}
                    />
                    <label
                      htmlFor={`wd-${wd.id}`}
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      <span className="font-semibold">{wd.wdCode}</span>
                      <span className="text-muted-foreground ml-2">- {wd.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Contents Info */}
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs font-medium text-primary mb-2">Report Columns:</p>
              <div className="text-[10px] text-muted-foreground grid grid-cols-2 gap-1">
                <span>• WD Code</span>
                <span>• TL Name</span>
                <span>• TL ID</span>
                <span>• DS Name</span>
                <span>• Date</span>
                <span>• Month</span>
                <span>• SKU Name</span>
                <span>• SKU Code</span>
                <span>• Outlet Name</span>
                <span>• Outlet ID</span>
                <span>• Quantity Sold</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={exportToExcel}
              disabled={!someWDsSelected}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Target Upload Dialog */}
      <Dialog open={showTargetUploadDialog} onOpenChange={setShowTargetUploadDialog}>
        <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target size={20} className="text-violet-500" />
              Upload DS Targets
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Instructions */}
            <div className="p-3 bg-muted/50 rounded-lg border">
              <p className="text-sm font-medium text-foreground mb-2">Instructions:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Download the template Excel file</li>
                <li>Fill in targets for each DS per SKU per month</li>
                <li>Upload the completed file</li>
                <li>Review and save the targets</li>
              </ol>
            </div>

            {/* Download Template Button */}
            <Button
              variant="outline"
              className="w-full h-11 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400"
              onClick={downloadTargetTemplate}
            >
              <Download size={16} className="mr-2" />
              Download Template
            </Button>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Excel File</Label>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleTargetFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="target-file-upload"
                />
                <div className="flex items-center justify-center h-24 border-2 border-dashed border-violet-300 dark:border-violet-700 rounded-lg bg-violet-50/50 dark:bg-violet-950/20 hover:bg-violet-100/50 dark:hover:bg-violet-950/30 transition-colors">
                  <div className="text-center">
                    <Upload size={24} className="mx-auto text-violet-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Click or drag file here</p>
                    <p className="text-xs text-muted-foreground">.xlsx or .xls files only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                </div>
              </div>
            )}

            {/* Success Preview */}
            {uploadSuccess && uploadedTargets.length > 0 && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {uploadedTargets.length} targets ready to save
                    </p>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-3 py-2 border-b">
                    <p className="text-xs font-medium text-muted-foreground">Preview (first 5 entries)</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/30 sticky top-0">
                        <tr>
                          <th className="px-2 py-1.5 text-left font-medium">DS Name</th>
                          <th className="px-2 py-1.5 text-left font-medium">SKU</th>
                          <th className="px-2 py-1.5 text-left font-medium">Month</th>
                          <th className="px-2 py-1.5 text-right font-medium">Target</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {uploadedTargets.slice(0, 5).map((target, index) => (
                          <tr key={index} className="hover:bg-muted/20">
                            <td className="px-2 py-1.5 truncate max-w-[80px]">{target.dsName}</td>
                            <td className="px-2 py-1.5 truncate max-w-[80px]">{target.skuName}</td>
                            <td className="px-2 py-1.5">{target.month}</td>
                            <td className="px-2 py-1.5 text-right font-medium">{target.targetQty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {uploadedTargets.length > 5 && (
                    <div className="px-3 py-1.5 bg-muted/30 border-t text-center">
                      <p className="text-xs text-muted-foreground">
                        +{uploadedTargets.length - 5} more entries
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Template Info */}
            <div className="p-3 bg-violet-50/50 dark:bg-violet-950/10 rounded-lg border border-violet-200 dark:border-violet-800">
              <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-2">Required Columns:</p>
              <div className="text-[10px] text-muted-foreground grid grid-cols-3 gap-1">
                <span>• WD Code</span>
                <span>• WD Name</span>
                <span>• TL Name</span>
                <span>• TL ID</span>
                <span>• DS Name</span>
                <span>• DS ID</span>
                <span>• SKU Name</span>
                <span>• Month</span>
                <span>• Target Qty</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTargetUploadDialog(false);
                setUploadedTargets([]);
                setUploadError(null);
                setUploadSuccess(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={saveUploadedTargets}
              disabled={!uploadSuccess || uploadedTargets.length === 0}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              <Upload size={16} className="mr-2" />
              Save Targets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Wrapper component with auth check
const ManagerDashboard: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  return (
    <AuthProvider>
      <SalesProvider>
        <ManagerAuthWrapper onReady={() => setIsReady(true)} />
      </SalesProvider>
    </AuthProvider>
  );
};

// Auth wrapper component
const ManagerAuthWrapper: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const { isAuthenticated, currentUser, logout } = useAuth();

  if (!isAuthenticated) {
    return <PinLogin onSuccess={onReady} allowedRoles={['manager']} />;
  }

  if (currentUser?.role !== 'manager') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="p-6 text-center max-w-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            This page is only accessible to Managers.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Manager Phone: <span className="font-mono font-bold">9876543214</span>
          </p>
          <Button onClick={logout} variant="outline" className="w-full">
            Logout & Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return <ManagerContent />;
};

export default ManagerDashboard;
