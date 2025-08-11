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
    <div className="bg-black border border-gray-700 text-white p-4 w-full rounded-lg space-y-3 flex flex-col">
      {/* Header with logo and title */}
      <div className="flex items-center space-x-3 mb-4">
        {/* Aave logo */}
        <img src="/logo.svg" alt="Aave Logo" className="w-10 h-10" />
        <h1 className="text-lg font-medium">YIELDR</h1>
      </div>

      {/* Status messages */}
      <div className="space-y-3">
        {/* Next rebalancing message - only show if we have real data */}
        {nextRebalanceTime && (
          <div className="border border-gray-700 rounded-lg p-3">
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