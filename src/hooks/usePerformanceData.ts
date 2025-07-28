'use client';


import { useQuery, gql } from '@apollo/client';

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
  const totalValue = vaultData ? parseFloat(vaultData.totalAssets) : 0;
  const sharePrice = vaultData ? vaultData.sharePrice : (latestPoint?.vaultSharePrice || 1.0);
  const totalGains = latestPoint ? latestPoint.differential : 0;
  const performance24h = vaultData ? vaultData.performance24h : 0;

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