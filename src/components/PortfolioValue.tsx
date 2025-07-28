'use client';

import React from 'react';
import PerformanceChart from './PerformanceChart';

interface PortfolioValueProps {
  totalValue: number;
  gains: number;
  apy: number;
}

const PortfolioValue = ({ totalValue, gains, apy }: PortfolioValueProps) => {
  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return '0';
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)} M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  const formatGains = (amount: number) => {
    if (!amount && amount !== 0) return '+0';
    const sign = amount >= 0 ? '+' : '';
    
    // Format large numbers properly
    if (Math.abs(amount) >= 1000000) {
      return `${sign}${(amount / 1000000).toFixed(3)}M`;
    } else if (Math.abs(amount) >= 1000) {
      return `${sign}${(amount / 1000).toFixed(0)}K`;
    }
    return `${sign}${Math.round(amount).toLocaleString()}`;
  };

  const formatAPY = (percentage: number) => {
    if (!percentage && percentage !== 0) return '0.00';
    // Ensure we show a reasonable APY format
    if (percentage > 100) return (percentage / 100).toFixed(2);
    return percentage.toFixed(2);
  };

  return (
    <div className="bg-[#0f0f0f] text-white rounded-lg w-full relative overflow-hidden h-full min-h-[500px]">
      {/* Vault title */}
      <div className="absolute top-6 left-6 z-20">
        <h1 className="text-2xl font-medium text-white">Vault</h1>
      </div>
      
      {/* Main content area */}
      <div className="absolute top-20 left-6 z-20">
        {/* Portfolio value with dollar icon */}
        <div className="flex items-center space-x-3 mb-2">
          {/* Dollar icon */}
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Value and gains */}
          <div>
            <div className="flex items-baseline space-x-3">
              <span className="text-5xl font-light text-white">
                {formatCurrency(totalValue)}
              </span>
              <span className="text-green-400 text-xl font-medium">
                {formatGains(gains)}
              </span>
            </div>
          </div>
        </div>
        
        {/* APY */}
        <div className="text-gray-400 text-lg mt-2">
          {formatAPY(apy)}% APY
        </div>
      </div>
      
      {/* Dotted pattern chart - anchored to bottom and filling space */}
      <div className="absolute inset-0 z-10">
        <div className="w-full h-full relative">
          {/* Chart container anchored to bottom */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: '60%' }}>
            <PerformanceChart width={900} height={300} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioValue; 