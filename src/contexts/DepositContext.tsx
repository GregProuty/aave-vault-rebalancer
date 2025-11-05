'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

interface DepositContextType {
  triggerDeposit: () => void;
  setTriggerDepositCallback: (callback: () => void) => void;
}

const DepositContext = createContext<DepositContextType | undefined>(undefined);

export const useDeposit = () => {
  const context = useContext(DepositContext);
  if (!context) {
    throw new Error('useDeposit must be used within a DepositProvider');
  }
  return context;
};

interface DepositProviderProps {
  children: ReactNode;
}

export const DepositProvider: React.FC<DepositProviderProps> = ({ children }) => {
  const [depositCallback, setDepositCallback] = useState<(() => void) | null>(null);

  const triggerDeposit = useCallback(() => {
    if (depositCallback) {
      depositCallback();
    }
  }, [depositCallback]);

  const setTriggerDepositCallback = useCallback((callback: () => void) => {
    setDepositCallback(() => callback);
  }, []);

  const contextValue: DepositContextType = useMemo(() => ({
    triggerDeposit,
    setTriggerDepositCallback,
  }), [triggerDeposit, setTriggerDepositCallback]);

  return (
    <DepositContext.Provider value={contextValue}>
      {children}
    </DepositContext.Provider>
  );
};

