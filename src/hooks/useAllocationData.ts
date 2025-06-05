import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { createNearContract } from '@/utils/nearContract';

export interface AllocationItem {
  name: string;
  icon: string;
  apy: number;
  allocation: number;
  color: string;
}

export interface AllocationData {
  allocations: AllocationItem[];
  totalValue: number;
  isLoading: boolean;
  error: string | null;
}

// Default allocation data (fallback)
const DEFAULT_ALLOCATIONS: AllocationItem[] = [
  { name: "Ethereum", icon: "Ξ", apy: 4.7, allocation: 44, color: "#627EEA" },
  { name: "Avalanche", icon: "A", apy: 4, allocation: 27, color: "#E84142" },
  { name: "Base", icon: "B", apy: 3.3, allocation: 14, color: "#0052FF" },
  { name: "BNB Chain", icon: "B", apy: 2.8, allocation: 9, color: "#F3BA2F" },
  { name: "Polygon", icon: "P", apy: 2.4, allocation: 6, color: "#8247E5" }
];

export const useAllocationData = (protocol: 'near' | 'ethereum' = 'ethereum'): AllocationData => {
  const [allocations, setAllocations] = useState<AllocationItem[]>(DEFAULT_ALLOCATIONS);
  const [totalValue, setTotalValue] = useState(1230000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const fetchAllocationData = async () => {
      if (!isConnected) {
        setAllocations(DEFAULT_ALLOCATIONS);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (protocol === 'near') {
          await fetchNearAllocationData();
        } else {
          await fetchEthereumAllocationData();
        }
      } catch (err) {
        console.error('Failed to fetch allocation data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setAllocations(DEFAULT_ALLOCATIONS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllocationData();
  }, [protocol, isConnected, address]);

  const fetchNearAllocationData = async () => {
    // TODO: Implement NEAR contract integration
    // This would require NEAR wallet selector to be available
    // For now, return enhanced mock data based on the screenshot
    const nearAllocations: AllocationItem[] = [
      { name: "Ethereum", icon: "Ξ", apy: 4.7, allocation: 44, color: "#627EEA" },
      { name: "Avalanche", icon: "A", apy: 4.0, allocation: 27, color: "#E84142" },
      { name: "Base", icon: "B", apy: 3.3, allocation: 14, color: "#0052FF" },
      { name: "BNB Chain", icon: "B", apy: 2.8, allocation: 9, color: "#F3BA2F" },
      { name: "Polygon", icon: "P", apy: 2.4, allocation: 6, color: "#8247E5" }
    ];
    
    setAllocations(nearAllocations);
    setTotalValue(1230000);
  };

  const fetchEthereumAllocationData = async () => {
    // TODO: Implement Ethereum contract integration
    // This would fetch data from the AaveVault contract
    // For now, return mock data
    setAllocations(DEFAULT_ALLOCATIONS);
    setTotalValue(1230000);
  };

  return {
    allocations,
    totalValue,
    isLoading,
    error
  };
}; 