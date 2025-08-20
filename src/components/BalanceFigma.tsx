'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { AAVE_VAULT_ABI, ERC20_ABI, getContractAddress, getUSDCAddress } from '@/utils/contracts';
import { usePerformanceData } from '@/hooks/usePerformanceData';
import { Button } from '@/components/Button';
import { useTransactionStatus } from '@/contexts/TransactionStatusContext';

export const BalanceFigma = () => {
  const { address, isConnected, chainId, connector } = useAccount();
  const [currentState, setCurrentState] = useState<'balance' | 'deposit' | 'withdraw'>('balance');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositStep, setDepositStep] = useState<'input' | 'approving' | 'depositing' | 'confirming' | 'error'>('input');
  const [withdrawStep, setWithdrawStep] = useState<'input' | 'withdrawing' | 'confirming' | 'error'>('input');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get performance data for APY, user's vault value, and totals
  const { currentApy, totalValue: userVaultValue } = usePerformanceData();
  
  // Transaction status context
  const { addMessage, upsertMessage, removeMessage, clearMessages } = useTransactionStatus();
  
  // Contract write hooks
  const { writeContract: writeVault, data: vaultTxHash, isPending: isVaultPending, error: vaultWriteError } = useWriteContract();
  const { writeContract: writeUSDC, data: usdcTxHash, isPending: isUSDCPending, error: usdcWriteError } = useWriteContract();
  
  // Transaction receipt hooks
  const { isSuccess: isVaultTxSuccess, isError: isVaultTxError } = useWaitForTransactionReceipt({ hash: vaultTxHash });
  const { isLoading: isUSDCTxLoading, isSuccess: isUSDCTxSuccess, isError: isUSDCTxError } = useWaitForTransactionReceipt({ hash: usdcTxHash });
  
  // Read user's USDC balance
  const { refetch: refetchUSDCBalance } = useReadContract({
    address: chainId ? getUSDCAddress(chainId) as `0x${string}` : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!chainId }
  });

  // Read current USDC allowance for the vault
  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: chainId ? getUSDCAddress(chainId) as `0x${string}` : undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && chainId ? [address, getContractAddress(chainId) as `0x${string}`] : undefined,
    query: { enabled: !!address && !!chainId }
  });
  
  // Read vault shares (user's balance in the vault)
  const { data: vaultShares, refetch: refetchVaultShares } = useReadContract({
    address: chainId ? getContractAddress(chainId) as `0x${string}` : undefined,
    abi: AAVE_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!chainId }
  });



  // Read vault total assets and total supply for share price calculation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: totalAssets, refetch: refetchTotalAssets } = useReadContract({
    address: chainId ? getContractAddress(chainId) as `0x${string}` : undefined,
    abi: AAVE_VAULT_ABI,
    functionName: 'totalAssets',
    query: { enabled: !!chainId }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: chainId ? getContractAddress(chainId) as `0x${string}` : undefined,
    abi: AAVE_VAULT_ABI,
    functionName: 'totalSupply',
    query: { enabled: !!chainId }
  });

  // Calculate user's balance in USDC
  // Note: userBalance calculation removed as it's not currently used in the UI

  // Format values for display
  // Note: balanceFormatted removed as it's not currently used in the UI
  
  const vaultSharesFormatted = vaultShares 
    ? parseFloat(formatUnits(vaultShares, 6)).toFixed(4)
    : '0.0000';

  // Format USDC balance for display
  // Display user's deposited funds in the vault (not wallet balance)
  const userDepositedFormatted = userVaultValue 
    ? parseFloat(userVaultValue.toString()).toFixed(2)
    : '0.00';





  // Check if user has sufficient allowance for the deposit amount
  const hasEnoughAllowance = (amount: string) => {
    if (!usdcAllowance || !amount) return false;
    const depositAmountInWei = parseUnits(amount, 6);
    return usdcAllowance >= depositAmountInWei;
  };

  // Add LP token to wallet function
  const addTokenToWallet = async () => {
    if (!chainId || !connector) {
      addMessage({
        type: 'error',
        message: 'No wallet connected. Please connect your wallet first.',
      });
      return;
    }
    
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) {
      addMessage({
        type: 'error',
        message: 'Vault contract not available on current network.',
      });
      return;
    }
    
    try {
      // Get the provider from the connected wallet (RainbowKit/Wagmi)
      const provider = await connector.getProvider();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!provider || !(provider as any).request) {
        addMessage({
          type: 'error',
          message: 'Wallet provider not available.',
        });
        return;
      }
      
      console.log('Adding token to wallet:', {
        address: contractAddress,
        symbol: 'AAVE-RB',
        decimals: 6,
        connector: connector?.name,
        chainId: chainId
      });
      
      // Show manual instructions as well in case automatic adding fails
      console.log('Manual token details:', {
        'Contract Address': contractAddress,
        'Token Symbol': 'AAVE-RB',
        'Decimals': 6,
        'Network': chainId === 1 ? 'Ethereum' : chainId === 84532 ? 'Base Sepolia' : chainId
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wasAdded = await (provider as any).request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: contractAddress,
            symbol: 'AAVE-RB',
            decimals: 6,
            image: `${window.location.origin}/logo.svg`,
          },
        },
      });
      
      if (wasAdded) {
        addMessage({
          type: 'success',
          message: 'AAVE-RB LP token successfully added to wallet!',
        });
      } else {
        console.log('User rejected adding token to wallet');
      }
    } catch (error) {
      console.error('Failed to add token to wallet:', error);
      
      // Provide more specific error messages
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).code === 4001) {
        console.log('User rejected the request');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if ((error as any).code === -32602) {
        addMessage({
          type: 'error',
          message: 'Wallet does not support adding custom tokens.',
        });
      } else {
        addMessage({
          type: 'error',
          message: `Failed to add token automatically. Add manually: Address: ${contractAddress}, Symbol: AAVE-RB, Decimals: 6`,
        });
      }
    }
  };

  // Simple state change functions
  const handleDeposit = () => {
    setCurrentState('deposit');
    setDepositStep('input');
    setDepositAmount('');
  };

  // New function to handle the actual deposit initiation
  const handleInitiateDeposit = () => {
    if (!depositAmount) return;
    
    // Check if we have enough allowance
    if (hasEnoughAllowance(depositAmount)) {
      // Skip approval and go directly to deposit
      handleConfirmDeposit();
    } else {
      // Need approval first
      handleApproveUSDC();
    }
  };

  const handleWithdrawClick = () => {
    setCurrentState('withdraw');
  };

  const handleCancel = () => {
    setCurrentState('balance');
    setDepositStep('input');
    setWithdrawStep('input');
    setDepositAmount('');
    setWithdrawAmount('');
    setErrorMessage('');
    // Refresh balances when returning to balance view in case any transactions completed
    refreshAllBalances();
  };

  const handleRetry = () => {
    setDepositStep('input');
    setErrorMessage('');
  };

  // Reset errors when starting new operations
  const resetErrors = () => {
    setErrorMessage('');
  };

  // Refresh all balance-related data
  const refreshAllBalances = async () => {
    try {
      await Promise.all([
        refetchUSDCBalance(),
        refetchVaultShares(),
        refetchTotalAssets(),
        refetchTotalSupply(),
        refetchAllowance()
      ]);
      console.log('All balances refreshed successfully');
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  // Deposit flow functions
  const handleApproveUSDC = async () => {
    if (!address || !chainId) return;
    
    resetErrors();
    setDepositStep('approving');
    
    try {
      upsertMessage('deposit-approving', { type: 'pending', message: 'Approving spending limit...' });
      // Approve maximum amount (type(uint256).max) for unlimited spending
      const maxAmount = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      
      await writeUSDC({
        address: getUSDCAddress(chainId) as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [getContractAddress(chainId) as `0x${string}`, maxAmount],
        chainId,
      });
      
      // Transaction submitted successfully - the useEffect will handle the rest
      
    } catch (error: unknown) {
      console.error('Approval failed:', error);
      setDepositStep('error');
      removeMessage('deposit-approving');
      
      // Handle different error types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any)?.message?.includes('User rejected') ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any 
                    (error as any)?.message?.includes('rejected') ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any)?.message?.includes('denied') ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any)?.name === 'UserRejectedRequestError') {
        setErrorMessage('Transaction was rejected. Please try again if you want to proceed.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if ((error as any)?.message?.includes('insufficient funds')) {
        setErrorMessage('Insufficient funds for gas fee.');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setErrorMessage(`Approval failed: ${(error as any)?.message || 'Please check your wallet and try again.'}`);
      }
    }
  };

  const handleConfirmDeposit = async () => {
    if (!address || !chainId || !depositAmount) return;
    
    resetErrors();
    setDepositStep('depositing');
    
    try {
      removeMessage('deposit-approving');
      upsertMessage('deposit-pending', { type: 'pending', message: 'Deposit in progress...' });
      const amountInWei = parseUnits(depositAmount, 6);
      
      await writeVault({
        address: getContractAddress(chainId) as `0x${string}`,
        abi: AAVE_VAULT_ABI,
        functionName: 'deposit',
        args: [amountInWei, address],
        chainId,
      });
      
      // Transaction submitted successfully - the useEffect will handle the rest
      
    } catch (error: unknown) {
      console.error('Deposit failed:', error);
      setDepositStep('error');
      removeMessage('deposit-pending');
      
      // Handle different error types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any)?.message?.includes('User rejected') ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any 
                    (error as any)?.message?.includes('rejected') ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any)?.message?.includes('denied') ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any)?.name === 'UserRejectedRequestError') {
        setErrorMessage('Transaction was rejected. Please try again if you want to proceed.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if ((error as any)?.message?.includes('insufficient funds')) {
        setErrorMessage('Insufficient USDC balance or gas fee.');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setErrorMessage(`Deposit failed: ${(error as any)?.message || 'Please check your wallet and try again.'}`);
      }
    }
  };

  // Watch for transaction completion and errors
  useEffect(() => {
    if (isUSDCTxSuccess && depositStep === 'approving') {
      // Approval completed, now proceed with deposit
      upsertMessage('deposit-approving', { type: 'success', message: 'Approval successful. Proceeding…', txHash: usdcTxHash, chainId });
      handleConfirmDeposit();
      // Also refetch allowance for future deposits
      refetchAllowance();
    }
    if (isVaultTxSuccess && depositStep === 'depositing') {
      setDepositStep('confirming');
      removeMessage('deposit-pending');
      upsertMessage('deposit-success', { type: 'success', message: `Deposit of ${depositAmount} USDC completed successfully!`, txHash: vaultTxHash, chainId });
      // Refresh all balances immediately after successful deposit
      refreshAllBalances();
      // Stay on confirmation screen until user clicks "Done"
    }
    if (isVaultTxSuccess && withdrawStep === 'withdrawing') {
      setWithdrawStep('confirming');
      addMessage({
        type: 'success',
        message: `Withdrawal of ${withdrawAmount} USDC completed successfully!`,
        txHash: vaultTxHash,
        chainId
      });
      // Refresh all balances immediately after successful withdrawal
        refreshAllBalances();
      // Stay on confirmation screen until user clicks "Done"
    }
    
    // Handle transaction errors
    if (isUSDCTxError && depositStep === 'approving') {
      setDepositStep('error');
      const errorMsg = 'USDC approval transaction failed. Please try again.';
      setErrorMessage(errorMsg);
      upsertMessage('deposit-approving', { type: 'error', message: errorMsg, txHash: usdcTxHash, chainId });
    }
    if (isVaultTxError && depositStep === 'depositing') {
      setDepositStep('error');
      setErrorMessage('Deposit transaction failed. Please try again.');
      upsertMessage('deposit-pending', { type: 'error', message: 'Deposit failed. Please try again.', txHash: vaultTxHash, chainId });
    }
    if (isVaultTxError && withdrawStep === 'withdrawing') {
      setWithdrawStep('error');
      setErrorMessage('Withdrawal transaction failed. Please try again.');
    }

    // Handle writeContract errors (including MetaMask rejections)
    if (usdcWriteError && depositStep === 'approving') {
      setDepositStep('error');
      if (usdcWriteError.message?.includes('User rejected') || 
          usdcWriteError.message?.includes('rejected') || 
          usdcWriteError.message?.includes('denied') ||
          usdcWriteError.message?.includes('UserRejectedRequestError')) {
        setErrorMessage('Transaction was rejected. Please try again if you want to proceed.');
      } else {
        setErrorMessage(`Approval failed: ${usdcWriteError.message || 'Please try again.'}`);
      }
    }
    
    if (vaultWriteError && depositStep === 'depositing') {
      setDepositStep('error');
      if (vaultWriteError.message?.includes('User rejected') || 
          vaultWriteError.message?.includes('rejected') || 
          vaultWriteError.message?.includes('denied') ||
          vaultWriteError.message?.includes('UserRejectedRequestError')) {
        setErrorMessage('Transaction was rejected. Please try again if you want to proceed.');
      } else {
        setErrorMessage(`Deposit failed: ${vaultWriteError.message || 'Please try again.'}`);
      }
    }
    
    if (vaultWriteError && withdrawStep === 'withdrawing') {
      setWithdrawStep('error');
      if (vaultWriteError.message?.includes('User rejected') || 
          vaultWriteError.message?.includes('rejected') || 
          vaultWriteError.message?.includes('denied') ||
          vaultWriteError.message?.includes('UserRejectedRequestError')) {
        setErrorMessage('Transaction was rejected. Please try again if you want to proceed.');
      } else {
        setErrorMessage(`Withdrawal failed: ${vaultWriteError.message || 'Please try again.'}`);
      }
    }
  }, [isUSDCTxSuccess, isVaultTxSuccess, isUSDCTxError, isVaultTxError, usdcWriteError, vaultWriteError, depositStep, withdrawStep]);

  // If user cancels in wallet, clear loading states gracefully
  useEffect(() => {
    if (usdcWriteError && depositStep === 'approving') {
      setDepositStep('error');
      setErrorMessage('Approval was cancelled in wallet.');
    }
    if (vaultWriteError && depositStep === 'depositing') {
      setDepositStep('error');
      setErrorMessage('Deposit was cancelled in wallet.');
    }
    if (vaultWriteError && withdrawStep === 'withdrawing') {
      setWithdrawStep('error');
      setErrorMessage('Withdrawal was cancelled in wallet.');
    }
  }, [usdcWriteError, vaultWriteError, depositStep, withdrawStep]);

  // Render different states based on currentState
  const renderBalanceState = () => (
    <>
      {/* Title inside the card */}
      <h3 className="text-lg font-semibold mb-6 text-white font-display">Balance</h3>
      {/* Balance Section - user's deposited funds in the vault */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          {/* USDC Icon */}
          <img src="/usdc-icon.svg" alt="USDC" className="w-6 h-6" />
          
          <div className="text-3xl font-semibold font-display">{userDepositedFormatted}</div>
        </div>
        
        <div className="text-gray-400 text-sm">
          {currentApy ? `${(currentApy * 100).toFixed(2)}% APY` : '4.47% APY'}
        </div>
      </div>

      {/* Vault Shares */}
      <div className="mb-6">
        <h4 className="text-gray-400 text-xs mb-2">Vault shares</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {vaultSharesFormatted} <span className="text-gray-400 text-xs font-normal">LP tokens</span>
          </span>
          <button 
            onClick={addTokenToWallet}
            className="bg-gray2 text-primary text-xs border border-gray3 px-3 py-1.5 rounded-lg hover:bg-gray1 transition-colors disabled:opacity-50"
            disabled={!isConnected || !chainId}
          >
            Add to Wallet
          </button>
        </div>
      </div>

      {/* Subtle line separator */}
      <div className="border-t border-gray-700 mb-4"></div>

      {/* Simple Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="secondary"
          onClick={handleWithdrawClick}
          disabled={!isConnected}
        >
          Withdraw
        </Button>
        <Button 
          variant="primary"
          onClick={handleDeposit}
          disabled={!isConnected}
        >
          Deposit
        </Button>
      </div>
    </>
  );

  const renderDepositState = () => {
    // Input step - user enters amount
    if (depositStep === 'input') {
      return (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-white font-display">Deposit</h3>
          </div>
          
          {/* Amount Input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                placeholder="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-gray-700 text-white py-2 px-4 rounded border border-gray-600 focus:outline-none focus:border-blue-500 pr-20 text-sm"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <span className="text-gray-400 text-sm">USDC</span>
                <img src="/usdc-icon.svg" alt="USDC" className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Action Buttons - Cancel and Confirm */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="secondary"
              onClick={handleCancel}
              disabled={!isConnected}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleInitiateDeposit}
              disabled={!depositAmount || !isConnected}
              className="w-full"
            >
              {depositAmount && hasEnoughAllowance(depositAmount) ? 'Deposit' : 'Approve & Deposit'}
            </Button>
          </div>
        </>
      );
    }

    // Approving step - waiting for approval transaction
    if (depositStep === 'approving') {
      return (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-white font-display">Deposit</h3>
          </div>
          
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                value={depositAmount}
                disabled
                className="w-full bg-gray-700 text-white py-2 px-4 rounded border border-gray-600 pr-20 text-sm"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <span className="text-gray-400 text-sm">USDC</span>
                <img src="/usdc-icon.svg" alt="USDC" className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleCancel}
              className="bg-gray-700 text-white py-2 px-4 rounded font-medium hover:bg-gray-600 transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDeposit}
              disabled={isUSDCPending || isUSDCTxLoading}
              className={`${(isUSDCPending || isUSDCTxLoading) ? 'bg-gray3 text-white border border-gray4' : 'bg-white text-black hover:bg-gray-100'} h-12 px-4 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 flex items-center justify-center w-full`}
              aria-busy={isUSDCPending || isUSDCTxLoading}
            >
              {(isUSDCPending || isUSDCTxLoading) ? (
                <img src="/loader.svg" alt="Loading" className="w-5 h-5 animate-spin" />
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </>
      );
    }

    // Depositing step - waiting for deposit transaction
    if (depositStep === 'depositing') {
      return (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-white font-display">Deposit</h3>
          </div>
          
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                value={depositAmount}
                disabled
                className="w-full bg-gray-700 text-white py-2 px-4 rounded border border-gray-600 pr-20 text-sm"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <span className="text-gray-400 text-sm">USDC</span>
                <img src="/usdc-icon.svg" alt="USDC" className="w-6 h-6" />
              </div>
            </div>
          </div>

          <button 
            disabled
            className="w-full bg-gray3 text-white h-12 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center border border-gray4"
            aria-busy="true"
          >
            <img src="/loader.svg" alt="Loading" className="w-5 h-5 animate-spin" />
          </button>
        </>
      );
    }

    // Confirming step - transaction confirmed
    if (depositStep === 'confirming') {
      // Calculate values for display using accurate performance data
      // Deposits = the amount just deposited by the user
      const justDeposited = depositAmount ? parseFloat(depositAmount) : 0;
      const currentTotal = userVaultValue || 0; // Use accurate user total from performance hook
      const previousAmount = Math.max(0, currentTotal - justDeposited);

      return (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-white font-display">Deposit</h3>
          </div>
          
          {/* Summary Card */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Deposits</span>
                <span className="text-white font-medium">{justDeposited.toLocaleString()} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Previous</span>
                <span className="text-gray-400 font-medium">{previousAmount.toFixed(2)} USDC</span>
              </div>
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total</span>
                  <span className="text-white font-semibold">{currentTotal.toLocaleString()} USDC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="secondary"
              onClick={() => {
                if (vaultTxHash && chainId) {
                  const getBlockExplorerUrl = (chainId: number, txHash: string) => {
                    switch (chainId) {
                      case 31337: // localhost - no block explorer
                        console.log('Transaction hash:', txHash);
                        alert(`Transaction hash: ${txHash}\n(No block explorer for localhost)`);
                        return;
                      case 84532: // Base Sepolia
                        return `https://sepolia.basescan.org/tx/${txHash}`;
                      case 421614: // Arbitrum Sepolia
                        return `https://sepolia.arbiscan.io/tx/${txHash}`;
                      case 11155420: // Optimism Sepolia
                        return `https://sepolia.optimistic.etherscan.io/tx/${txHash}`;
                      default:
                        return `https://etherscan.io/tx/${txHash}`; // Default to Ethereum mainnet
                    }
                  };
                  
                  const url = getBlockExplorerUrl(chainId, vaultTxHash);
                  if (url) {
                    window.open(url, '_blank');
                  }
                }
              }}
              disabled={!vaultTxHash}
            >
              View transaction
            </Button>
            <Button 
              variant="primary"
              onClick={() => {
                setCurrentState('balance');
                setDepositStep('input');
                setDepositAmount('');
                clearMessages();
              }}
            >
              Done
            </Button>
          </div>
        </>
      );
    }

    // Error step - transaction failed or was rejected
    if (depositStep === 'error') {
      return (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-white font-display">Deposit</h3>
          </div>
          
          <div className="text-center py-8">
            <div className="text-red-400 text-4xl mb-4">❌</div>
            <p className="text-white mb-2">Transaction Failed</p>
            <p className="text-gray-400 text-sm mb-6">{errorMessage}</p>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleCancel}
                className="bg-gray-700 text-white py-2 px-4 rounded font-medium hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleRetry}
                className="bg-white text-black py-2 px-4 rounded font-medium hover:bg-gray-100 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  // Calculate withdrawable amount using accurate performance data
  const withdrawableAmount = userVaultValue; // User's deposited funds available
  
  const isWithdrawAmountValid = withdrawAmount && parseFloat(withdrawAmount) > 0;
  const hasEnoughWithdrawBalance = withdrawableAmount && parseFloat(withdrawAmount) <= withdrawableAmount;
  const canWithdraw = isWithdrawAmountValid && hasEnoughWithdrawBalance && !isVaultPending;

  const handleWithdraw = async () => {
    if (!withdrawAmount || !chainId || !address || !canWithdraw) return;
    
    try {
      setWithdrawStep('withdrawing');
      console.log('💳 Starting withdrawal:', withdrawAmount, 'USDC');
      
      await writeVault({
        address: getContractAddress(chainId) as `0x${string}`,
        abi: AAVE_VAULT_ABI,
        functionName: 'withdraw',
        args: [parseUnits(withdrawAmount, 6), address, address],
        chainId,
      });
      
      console.log('📝 Withdrawal transaction submitted, waiting for confirmation...');
      // Transaction submitted successfully - the useEffect will handle the rest
      
    } catch (error: unknown) {
      console.error('Withdrawal failed:', error);
      setWithdrawStep('error');
      
      // Handle different error types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any)?.message?.includes('User rejected') ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any 
                    (error as any)?.message?.includes('rejected') ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any)?.message?.includes('denied') ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any)?.name === 'UserRejectedRequestError') {
        setErrorMessage('Transaction was rejected. Please try again if you want to proceed.');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setErrorMessage(`Withdrawal failed: ${(error as any)?.message || 'Please try again.'}`);
      }
    }
  };

  const renderWithdrawState = () => {
    // Calculate values for display - available across all steps using accurate performance data
    // For withdraw, estimate deposits based on vault shares and use accurate total
    const userVaultShares = vaultShares ? parseFloat(formatUnits(vaultShares, 6)) : 0; // shares decimals ~ underlying (USDC: 6)
    const currentDeposits = userVaultShares; // assume initial sharePrice ~1
    const currentTotal = userVaultValue || 0;
    const totalYield = Math.max(0, currentTotal - currentDeposits);
    
    // Calculate yield specifically for the withdrawal amount
    const withdrawalAmount = withdrawAmount ? parseFloat(withdrawAmount) : 0;
    
    // Calculate what percentage of the vault is original deposits vs yield
    const depositPercentage = currentTotal > 0 ? currentDeposits / currentTotal : 0;
    const yieldPercentage = currentTotal > 0 ? totalYield / currentTotal : 0;
    
    // For withdrawal: how much of the withdrawal amount represents original deposits vs yield
    const withdrawalDeposits = withdrawalAmount * depositPercentage;
    const withdrawalYield = withdrawalAmount * yieldPercentage;

    // Input step - user enters amount
    if (withdrawStep === 'input') {
      return (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-white font-display">Withdraw</h3>
          </div>
          
          {/* Summary Card */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Deposits</span>
                <span className="text-white font-medium">{currentDeposits.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Yield</span>
                <span className="text-green-400 font-medium">{totalYield.toFixed(2)} USDC</span>
              </div>
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total</span>
                  <span className="text-white font-semibold">{currentTotal.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                placeholder="0"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-gray-700 text-white py-3 px-4 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-lg"
              />
              <button
                onClick={() => setWithdrawAmount(withdrawableAmount.toString())}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 text-sm hover:text-blue-300"
              >
                Max
              </button>
            </div>
            {/* Available line removed per design */}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="secondary" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleWithdraw}
              disabled={!canWithdraw}
            >
              Confirm
            </Button>
          </div>

          {/* Error/Warning Messages */}
          {!hasEnoughWithdrawBalance && withdrawAmount && (
            <div className="mt-3 text-red-400 text-sm">
              Insufficient vault balance
            </div>
          )}
        </>
      );
    }

    // Withdrawing step - waiting for withdraw transaction
    if (withdrawStep === 'withdrawing') {
      return (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-white font-display">Withdraw</h3>
          </div>
          
          {/* Summary Card */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Deposits</span>
                <span className="text-white font-medium">{withdrawalDeposits.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Yield</span>
                <span className="text-green-400 font-medium">{withdrawalYield.toFixed(2)} USDC</span>
              </div>
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total</span>
                  <span className="text-white font-semibold">{withdrawalAmount.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Processing indicator as spinner button */}
          <div className="py-4">
            <button disabled className="w-full bg-gray3 text-white h-12 px-4 rounded-lg font-medium text-sm cursor-not-allowed flex items-center justify-center border border-gray4" aria-busy="true">
              <img src="/loader.svg" alt="Loading" className="w-5 h-5 animate-spin" />
            </button>
          </div>
        </>
      );
    }

    // Confirming step - transaction confirmed
    if (withdrawStep === 'confirming') {
      return (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-white font-display">Withdraw</h3>
          </div>
          
          {/* Summary Card */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Deposits</span>
                <span className="text-white font-medium">{withdrawalDeposits.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Yield</span>
                <span className="text-green-400 font-medium">{withdrawalYield.toFixed(2)} USDC</span>
              </div>
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total</span>
                  <span className="text-white font-semibold">{withdrawalAmount.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="secondary"
              onClick={() => {
                if (vaultTxHash && chainId) {
                  const getBlockExplorerUrl = (chainId: number, txHash: string) => {
                    switch (chainId) {
                      case 31337: // localhost - no block explorer
                        console.log('Transaction hash:', txHash);
                        alert(`Transaction hash: ${txHash}\n(No block explorer for localhost)`);
                        return;
                      case 84532: // Base Sepolia
                        return `https://sepolia.basescan.org/tx/${txHash}`;
                      case 421614: // Arbitrum Sepolia
                        return `https://sepolia.arbiscan.io/tx/${txHash}`;
                      case 11155420: // Optimism Sepolia
                        return `https://sepolia.optimistic.etherscan.io/tx/${txHash}`;
                      default:
                        return `https://etherscan.io/tx/${txHash}`; // Default to Ethereum mainnet
                    }
                  };
                  
                  const url = getBlockExplorerUrl(chainId, vaultTxHash);
                  if (url) {
                    window.open(url, '_blank');
                  }
                }
              }}
              disabled={!vaultTxHash}
            >
              View transaction
            </Button>
            <Button 
              variant="primary"
              onClick={() => {
                setCurrentState('balance');
                setWithdrawStep('input');
                setWithdrawAmount('');
                clearMessages();
              }}
            >
              Done
            </Button>
          </div>
        </>
      );
    }

    // Error step - transaction failed or was rejected
    if (withdrawStep === 'error') {
      return (
    <>
      <h3 className="text-xl font-medium mb-6 text-white font-display">Withdraw</h3>
          
      <div className="text-center py-8">
            <div className="text-red-400 text-4xl mb-4">❌</div>
            <p className="text-white mb-2">Withdrawal Failed</p>
            <p className="text-gray-400 text-sm mb-4">{errorMessage}</p>
            
            <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={handleCancel}
          className="bg-gray-700 text-white py-2 px-4 rounded font-medium hover:bg-gray-600 transition-colors text-sm"
        >
          Cancel
        </button>
              <button 
                onClick={() => setWithdrawStep('input')}
                className="bg-gray-800 text-white py-2 px-4 rounded font-medium hover:bg-gray-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
      </div>
    </>
  );
    }

    return null;
  };

  return (
    <div className="text-primary w-full">
      {/* Balance Card Container - matches sidebar components spec */}
      {(() => {
        const isDepositBig = currentState === 'deposit' && (depositStep === 'confirming' || depositStep === 'error');
        const isWithdrawBig = currentState === 'withdraw' && (withdrawStep === 'input' || withdrawStep === 'confirming' || withdrawStep === 'error');
        const cardMinH = (isDepositBig || isWithdrawBig) ? 'min-h-80' : 'min-h-64';
        return (
          <div className={`bg-gray2 border border-gray3 rounded-md p-6 ${cardMinH}`}>
            {currentState === 'balance' && renderBalanceState()}
            {currentState === 'deposit' && renderDepositState()}
            {currentState === 'withdraw' && renderWithdrawState()}
          </div>
        );
      })()}
    </div>
  );
};

export default BalanceFigma;
