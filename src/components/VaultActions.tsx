'use client';

import React, { useState, useMemo } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { AAVE_VAULT_ABI, ERC20_ABI, getContractAddress, getUSDCAddress } from '@/utils/contracts';
import { validateAmount, validateChainId, DepositSchema, WithdrawSchema, ApprovalSchema } from '@/lib/validation';
import { useWelcome } from '@/contexts/WelcomeContext';

// Mobile Number Pad Component
const NumberPad = ({ onNumberClick, onBackspace, onClear }: {
  onNumberClick: (num: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}) => {
  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'], 
    ['7', '8', '9'],
    ['', '0', '⌫']
  ];

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {numbers.flat().map((num, index) => (
        <button
          key={index}
          onClick={() => {
            if (num === '⌫') onBackspace();
            else if (num === '') onClear();
            else if (num) onNumberClick(num);
          }}
          className={`h-12 rounded-lg font-medium ${
            num === '⌫' 
              ? 'bg-gray-600 text-white' 
              : num === ''
              ? 'invisible'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          disabled={num === ''}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

// Mobile Modal Component
const MobileModal = ({ isOpen, children }: {
  isOpen: boolean;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]">
        {children}
      </div>
    </div>
  );
};

export const VaultActions: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const { hasDeposits } = useWelcome();
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

  // Mobile state
  const [showMobileDeposit, setShowMobileDeposit] = useState(false);
  const [showMobileWithdraw, setShowMobileWithdraw] = useState(false);
  const [mobileAmount, setMobileAmount] = useState('');
  const [mobileStep, setMobileStep] = useState<'input' | 'confirm' | 'progress' | 'success' | 'error'>('input');

  // Check if current chain is supported and validate
  const isChainSupported = chainId === 1 || chainId === 84532 || chainId === 421614 || chainId === 11155420 || chainId === 111155111;
  
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
    // ERC4626 shares use same decimals as underlying asset (6 decimals for USDC)
    const userShares = shareBalance ? Number(formatUnits(shareBalance as bigint, 6)) : 0;
    
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

  // Debug share balance and vault balances
  React.useEffect(() => {
    if (address && shareBalance !== undefined) {
      const formattedShares = shareBalance ? formatUnits(shareBalance as bigint, 6) : '0';
      console.log('📊 Share Balance Debug:', {
        userAddress: address,
        rawShareBalance: shareBalance?.toString(),
        formattedShares: formattedShares,
        shareDecimals: '6 (same as USDC)',
        hasShares: shareBalance ? shareBalance > BigInt(0) : false
      });
    }
  }, [address, shareBalance]);

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

  // Mobile handlers
  const handleMobileNumberInput = (num: string) => {
    setMobileAmount(prev => prev + num);
  };

  const handleMobileBackspace = () => {
    setMobileAmount(prev => prev.slice(0, -1));
  };

  const handleMobileClear = () => {
    setMobileAmount('');
  };

  const handleMobileDeposit = () => {
    setShowMobileDeposit(true);
    setMobileStep('input');
    setMobileAmount('');
  };

  const handleMobileWithdraw = () => {
    setShowMobileWithdraw(true);
    setMobileStep('input');
    setMobileAmount('');
  };

  const handleMobileConfirm = async () => {
    if (!address || !contractAddress || !mobileAmount) return;
    
    setMobileStep('progress');
    
    try {
      if (showMobileDeposit) {
        // Mobile deposit flow
        setIsDepositing(true);
        console.log('💸 Starting mobile deposit:', mobileAmount, 'USDC');
        
        await writeContract({
          address: contractAddress as `0x${string}`,
          abi: AAVE_VAULT_ABI,
          functionName: 'deposit',
          args: [parseUnits(mobileAmount, 6), address], // USDC has 6 decimals
        });
        
        console.log('📝 Mobile deposit transaction submitted');
      } else if (showMobileWithdraw) {
        // Mobile withdraw flow  
        setIsWithdrawing(true);
        console.log('💳 Starting mobile withdrawal:', mobileAmount, 'USDC');
        
        await writeContract({
          address: contractAddress as `0x${string}`,
          abi: AAVE_VAULT_ABI,
          functionName: 'withdraw',
          args: [parseUnits(mobileAmount, 6), address, address], // USDC has 6 decimals
        });
        
        console.log('📝 Mobile withdrawal transaction submitted');
      }
    } catch (err) {
      console.error('Mobile transaction failed:', err);
      setMobileStep('error');
      setIsDepositing(false);
      setIsWithdrawing(false);
    }
  };

  const handleMobileApprove = async () => {
    if (!address || !contractAddress || !mobileAmount || !usdcAddress) return;
    
    setMobileStep('progress');
    setIsApproving(true);
    
    try {
      console.log('✅ Starting mobile approval...');
      
      // Approve maximum amount so user doesn't need to approve again
      const maxApproval = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      
      await writeContract({
        address: usdcAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddress as `0x${string}`, maxApproval],
      });
      
      console.log('📝 Mobile approval transaction submitted');
    } catch (err) {
      console.error('Mobile approval failed:', err);
      setMobileStep('error');
      setIsApproving(false);
    }
  };

  const handleMobileClose = () => {
    setShowMobileDeposit(false);
    setShowMobileWithdraw(false);
    setMobileStep('input');
    setMobileAmount('');
  };

  // Monitor transaction confirmation for mobile flows
  React.useEffect(() => {
    if (hash && (showMobileDeposit || showMobileWithdraw)) {
      if (isConfirmed) {
        if (isApproving) {
          // Approval completed, move to deposit confirmation
          setMobileStep('confirm');
          setIsApproving(false);
        } else {
          // Deposit/withdraw completed
          setMobileStep('success');
          setIsDepositing(false);
          setIsWithdrawing(false);
          // Refetch balances
          refetchUsdcBalance();
          refetchShareBalance();
        }
      } else if (isConfirming) {
        setMobileStep('progress');
      }
    }
  }, [hash, isConfirmed, isConfirming, isApproving, showMobileDeposit, showMobileWithdraw, refetchUsdcBalance, refetchShareBalance]);

  if (!isConnected) {
    return (
      <div className="bg-black rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Vault Actions</h3>
        <p className="text-gray-400 text-center py-8">
          Connect your wallet to deposit or withdraw from the vault
        </p>
      </div>
    );
  }

  if (!isChainSupported) {
    return (
      <div className="bg-black rounded-lg p-6 border border-gray-800">
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
    <>
      {/* Desktop Layout */}
      <div className="hidden md:block bg-black rounded-lg p-6 border border-gray-800">
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
              {shareBalance ? formatUnits(shareBalance as bigint, 6) : '0.000000'}
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
                ≈ {shareBalance ? 
                  formatUnits(shareBalance as bigint, 6) 
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

        {/* Withdraw Section - Only show if user has deposits */}
        {hasDeposits && (
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
        )}
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

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Balance Card */}
        <div className="bg-black rounded-lg p-4 border border-gray-800 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Balance</h3>
            <button className="text-blue-400 text-sm">Add to Wallet</button>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">$</span>
            </div>
            <div>
              <div className="text-2xl font-light text-white">
                {shareBalance ? Number(formatUnits(shareBalance as bigint, 6)).toLocaleString() : '0'}
              </div>
              <div className="text-gray-400 text-sm">
                {shareBalance ? formatUnits(shareBalance as bigint, 6) : '0.0000'} LP Shares
              </div>
            </div>
          </div>
          
          <div className="text-gray-400 text-sm mb-4">
            4.87% APY
          </div>
          
          <div className={`grid gap-3 ${hasDeposits ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {hasDeposits && (
              <button
                onClick={handleMobileWithdraw}
                className="bg-gray-700 text-white py-3 px-4 rounded-lg font-medium"
              >
                Withdraw
              </button>
            )}
            <button
              onClick={handleMobileDeposit}
              className="bg-white text-black py-3 px-4 rounded-lg font-medium"
            >
              Deposit
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Deposit Modal */}
      <MobileModal isOpen={showMobileDeposit}>
        {mobileStep === 'input' && (
          <div className="p-4 pt-12">
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium text-white mb-2">Deposit</h2>
              <div className="text-gray-400 text-sm">Enter amount in USDC</div>
            </div>
            
            <div className="mb-8">
              <div className="text-center text-4xl font-light text-white mb-2">
                {mobileAmount || '0'}
              </div>
              <div className="text-center text-gray-400 text-sm">USDC</div>
            </div>
            
            <NumberPad
              onNumberClick={handleMobileNumberInput}
              onBackspace={handleMobileBackspace}
              onClear={handleMobileClear}
            />
            
            <div className="p-4 space-y-3">
              <button
                onClick={handleMobileClose}
                className="w-full bg-gray-700 text-white py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Check if approval is needed
                  const mobileAmountBigInt = mobileAmount ? parseUnits(mobileAmount, 6) : BigInt(0);
                  const currentAllowance = allowance as bigint || BigInt(0);
                  const needsApproval = mobileAmountBigInt > currentAllowance;
                  
                  if (needsApproval) {
                    handleMobileApprove();
                  } else {
                    setMobileStep('confirm');
                  }
                }}
                disabled={!mobileAmount}
                className="w-full bg-white text-black py-3 rounded-lg font-medium disabled:bg-gray-600 disabled:text-gray-400"
              >
                {(() => {
                  const mobileAmountBigInt = mobileAmount ? parseUnits(mobileAmount, 6) : BigInt(0);
                  const currentAllowance = allowance as bigint || BigInt(0);
                  const needsApproval = mobileAmountBigInt > currentAllowance;
                  return needsApproval ? 'Approve USDC' : 'Continue';
                })()}
              </button>
            </div>
          </div>
        )}

        {mobileStep === 'confirm' && (
          <div className="p-4 pt-12">
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium text-white mb-2">Deposit</h2>
              <div className="text-gray-400 text-sm">Confirm transaction</div>
            </div>
            
            <div className="mb-8">
              <div className="text-center text-4xl font-light text-white mb-2">
                {mobileAmount}
              </div>
              <div className="text-center text-gray-400 text-sm">USDC</div>
            </div>
            
            <div className="p-4 space-y-3">
              <button
                onClick={handleMobileClose}
                className="w-full bg-gray-700 text-white py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleMobileConfirm}
                className="w-full bg-white text-black py-3 rounded-lg font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {mobileStep === 'progress' && (
          <div className="p-4 pt-12 text-center">
            <h2 className="text-xl font-medium text-white mb-4">Deposit in progress...</h2>
            <div className="mb-8">
              <div className="text-4xl font-light text-white mb-2">{mobileAmount}</div>
              <div className="text-gray-400 text-sm">USDC</div>
            </div>
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
          </div>
        )}

        {mobileStep === 'success' && (
          <div className="p-4 pt-12 text-center">
            <div className="text-green-400 text-sm mb-4">Your deposit was successful! ✅</div>
            <div className="mb-8">
              <div className="text-4xl font-light text-white mb-2">{mobileAmount}</div>
              <div className="text-gray-400 text-sm">USDC deposited</div>
            </div>
            <button
              onClick={handleMobileClose}
              className="w-full bg-white text-black py-3 rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        )}

        {mobileStep === 'error' && (
          <div className="p-4 pt-12 text-center">
            <div className="text-red-400 text-sm mb-4">Your deposit failed. Please try again!</div>
            <div className="mb-8">
              <div className="text-4xl font-light text-white mb-2">{mobileAmount}</div>
              <div className="text-gray-400 text-sm">USDC</div>
            </div>
            <button
              onClick={handleMobileClose}
              className="w-full bg-white text-black py-3 rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        )}
      </MobileModal>

      {/* Mobile Withdraw Modal */}
      <MobileModal isOpen={showMobileWithdraw}>
        {mobileStep === 'input' && (
          <div className="p-4 pt-12">
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium text-white mb-2">Withdraw</h2>
              <div className="text-gray-400 text-sm">
                You can withdraw from Yieldr with one click below. The transaction typically
                takes 5 minutes and will arrive to the same wallet you connected.
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Deposits</span>
                <span className="text-white">{mobileAmount || '1230'} USDC</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Yield</span>
                <span className="text-white">247 USDC</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white">1477 USDC</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <button
                onClick={handleMobileClose}
                className="w-full bg-gray-700 text-white py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setMobileStep('confirm')}
                className="w-full bg-white text-black py-3 rounded-lg font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {mobileStep === 'progress' && (
          <div className="p-4 pt-12 text-center">
            <h2 className="text-xl font-medium text-white mb-4">Withdrawal in progress...</h2>
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Deposits</span>
                <span className="text-white">1230 USDC</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Yield</span>
                <span className="text-white">247 USDC</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white">1477 USDC</span>
                </div>
              </div>
            </div>
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
          </div>
        )}

        {mobileStep === 'success' && (
          <div className="p-4 pt-12 text-center">
            <div className="text-green-400 text-sm mb-4">Your withdrawal was successful! ✅</div>
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Deposits</span>
                <span className="text-white">1230 USDC</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Yield</span>
                <span className="text-white">247 USDC</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white">1477 USDC</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-gray-700 text-white py-3 rounded-lg">
                View transaction
              </button>
              <button
                onClick={handleMobileClose}
                className="w-full bg-white text-black py-3 rounded-lg font-medium"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {mobileStep === 'error' && (
          <div className="p-4 pt-12 text-center">
            <div className="text-red-400 text-sm mb-4">Your withdrawal failed. Please try again!</div>
            <button
              onClick={handleMobileClose}
              className="w-full bg-white text-black py-3 rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        )}
      </MobileModal>
    </>
  );
}; 