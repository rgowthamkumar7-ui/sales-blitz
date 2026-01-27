import React from 'react';
import { motion } from 'framer-motion';
import { Home, BarChart3, ShoppingBag } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';

type NavItem = 'home' | 'sales' | 'performance';

interface BottomNavProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeItem, onNavigate }) => {
  const { lightTap } = useHapticFeedback();

  const navItems: { id: NavItem; icon: React.ElementType; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'sales', icon: ShoppingBag, label: 'Sales' },
    { id: 'performance', icon: BarChart3, label: 'Stats' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 pb-safe z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                lightTap();
                onNavigate(item.id);
              }}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-6 rounded-xl transition-colors touch-manipulation",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon size={24} />
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
