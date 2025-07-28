import React from 'react';

interface StatusMessage {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface StatusPanelProps {
  nextRebalanceTime: string | null;
  messages: StatusMessage[];
}

const StatusPanel = ({ nextRebalanceTime, messages }: StatusPanelProps) => {
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '⏰';
    }
  };

  const getMessageBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500';
      case 'warning':
        return 'border-yellow-500';
      case 'error':
        return 'border-red-500';
      default:
        return 'border-gray-600';
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333] text-white p-4 w-full rounded-lg space-y-3 h-[90%] min-h-[350px] flex flex-col">
      {/* Header with logo and title */}
      <div className="flex items-center space-x-3 mb-4">
        {/* Aave logo placeholder - geometric shape */}
        <div className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white rounded transform rotate-45"></div>
        </div>
        <h1 className="text-lg font-medium">Aave Rebalancer 9000</h1>
      </div>

      {/* Status messages */}
      <div className="space-y-3 flex-1 flex flex-col justify-start">
        {/* Next rebalancing message - only show if we have real data */}
        {nextRebalanceTime && (
          <div className="border border-[#333] rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span>⏰</span>
              <span className="text-gray-300 text-sm">Next rebalancing in {nextRebalanceTime}</span>
            </div>
          </div>
        )}

        {/* Other status messages */}
        {messages.map((message, index) => (
          <div key={index} className={`border rounded-lg p-3 ${getMessageBorderColor(message.type)}`}>
            <div className="flex items-center space-x-2">
              <span>{getMessageIcon(message.type)}</span>
              <span className="text-gray-300 text-sm">{message.text}</span>
            </div>
          </div>
        ))}
        
        {/* Spacer to push content up */}
        <div className="flex-1"></div>
      </div>
    </div>
  );
};

export default StatusPanel; 