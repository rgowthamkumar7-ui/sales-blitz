import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Package, ArrowLeft, LogOut, ChevronRight, Check, Calendar, ChevronLeft, ChevronRightIcon, Store, ClipboardList, TrendingUp, MapPin, Edit2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SalesProvider, useSales } from '@/contexts/SalesContext';
import { userService } from '@/services/userService';
import { skuService } from '@/services/skuService';
import { User, SKU } from '@/types';
import PinLogin from '@/components/salesman/PinLogin';
import AnalysisPopup from '@/components/manager/AnalysisPopup';

type ViewState = 'home' | 'salesman-list' | 'entry';

// Main content component
const TeamLeaderContent: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { addBulkSaleTransactions, hasSalesmanEntryForDate, getSalesmanSalesForDate, transactions, getSalesmanMappedOutlets, setSalesmanMappedOutlets, isLoading: isSalesLoading } = useSales();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [view, setView] = useState<ViewState>('home');
  const [selectedSalesman, setSelectedSalesman] = useState<User | null>(null);
  const [salesInputs, setSalesInputs] = useState<Record<string, { packs: string; outlets: string }>>({});
  const [mappedOutletsInput, setMappedOutletsInput] = useState<string>('');
  const [isEditingMappedOutlets, setIsEditingMappedOutlets] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Analysis Popup State
  const [showAnalysisPopup, setShowAnalysisPopup] = useState(false);
  const [missingSKUs, setMissingSKUs] = useState<SKU[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Supabase data states
  const [assignedSalesmen, setAssignedSalesmen] = useState<User[]>([]);
  const [activeSKUs, setActiveSKUs] = useState<SKU[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch salesmen and SKUs from Supabase
  const fetchData = useCallback(async () => {
    if (!currentUser?.id) return;

    setIsLoadingData(true);
    try {
      const [salesmen, skus] = await Promise.all([
        userService.getSalesmenForTeamLeader(currentUser.id),
        skuService.getActive()
      ]);

      console.log(`Fetched ${salesmen.length} salesmen for TL ${currentUser.name}`);
      setAssignedSalesmen(salesmen);
      setActiveSKUs(skus);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Check if salesman has entry for selected date
  const getSalesmanStatus = (salesmanId: string) => {
    const hasEntry = hasSalesmanEntryForDate(salesmanId, selectedDate);
    if (hasEntry) {
      const sales = getSalesmanSalesForDate(salesmanId, selectedDate);
      const totalQty = sales.reduce((sum, s) => sum + s.quantity, 0);
      const totalOutlets = sales.reduce((sum, s) => sum + (s.outletCount || 0), 0);
      return { hasEntry: true, totalQty, totalOutlets };
    }
    return { hasEntry: false, totalQty: 0, totalOutlets: 0 };
  };

  // Calculate completion stats
  const completionStats = useMemo(() => {
    const completed = assignedSalesmen.filter(s => hasSalesmanEntryForDate(s.id, selectedDate)).length;
    const total = assignedSalesmen.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Get today's total sales
    const todaySales = transactions.filter(t => {
      const txnDate = t.timestamp.includes('T')
        ? new Date(t.timestamp).toISOString().split('T')[0]
        : t.timestamp.split('T')[0];
      const salesman = assignedSalesmen.find(s => s.id === t.salesmanId);
      return txnDate === selectedDate && salesman;
    });

    const totalPacks = todaySales.reduce((sum, t) => sum + t.quantity, 0);
    const totalOutlets = todaySales.reduce((sum, t) => sum + (t.outletCount || 0), 0);

    return { completed, total, percentage, totalPacks, totalOutlets };
  }, [assignedSalesmen, selectedDate, transactions, hasSalesmanEntryForDate]);

  // Get previous sales for reference
  const getPreviousDaySales = (salesmanId: string) => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    return getSalesmanSalesForDate(salesmanId, prevDateStr);
  };

  const handleSelectSalesman = (salesman: User) => {
    try {
      console.log('=== SALESMAN SELECTION STARTED ===');
      console.log('Selected salesman:', salesman.name, salesman.id);
      console.log('Salesman object:', JSON.stringify(salesman, null, 2));

      setSelectedSalesman(salesman);
      console.log('✓ setSelectedSalesman called');

      // Get mapped outlets
      const mappedOutlets = getSalesmanMappedOutlets(salesman.id);
      console.log('Mapped outlets:', mappedOutlets);
      setMappedOutletsInput(mappedOutlets > 0 ? mappedOutlets.toString() : '');
      console.log('✓ Mapped outlets set');

      // CHECK FOR ANALYSIS (After 5th of month)
      const today = new Date();
      const currentDayOfMonth = today.getDate();
      console.log('Current day of month:', currentDayOfMonth);

      if (currentDayOfMonth > 5) {
        console.log('After 5th - checking for missing SKUs');

        // Calculate last 3 days range
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(today.getDate() - 3);
        const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];
        console.log('Date range:', threeDaysAgoStr, 'to', todayStr);

        // Get all transactions for this salesman in the last 30 days (already in context)
        // Filter for last 3 days
        const recentSales = transactions.filter(t => {
          const tDateStr = t.timestamp.includes('T')
            ? new Date(t.timestamp).toISOString().split('T')[0]
            : t.timestamp.split('T')[0];
          return t.salesmanId === salesman.id && tDateStr >= threeDaysAgoStr && tDateStr <= todayStr;
        });

        console.log(`Recent sales for ${salesman.name}:`, recentSales.length);
        console.log('Active SKUs count:', activeSKUs.length);

        // Find SKUs with NO sales in this period
        const missing = activeSKUs.filter(sku => {
          const skuSales = recentSales.filter(t => t.skuId === sku.id);
          const totalQty = skuSales.reduce((sum, t) => sum + t.quantity, 0);
          return totalQty === 0;
        });

        console.log(`Missing SKUs for ${salesman.name}:`, missing.length);
        if (missing.length > 0) {
          console.log('Missing SKU names:', missing.map(s => s.name).join(', '));
        }

        if (missing.length > 0) {
          console.log('✓ Showing analysis popup');
          setMissingSKUs(missing);
          setShowAnalysisPopup(true);
          console.log('✓ Analysis popup state set');
          // Don't set view to 'entry' yet, wait for popup close
        } else {
          // No missing SKUs, proceed to entry
          console.log('✓ No missing SKUs, proceeding to entry');
          prepareEntryView(salesman);
          console.log('✓ prepareEntryView called');
        }
      } else {
        // Before 5th, proceed directly
        console.log('✓ Before 5th, proceeding directly to entry');
        prepareEntryView(salesman);
        console.log('✓ prepareEntryView called');
      }

      console.log('=== SALESMAN SELECTION COMPLETED ===');
    } catch (error) {
      console.error('❌ ERROR in handleSelectSalesman:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      alert(`Error selecting salesman: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  function prepareEntryView(salesman: User) {
    // Pre-fill with existing data if available
    const existingSales = getSalesmanSalesForDate(salesman.id, selectedDate);
    const inputs: Record<string, { packs: string; outlets: string }> = {};
    existingSales.forEach(sale => {
      inputs[sale.skuId] = {
        packs: sale.quantity.toString(),
        outlets: (sale.outletCount || 0).toString()
      };
    });
    setSalesInputs(inputs);
    setShowSuccess(false);
    setView('entry');
  };

  const handleBack = () => {
    if (view === 'entry') {
      setSelectedSalesman(null);
      setSalesInputs({});
      setShowSuccess(false);
      setView('salesman-list');
    } else if (view === 'salesman-list') {
      setView('home');
    }
  };

  const handleInputChange = (skuId: string, field: 'packs' | 'outlets', value: string) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setSalesInputs(prev => ({
        ...prev,
        [skuId]: {
          ...prev[skuId],
          [field]: value
        }
      }));
    }
  };

  const handleSubmitSales = async () => {
    if (!selectedSalesman || !currentUser) return;

    // Prevent future date entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    if (selected > today) {
      alert('Cannot enter sales data for future dates. Please select today or a previous date.');
      return;
    }

    setIsSaving(true);
    try {
      // Validate entries
      for (const sku of activeSKUs) {
        const packs = parseInt(salesInputs[sku.id]?.packs || '0', 10);
        const outlets = parseInt(salesInputs[sku.id]?.outlets || '0', 10);

        // Validation: If one is > 0, other MUST be > 0
        if ((packs > 0 && outlets === 0) || (packs === 0 && outlets > 0)) {
          alert(`Error for SKU ${sku.name}: Cannot have tickets without outlets or vice versa.`);
          setIsSaving(false);
          return;
        }
      }

      // Prepare entries
      const entries = activeSKUs.map(sku => ({
        skuId: sku.id,
        quantity: parseInt(salesInputs[sku.id]?.packs || '0', 10),
        outletCount: parseInt(salesInputs[sku.id]?.outlets || '0', 10),
        points: parseInt(salesInputs[sku.id]?.packs || '0', 10) * sku.pointsPerUnit,
      }));

      // Save transactions
      await addBulkSaleTransactions(selectedSalesman.id, entries, selectedDate);

      // Save mapped outlets if provided
      if (mappedOutletsInput && !isNaN(parseInt(mappedOutletsInput))) {
        await setSalesmanMappedOutlets(
          selectedSalesman.id,
          parseInt(mappedOutletsInput),
          currentUser.name
        );
      }

      setShowSuccess(true);

      // Auto-return to DS list after 1.5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedSalesman(null);
        setSalesInputs({});
        setView('salesman-list');
      }, 1500);
    } catch (error) {
      console.error('Failed to save sales:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasAnyData = Object.values(salesInputs).some(
    v => parseInt(v?.packs || '0', 10) > 0 || parseInt(v?.outlets || '0', 10) > 0
  );

  // Date navigation
  const handlePrevDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDate = () => {
    const date = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      date.setDate(date.getDate() + 1);
      setSelectedDate(date.toISOString().split('T')[0]);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // Loading state
  if (isLoadingData || isSalesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  // Analysis Popup - CHECK THIS FIRST before any view rendering
  if (showAnalysisPopup && selectedSalesman) {
    console.log('🔔 Rendering Analysis Popup');
    return (
      <AnalysisPopup
        isOpen={showAnalysisPopup}
        onClose={() => {
          console.log('Analysis popup closed');
          setShowAnalysisPopup(false);
          prepareEntryView(selectedSalesman);
        }}
        missingSKUs={missingSKUs}
        salesmanName={selectedSalesman.name}
      />
    );
  }

  // HOME VIEW
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white px-4 pt-6 pb-10 rounded-b-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/80 text-sm">Welcome back,</p>
              <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut size={20} />
            </Button>
          </div>

          {/* Date Selector */}
          <div className="flex items-center justify-between bg-white/10 rounded-xl p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevDate}
              className="text-white hover:bg-white/10 h-8 w-8"
            >
              <ChevronLeft size={18} />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span className="font-medium">{formatDate(selectedDate)}</span>
              {isToday && <Badge className="bg-white/20 text-white text-xs">Today</Badge>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDate}
              disabled={isToday}
              className="text-white hover:bg-white/10 h-8 w-8 disabled:opacity-30"
            >
              <ChevronRightIcon size={18} />
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="px-4 -mt-6">
          <Card className="p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <ClipboardList size={18} className="text-primary" />
                Survey Progress
              </h2>
              {completionStats.completed === completionStats.total && completionStats.total > 0 && (
                <Badge className="bg-green-500 text-white">Complete!</Badge>
              )}
            </div>

            {/* Progress Ring */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    className="text-primary"
                    initial={{ strokeDasharray: '0 301.59' }}
                    animate={{
                      strokeDasharray: `${(completionStats.percentage / 100) * 301.59} 301.59`
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">{completionStats.completed}</span>
                  <span className="text-xs text-muted-foreground">of {completionStats.total}</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Salesmen Done</span>
                  <span className="font-bold text-foreground">{completionStats.completed}/{completionStats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Packs</span>
                  <span className="font-bold text-foreground">{completionStats.totalPacks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Outlets</span>
                  <span className="font-bold text-foreground">{completionStats.totalOutlets}</span>
                </div>
              </div>
            </div>

            {/* Pending Salesmen */}
            {completionStats.completed < completionStats.total && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Pending:</p>
                <div className="flex flex-wrap gap-2">
                  {assignedSalesmen
                    .filter(s => !hasSalesmanEntryForDate(s.id, selectedDate))
                    .slice(0, 4)
                    .map(s => (
                      <Badge key={s.id} variant="secondary" className="text-xs">
                        {s.name.split(' ')[0]}
                      </Badge>
                    ))}
                  {assignedSalesmen.filter(s => !hasSalesmanEntryForDate(s.id, selectedDate)).length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{assignedSalesmen.filter(s => !hasSalesmanEntryForDate(s.id, selectedDate)).length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="px-4 mt-4 grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <Package size={24} className="mx-auto text-indigo-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{completionStats.totalPacks}</p>
            <p className="text-xs text-muted-foreground">Packs Sold</p>
          </Card>
          <Card className="p-4 text-center">
            <Store size={24} className="mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {assignedSalesmen.reduce((sum, s) => sum + (getSalesmanMappedOutlets(s.id) || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Outlets Mapped</p>
          </Card>
        </div>

        {/* Calendar Stats */}
        <div className="px-4 mt-6 mb-6">
          <Card className="p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-primary" />
              <h2 className="font-semibold text-foreground">Entry Performance</h2>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[10px] text-muted-foreground font-medium uppercase">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const today = new Date();
                const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

                const days = [];
                // Empty cells for days before start of month
                for (let i = 0; i < firstDayOfMonth; i++) {
                  days.push(<div key={`empty-${i}`} className="h-10"></div>);
                }

                // Days of month
                for (let d = 1; d <= daysInMonth; d++) {
                  // Create date string directly to avoid timezone issues
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(d).padStart(2, '0');
                  const dateStr = `${year}-${month}-${day}`;

                  // Create date object for comparison (set to noon to avoid timezone issues)
                  const date = new Date(year, today.getMonth(), d, 12, 0, 0);

                  // Calculate stats for this day
                  // Count how many of the assigned salesmen have entries for this specific date
                  const salesmenWithSales = assignedSalesmen.filter(salesman => {
                    return transactions.some(t => {
                      // Handle both date strings (YYYY-MM-DD) and ISO timestamps
                      const tDate = t.timestamp.includes('T')
                        ? new Date(t.timestamp).toISOString().split('T')[0]
                        : t.timestamp.split('T')[0]; // Already a date string
                      return tDate === dateStr && t.salesmanId === salesman.id;
                    });
                  }).length;

                  const totalStats = assignedSalesmen.length;
                  const isHalfDone = totalStats > 0 && salesmenWithSales >= (totalStats / 2);
                  const isFuture = date > new Date();

                  let bgColor = 'bg-muted/30';
                  let textColor = 'text-muted-foreground';

                  if (!isFuture && totalStats > 0) {
                    bgColor = isHalfDone ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
                    textColor = isHalfDone ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400';
                  }

                  if (isFuture) {
                    bgColor = 'bg-muted/10 opacity-50';
                  }

                  days.push(
                    <div
                      key={d}
                      className={`h-14 rounded-lg border flex flex-col items-center justify-center relative ${bgColor}`}
                    >
                      <span className={`text-xs font-medium mb-0.5 ${isFuture ? 'text-muted-foreground' : 'text-foreground'}`}>{d}</span>
                      {!isFuture && totalStats > 0 && (
                        <span className={`text-[10px] font-bold ${textColor}`}>
                          {salesmenWithSales}/{totalStats}
                        </span>
                      )}
                    </div>
                  );
                }

                return days;
              })()}
            </div>
          </Card>
        </div>

        {/* Start Entry Button */}
        <div className="px-4 mt-6">
          <Button
            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            onClick={() => setView('salesman-list')}
          >
            <ClipboardList className="mr-2" size={20} />
            {completionStats.completed === 0 ? 'Start Entry' : 'Continue Entry'}
            <ChevronRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    );
  }

  // SALESMAN LIST VIEW
  if (view === 'salesman-list') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white px-4 pt-4 pb-8 rounded-b-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex-1">
              <p className="text-white/80 text-sm">Select Salesman</p>
              <h1 className="text-xl font-bold">{formatDate(selectedDate)}</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoadingData}
              className="text-white/80 hover:text-white hover:bg-white/10"
              title="Refresh salesmen list"
            >
              <RefreshCw size={20} className={isLoadingData ? 'animate-spin' : ''} />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 text-white/90 bg-white/10 rounded-lg px-3 py-2">
            <Users size={16} />
            <span className="text-sm">
              {completionStats.completed}/{completionStats.total} Done
            </span>
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden ml-2">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionStats.percentage}%` }}
              />
            </div>
            <span className="text-sm font-bold">{completionStats.percentage}%</span>
          </div>
        </div>

        {/* Salesmen List */}
        <div className="px-4 -mt-4">
          <Card className="p-4 shadow-lg mb-4">
            <div className="space-y-2">
              {(() => {
                console.log('=== RENDERING SALESMEN LIST ===');
                console.log('Total salesmen:', assignedSalesmen.length);
                console.log('Salesmen names:', assignedSalesmen.map(s => s.name).join(', '));
                const shyamlal = assignedSalesmen.find(s => s.name.toUpperCase().includes('SHYAMLAL'));
                console.log('SHYAMLAL in list:', shyamlal ? 'YES ✅' : 'NO ❌');
                if (shyamlal) {
                  console.log('SHYAMLAL details:', JSON.stringify(shyamlal, null, 2));
                }
                return null;
              })()}
              {assignedSalesmen.map((salesman, index) => {
                const status = getSalesmanStatus(salesman.id);

                return (
                  <motion.div
                    key={salesman.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all hover:border-primary/50 active:bg-muted ${status.hasEntry ? 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20' : ''
                        }`}
                      onClick={() => handleSelectSalesman(salesman)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${status.hasEntry
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                          : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                          }`}>
                          {status.hasEntry ? <Check size={20} /> : salesman.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{salesman.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {status.hasEntry ? (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                {status.totalQty} packs • {status.totalOutlets} / {getSalesmanMappedOutlets(salesman.id)} outlets
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                No entry • {getSalesmanMappedOutlets(salesman.id)} mapped
                              </span>
                            )}
                          </p>
                        </div>
                        <ChevronRight className="text-muted-foreground" size={20} />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ENTRY VIEW
  if (!selectedSalesman) return null;

  const prevDaySales = getPreviousDaySales(selectedSalesman.id);
  const prevDayMap: Record<string, { packs: number; outlets: number }> = {};
  prevDaySales.forEach(s => {
    prevDayMap[s.skuId] = {
      packs: (prevDayMap[s.skuId]?.packs || 0) + s.quantity,
      outlets: (prevDayMap[s.skuId]?.outlets || 0) + (s.outletCount || 0)
    };
  });

  // Calculate totals
  const totalPacks = Object.values(salesInputs).reduce(
    (sum, v) => sum + (parseInt(v?.packs || '0', 10) || 0), 0
  );
  const totalOutlets = Object.values(salesInputs).reduce(
    (sum, v) => sum + (parseInt(v?.outlets || '0', 10) || 0), 0
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white px-4 pt-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <p className="text-white/80 text-sm">Enter Sales For</p>
            <h1 className="text-xl font-bold">{selectedSalesman.name}</h1>
          </div>
        </div>

        {/* Date Badge with validation indicator */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 w-fit">
            <Calendar size={14} />
            <span className="text-sm font-medium">{formatDate(selectedDate)}</span>
          </div>
          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selected = new Date(selectedDate);
            selected.setHours(0, 0, 0, 0);

            if (selected > today) {
              return (
                <p className="text-xs text-red-300 flex items-center gap-1">
                  ⚠️ Future dates cannot be edited
                </p>
              );
            } else if (selected < today) {
              return (
                <p className="text-xs text-white/70">
                  ✓ Editing previous date entry
                </p>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Mapped Outlets Input */}
      <Card className="mx-4 -mt-4 mb-4 p-3 flex items-center justify-between relative z-10 shadow-lg">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <MapPin size={18} className="text-primary" />
          <span className="text-sm">Total Mapped Outlets</span>
        </div>
        <div className="flex items-center gap-2">
          {isEditingMappedOutlets ? (
            <Input
              type="number"
              inputMode="numeric"
              autoFocus
              value={mappedOutletsInput}
              onChange={(e) => setMappedOutletsInput(e.target.value)}
              onBlur={() => setIsEditingMappedOutlets(false)}
              className="w-20 h-8 bg-muted/50 border-border text-center font-bold text-lg"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">{mappedOutletsInput}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary"
                onClick={() => setIsEditingMappedOutlets(true)}
              >
                <Edit2 size={12} />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4 mt-4"
          >
            <Card className="p-4 bg-green-500/10 border-green-500/30">
              <div className="flex items-center gap-3 text-green-600">
                <Check size={20} />
                <span className="font-medium">Sales saved! Returning to list...</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sales Input Form */}
      <div className="px-4 mt-4">
        <Card className="p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-primary" />
            <span className="font-medium text-foreground">Enter Daily Sales</span>
          </div>

          {/* Column Headers */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="flex-1"></div>
            <div className="w-20 text-center">
              <span className="text-xs font-medium text-muted-foreground">Packs</span>
            </div>
            <div className="w-20 text-center">
              <span className="text-xs font-medium text-muted-foreground">Outlets</span>
            </div>
          </div>

          <div className="space-y-4">
            {activeSKUs.map((sku) => (
              <motion.div
                key={sku.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0">
                  <img src={sku.imageUrl} alt={sku.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{sku.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {prevDayMap[sku.id] ? (
                      <span className="text-indigo-500">
                        Yest: {prevDayMap[sku.id].packs}p / {prevDayMap[sku.id].outlets}o
                      </span>
                    ) : (
                      <span>+{sku.pointsPerUnit} pts/pack</span>
                    )}
                  </p>
                </div>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={salesInputs[sku.id]?.packs || ''}
                  onChange={(e) => handleInputChange(sku.id, 'packs', e.target.value)}
                  className="w-20 h-11 text-center text-lg font-bold"
                />
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={salesInputs[sku.id]?.outlets || ''}
                  onChange={(e) => handleInputChange(sku.id, 'outlets', e.target.value)}
                  className="w-20 h-11 text-center text-lg font-bold"
                />
              </motion.div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t flex justify-center">
            <div className="flex items-center gap-4 px-2">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Packs:</span>
              </div>
              <span className="text-lg font-bold text-foreground">{totalPacks}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          className="w-full h-14 text-lg font-bold rounded-xl shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          onClick={handleSubmitSales}
          disabled={(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selected = new Date(selectedDate);
            selected.setHours(0, 0, 0, 0);
            const isFutureDate = selected > today;
            return (!hasAnyData && !Object.keys(salesInputs).length) || isSaving || isFutureDate;
          })()}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={20} />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-2" size={20} />
              SAVE SALES
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Wrapper component with auth check
const TeamLeaderDashboard: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  return (
    <AuthProvider>
      <SalesProvider>
        <TeamLeaderAuthWrapper onReady={() => setIsReady(true)} />
      </SalesProvider>
    </AuthProvider>
  );
};

// Auth wrapper component
const TeamLeaderAuthWrapper: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const { isAuthenticated, currentUser, logout } = useAuth();

  if (!isAuthenticated) {
    return <PinLogin onSuccess={onReady} allowedRoles={['team_leader']} />;
  }

  if (currentUser?.role !== 'team_leader') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="p-6 text-center max-w-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            This page is only accessible to Team Leaders.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Team Leader Phone: <span className="font-mono font-bold">9876543213</span>
          </p>
          <Button onClick={logout} variant="outline" className="w-full">
            Logout & Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return <TeamLeaderContent />;
};

export default TeamLeaderDashboard;