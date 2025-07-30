'use client';

import React, { useState, useMemo } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { AAVE_VAULT_ABI, ERC20_ABI, getContractAddress, getUSDCAddress } from '@/utils/contracts';
import { validateAmount, validateChainId, DepositSchema, WithdrawSchema, ApprovalSchema } from '@/lib/validation';

export const VaultActions: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  // Validation state
  const [depositError, setDepositError] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [chainError, setChainError] = useState<string | null>(null);

  // Check if current chain is supported and validate
  const isChainSupported = chainId === 84532 || chainId === 421614 || chainId === 11155420 || chainId === 111155111;
  
  // Validate chain on change
  useMemo(() => {
    if (chainId) {
      const error = validateChainId(chainId);
      setChainError(error);
    }
  }, [chainId]);
  
  // Validate deposit amount
  const validateDepositAmount = (amount: string) => {
    if (!amount) {
      setDepositError(null);
      return;
    }
    
    const maxBalance = usdcBalance ? formatUnits(usdcBalance as bigint, 6) : '0';
    const error = validateAmount(amount, maxBalance);
    setDepositError(error);
    
    if (!address || !contractAddress || !usdcAddress) {
      setDepositError('Invalid addresses');
      return;
    }
    
    // Validate with Zod schema
    try {
      DepositSchema.parse({
        amount,
        userAddress: address,
        contractAddress,
        tokenAddress: usdcAddress
      });
         } catch {
       setDepositError('Invalid deposit data');
     }
  };
  
    // Validate withdraw amount
  const validateWithdrawAmount = (amount: string) => {
    if (!amount) {
      setWithdrawError(null);
      return;
    }
    
    // Calculate USDC value of user's shares (shares are typically 1:1 with USDC for this vault)
    // ERC4626 shares usually have same decimals as underlying asset, but shares use 18 decimals
    const userShares = shareBalance ? Number(formatUnits(shareBalance as bigint, 18)) : 0;
    
    // For simplicity, assume 1:1 share to USDC ratio (typical for new vaults)
    // In production, you'd call vault.convertToAssets(shareBalance) 
    const maxWithdrawableUSDC = userShares.toString();
    
    console.log('💳 Withdrawal Validation:', {
      requestedAmount: amount,
      userShares: userShares,
      maxWithdrawableUSDC: maxWithdrawableUSDC,
      rawShareBalance: shareBalance?.toString()
    });
    
    const error = validateAmount(amount, maxWithdrawableUSDC);
    setWithdrawError(error);
    
    if (!address || !contractAddress) {
      setWithdrawError('Invalid addresses');
      return;
    }
    
    // Validate with Zod schema
    try {
      WithdrawSchema.parse({
        amount,
        userAddress: address,
        contractAddress
      });
         } catch {
      setWithdrawError('Invalid withdrawal data');
    }
  };
  const contractAddress = isChainSupported && chainId ? (() => {
    try {
      return getContractAddress(chainId);
    } catch {
      return null;
    }
  })() : null;
  
  // Get USDC address for current network
  const usdcAddress = isChainSupported && chainId ? (() => {
    try {
      return getUSDCAddress(chainId);
    } catch {
      return null;
    }
  })() : null;

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  // Read user's USDC balance
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: usdcAddress as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!chainId && isChainSupported && !!usdcAddress,
    },
  });

  // Debug USDC balance and contract info
  React.useEffect(() => {
    if (address && usdcAddress && chainId) {
      console.log('💰 USDC Balance Debug:', {
        userAddress: address,
        usdcContractAddress: usdcAddress,
        chainId: chainId,
        rawBalance: usdcBalance?.toString(),
        formattedBalance: usdcBalance ? formatUnits(usdcBalance as bigint, 6) : 'null'
      });
    }
  }, [address, usdcAddress, chainId, usdcBalance]);

  // Read user's vault share balance
  const { data: shareBalance, refetch: refetchShareBalance } = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: AAVE_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  // Read total assets in vault
  const { data: totalAssets } = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: AAVE_VAULT_ABI,
    functionName: 'totalAssets',
    query: {
      enabled: !!contractAddress,
    },
  });

  // Read current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && contractAddress ? [address, contractAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!contractAddress && !!usdcAddress,
    },
  });

  // Refetch data when transactions are confirmed
  React.useEffect(() => {
    if (isConfirmed) {
      console.log('✅ Transaction confirmed, refetching balances...');
      if (isApproving) {
        console.log('🔄 Refetching allowance after approval');
        refetchAllowance();
        setIsApproving(false);
      }
      if (isDepositing) {
        console.log('🔄 Refetching USDC and share balances after deposit');
        refetchUsdcBalance();
        refetchShareBalance();
        setIsDepositing(false);
      }
      if (isWithdrawing) {
        console.log('🔄 Refetching USDC and share balances after withdrawal');
        refetchUsdcBalance();
        refetchShareBalance();
        setIsWithdrawing(false);
      }
    }
  }, [isConfirmed, isApproving, isDepositing, isWithdrawing, refetchAllowance, refetchUsdcBalance, refetchShareBalance]);

  // Debug contract addresses and transaction state
  React.useEffect(() => {
    if (address && chainId) {
      console.log('🏗️ Contract Address Debug:', {
        chainId: chainId,
        vaultContract: contractAddress,
        usdcContract: usdcAddress,
        userAddress: address,
        isChainSupported: isChainSupported
      });
    }
  }, [address, chainId, contractAddress, usdcAddress, isChainSupported]);

  // Debug transaction states
  React.useEffect(() => {
    console.log('🔄 Transaction States:', {
      isApproving,
      isDepositing, 
      isWithdrawing,
      isConfirmed,
      isPending
    });
  }, [isApproving, isDepositing, isWithdrawing, isConfirmed, isPending]);

  const handleApprove = async () => {
    if (!address || !contractAddress || !depositAmount || !usdcAddress) return;
    if (depositError) return; // Don't proceed if there are validation errors

    try {
      setIsApproving(true);
      console.log('✅ Starting approval for maximum amount...');
      
      // Validate approval data
      ApprovalSchema.parse({
        amount: depositAmount,
        spenderAddress: contractAddress,
        tokenAddress: usdcAddress,
        userAddress: address
      });
      
      // Approve maximum amount so user doesn't need to approve again
      const maxApproval = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'); // 2^256 - 1
      
      await writeContract({
        address: usdcAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddress as `0x${string}`, maxApproval],
      });
      
      console.log('📝 Approval transaction submitted, waiting for confirmation...');
    } catch (err) {
      console.error('Approve failed:', err);
      setIsApproving(false); // Only reset on error
    }
  };

  const handleDeposit = async () => {
    if (!address || !contractAddress || !depositAmount) return;

    try {
      setIsDepositing(true);
      console.log('💸 Starting deposit:', depositAmount, 'USDC');
      
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: AAVE_VAULT_ABI,
        functionName: 'deposit',
        args: [parseUnits(depositAmount, 6), address], // USDC has 6 decimals
      });
      
      console.log('📝 Deposit transaction submitted, waiting for confirmation...');
    } catch (err) {
      console.error('Deposit failed:', err);
      setIsDepositing(false); // Only reset on error
    }
  };

  const handleWithdraw = async () => {
    if (!address || !contractAddress || !withdrawAmount) return;
    if (withdrawError) return; // Don't proceed if there are validation errors

    try {
      setIsWithdrawing(true);
      console.log('💳 Starting withdrawal:', withdrawAmount, 'USDC');
      
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: AAVE_VAULT_ABI,
        functionName: 'withdraw',
        args: [parseUnits(withdrawAmount, 6), address, address], // USDC has 6 decimals
      });
      
      console.log('📝 Withdrawal transaction submitted, waiting for confirmation...');
    } catch (err) {
      console.error('Withdraw failed:', err);
      setIsWithdrawing(false); // Only reset on error
    }
  };

  const handleAddTokenToWallet = async () => {
    if (!contractAddress) return;

    try {
      // Check if ethereum is available
      if (typeof window !== 'undefined') {
        const ethereum = (window as { ethereum?: { request: (params: { method: string; params: unknown }) => Promise<void> } }).ethereum;
        if (ethereum) {
          await ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: contractAddress,
                symbol: 'avUSDC', // Aave Vault USDC
                decimals: 18,
                image: 'https://cryptologos.cc/logos/aave-aave-logo.png', // Optional: Aave logo
              },
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to add token to wallet:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Vault Actions</h3>
        <p className="text-gray-400 text-center py-8">
          Connect your wallet to deposit or withdraw from the vault
        </p>
      </div>
    );
  }

  if (!isChainSupported) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Vault Actions</h3>
        <div className="text-center py-8">
          <p className="text-yellow-400 mb-4">⚠️ Unsupported Network</p>
          {chainError && (
            <p className="text-red-400 text-sm mb-2">{chainError}</p>
          )}
          <p className="text-gray-400 text-sm mb-4">
            Please switch to one of the supported networks:
          </p>
          <div className="space-y-2 text-sm">
            <div className="text-blue-400">• Base Sepolia (Chain ID: 84532)</div>
            <div className="text-purple-400">• Arbitrum Sepolia (Chain ID: 421614)</div>
            <div className="text-red-400">• Optimism Sepolia (Chain ID: 11155420)</div>
            <div className="text-blue-300">• Ethereum Sepolia (Chain ID: 111155111)</div>
          </div>
        </div>
      </div>
    );
  }

  const depositAmountBigInt = depositAmount ? parseUnits(depositAmount, 6) : BigInt(0);
  const currentAllowance = allowance as bigint || BigInt(0);
  const needsApproval = depositAmountBigInt > currentAllowance;

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-6">Vault Actions</h3>
      
      {/* Vault Stats */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="space-y-4 text-sm">
          <div>
            <div className="text-gray-400">Your USDC Balance</div>
            <div className="text-white font-medium">
              {usdcBalance ? formatUnits(usdcBalance as bigint, 6) : '0.000000'} USDC
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <div className="text-green-400 font-medium">Your Vault Shares (LP Tokens)</div>
            <div className="text-white font-bold text-lg">
              {shareBalance ? formatUnits(shareBalance as bigint, 18) : '0.000000'}
            </div>
            <div className="text-xs text-gray-400 mt-1 mb-3">
              These are your LP tokens representing your share of the vault
            </div>
            <button
              onClick={handleAddTokenToWallet}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
            >
              + Add LP Tokens to Wallet
            </button>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <div className="text-gray-400">Total Vault Assets</div>
            <div className="text-white font-medium">
              {totalAssets ? formatUnits(totalAssets as bigint, 6) : '0.000000'} USDC
            </div>
          </div>
          
          {shareBalance && totalAssets && shareBalance > 0 && (
            <div className="border-t border-gray-700 pt-4">
              <div className="text-blue-400">Your Share Value</div>
              <div className="text-white font-medium">
                ≈ {shareBalance && totalAssets ? 
                  formatUnits((shareBalance as bigint * totalAssets as bigint) / parseUnits("1", 18), 6) 
                  : '0.000000'} USDC
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Estimated value of your vault shares
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div className="space-y-6">
        {/* Deposit Section */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Deposit Amount (USDC)
          </label>
          <div className="space-y-3">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => {
                const value = e.target.value;
                setDepositAmount(value);
                validateDepositAmount(value);
              }}
              placeholder="0.0"
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${
                depositError 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {depositError && (
              <div className="text-red-400 text-xs mt-1">{depositError}</div>
            )}
            
            {/* Approval and Deposit Buttons */}
            <div className="flex space-x-2 w-full">
              {needsApproval && depositAmount && (
                <button
                  onClick={handleApprove}
                  disabled={!depositAmount || depositError !== null || isApproving || isPending || isConfirming}
                  className="flex-1 min-w-0 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-2 rounded-lg transition-colors text-sm"
                >
                  <span className="truncate block">
                    {isApproving || (isPending && !isDepositing && !isWithdrawing) || isConfirming ? 'Approving...' : 'Approve USDC'}
                  </span>
                </button>
              )}
              <button
                onClick={handleDeposit}
                disabled={!depositAmount || depositError !== null || needsApproval || isDepositing || isPending || isConfirming}
                className="flex-1 min-w-0 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-2 rounded-lg transition-colors text-sm"
              >
                <span className="truncate block">
                  {isDepositing || (isPending && !isApproving && !isWithdrawing) || isConfirming ? 'Depositing...' : 'Deposit'}
                </span>
              </button>
            </div>
            
            {needsApproval && depositAmount && (
              <p className="text-xs text-yellow-400">
                You need to approve USDC spending before depositing
              </p>
            )}
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Withdraw Amount (USDC)
          </label>
          <div className="space-y-3">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => {
                const value = e.target.value;
                setWithdrawAmount(value);
                validateWithdrawAmount(value);
              }}
              placeholder="0.0"
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${
                withdrawError 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {withdrawError && (
              <div className="text-red-400 text-xs mt-1">{withdrawError}</div>
            )}
            <button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || withdrawError !== null || isWithdrawing || isPending || isConfirming}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              <span className="truncate block">
                {isWithdrawing || (isPending && !isDepositing && !isApproving) || isConfirming ? 'Withdrawing...' : 'Withdraw'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      {hash && (
        <div className="mt-6 p-3 bg-blue-900 rounded-lg">
          <div className="text-sm text-blue-200">
            Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
          </div>
          {isConfirming && <div className="text-xs text-blue-300 mt-1">Waiting for confirmation...</div>}
          {isConfirmed && (
            <div className="text-xs text-green-300 mt-1">
              ✅ Transaction confirmed! 
              {isDepositing && " You should see your vault shares (LP tokens) updated above."}
              {isWithdrawing && " Your USDC balance should be updated above."}
              {isApproving && " You can now proceed with the deposit."}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-900 rounded-lg">
          <div className="text-sm text-red-200">
            Error: {error.message}
          </div>
        </div>
      )}
    </div>
  );
}; 