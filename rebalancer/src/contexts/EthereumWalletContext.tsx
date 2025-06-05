'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { WagmiProvider, http } from 'wagmi';
import { mainnet, sepolia, baseSepolia, localhost } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Wagmi configuration
const config = getDefaultConfig({
  appName: 'AAVE Vault Rebalancer',
  projectId: 'your-wallet-connect-project-id', // Replace with your WalletConnect project ID
  chains: [mainnet, sepolia, baseSepolia, localhost],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [localhost.id]: http(),
  },
});

const queryClient = new QueryClient();

interface EthereumWalletContextType {
  // This can be extended with additional functionality as needed
  initialized: boolean;
}

const EthereumWalletContext = createContext<EthereumWalletContextType | null>(null);

export const useEthereumWallet = () => {
  const context = useContext(EthereumWalletContext);
  if (!context) {
    throw new Error('useEthereumWallet must be used within an EthereumWalletProvider');
  }
  return context;
};

interface EthereumWalletProviderProps {
  children: ReactNode;
}

export const EthereumWalletProvider: React.FC<EthereumWalletProviderProps> = ({ children }) => {
  const value: EthereumWalletContextType = {
    initialized: true,
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <EthereumWalletContext.Provider value={value}>
            {children}
          </EthereumWalletContext.Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}; 