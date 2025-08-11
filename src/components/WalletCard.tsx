'use client';

import React from 'react';
import Chart from './Chart';

interface WalletCardProps {
  walletAddress: string;
  totalValue: number;
  gains: number;
  apy: number;
  onWithdraw?: () => void;
  onDeposit?: () => void;
}

const WalletCard = ({ 
  walletAddress, 
  totalValue, 
  gains, 
  apy, 
  onWithdraw, 
  onDeposit 
}: WalletCardProps) => {
  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return '$0';
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatGains = (amount: number) => {
    if (!amount && amount !== 0) return '+$0';
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${amount}`;
  };

  const truncateAddress = (address: string) => {
    if (!address) return '0x...';
    return `${address.slice(0, 6)}...`;
  };

  return (
    <div className="bg-black border border-gray-700 text-white rounded-lg w-full max-w-sm mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 pb-2">
        <h2 className="text-lg font-medium">{truncateAddress(walletAddress)}</h2>
        <button className="text-white">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="10" cy="4" r="1.5"/>
            <circle cx="10" cy="10" r="1.5"/>
            <circle cx="10" cy="16" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Portfolio Value */}
      <div className="px-4 pb-4">
        <div className="flex items-baseline space-x-3 mb-1">
          <h1 className="text-4xl font-light">
            {formatCurrency(totalValue)}
          </h1>
          <span className="text-green-400 text-lg font-medium">
            {formatGains(gains)}
          </span>
        </div>
        
        <div className="text-gray-400 text-sm">
          {apy}% APY
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-32 px-4 pb-4">
        <Chart width={300} height={120} dotSize={1} dotSpacing={8} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 p-4 pt-2">
        <button 
          onClick={onWithdraw}
          className="flex-1 bg-transparent border border-gray-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Withdraw
        </button>
        <button 
          onClick={onDeposit}
          className="flex-1 bg-[#333] text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          Deposit
        </button>
      </div>
    </div>
  );
};

export default WalletCard; 