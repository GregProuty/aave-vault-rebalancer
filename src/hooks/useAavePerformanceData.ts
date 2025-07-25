'use client';

import { useState, useEffect } from 'react';
import { apolloClient, GET_PERFORMANCE_DATA, GET_ALL_CHAIN_DATA, GET_PERFORMANCE_METRICS } from '@/lib/apollo-client';

export interface PerformanceDataPoint {
  date: string;
  totalFundAllocationBaseline: string;
  totalFundAllocationOptimized: string;
  differential: string;
  differentialPercentage: number;
  chains: ChainPerformance[];
}

export interface ChainPerformance {
  chainName: string;
  apyBaseline: number;
  apyOptimized: number;
  allocationBaseline: string;
  allocationOptimized: string;
  utilizationRatio: number;
  totalSupply: string;
}

export interface AaveChainData {
  chainName: string;
  chainId: number;
  aavePool: {
    totalLiquidity: string;
    totalBorrowed: string;
    utilizationRate: number;
    supplyAPY: number;
    lastUpdate: string;
  };
  totalDeposited: string;
  activeUsers: number;
  lastRebalance?: string;
}

export interface PerformanceMetrics {
  totalGain: string;
  totalGainPercentage: number;
  averageDailyGain: string;
  averageDailyGainPercentage: number;
  bestPerformingChain: string;
  worstPerformingChain: string;
  rebalanceCount: number;
  totalDaysTracked: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
  volatility?: number;
}

export const useAavePerformanceData = (days: number = 30) => {
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [chainData, setChainData] = useState<AaveChainData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Test backend connection first
      const backendUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace('/graphql', '') || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/health`);
      if (!response.ok) {
        throw new Error('Backend server not available');
      }
      
      setIsBackendConnected(true);
      console.log('✅ Connected to AAVE rebalancer backend');

      // Calculate date range
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      // Fetch performance data
      const performanceResult = await apolloClient.query({
        query: GET_PERFORMANCE_DATA,
        variables: { startDate, endDate },
        fetchPolicy: 'network-only'
      });

      if (performanceResult.data?.performanceData) {
        setPerformanceData(performanceResult.data.performanceData);
        console.log('📊 Performance data loaded:', performanceResult.data.performanceData.length, 'days');
      }

      // Fetch all chain data
      const chainResult = await apolloClient.query({
        query: GET_ALL_CHAIN_DATA,
        fetchPolicy: 'network-only'
      });

      if (chainResult.data?.allChainData) {
        setChainData(chainResult.data.allChainData);
        console.log('🌐 Chain data loaded:', chainResult.data.allChainData.length, 'chains');
      }

      // Fetch performance metrics
      const metricsResult = await apolloClient.query({
        query: GET_PERFORMANCE_METRICS,
        fetchPolicy: 'network-only'
      });

      if (metricsResult.data?.performanceMetrics) {
        setMetrics(metricsResult.data.performanceMetrics);
        console.log('📈 Performance metrics loaded');
      }

    } catch (err) {
      console.error('❌ Error fetching AAVE data from backend:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch backend data');
      setIsBackendConnected(false);
      
      // Fall back to mock data for demo
      console.log('⚠️ Using mock data for demonstration');
      setPerformanceData(generateMockPerformanceData(days));
      setChainData(generateMockChainData());
      setMetrics(generateMockMetrics());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up periodic refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [days]);

  return {
    performanceData,
    chainData,
    metrics,
    isLoading,
    error,
    isBackendConnected,
    refetch: fetchData
  };
};

// Mock data generators for fallback
const generateMockPerformanceData = (days: number): PerformanceDataPoint[] => {
  const data: PerformanceDataPoint[] = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    const baseline = 5000000; // $5M baseline
    const differential = Math.random() * 2000 - 500; // -$500 to +$1500 daily
    const optimized = baseline + differential;
    
    data.push({
      date,
      totalFundAllocationBaseline: baseline.toString(),
      totalFundAllocationOptimized: optimized.toString(),
      differential: differential.toString(),
      differentialPercentage: (differential / baseline) * 100,
      chains: [
        {
          chainName: 'ethereum',
          apyBaseline: 4.2 + Math.random() * 0.5,
          apyOptimized: 4.5 + Math.random() * 0.8,
          allocationBaseline: '4000000',
          allocationOptimized: (4000000 + differential * 0.8).toString(),
          utilizationRatio: 0.75 + Math.random() * 0.2,
          totalSupply: '1000000000'
        },
        {
          chainName: 'base',
          apyBaseline: 3.8 + Math.random() * 0.3,
          apyOptimized: 4.2 + Math.random() * 0.6,
          allocationBaseline: '1000000',
          allocationOptimized: (1000000 + differential * 0.2).toString(),
          utilizationRatio: 0.65 + Math.random() * 0.25,
          totalSupply: '500000000'
        }
      ]
    });
  }
  
  return data;
};

const generateMockChainData = (): AaveChainData[] => [
  {
    chainName: 'ethereum',
    chainId: 1,
    aavePool: {
      totalLiquidity: '1200000000',
      totalBorrowed: '900000000',
      utilizationRate: 75.0,
      supplyAPY: 4.47,
      lastUpdate: new Date().toISOString()
    },
    totalDeposited: '4000000',
    activeUsers: 1247
  },
  {
    chainName: 'base',
    chainId: 8453,
    aavePool: {
      totalLiquidity: '650000000',
      totalBorrowed: '420000000',
      utilizationRate: 64.6,
      supplyAPY: 3.84,
      lastUpdate: new Date().toISOString()
    },
    totalDeposited: '1000000',
    activeUsers: 523
  }
];

const generateMockMetrics = (): PerformanceMetrics => ({
  totalGain: '247000',
  totalGainPercentage: 4.94,
  averageDailyGain: '8233',
  averageDailyGainPercentage: 0.165,
  bestPerformingChain: 'ethereum',
  worstPerformingChain: 'polygon',
  rebalanceCount: 15,
  totalDaysTracked: 30,
  sharpeRatio: 1.42,
  maxDrawdown: -2.3,
  volatility: 0.18
}); 