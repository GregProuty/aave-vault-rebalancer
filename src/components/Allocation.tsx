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
  return (
    <div className="bg-[#1a1a1a] border border-[#333] text-white p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-medium mb-6">Allocation</h2>
      
      {allocations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm mb-2">No allocation data available</div>
          <div className="text-gray-500 text-xs">Waiting for real cross-chain data...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {allocations.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            {/* Left side - Icon and name */}
            <div className="flex items-center space-x-3 flex-1">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: item.color }}
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
      )}
      
      {/* Data source indicator - only show if we have data */}
      {allocations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#333]">
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
            <span className="text-green-400">●</span>
            <span>Live data from NEAR contract</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allocation;
