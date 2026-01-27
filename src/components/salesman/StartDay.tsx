import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Search, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { mockOutlets } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useSales } from '@/contexts/SalesContext';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Outlet } from '@/types';

interface StartDayProps {
  onStartSales: () => void;
}

const StartDay: React.FC<StartDayProps> = ({ onStartSales }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout } = useAuth();
  const { selectedOutlet, setSelectedOutlet } = useSales();
  const { lightTap, mediumTap } = useHapticFeedback();

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const filteredOutlets = mockOutlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    outlet.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOutletSelect = (outlet: Outlet) => {
    lightTap();
    setSelectedOutlet(outlet);
  };

  const handleStartSales = () => {
    mediumTap();
    onStartSales();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/80 text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold">{currentUser?.name}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { lightTap(); logout(); }}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut size={20} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-primary-foreground/90">
          <Calendar size={16} />
          <span className="text-sm">{today}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4">
        {/* Search */}
        <Card className="p-3 mb-4 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search outlets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </Card>

        {/* Selected Outlet */}
        {selectedOutlet && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card className="p-4 border-2 border-primary bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{selectedOutlet.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOutlet.area}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 bg-primary-foreground rounded-full"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Outlet List */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {selectedOutlet ? 'Other Outlets' : 'Select an Outlet'}
          </p>
          {filteredOutlets.map((outlet, index) => (
            <motion.div
              key={outlet.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all touch-manipulation ${
                  selectedOutlet?.id === outlet.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50 active:bg-muted'
                }`}
                onClick={() => handleOutletSelect(outlet)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <MapPin className="text-muted-foreground" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{outlet.name}</p>
                    <p className="text-sm text-muted-foreground">{outlet.address}</p>
                  </div>
                  <ChevronRight className="text-muted-foreground" size={18} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Button */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: selectedOutlet ? 0 : 100 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent"
      >
        <Button
          className="w-full h-14 text-lg font-bold rounded-xl shadow-lg"
          onClick={handleStartSales}
          disabled={!selectedOutlet}
        >
          START SALES
          <ChevronRight className="ml-2" size={20} />
        </Button>
      </motion.div>
    </div>
  );
};

export default StartDay;
