'use client';

import React from 'react';
import { useTransactionStatus } from '@/contexts/TransactionStatusContext';

const StatusPanelFigma = () => {
  const { messages, removeMessage } = useTransactionStatus();

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="text-white w-full space-y-3">
      {/* Header with logo and title */}
      <div className="flex items-center space-x-3 mb-4">
        {/* Yieldr Logo */}
        <img src="/logo.svg" alt="Yieldr" className="w-8 h-8" />
        {/* <h1 className="text-lg font-medium text-white">YIELDR</h1> */}
      </div>

      {/* Status messages */}
      {messages.length > 0 ? (
        <div className="space-y-2">
          {messages.map((message) => (
            <div key={message.id} className="bg-gray-800 rounded-md p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <span>{getStatusIcon(message.type)}</span>
                  <span className={`text-sm ${getStatusColor(message.type)}`}>
                    {message.message}
                  </span>
                </div>
                {(message.type === 'success' || message.type === 'error') && (
                  <button
                    onClick={() => removeMessage(message.id)}
                    className="text-gray-500 hover:text-gray-300 text-xs ml-2"
                  >
                    ×
                  </button>
                )}
              </div>
              {message.txHash && (
                <div className="mt-1 text-xs text-gray-500">
                  Tx: {message.txHash.slice(0, 10)}...
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <span>📊</span>
            <span className="text-sm text-gray-300">
              Ready for transactions
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPanelFigma;
