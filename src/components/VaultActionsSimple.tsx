'use client';

import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { AAVE_VAULT_ABI, ERC20_ABI, getContractAddress, getUSDCAddress } from '@/utils/contracts';

export const VaultActionsSimple = () => {
  const { address, chainId } = useAccount();
  
  // State management
  const [mode, setMode] = useState<'view' | 'deposit' | 'withdraw'>('view');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    address: chainId ? (getUSDCAddress(chainId) as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!chainId }
  });

  // Read vault shares
  const { data: vaultShares } = useReadContract({
    address: chainId ? (getContractAddress(chainId) as `0x${string}`) : undefined,
    abi: AAVE_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!chainId }
  });

  // Read vault total assets for calculating share value
  const { data: totalAssets } = useReadContract({
    address: chainId ? (getContractAddress(chainId) as `0x${string}`) : undefined,
    abi: AAVE_VAULT_ABI,
    functionName: 'totalAssets',
    query: { enabled: !!chainId }
  });

  // Read total supply
  const { data: totalSupply } = useReadContract({
    address: chainId ? (getContractAddress(chainId) as `0x${string}`) : undefined,
    abi: AAVE_VAULT_ABI,
    functionName: 'totalSupply',
    query: { enabled: !!chainId }
  });

  // Calculate values
  const usdcBalanceFormatted = usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)).toLocaleString() : '0';
  const vaultSharesFormatted = vaultShares ? formatUnits(vaultShares, 18) : '0.0001';
  
  // Calculate estimated share value
  const shareValue = totalAssets && totalSupply && vaultShares 
    ? (parseFloat(formatUnits(totalAssets, 6)) * parseFloat(formatUnits(vaultShares, 18))) / parseFloat(formatUnits(totalSupply, 18))
    : 3;

  // Contract interactions
  const { writeContract: approveUSDC, isPending: isApprovePending } = useWriteContract();
  const { writeContract: depositToVault, isPending: isDepositPending } = useWriteContract();
  const { writeContract: withdrawFromVault, isPending: isWithdrawPending } = useWriteContract();

  // Check USDC allowance
  const { data: allowance } = useReadContract({
    address: chainId ? (getUSDCAddress(chainId) as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && chainId ? [address, getContractAddress(chainId) as `0x${string}`] : undefined,
    query: { enabled: !!address && !!chainId }
  });

  // Handler functions
  const handleApprove = async () => {
    if (!amount || !chainId || !address) return;
    
    try {
      setIsLoading(true);
      await approveUSDC({
        address: getUSDCAddress(chainId) as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [getContractAddress(chainId) as `0x${string}`, parseUnits(amount, 6)]
      });
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || !chainId || !address) return;
    
    try {
      setIsLoading(true);
      await depositToVault({
        address: getContractAddress(chainId) as `0x${string}`,
        abi: AAVE_VAULT_ABI,
        functionName: 'deposit',
        args: [parseUnits(amount, 6), address]
      });
      setAmount('');
      setMode('view');
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !chainId || !address) return;
    
    try {
      setIsLoading(true);
      await withdrawFromVault({
        address: getContractAddress(chainId) as `0x${string}`,
        abi: AAVE_VAULT_ABI,
        functionName: 'withdraw',
        args: [parseUnits(amount, 6), address, address]
      });
      setAmount('');
      setMode('view');
    } catch (error) {
      console.error('Withdraw failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Validation
  const isAmountValid = amount && parseFloat(amount) > 0;
  const hasEnoughBalance = mode === 'deposit' 
    ? usdcBalance && parseFloat(amount) <= parseFloat(formatUnits(usdcBalance, 6))
    : vaultShares && parseFloat(amount) <= shareValue;
  
  const needsApproval = mode === 'deposit' && allowance && parseFloat(amount) > parseFloat(formatUnits(allowance, 6));
  const canProceed = isAmountValid && hasEnoughBalance && !isLoading;

  if (mode === 'view') {
    return (
      <div className="bg-black border border-gray-700 text-white rounded-lg p-6">
        {/* Balance Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Balance</h3>
          
          <div className="flex items-center space-x-3 mb-4">
            {/* USDC Icon */}
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">$</span>
            </div>
            
            <div>
              <div className="text-2xl font-semibold">${shareValue.toFixed(2)}</div>
              <div className="text-gray-400 text-sm">4.47% APY</div>
            </div>
          </div>
        </div>

        {/* Vault Shares */}
        <div className="mb-6">
          <h4 className="text-gray-400 text-sm mb-2">Vault shares</h4>
          <div className="flex items-center justify-between">
            <span className="text-lg">
              {vaultSharesFormatted} <span className="text-gray-400 text-sm">LP tokens</span>
            </span>
            <button className="text-gray-400 text-sm border border-gray-600 px-3 py-1 rounded hover:bg-gray-800 transition-colors">
              Add to Wallet
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setMode('withdraw')}
            className="bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Withdraw
          </button>
          <button 
            onClick={() => setMode('deposit')}
            className="bg-white text-black py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Deposit
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{address ? `${address.slice(0, 6)}...` : '0x123...'}</span>
            <span className="text-gray-400">{usdcBalanceFormatted} USDC</span>
            <button className="text-gray-400">•••</button>
          </div>
        </div>
      </div>
    );
  }

  // Input form for deposit/withdraw
  return (
    <div className="bg-black border border-gray-700 text-white rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">{mode === 'deposit' ? 'Deposit' : 'Withdraw'}</h3>
        <button 
          onClick={() => {setMode('view'); setAmount('');}}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">
          Amount ({mode === 'deposit' ? 'USDC' : 'USDC value'})
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => {
              if (mode === 'deposit' && usdcBalance) {
                setAmount(formatUnits(usdcBalance, 6));
              } else if (mode === 'withdraw') {
                setAmount(shareValue.toString());
              }
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 text-sm hover:text-blue-300"
          >
            Max
          </button>
        </div>
        
        {/* Balance Info */}
        <div className="mt-2 text-sm text-gray-400">
          Available: {mode === 'deposit' 
            ? `${usdcBalanceFormatted} USDC` 
            : `$${shareValue.toFixed(2)} USDC`
          }
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-3">
        {mode === 'deposit' && needsApproval && (
          <button
            onClick={handleApprove}
            disabled={!canProceed || isApprovePending}
            className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApprovePending ? 'Approving...' : 'Approve USDC'}
          </button>
        )}
        
        <button
          onClick={mode === 'deposit' ? handleDeposit : handleWithdraw}
          disabled={!canProceed || (mode === 'deposit' && needsApproval) || isDepositPending || isWithdrawPending}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            mode === 'deposit' 
              ? 'bg-white text-black hover:bg-gray-100' 
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          {isDepositPending || isWithdrawPending 
            ? (mode === 'deposit' ? 'Depositing...' : 'Withdrawing...') 
            : (mode === 'deposit' ? 'Deposit' : 'Withdraw')
          }
        </button>
      </div>

      {/* Error/Warning Messages */}
      {!hasEnoughBalance && amount && (
        <div className="mt-3 text-red-400 text-sm">
          Insufficient {mode === 'deposit' ? 'USDC' : 'vault'} balance
        </div>
      )}
    </div>
  );
};

export default VaultActionsSimple;
