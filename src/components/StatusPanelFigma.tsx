'use client';

import React from 'react';
import { useTransactionStatus } from '@/contexts/TransactionStatusContext';

const StatusPanelFigma = () => {
  const { messages } = useTransactionStatus();

  // Icon/color helpers not used in current design; remove to satisfy linter

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
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="bg-gray2 rounded-xl px-4 py-3">
              <div className="flex items-center">
                <span className="text-sm text-primary">
                  {message.message}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray2 border border-gray3 rounded-lg p-4">
          <h3 className="text-white text-2xl font-semibold mb-2 font-display">Welcome!</h3>
          <p className="text-white text-sm leading-relaxed mb-4">
            I am Yieldr, the first multichain agentic protocol that automatically maximizes your Aave earnings with unparalleled reliability.
            Get started by approving a spending limit and depositing into the vault.
          </p>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-md border border-gray4 text-primary bg-transparent">
              Help
            </button>
            <button className="px-4 py-2 rounded-md bg-white text-black font-medium">
              Get started
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPanelFigma;
