'use client';

import React, { useState, useEffect } from 'react';
import Circle from './Circle';
import { createNearContractReader, ActivityLog, SignedTransaction, ChainAllocation } from '@/utils/nearContract';

const Activity = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [transactions, setTransactions] = useState<SignedTransaction[]>([]);
  const [allocations, setAllocations] = useState<ChainAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      console.log('🔍 Fetching NEAR contract data from rebalancer-10.testnet...');
      const nearReader = createNearContractReader();

      // Test connection first
      const connectionTest = await nearReader.testConnection();
      if (!connectionTest) {
        setIsConnected(false);
        return;
      }

      setIsConnected(true);

      // Fetch logs, transactions, and allocations in parallel
      const [latestLogs, signedTxs, chainAllocations] = await Promise.allSettled([
        nearReader.getLatestLogs(5), // Limit to 5 for sidebar
        nearReader.getSignedTransactions(0),
        nearReader.getAllocations() // NEW: Get actual allocation data
      ]);

      // Process logs
      if (latestLogs.status === 'fulfilled') {
        setLogs(latestLogs.value);
        console.log('✅ Got activity logs:', latestLogs.value);
      } else {
        console.error('❌ Failed to fetch logs:', latestLogs.reason);
      }

      // Process transactions
      if (signedTxs.status === 'fulfilled') {
        setTransactions(signedTxs.value);
        console.log('✅ Got signed transactions:', signedTxs.value);
      } else {
        console.error('❌ Failed to fetch transactions:', signedTxs.reason);
      }

      // Process allocations
      if (chainAllocations.status === 'fulfilled') {
        setAllocations(chainAllocations.value);
        console.log('✅ Got chain allocations:', chainAllocations.value);
      } else {
        console.error('❌ Failed to fetch allocations:', chainAllocations.reason);
      }

    } catch (err) {
      console.error('💥 Error fetching NEAR data:', err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getChainName = (chainId: number): string => {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      43114: 'Avalanche',
      8453: 'Base',
      42161: 'Arbitrum',
      10: 'Optimism',
      // Add more as needed
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  const getActivityIcon = (activityType?: string) => {
    switch (activityType?.toLowerCase()) {
      case 'invest': return '💰';
      case 'cross_chain_transfer': return '🌉';
      case 'rebalance': return '⚖️';
      case 'deposit': return '📥';
      case 'withdraw': return '📤';
      case 'bridge': return '🌉';
      case 'swap': return '🔄';
      default: return '📊';
    }
  };

  const getTransactionTypeLabel = (payloadType: number) => {
    const types: Record<number, string> = {
      0: 'CCTP Burn',
      1: 'Ethereum Tx',
      2: 'CCTP Mint',
      3: 'Rebalancer Tx'
    };
    return types[payloadType] || `Type ${payloadType}`;
  };

  const formatAmount = (amount: string): string => {
    try {
      // Convert from wei/smallest unit to readable format
      const bigIntAmount = BigInt(amount);
      const formatted = (Number(bigIntAmount) / 1e18).toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      });
      return formatted;
    } catch {
      return amount;
    }
  };

  const formatActivityText = (log: ActivityLog) => {
    const icon = getActivityIcon(log.activity_type);
    const type = log.activity_type || 'Unknown';
    const sourceChain = getChainName(log.source_chain);
    const destChain = getChainName(log.destination_chain);
    const amount = log.actual_amount || log.expected_amount;
    const formattedAmount = amount ? formatAmount(amount) : '';
    
    if (log.source_chain === log.destination_chain) {
      // Same chain activity
      return `${icon} ${type} on ${sourceChain}${formattedAmount ? ` (${formattedAmount})` : ''}`;
    } else {
      // Cross-chain activity
      return `${icon} ${type}: ${sourceChain} → ${destChain}${formattedAmount ? ` (${formattedAmount})` : ''}`;
    }
  };

  const formatTransactionText = (tx: SignedTransaction) => {
    const label = getTransactionTypeLabel(tx.payload_type);
    const bytes = tx.raw_transaction.length / 2;
    return `🔐 ${label} (${bytes} bytes)`;
  };

  // Generate activity events
  const generateActivityEvents = () => {
    const events: string[] = [];
    
    // Connection status
    if (isConnected) {
      events.push('✅ NEAR contract connected (rebalancer-10)');
    } else {
      events.push('❌ NEAR contract disconnected');
    }

    // Real allocation data status
    if (allocations.length > 0) {
      const totalAllocations = allocations.length;
      events.push(`📊 ${totalAllocations} chain allocations loaded`);
    } else if (logs.length > 0 || transactions.length > 0) {
      events.push('📊 Real activity data loaded');
    } else {
      events.push('⏳ Loading allocation data...');
    }

    // Signed transactions
    if (transactions.length > 0) {
      events.push(`🔄 ${transactions.length} signed transactions pending`);
    } else {
      events.push('📝 No pending transactions');
    }

    // Activity feed status
    if (logs.length > 0) {
      events.push('📡 Activity feed streaming');
    } else {
      events.push('⏸️ Activity feed idle');
    }

    // Ethereum vault status
    events.push('💎 Ethereum vault ready');

    // AI rebalancer status
    events.push('🤖 AI rebalancer monitoring...');

    return events;
  };

  const activityEvents = generateActivityEvents();

  return (
    <div className='bg-black border border-gray-700 rounded-lg w-full p-4'>
      <div className="flex items-center justify-between mb-2">
        <p className='text-2xl text-white'>Activity</p>
        {isLoading && (
          <div className="text-blue-400 text-sm">🔄</div>
        )}
      </div>
      
      <ul className='text-white space-y-2'>
        {activityEvents.map((event, index) => (
          <div key={index} className='flex items-center gap-2'>
            <Circle width={18} />
            <li className='text-gray-400 text-sm'>{event}</li>
          </div>
        ))}
      </ul>

      {/* Chain Allocations Summary */}
      {allocations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-white text-sm mb-2">Chain Allocations:</p>
          <div className="space-y-1">
            {allocations.slice(0, 3).map((allocation, index) => (
              <div key={index} className="flex items-center gap-2">
                <Circle width={12} />
                <span className="text-gray-400 text-xs truncate">
                  🔗 {getChainName(allocation.chainId)}: {formatAmount(allocation.amount)}
                </span>
              </div>
            ))}
            {allocations.length > 3 && (
              <div className="flex items-center gap-2">
                <Circle width={12} />
                <span className="text-gray-400 text-xs">
                  ... and {allocations.length - 3} more chains
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity Summary */}
      {logs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-white text-sm mb-2">Recent Activity:</p>
          <div className="space-y-1">
            {logs.slice(0, 3).map((log, index) => (
              <div key={index} className="flex items-center gap-2">
                <Circle width={12} />
                <span className="text-gray-400 text-xs truncate">
                  {formatActivityText(log)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Transactions Summary */}
      {transactions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-white text-sm mb-2">Pending Transactions:</p>
          <div className="space-y-1">
            {transactions.slice(0, 2).map((tx, index) => (
              <div key={index} className="flex items-center gap-2">
                <Circle width={12} />
                <span className="text-gray-400 text-xs truncate">
                  {formatTransactionText(tx)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Activity;