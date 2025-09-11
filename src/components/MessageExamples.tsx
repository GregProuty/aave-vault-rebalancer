// Example usage of the Message component
// This file demonstrates how to use the reusable Message component

import React from 'react';
import { Message, IdleMessage, InfoMessage, SuccessMessage, ErrorMessage, LoadingMessage } from './Message';
import { INFO, SUCCESS, ERROR, LOADING } from '@/constants/messages';

export const MessageExamples = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Welcome Back Message (Idle type) */}
      <IdleMessage category="welcome-back" id="welcome-back-example">
        <p>Welcome back! You have earned <span className="font-semibold text-green-400">247 USDC</span> yield since last time.</p>
      </IdleMessage>

      {/* Info Messages */}
      <InfoMessage category="deposit" id="deposit-info">
        <div>
          <p className="mb-2">{INFO.NO_DEPOSITS}</p>
          <p className="text-sm">{INFO.DEPOSIT_HELP}</p>
          <p className="text-sm mt-2">{INFO.DEPOSIT_CONTACT}</p>
        </div>
      </InfoMessage>

      <InfoMessage category="withdraw" id="withdraw-info">
        <div>
          <p className="mb-2">{INFO.WITHDRAW_HELP}</p>
          <p className="text-sm mt-2">{INFO.WITHDRAW_CONTACT}</p>
        </div>
      </InfoMessage>

      {/* Success Messages */}
      <SuccessMessage category="deposit" id="deposit-success">
        <p>{SUCCESS.DEPOSIT}</p>
      </SuccessMessage>

      <SuccessMessage category="withdraw" id="withdraw-success">
        <p>{SUCCESS.WITHDRAW}</p>
      </SuccessMessage>

      <SuccessMessage category="vault-shares" id="vault-shares-success">
        <p>{SUCCESS.VAULT_SHARES}</p>
      </SuccessMessage>

      {/* Error Messages */}
      <ErrorMessage category="deposit" id="deposit-error">
        <p>{ERROR.DEPOSIT}</p>
      </ErrorMessage>

      <ErrorMessage category="withdraw" id="withdraw-error">
        <p>{ERROR.WITHDRAW}</p>
      </ErrorMessage>

      <ErrorMessage category="vault-shares" id="vault-shares-error">
        <p>{ERROR.VAULT_SHARES}</p>
      </ErrorMessage>

      {/* Loading Messages */}
      <LoadingMessage category="deposit" id="deposit-loading">
        <p>{LOADING.DEPOSIT}</p>
      </LoadingMessage>

      <LoadingMessage category="withdraw" id="withdraw-loading">
        <p>{LOADING.WITHDRAW}</p>
      </LoadingMessage>

      <LoadingMessage category="vault-shares" id="vault-shares-loading">
        <p>{LOADING.VAULT_SHARES}</p>
      </LoadingMessage>

      {/* Message with dismiss functionality */}
      <InfoMessage 
        category="deposit" 
        id="dismissible-info"
        onDismiss={() => console.log('Message dismissed')}
      >
        <p>This message can be dismissed by clicking the X button.</p>
      </InfoMessage>

      {/* Custom styled message */}
      <Message 
        type="info" 
        category="deposit" 
        className="border-blue-500" 
        id="custom-message"
        persistent={true}
      >
        <div>
          <h4 className="font-semibold mb-2">Custom Message</h4>
          <p>This demonstrates custom styling and persistent behavior.</p>
        </div>
      </Message>
    </div>
  );
};

export default MessageExamples;
