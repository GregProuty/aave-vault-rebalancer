import React from 'react';

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
  
  // Mock data matching current app state - Ethereum 100%, others 0%
  const mockAllocations: AllocationItem[] = [
    { name: "Base Sepolia", icon: "B", apy: 3.8, allocation: 0, color: "#0052ff" },
    { name: "Arbitrum Sepolia", icon: "AR", apy: 3.5, allocation: 0, color: "#2d374b" },
    { name: "Optimism Sepolia", icon: "O", apy: 3.2, allocation: 0, color: "#ff0420" },
    { name: "Ethereum Sepolia", icon: "E", apy: 4.2, allocation: 100, color: "#627eea" },
  ];
  
  const displayAllocations = allocations.length > 0 ? allocations : mockAllocations;
  
  return (
    <div className="bg-black border border-gray-700 text-white rounded-lg w-full h-full">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col p-6 max-w-md h-full">
        <h2 className="text-xl font-medium mb-6">Allocation</h2>
        
        {/* Always show allocation visual and details */}
        <>
          {/* Visual allocation bars - Figma style */}
          <div className="mb-6">
            <div className="flex h-16 rounded-lg overflow-hidden border border-gray-700">
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
          <div className="space-y-4 flex-1 overflow-y-auto">
            {displayAllocations.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                {/* Left side - Icon and name */}
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ 
                      backgroundColor: item.color,
                      minWidth: '2.5rem',
                      minHeight: '2.5rem'
                    }}
                  >
                    {item.icon}
                  </div>
                  <span className="text-white font-medium">{item.name}</span>
                </div>
                
                {/* Middle - APY */}
                <div className="text-gray-400 text-sm mx-4">
                  {item.apy}% APY
                </div>
                
                {/* Right side - Progress bar and percentage */}
                <div className="flex items-center space-x-3 w-32">
                  <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                    <div 
                      className="bg-white rounded-full h-1.5 transition-all duration-300"
                      style={{ width: `${item.allocation}%` }}
                    />
                  </div>
                  <span className="text-white text-sm font-medium w-8 text-right">
                    {item.allocation}%
                  </span>
                </div>
              </div>
              ))}
            </div>
        </>
        
        {/* Data source indicator - only show if we have data */}
        {allocations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
              <span className="text-green-400">●</span>
              <span>Live data from NEAR contract</span>
            </div>
          </div>
        )}
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
              {/* Left side - Dot and name */}
              <div className="flex items-center space-x-3 flex-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
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
