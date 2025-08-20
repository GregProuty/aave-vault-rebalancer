'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface StatusMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'pending';
  message: string;
  timestamp: number;
  txHash?: string;
  chainId?: number;
}

interface TransactionStatusContextType {
  messages: StatusMessage[];
  addMessage: (message: Omit<StatusMessage, 'id' | 'timestamp'>) => string;
  upsertMessage: (key: string, message: Omit<StatusMessage, 'id' | 'timestamp'>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
}

const TransactionStatusContext = createContext<TransactionStatusContextType | undefined>(undefined);

export const useTransactionStatus = () => {
  const context = useContext(TransactionStatusContext);
  if (!context) {
    throw new Error('useTransactionStatus must be used within a TransactionStatusProvider');
  }
  return context;
};

interface TransactionStatusProviderProps {
  children: ReactNode;
}

export const TransactionStatusProvider: React.FC<TransactionStatusProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<StatusMessage[]>([]);

  const addMessage = (messageData: Omit<StatusMessage, 'id' | 'timestamp'>) => {
    const newMessage: StatusMessage = {
      ...messageData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    setMessages(prev => {
      // Keep only the last 3 messages to prevent overflow
      const updatedMessages = [newMessage, ...prev].slice(0, 3);
      return updatedMessages;
    });

    // Auto-remove success and info messages after 10 seconds
    if (messageData.type === 'success' || messageData.type === 'info') {
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      }, 10000);
    }
    return newMessage.id;
  };

  // Deterministic key upsert to handle persistent transaction messages
  const upsertMessage = (key: string, messageData: Omit<StatusMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => {
      const existingIndex = prev.findIndex(m => m.id === key);
      const updated: StatusMessage = { ...messageData, id: key, timestamp: Date.now() };
      if (existingIndex !== -1) {
        const copy = [...prev];
        copy[existingIndex] = updated;
        return copy;
      }
      return [updated, ...prev].slice(0, 3);
    });
  };

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <TransactionStatusContext.Provider value={{ messages, addMessage, upsertMessage, removeMessage, clearMessages }}>
      {children}
    </TransactionStatusContext.Provider>
  );
};
