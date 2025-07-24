'use client';

import React, { createContext, useContext } from 'react';

interface NearWalletContextType {
  selector: null;
}

const NearWalletContext = createContext<NearWalletContextType>({
  selector: null
});

export const useNearWallet = () => {
  return useContext(NearWalletContext);
};

export const NearWalletProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NearWalletContext.Provider value={{ selector: null }}>
      {children}
    </NearWalletContext.Provider>
  );
}; 