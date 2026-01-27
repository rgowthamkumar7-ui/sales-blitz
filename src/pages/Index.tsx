import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SalesProvider } from '@/contexts/SalesContext';
import PinLogin from '@/components/salesman/PinLogin';
import SalesmanApp from '@/components/salesman/SalesmanApp';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showApp, setShowApp] = useState(false);

  if (!isAuthenticated) {
    return <PinLogin onSuccess={() => setShowApp(true)} />;
  }

  return (
    <SalesProvider>
      <SalesmanApp />
    </SalesProvider>
  );
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
