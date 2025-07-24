// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  localhost: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
  baseSepolia: '0xDEAfA3ba09ffF027F0dA4c8Ba79C238A547aeBd3', // AaveVault on Base Sepolia
} as const;

// USDC contract addresses for different networks
export const USDC_ADDRESSES = {
  localhost: '0x16f18Ee01365Ef23E0564dfB635215A5B4Eaa3c4', // MockUSDC for local testing
  baseSepolia: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', // Real USDC on Base Sepolia testnet
} as const;

// ERC20 ABI for token operations (approve, balanceOf, etc.)
export const ERC20_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// AaveVault ABI - Essential functions for deposit/withdraw
export const AAVE_VAULT_ABI = [
  // ERC4626 standard functions
  {
    "inputs": [
      {"internalType": "uint256", "name": "assets", "type": "uint256"},
      {"internalType": "address", "name": "receiver", "type": "address"}
    ],
    "name": "deposit",
    "outputs": [{"internalType": "uint256", "name": "shares", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "assets", "type": "uint256"},
      {"internalType": "address", "name": "receiver", "type": "address"},
      {"internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "withdraw",
    "outputs": [{"internalType": "uint256", "name": "shares", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "shares", "type": "uint256"},
      {"internalType": "address", "name": "receiver", "type": "address"},
      {"internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "redeem",
    "outputs": [{"internalType": "uint256", "name": "assets", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View functions
  {
    "inputs": [],
    "name": "totalAssets",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "assets", "type": "uint256"}],
    "name": "previewDeposit",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "assets", "type": "uint256"}],
    "name": "previewWithdraw",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "sender", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "assets", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "shares", "type": "uint256"}
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "sender", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "receiver", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "assets", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "shares", "type": "uint256"}
    ],
    "name": "Withdraw",
    "type": "event"
  }
] as const;

// Helper function to get contract address for current network
export const getContractAddress = (chainId: number): string => {
  switch (chainId) {
    case 31337: // localhost
      return CONTRACT_ADDRESSES.localhost;
    case 84532: // Base Sepolia
      return CONTRACT_ADDRESSES.baseSepolia;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}. Please switch to Base Sepolia (84532) or Localhost (31337) to interact with the deployed contracts.`);
  }
};

// Helper function to get USDC address for current network
export const getUSDCAddress = (chainId: number): string => {
  switch (chainId) {
    case 31337: // localhost
      return USDC_ADDRESSES.localhost;
    case 84532: // Base Sepolia
      return USDC_ADDRESSES.baseSepolia;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}. Please switch to Base Sepolia (84532) or Localhost (31337) to interact with the deployed contracts.`);
  }
}; 