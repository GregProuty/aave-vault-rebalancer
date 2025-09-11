'use client';

import { useMessageState } from '@/contexts/MessageStateContext';
import { MessageType, MessageCategory } from '@/constants/messages';
import { INFO, SUCCESS, ERROR, LOADING } from '@/constants/messages';

// Convenience hook for common message operations
export const useMessages = () => {
  const messageState = useMessageState();

  // Quick message creators with predefined content
  const showDepositInfo = () => {
    return messageState.addMessage({
      type: 'info',
      category: 'deposit',
      content: INFO.DEPOSIT_HELP,
      persistent: false,
      priority: 50,
    });
  };

  const showWithdrawInfo = () => {
    return messageState.addMessage({
      type: 'info',
      category: 'withdraw',
      content: INFO.WITHDRAW_HELP,
      persistent: false,
      priority: 50,
    });
  };

  const showDepositSuccess = () => {
    return messageState.addMessage({
      type: 'success',
      category: 'deposit',
      content: SUCCESS.DEPOSIT,
      persistent: false,
      priority: 80,
    });
  };

  const showWithdrawSuccess = () => {
    return messageState.addMessage({
      type: 'success',
      category: 'withdraw',
      content: SUCCESS.WITHDRAW,
      persistent: false,
      priority: 80,
    });
  };

  const showVaultSharesSuccess = () => {
    return messageState.addMessage({
      type: 'success',
      category: 'vault-shares',
      content: SUCCESS.VAULT_SHARES,
      persistent: false,
      priority: 75,
    });
  };

  const showDepositError = () => {
    return messageState.addMessage({
      type: 'error',
      category: 'deposit',
      content: ERROR.DEPOSIT,
      persistent: false,
      priority: 90,
    });
  };

  const showWithdrawError = () => {
    return messageState.addMessage({
      type: 'error',
      category: 'withdraw',
      content: ERROR.WITHDRAW,
      persistent: false,
      priority: 90,
    });
  };

  const showVaultSharesError = () => {
    return messageState.addMessage({
      type: 'error',
      category: 'vault-shares',
      content: ERROR.VAULT_SHARES,
      persistent: false,
      priority: 85,
    });
  };

  const showDepositLoading = () => {
    return messageState.addMessage({
      type: 'loading',
      category: 'deposit',
      content: LOADING.DEPOSIT,
      persistent: true, // Loading messages persist until manually cleared
      priority: 100,
    });
  };

  const showWithdrawLoading = () => {
    return messageState.addMessage({
      type: 'loading',
      category: 'withdraw',
      content: LOADING.WITHDRAW,
      persistent: true,
      priority: 100,
    });
  };

  const showVaultSharesLoading = () => {
    return messageState.addMessage({
      type: 'loading',
      category: 'vault-shares',
      content: LOADING.VAULT_SHARES,
      persistent: true,
      priority: 95,
    });
  };

  // Generic message creator
  const showMessage = (
    type: MessageType, 
    category: MessageCategory, 
    content: string, 
    options?: { persistent?: boolean; priority?: number }
  ) => {
    return messageState.addMessage({
      type,
      category,
      content,
      persistent: options?.persistent || false,
      priority: options?.priority || 50,
    });
  };

  // Clear functions for specific categories
  const clearDepositMessages = () => messageState.clearMessagesByCategory('deposit');
  const clearWithdrawMessages = () => messageState.clearMessagesByCategory('withdraw');
  const clearVaultSharesMessages = () => messageState.clearMessagesByCategory('vault-shares');

  // Check functions for specific message types
  const hasLoadingMessages = messageState.activeMessages.some(msg => msg.type === 'loading');
  const hasErrorMessages = messageState.activeMessages.some(msg => msg.type === 'error');
  const hasSuccessMessages = messageState.activeMessages.some(msg => msg.type === 'success');
  
  const hasDepositMessages = messageState.activeMessages.some(msg => msg.category === 'deposit');
  const hasWithdrawMessages = messageState.activeMessages.some(msg => msg.category === 'withdraw');
  const hasVaultSharesMessages = messageState.activeMessages.some(msg => msg.category === 'vault-shares');

  return {
    // Access to full message state
    ...messageState,
    
    // Quick message creators
    showDepositInfo,
    showWithdrawInfo,
    showDepositSuccess,
    showWithdrawSuccess,
    showVaultSharesSuccess,
    showDepositError,
    showWithdrawError,
    showVaultSharesError,
    showDepositLoading,
    showWithdrawLoading,
    showVaultSharesLoading,
    showMessage,
    
    // Clear functions
    clearDepositMessages,
    clearWithdrawMessages,
    clearVaultSharesMessages,
    
    // Check functions
    hasLoadingMessages,
    hasErrorMessages,
    hasSuccessMessages,
    hasDepositMessages,
    hasWithdrawMessages,
    hasVaultSharesMessages,
  };
};

export default useMessages;
