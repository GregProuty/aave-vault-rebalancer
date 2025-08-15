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
  
  return (
    <div className="bg-black border border-gray-700 text-white rounded-lg w-full h-full">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col p-6 max-w-md h-full overflow-hidden">
        <h2 className="text-xl font-medium mb-6">Allocation</h2>
        
        {/* Always show allocation visual and details */}
        <>
          {/* Visual allocation bars - Figma style */}
          <div className="mb-6">
            <div className="flex h-16 rounded-lg border border-gray-700 overflow-hidden">
              {displayAllocations.filter(item => item.allocation > 0).map((item, index) => (
                <div
                  key={index}
                  className="h-full relative"
                  style={{ 
                    width: `${item.allocation}%`, 
                    backgroundColor: item.color,
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Allocation details list */}
          <div className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
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
                  <span className="text-white font-medium truncate">{item.name}</span>
                </div>
                
                {/* Middle - APY */}
                <div className="text-gray-400 text-sm mx-4 shrink-0">
                  {item.apy}% APY
                </div>
                
                {/* Right side - Progress bar and percentage */}
                <div className="flex items-center space-x-3 w-36 shrink-0">
                  <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                    <div 
                      className="bg-white rounded-full h-1.5 transition-all duration-300"
                      style={{ width: `${item.allocation}%` }}
                    />
                  </div>
                  <span className="text-white text-sm font-medium w-12 text-right">
                    {item.allocation}%
                  </span>
                </div>
              </div>
              ))}
            </div>
        </>

      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-4">
        <h2 className="text-lg font-medium mb-4">Allocation</h2>
        
        {/* Visual allocation bars */}
        <div className="mb-4">
          <div className="flex h-12 rounded-lg overflow-hidden">
            {displayAllocations.map((item, index) => (
              <div
                key={index}
                className="h-full flex items-center justify-center"
                style={{ 
                  width: `${item.allocation}%`, 
                  backgroundColor: item.color,
                  backgroundImage: index < 3 ? 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' : 'none'
                }}
              />
            ))}
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
              <span className="text-white text-sm font-medium">
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
