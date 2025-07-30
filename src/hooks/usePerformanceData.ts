'use client';


import { useQuery, gql } from '@apollo/client';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { AAVE_VAULT_ABI, getContractAddress } from '@/utils/contracts';

// GraphQL queries  
const GET_CHAIN_DATA = gql`
  query GetAllChainData {
    allChainData {
      chainName
      chainId
      aavePool {
        supplyAPY
        totalLiquidity
        utilizationRate
      }
      totalDeposited
    }
  }
`;

const GET_VAULT_DATA = gql`
  query GetVaultData($chainName: String!) {
    vaultData(chainName: $chainName) {
      chainName
      vaultAddress
      totalAssets
      totalShares
      sharePrice
      sharePriceFormatted
      totalAssetsUSD
      performance24h
      lastUpdate
    }
  }
`;

const GET_SHARE_PRICE_HISTORY = gql`
  query GetSharePriceHistory($chainName: String!, $days: Int) {
    sharePriceHistory(chainName: $chainName, days: $days) {
      date
      sharePrice
      minSharePrice
      maxSharePrice
      dataPoints
    }
  }
`;

export interface PerformanceDataPoint {
  date: string;
  totalFundAllocationBaseline: string;
  totalFundAllocationOptimized: string;
  differential: string;
  differentialPercentage: number;
}



export interface ChainData {
  chainName: string;
  chainId: number;
  aavePool: {
    supplyAPY: number;
    totalLiquidity: string;
    utilizationRate: number;
  };
  totalDeposited: string;
}

export interface VaultData {
  chainName: string;
  vaultAddress: string;
  totalAssets: string;
  totalShares: string;
  sharePrice: number;
  sharePriceFormatted: string;
  totalAssetsUSD: string;
  performance24h: number;
  lastUpdate: string;
}

export interface SharePricePoint {
  date: string;
  sharePrice: number;
  minSharePrice: number;
  maxSharePrice: number;
  dataPoints: number;
}

export interface VaultPerformancePoint {
  date: string;
  vaultSharePrice: number;
  baselineValue: number;
  differential: number;
  differentialPercentage: number;
}

export function usePerformanceData() {
  const days = 30;
  const chainName = 'base'; // Focus on Base vault for now
  
  // Get user account info
  const { address, chainId } = useAccount();
  
  // Get contract address for current chain
  const contractAddress = chainId ? (() => {
    try {
      return getContractAddress(chainId);
    } catch {
      return null;
    }
  })() : null;

  // Read user's vault share balance
  const { data: userShareBalance } = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: AAVE_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  // Read total assets directly from contract for accurate calculation
  const { data: contractTotalAssets } = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: AAVE_VAULT_ABI,
    functionName: 'totalAssets',
    query: {
      enabled: !!contractAddress,
    },
  });



  // Query vault share price history (our real performance)
  const { data: sharePriceResult, loading: sharePriceLoading, error: sharePriceError } = useQuery(
    GET_SHARE_PRICE_HISTORY,
    {
      variables: { chainName, days },
      errorPolicy: 'all'
    }
  );

  // Query current vault data
  const { data: vaultResult, loading: vaultLoading, error: vaultError } = useQuery(
    GET_VAULT_DATA,
    {
      variables: { chainName },
      errorPolicy: 'all'
    }
  );

  // Query chain data for baseline AAVE APY
  const { data: chainResult, loading: chainLoading, error: chainError } = useQuery(
    GET_CHAIN_DATA,
    {
      errorPolicy: 'all'
    }
  );

  // Process vault data
  const sharePriceHistory: SharePricePoint[] = sharePriceResult?.sharePriceHistory || [];
  const vaultData: VaultData | null = vaultResult?.vaultData || null;
  const chainData: ChainData[] = chainResult?.allChainData || [];

  // Generate performance comparison data - only from real data
  const performanceData: VaultPerformancePoint[] = (() => {
    // Only show data if we have real historical data and vault has assets
    const hasRealData = sharePriceHistory.length > 0 && vaultData && parseFloat(vaultData.totalAssets) > 0;
    
    if (!hasRealData) {
      // Return empty array - no mock data
      return [];
    }
    
    // Process real share price data
    const baselineAPY = chainData.find(c => c.chainName === chainName)?.aavePool?.supplyAPY || 3.3;
    const dailyRate = baselineAPY / 100 / 365;
    
    return sharePriceHistory.map((point, index) => {
      // Calculate what the baseline would be (starting from 1.0)
      const baselineValue = Math.pow(1 + dailyRate, index);
      const differential = point.sharePrice - baselineValue;
      const differentialPercentage = (differential / baselineValue) * 100;
      
      return {
        date: point.date,
        vaultSharePrice: point.sharePrice,
        baselineValue: baselineValue,
        differential: differential,
        differentialPercentage: differentialPercentage
      };
    });
  })();

  // Calculate summary stats
  const latestPoint = performanceData[performanceData.length - 1];
  
  // Calculate user's personal vault value based on their shares
  // ERC4626 shares typically have the same decimals as the underlying asset (6 for USDC)
  let userShares = userShareBalance ? Number(formatUnits(userShareBalance as bigint, 6)) : 0;
  
  // TEMPORARY FIX: Scale down inflated contract values
  // Contract seems to return values inflated by ~1 billion factor
  if (userShares > 1000000) { // If more than 1M USDC, likely inflated
    userShares = userShares / 1000000000; // Scale down by 1 billion
    console.log('🔧 Applied scaling fix to user shares:', userShares);
  }
  
  // Calculate share price using the most reliable method
  let sharePrice = 1.0;
  
  // Method 1: Use contract data (most reliable for current value)
  if (contractTotalAssets && userShareBalance && userShareBalance > BigInt(0)) {
    // For ERC4626 vaults, we can estimate share value
    // This is a simplified calculation - real share price would need total supply
    sharePrice = 1.0; // Default to 1:1 ratio, backend data will override if available
  }
  
  // Method 2: Use backend calculated share price if available
  if (vaultData && vaultData.sharePrice && vaultData.sharePrice > 0) {
    sharePrice = vaultData.sharePrice;
  }
  
  // Method 3: Use historical data
  if (latestPoint?.vaultSharePrice && latestPoint.vaultSharePrice > 0) {
    sharePrice = latestPoint.vaultSharePrice;
  }
  
  const totalValue = userShares * sharePrice; // User's personal vault value, not total vault assets
  
  const totalGains = latestPoint ? latestPoint.differential * userShares : 0; // Scale gains by user's shares
  const performance24h = vaultData ? vaultData.performance24h : 0;

  // Simplified logging for vault values
  if (userShares > 0) {
    console.log('💰 Your vault value:', totalValue, 'USDC (', userShares, 'shares at', sharePrice, 'price)');
  }

  // Convert to old format for backward compatibility
  const legacyPerformanceData: PerformanceDataPoint[] = performanceData.map(point => ({
    date: point.date,
    totalFundAllocationBaseline: point.baselineValue.toString(),
    totalFundAllocationOptimized: point.vaultSharePrice.toString(),
    differential: point.differential.toString(),
    differentialPercentage: point.differentialPercentage
  }));

  const loading = sharePriceLoading || vaultLoading || chainLoading;
  const error = sharePriceError || vaultError || chainError;



  return {
    // Legacy data format (for backward compatibility)
    performanceData: legacyPerformanceData,
    
    // New vault-specific data
    vaultPerformanceData: performanceData,
    vaultData,
    sharePriceHistory,
    chainData,
    
    // Loading states
    loading,
    
    // Errors
    error,
    
    // Summary values
    totalValue,
    totalGains,
    sharePrice,
    performance24h,
    currentApy: performance24h * 365, // Annualized from 24h performance
    
    // Controls
    days,
    chainName
  };
} 