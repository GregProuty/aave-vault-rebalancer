import React from 'react';

interface ProtocolSwitcherProps {
  currentProtocol: 'near' | 'ethereum';
  onProtocolChange: (protocol: 'near' | 'ethereum') => void;
}

export const ProtocolSwitcher: React.FC<ProtocolSwitcherProps> = ({
  currentProtocol,
  onProtocolChange,
}) => {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Data Source</h3>
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => onProtocolChange('ethereum')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              currentProtocol === 'ethereum'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Ethereum
          </button>
          <button
            onClick={() => onProtocolChange('near')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              currentProtocol === 'near'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            NEAR
          </button>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        {currentProtocol === 'ethereum' 
          ? 'Using Ethereum AaveVault contract data'
          : 'Using NEAR Protocol contract data'
        }
      </div>
    </div>
  );
}; 