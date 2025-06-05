# Ethereum Wallet Integration Setup

This guide explains how to connect your React frontend to the Ethereum AaveVault contracts.

## Overview

The application has been migrated from NEAR Protocol to Ethereum, featuring:
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Wallet Integration**: RainbowKit + Wagmi + Viem
- **Smart Contract**: AaveVault (ERC4626 compliant)
- **Supported Networks**: Localhost (31337), Base Sepolia (84532)

## Contract Information

### AaveVault Contract
- **Localhost**: `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`
- **Base Sepolia**: `0x23a4e6740F7b658Ad5041D1720b16508a725d53d` (verify this address)

### Key Functions
- `deposit(uint256 assets, address receiver)` - Deposit assets to get vault shares
- `withdraw(uint256 assets, address receiver, address owner)` - Withdraw assets by burning shares
- `redeem(uint256 shares, address receiver, address owner)` - Redeem shares for assets
- `balanceOf(address account)` - Get user's vault share balance
- `totalAssets()` - Get total assets in the vault

## Setup Instructions

### 1. Install Dependencies
```bash
cd rebalancer
npm install
```

### 2. Configure WalletConnect (Optional)
Update the `projectId` in `src/contexts/EthereumWalletContext.tsx`:
```typescript
const config = getDefaultConfig({
  appName: 'AAVE Vault Rebalancer',
  projectId: 'your-wallet-connect-project-id', // Get from https://cloud.walletconnect.com
  // ...
});
```

### 3. Update Contract Addresses
If you have different contract addresses, update `src/utils/contracts.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  localhost: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
  baseSepolia: 'YOUR_BASE_SEPOLIA_ADDRESS', // Update this
} as const;
```

### 4. Run the Application
```bash
npm run dev
```

## Usage

### Connecting Wallet
1. Click "Connect Wallet" button
2. Choose your preferred wallet (MetaMask, WalletConnect, etc.)
3. Approve the connection
4. Switch to supported network if needed

### Depositing to Vault
1. Ensure you're connected to a supported network
2. Enter deposit amount in ETH
3. Click "Deposit" button
4. Confirm transaction in your wallet
5. Wait for transaction confirmation

### Withdrawing from Vault
1. Enter withdrawal amount in ETH
2. Click "Withdraw" button
3. Confirm transaction in your wallet
4. Wait for transaction confirmation

## Network Configuration

The app supports these networks:
- **Localhost (31337)**: For local development with Foundry/Anvil
- **Base Sepolia (84532)**: For testnet deployment
- **Ethereum Mainnet (1)**: Ready for production
- **Sepolia (11155111)**: Ethereum testnet

## Development

### Local Development with Foundry
1. Start local Ethereum node:
```bash
cd contracts
anvil
```

2. Deploy contracts:
```bash
forge script script/001_deploy_aave_vault.s.sol --rpc-url http://localhost:8545 --broadcast
```

3. Update contract addresses in frontend
4. Start frontend:
```bash
cd rebalancer
npm run dev
```

### Testing on Base Sepolia
1. Get Base Sepolia ETH from faucet
2. Deploy contracts to Base Sepolia
3. Update contract addresses
4. Connect wallet to Base Sepolia network

## Troubleshooting

### Common Issues

1. **"Wrong network" error**: Switch to supported network in your wallet
2. **Transaction fails**: Check you have enough ETH for gas fees
3. **Contract not found**: Verify contract addresses are correct
4. **Wallet not connecting**: Try refreshing page or clearing browser cache

### Contract Verification
To verify the contract is deployed correctly:
```bash
# Check contract code
cast code 0x610178dA211FEF7D417bC0e6FeD39F05609AD788 --rpc-url http://localhost:8545

# Check total assets
cast call 0x610178dA211FEF7D417bC0e6FeD39F05609AD788 "totalAssets()" --rpc-url http://localhost:8545
```

## Security Considerations

1. **Never share private keys**: Use hardware wallets for production
2. **Verify contract addresses**: Always double-check addresses before interacting
3. **Start with small amounts**: Test with minimal funds first
4. **Keep software updated**: Regularly update dependencies

## Next Steps

1. **Add token approvals**: If the vault uses ERC20 tokens instead of ETH
2. **Implement slippage protection**: For better UX
3. **Add transaction history**: Track user's deposit/withdrawal history
4. **Integrate with DeFi protocols**: Connect to actual yield-generating protocols
5. **Add portfolio analytics**: Show performance metrics and yields

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify network and contract addresses
3. Ensure wallet has sufficient funds
4. Try different wallet providers if connection issues persist 