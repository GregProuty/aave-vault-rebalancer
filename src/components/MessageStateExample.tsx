// Example usage of the Message State Management System
// This demonstrates how easy it is to use from any component

import React from 'react';
import { useMessages } from '@/hooks/useMessages';

export const MessageStateExample = () => {
  const {
    // Quick message functions
    showDepositSuccess,
    showDepositError,
    showDepositLoading,
    clearDepositMessages,
    
    // State checks
    hasLoadingMessages,
    hasErrorMessages,
    hasDepositMessages,
    
    // Advanced functions
    showMessage,
    activeMessages,
    primaryMessage
  } = useMessages();

  const handleDepositSuccess = () => {
    // Clear any existing deposit messages first
    clearDepositMessages();
    // Show success message
    showDepositSuccess();
  };

  const handleDepositError = () => {
    clearDepositMessages();
    showDepositError();
  };

  const handleStartDeposit = () => {
    clearDepositMessages();
    showDepositLoading();
  };

  const handleCustomMessage = () => {
    showMessage('info', 'deposit', 'Custom deposit guidance message', {
      persistent: true,
      priority: 75
    });
  };

  return (
    <div className="p-4 space-y-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold">Message State System Demo</h2>
      
      {/* Action Buttons */}
      <div className="space-x-2">
        <button 
          onClick={handleDepositSuccess}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Show Deposit Success
        </button>
        
        <button 
          onClick={handleDepositError}
          className="bg-red-600 px-4 py-2 rounded"
        >
          Show Deposit Error
        </button>
        
        <button 
          onClick={handleStartDeposit}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Show Deposit Loading
        </button>
        
        <button 
          onClick={handleCustomMessage}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          Custom Message
        </button>
        
        <button 
          onClick={clearDepositMessages}
          className="bg-gray-600 px-4 py-2 rounded"
        >
          Clear Deposit Messages
        </button>
      </div>

      {/* State Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-3 rounded">
          <h3 className="font-semibold mb-2">State Checks</h3>
          <ul className="text-sm space-y-1">
            <li>Has Loading: {hasLoadingMessages ? '✅' : '❌'}</li>
            <li>Has Errors: {hasErrorMessages ? '✅' : '❌'}</li>
            <li>Has Deposit Messages: {hasDepositMessages ? '✅' : '❌'}</li>
          </ul>
        </div>
        
        <div className="bg-gray-800 p-3 rounded">
          <h3 className="font-semibold mb-2">Message Count</h3>
          <ul className="text-sm space-y-1">
            <li>Active Messages: {activeMessages.length}</li>
            <li>Primary Message: {primaryMessage?.category || 'None'}</li>
          </ul>
        </div>
      </div>

      {/* Active Messages List */}
      <div className="bg-gray-800 p-3 rounded">
        <h3 className="font-semibold mb-2">Active Messages</h3>
        {activeMessages.length === 0 ? (
          <p className="text-gray-400 text-sm">No active messages</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {activeMessages.map(msg => (
              <li key={msg.id} className="flex justify-between">
                <span>{msg.type} - {msg.category}</span>
                <span className="text-gray-400">Priority: {msg.priority}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MessageStateExample;
