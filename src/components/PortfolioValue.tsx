'use client';

import React from 'react';
import Chart from './Chart';

interface PortfolioValueProps {
  totalValue: number;
  gains: number;
  apy: number;
}

const PortfolioValue = ({ totalValue, gains, apy }: PortfolioValueProps) => {
  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return '$0';
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)} M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatGains = (amount: number) => {
    if (!amount && amount !== 0) return '+$0';
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${amount.toLocaleString()}`;
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333] text-white rounded-lg w-full relative overflow-hidden">
      {/* Top section with portfolio value */}
      <div className="p-6 relative">
        {/* Dotted pattern background for top section */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '15px 15px',
            }}
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Main portfolio value */}
          <div className="flex items-baseline space-x-4 mb-2">
            <h1 className="text-5xl font-light">
              {formatCurrency(totalValue)}
            </h1>
            <span className="text-green-400 text-xl font-medium">
              {formatGains(gains)}
            </span>
          </div>
          
          {/* APY */}
          <div className="text-gray-400 text-lg">
            {apy}% APY
          </div>
        </div>
      </div>
      
      {/* Bottom section with chart */}
      <div className="h-48 relative mx-6 mb-6">
        <Chart />
      </div>
    </div>
  );
};

export default PortfolioValue; 