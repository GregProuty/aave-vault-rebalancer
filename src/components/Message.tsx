'use client';

import React, { ReactNode } from 'react';
import { MessageType, MessageCategory } from '@/constants/messages';

interface MessageProps {
  type: MessageType;
  category?: MessageCategory;
  children: ReactNode;
  className?: string;
  onDismiss?: () => void;
  persistent?: boolean;
  id?: string;
}

export const Message: React.FC<MessageProps> = ({
  type,
  category,
  children,
  className = '',
  onDismiss,
  persistent = false, // Will be used by state management system
  id
}) => {
  // Base styles for all messages - matching Figma specs exactly
  const baseStyles = 'rounded-lg px-4 py-4 text-base leading-relaxed';
  
  // Type-specific styling - matching Figma exactly
  const getTypeStyles = (messageType: MessageType): string => {
    switch (messageType) {
      case 'idle':
        // Welcome back messages - Figma specs: bg-gray2 with gray3 border
        return 'bg-gray2 border border-gray3 text-white';
      case 'info':
        // Help/guidance messages - Figma specs: bg-gray2 with gray3 border  
        return 'bg-gray2 border border-gray3 text-white';
      case 'success':
        // Successful transactions - Figma specs: bg-gray2 with gray3 border
        return 'bg-gray2 border border-gray3 text-white';
      case 'error':
        // Failed transactions - Figma specs: bg-gray2 with gray3 border
        return 'bg-gray2 border border-gray3 text-white';
      case 'loading':
        // In-progress transactions - Figma specs: bg-gray2 with gray3 border
        return 'bg-gray2 border border-gray3 text-white';
      default:
        return 'bg-gray2 border border-gray3 text-white';
    }
  };

  // Category-specific adjustments (if needed for spacing, etc.)
  const getCategoryStyles = (messageCategory?: MessageCategory): string => {
    switch (messageCategory) {
      case 'welcome':
        // Welcome messages might need different padding/spacing
        return 'space-y-4';
      case 'welcome-back':
        // Welcome back is simpler, single line
        return '';
      case 'deposit':
      case 'withdraw':
      case 'vault-shares':
        // Transaction-related messages
        return '';
      default:
        return '';
    }
  };

  const typeStyles = getTypeStyles(type);
  const categoryStyles = getCategoryStyles(category);
  const combinedClassName = `${baseStyles} ${typeStyles} ${categoryStyles} ${className}`.trim();

  return (
    <div 
      className={combinedClassName} 
      data-message-type={type} 
      data-category={category} 
      data-persistent={persistent}
      id={id}
    >
      {/* Message Content */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {children}
        </div>
        
        {/* Optional Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-gray-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Dismiss message"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      
    </div>
  );
};

// Convenience components for specific message types
export const IdleMessage: React.FC<Omit<MessageProps, 'type'>> = (props) => (
  <Message {...props} type="idle" />
);

export const InfoMessage: React.FC<Omit<MessageProps, 'type'>> = (props) => (
  <Message {...props} type="info" />
);

export const SuccessMessage: React.FC<Omit<MessageProps, 'type'>> = (props) => (
  <Message {...props} type="success" />
);

export const ErrorMessage: React.FC<Omit<MessageProps, 'type'>> = (props) => (
  <Message {...props} type="error" />
);

export const LoadingMessage: React.FC<Omit<MessageProps, 'type'>> = (props) => (
  <Message {...props} type="loading" />
);

export default Message;
