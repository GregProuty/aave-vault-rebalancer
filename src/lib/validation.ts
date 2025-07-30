import { z } from 'zod';

// Common validation helpers
const EthereumAddress = z.string().regex(
  /^0x[a-fA-F0-9]{40}$/,
  'Invalid Ethereum address format'
);

const PositiveAmount = z.string()
  .min(1, 'Amount is required')
  .refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    'Amount must be a positive number'
  )
  .refine(
    (val) => {
      const num = parseFloat(val);
      return num <= 1e12; // Reasonable upper limit to prevent overflow
    },
    'Amount is too large'
  );

export const NonNegativeAmount = z.string()
  .refine(
    (val) => {
      if (val === '' || val === '0') return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    },
    'Amount must be a non-negative number'
  );

// Vault Actions Validation
export const DepositSchema = z.object({
  amount: PositiveAmount,
  userAddress: EthereumAddress,
  contractAddress: EthereumAddress,
  tokenAddress: EthereumAddress
}).refine(
  (data) => data.userAddress !== data.contractAddress,
  {
    message: 'User address cannot be the same as contract address',
    path: ['userAddress']
  }
);

export const WithdrawSchema = z.object({
  amount: PositiveAmount,
  userAddress: EthereumAddress,
  contractAddress: EthereumAddress
});

export const ApprovalSchema = z.object({
  amount: PositiveAmount,
  spenderAddress: EthereumAddress,
  tokenAddress: EthereumAddress,
  userAddress: EthereumAddress
});

// Chain validation
export const ChainIdSchema = z.union([
  z.literal(1), // Ethereum mainnet
  z.literal(8453), // Base mainnet
  z.literal(84532), // Base Sepolia testnet
  z.literal(11155111), // Sepolia testnet
  z.literal(111155111), // Ethereum Sepolia testnet (actual contract chain ID)
  z.literal(10), // Optimism mainnet
  z.literal(11155420), // Optimism Sepolia testnet
  z.literal(137), // Polygon
  z.literal(42161), // Arbitrum mainnet
  z.literal(421614) // Arbitrum Sepolia testnet
], {
  errorMap: () => ({ message: 'Unsupported chain ID' })
});

// Balance validation
export const BalanceSchema = z.object({
  balance: z.bigint().nonnegative('Balance cannot be negative'),
  decimals: z.number().int().min(0).max(18, 'Invalid decimal places'),
  symbol: z.string().min(1, 'Token symbol is required'),
  formatted: z.string()
});

// Transaction validation
export const TransactionHashSchema = z.string().regex(
  /^0x[a-fA-F0-9]{64}$/,
  'Invalid transaction hash format'
);

export const TransactionReceiptSchema = z.object({
  hash: TransactionHashSchema,
  status: z.union([z.literal('success'), z.literal('reverted')]),
  blockNumber: z.number().positive(),
  gasUsed: z.bigint().positive()
});

// GraphQL query input validation
export const DateRangeSchema = z.object({
  startDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid start date format'
  ),
  endDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid end date format'
  )
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  {
    message: 'Start date must be before or equal to end date',
    path: ['startDate']
  }
);

export const PerformanceQuerySchema = z.object({
  days: z.number().int().min(1, 'Days must be at least 1').max(365, 'Days cannot exceed 365').optional()
});

export const ChainNameSchema = z.enum(['ethereum', 'base', 'optimism', 'arbitrum', 'polygon'], {
  errorMap: () => ({ message: 'Invalid chain name' })
});

// API Response validation
export const AavePoolDataResponseSchema = z.object({
  chainName: z.string(),
  poolAddress: EthereumAddress,
  totalLiquidity: z.string(),
  totalBorrowed: z.string(),
  utilizationRate: z.number().min(0).max(100),
  supplyAPY: z.number().nonnegative(),
  variableBorrowAPY: z.number().nonnegative(),
  stableBorrowAPY: z.number().nonnegative(),
  lastUpdate: z.string().datetime()
});

export const VaultDataResponseSchema = z.object({
  chainName: z.string(),
  vaultAddress: EthereumAddress,
  totalAssets: z.string(),
  totalShares: z.string(),
  sharePrice: z.number().positive(),
  assetDecimals: z.number().int().min(0).max(18),
  shareDecimals: z.number().int().min(0).max(18),
  lastUpdate: z.string().datetime(),
  sharePriceFormatted: z.string(),
  totalAssetsUSD: z.string(),
  performance24h: z.number()
});

export const PerformanceDataResponseSchema = z.array(z.object({
  id: z.string(),
  date: z.string(),
  totalFundAllocationBaseline: z.string(),
  totalFundAllocationOptimized: z.string(),
  differential: z.string(),
  differentialPercentage: z.number(),
  chains: z.array(z.object({
    chainName: z.string(),
    apyBaseline: z.number().nonnegative(),
    apyOptimized: z.number().nonnegative(),
    allocationBaseline: z.string(),
    allocationOptimized: z.string(),
    utilizationRatio: z.number().min(0).max(100),
    totalSupply: z.string()
  })),
  createdAt: z.string().datetime()
}));

// Form validation helpers
export const validateAmount = (amount: string, maxAmount?: string): string | null => {
  try {
    PositiveAmount.parse(amount);
    
    if (maxAmount) {
      const amountNum = parseFloat(amount);
      const maxNum = parseFloat(maxAmount);
      
      if (amountNum > maxNum) {
        return 'Amount exceeds maximum available';
      }
    }
    
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid amount';
    }
    return 'Validation error';
  }
};

export const validateAddress = (address: string): string | null => {
  try {
    EthereumAddress.parse(address);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid address';
    }
    return 'Validation error';
  }
};

export const validateChainId = (chainId: number): string | null => {
  try {
    ChainIdSchema.parse(chainId);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid chain ID';
    }
    return 'Validation error';
  }
};

// Safe validation helper that doesn't throw
export const safeValidate = <T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(', ');
      return { success: false, error: messages };
    }
    return { success: false, error: 'Validation failed' };
  }
};

// Type exports for TypeScript
export type DepositInput = z.infer<typeof DepositSchema>;
export type WithdrawInput = z.infer<typeof WithdrawSchema>;
export type ApprovalInput = z.infer<typeof ApprovalSchema>;
export type BalanceData = z.infer<typeof BalanceSchema>;
export type TransactionReceipt = z.infer<typeof TransactionReceiptSchema>;
export type AavePoolData = z.infer<typeof AavePoolDataResponseSchema>;
export type VaultData = z.infer<typeof VaultDataResponseSchema>;
export type PerformanceData = z.infer<typeof PerformanceDataResponseSchema>;
export type ChainName = z.infer<typeof ChainNameSchema>; 