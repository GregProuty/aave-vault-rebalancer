'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { AAVE_VAULT_ABI, getContractAddress } from '@/utils/contracts';

interface WelcomeContextType {
  showWelcome: boolean;
  hasDeposits: boolean;
  setShowWelcome: (show: boolean) => void;
  dismissWelcome: () => void;
  clearWelcomeStorage: () => void; // For debugging/testing
}

const WelcomeContext = createContext<WelcomeContextType | undefined>(undefined);

export const useWelcome = () => {
  const context = useContext(WelcomeContext);
  if (!context) {
    throw new Error('useWelcome must be used within a WelcomeProvider');
  }
  return context;
};

interface WelcomeProviderProps {
  children: ReactNode;
}

export const WelcomeProvider: React.FC<WelcomeProviderProps> = ({ children }) => {
  const { address, isConnected, chainId } = useAccount();
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasDeposits, setHasDeposits] = useState(false);

  // Reset state when wallet address changes
  useEffect(() => {
    if (address) {
      // Reset states for new wallet
      setHasDeposits(false);
      setShowWelcome(false);
    } else {
      // No wallet connected
      setHasDeposits(false);
      setShowWelcome(false);
    }
  }, [address]);


  // Read user's vault shares to determine if they have deposits
  const { data: vaultShares } = useReadContract({
    address: chainId ? (getContractAddress(chainId) as `0x${string}`) : undefined,
    abi: AAVE_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && !!chainId && isConnected,
    },
  });


  // Update hasDeposits based on vault shares
  useEffect(() => {
    if (vaultShares !== undefined && address) {
      const hasShares = vaultShares > BigInt(0);
      setHasDeposits(hasShares);
    }
  }, [vaultShares, address, chainId]);

  // Show welcome card logic - Show when connected but no deposits
  useEffect(() => {
    if (!isConnected || !address) {
      setShowWelcome(false);
      return;
    }

    // Show welcome card if user is connected and has no deposits
    if (isConnected && !hasDeposits) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, [isConnected, hasDeposits, address]);

  const dismissWelcome = () => {
    // Just a placeholder - welcome will show again if user still has no deposits
    // The real dismissal happens when user makes their first deposit
    setShowWelcome(false);
  };

  // Refetch vault shares when needed (can be called from deposit success)
  // const refreshUserDeposits = () => {
  //   if (isConnected && address && chainId) {
  //     refetchVaultShares();
  //   }
  // };

  const clearWelcomeStorage = () => {
    // No longer needed since we don't use localStorage
  };

  const contextValue: WelcomeContextType = {
    showWelcome,
    hasDeposits,
    setShowWelcome,
    dismissWelcome,
    clearWelcomeStorage,
  };

  return (
    <WelcomeContext.Provider value={contextValue}>
      {children}
    </WelcomeContext.Provider>
  );
};
