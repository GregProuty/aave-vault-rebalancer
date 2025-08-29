import React from 'react';
import Image from 'next/image';

interface AllocationItem {
  name: string;
  icon: string; // emoji or icon
  apy: number;
  allocation: number; // percentage
  color: string; // for the icon background
}

interface AllocationProps {
  allocations: AllocationItem[];
}

const Allocation = ({ allocations }: AllocationProps) => {
  console.log(allocations);
  
  // Helper function to get chain icon
  const getChainIcon = (chainName: string): string => {
    const name = chainName.toLowerCase();
    if (name.includes('ethereum')) return '/Chain=ETH.svg';
    if (name.includes('base')) return '/Chain=BASE.svg';
    if (name.includes('arbitrum')) return '/arbitrum-arb-logo.svg';
    if (name.includes('optimism')) return '/optimism-ethereum-op-logo.svg';
    if (name.includes('polygon')) return '/Chain=POL.svg';
    if (name.includes('avalanche')) return '/Chain=AVA.svg';
    return '/Chain=ETH.svg'; // Default fallback
  };
  
  // Mock data matching current app state - Ethereum 100%, others 0%
  const mockAllocations: AllocationItem[] = [
    { name: "Base Sepolia", icon: getChainIcon("Base"), apy: 3.8, allocation: 0, color: "#0052ff" },
    { name: "Arbitrum Sepolia", icon: getChainIcon("Arbitrum"), apy: 3.5, allocation: 0, color: "#2d374b" },
    { name: "Optimism Sepolia", icon: getChainIcon("Optimism"), apy: 3.2, allocation: 0, color: "#ff0420" },
    { name: "Ethereum Sepolia", icon: getChainIcon("Ethereum"), apy: 4.2, allocation: 100, color: "#627eea" },
  ];
  
  // Sort allocations by allocation percentage (highest to lowest)
  const sortedAllocations = allocations.length > 0 ? 
    [...allocations].sort((a, b) => b.allocation - a.allocation) : 
    [...mockAllocations].sort((a, b) => b.allocation - a.allocation);
  
  const displayAllocations = sortedAllocations;
  const totalPercent = displayAllocations.reduce((sum, a) => sum + (a.allocation || 0), 0);
  const remainingPercent = Math.max(0, 100 - totalPercent);
  
  return (
    <div className="bg-gray1 border border-gray3 text-primary rounded-lg w-full h-full overflow-x-hidden max-w-full">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col p-6 w-full h-full overflow-hidden max-w-full">
        <h2 className="text-base font-semibold mb-6">Allocation</h2>
        
        {/* Always show allocation visual and details */}
        <>
          {/* Visual allocation bars - segmented with gaps and reduced radius */}
          <div className="mb-6">
            <div className="flex h-[100px] rounded-[4px] gap-1 w-full">
              {displayAllocations.filter(item => item.allocation > 0).map((item, index, arr) => (
                <div
                  key={index}
                  className={`${index === 0 ? 'rounded-l-[4px]' : ''} ${index === arr.length - 1 ? 'rounded-r-[4px]' : ''} h-full relative`}
                  style={{ flex: `0 0 ${item.allocation}%`, backgroundColor: item.color }}
                >
                  {/* Stripe overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 10px, rgba(255,255,255,0.0) 10px, rgba(255,255,255,0.0) 20px)',
                      borderRadius: 'inherit'
                    }}
                  />
                  {/* Light source + subtle inner shadow */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 35%, rgba(0,0,0,0) 70%), linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 40%)',
                      boxShadow: 'inset 0 -6px 10px rgba(0,0,0,0.12)',
                      borderRadius: 'inherit'
                    }}
                  />
                </div>
              ))}
              {remainingPercent > 0 && (
                <div className="h-full rounded-r-lg" style={{ flex: `0 0 ${remainingPercent}%`, backgroundColor: '#0f0f10' }} />
              )}
            </div>
          </div>

          {/* Allocation details list */}
          <div className="space-y-4 flex-1 overflow-y-hidden overflow-x-hidden">
            {displayAllocations.map((item, index) => (
              <div key={index} className="flex items-center justify-between min-w-0">
                {/* Left side - Icon and name */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={32}
                      height={32}
                    />
                  </div>
                  <span className="text-primary font-medium truncate">{item.name}</span>
                </div>
                
                {/* Middle - APY (centered between name and indicator) */}
                <div className="text-gray5 text-sm mx-4 shrink-0 text-center w-32">
                  {item.apy}% APY
                </div>
                
                {/* Right side - Progress bar and percentage */}
                <div className="flex items-center space-x-3 w-36 shrink-0">
                  <div className="flex-1 bg-gray2 rounded-full h-1.5">
                    <div 
                      className="bg-white rounded-full h-1.5 transition-all duration-300"
                      style={{ width: `${item.allocation}%` }}
                    />
                  </div>
                  <span className="text-gray5 text-sm font-medium w-12 text-right">
                    {item.allocation}%
                  </span>
                </div>
              </div>
              ))}
            </div>
        </>

      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-4 overflow-x-hidden max-w-full">
        <h2 className="text-base font-semibold mb-4">Allocation</h2>
        
        {/* Visual allocation bars */}
        <div className="mb-4">
          <div className="flex h-[100px] rounded-[4px] gap-1 w-full">
            {displayAllocations.map((item, index, arr) => (
              <div
                key={index}
                className={`${index === 0 ? 'rounded-l-[4px]' : ''} ${index === arr.length - 1 ? 'rounded-r-[4px]' : ''} h-full relative`}
                style={{ flex: `0 0 ${item.allocation}%`, backgroundColor: item.color }}
              >
                {/* Stripe overlay */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 8px, rgba(255,255,255,0.0) 8px, rgba(255,255,255,0.0) 16px)',
                    borderRadius: 'inherit'
                  }}
                />
                {/* Light source + subtle inner shadow */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 35%, rgba(0,0,0,0) 70%), linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 40%)',
                    boxShadow: 'inset 0 -5px 8px rgba(0,0,0,0.12)',
                    borderRadius: 'inherit'
                  }}
                />
              </div>
            ))}
            {remainingPercent > 0 && (
              <div className="h-full rounded-r-lg" style={{ flex: `0 0 ${remainingPercent}%`, backgroundColor: '#0f0f10' }} />
            )}
          </div>
        </div>
        
        {/* Allocation details */}
        <div className="space-y-3">
          {displayAllocations.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              {/* Left side - Icon and name */}
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={20}
                    height={20}
                  />
                </div>
                <span className="text-white text-sm">{item.name}</span>
                <span className="text-gray-400 text-xs">{item.apy}% APY</span>
              </div>
              
              {/* Right side - Percentage */}
              <span className="text-gray5 text-sm font-medium">
                {item.allocation}%
              </span>
            </div>
          ))}
        </div>
        
        {/* Rebalancing indicator */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Rebalancing in 5h 26m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allocation;
