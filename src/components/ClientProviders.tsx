'use client';

import { useState, useEffect } from 'react';
import { WagmiProvider, http } from 'wagmi';
import { mainnet, sepolia, baseSepolia, localhost } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '../lib/apollo-client';
import '@rainbow-me/rainbowkit/styles.css';

// Wagmi configuration - using a minimal config to avoid WalletConnect auth errors
const config = getDefaultConfig({
  appName: 'AAVE Vault Rebalancer',
  projectId: '2f05ae7f2dc0d19002fb4db99c73e1db', // Using a valid demo project ID to avoid auth errors
  chains: [mainnet, sepolia, baseSepolia, localhost],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [localhost.id]: http(),
  },
  ssr: false, // Disable SSR to avoid hydration issues
});

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [isClient, setIsClient] = useState(false);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render providers on client to avoid SSR issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </ApolloProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 