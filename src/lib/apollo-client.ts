import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';

// GraphQL endpoint - update this to match your backend URL
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// GraphQL Queries for AAVE data
export const GET_PERFORMANCE_DATA = gql`
  query GetPerformanceData($startDate: Date!, $endDate: Date!) {
    performanceData(startDate: $startDate, endDate: $endDate) {
      date
      totalFundAllocationBaseline
      totalFundAllocationOptimized
      differential
      differentialPercentage
      chains {
        chainName
        apyBaseline
        apyOptimized
        allocationBaseline
        allocationOptimized
        utilizationRatio
        totalSupply
      }
    }
  }
`;

export const GET_CURRENT_ALLOCATION = gql`
  query GetCurrentAllocation {
    currentAllocation {
      chains {
        name
        apy
        allocation
        totalValue
        color
        icon
      }
      totalValue
      lastUpdate
    }
  }
`;

export const GET_AAVE_POOL_DATA = gql`
  query GetAavePoolData($chainName: String!) {
    aavePoolData(chainName: $chainName) {
      chainName
      poolAddress
      totalLiquidity
      totalBorrowed
      utilizationRate
      supplyAPY
      variableBorrowAPY
      stableBorrowAPY
      lastUpdate
    }
  }
`;

export const GET_ALL_CHAIN_DATA = gql`
  query GetAllChainData {
    allChainData {
      chainName
      chainId
      aavePool {
        totalLiquidity
        totalBorrowed
        utilizationRate
        supplyAPY
        lastUpdate
      }
      totalDeposited
      activeUsers
      lastRebalance
    }
  }
`;

export const GET_PERFORMANCE_METRICS = gql`
  query GetPerformanceMetrics {
    performanceMetrics {
      totalGain
      totalGainPercentage
      averageDailyGain
      averageDailyGainPercentage
      bestPerformingChain
      worstPerformingChain
      rebalanceCount
      totalDaysTracked
      sharpeRatio
      maxDrawdown
      volatility
    }
  }
`; 