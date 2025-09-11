'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const triggerDeposit = () => {
    if (depositCallback) {
      depositCallback();
    }
  };

  const setTriggerDepositCallback = (callback: () => void) => {
    setDepositCallback(() => callback);
  };

  const contextValue: DepositContextType = {
    triggerDeposit,
    setTriggerDepositCallback,
  };

  return (
    <DepositContext.Provider value={contextValue}>
      {children}
    </DepositContext.Provider>
  );
};
