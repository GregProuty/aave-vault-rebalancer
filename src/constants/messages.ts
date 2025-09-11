

export const MESSAGES = {
  // Welcome messages
  WELCOME: {
    TITLE: "Welcome!",
    DESCRIPTION: "I am Yieldr, the first multichain agentic protocol that automatically maximizes your Aave earnings with unparalleled reliability. Get started by approving a spending limit and depositing into the vault.",
    BUTTONS: {
      HELP: "Help",
      GET_STARTED: "Get started"
    }
  },
  
  // Welcome back messages
  WELCOME_BACK: {
    PREFIX: "Welcome back! You have earned ",
    SUFFIX: " yield since last time.",
    CURRENCY: "USDC"
  },
  
  // Info messages - User guidance and help
  INFO: {
    NO_DEPOSITS: "You currently have no deposits on Yieldr. To top up, enter an amount below.",
    DEPOSIT_HELP: "You can deposit USDC to Yieldr with one click below. The transaction typically takes X minutes and will start earning yield right away.\n\nNeed help? Contact help@yieldr.ai",
    DEPOSIT_CONTACT: "Need help? Contact help@yieldr.ai",
    WITHDRAW_HELP: "You can withdraw from Yieldr with one click below. The transaction typically takes X minutes and will arrive to the same wallet you connected.",
    WITHDRAW_CONTACT: "Need help? Contact help@yieldr.ai"
  },
  
  // Success messages
  SUCCESS: {
    DEPOSIT: "Your deposit was successful! ✅",
    WITHDRAW: "Your withdrawal was successful! ✅", 
    VAULT_SHARES: "You successfully added LP tokens to your wallet! 🎯 These are a representation of your vault shares, that you can trade if you wish."
  },
  
  // Error messages
  ERROR: {
    DEPOSIT: "Your deposit failed. Please try again!",
    WITHDRAW: "Your withdrawal failed. Please try again!",
    VAULT_SHARES: "Unable to add LP tokens to your wallet. Please try again!",
    WALLET_NOT_CONNECTED: "Please connect your wallet",
    INSUFFICIENT_BALANCE: "Insufficient balance",
    TRANSACTION_REJECTED: "Transaction was rejected",
    NETWORK_ERROR: "Network error occurred"
  },
  
  // Loading messages
  LOADING: {
    DEPOSIT: "Deposit in progress...",
    WITHDRAW: "Withdrawal in progress...",
    VAULT_SHARES: "Adding LP tokens to wallet..."
  },
  
  // UI Labels
  UI: {
    DEPOSIT: "Deposit",
    WITHDRAW: "Withdraw",
    APPROVE: "Approve",
    CANCEL: "Cancel",
    CONFIRM: "Confirm",
    MAX: "Max",
    DONE: "Done",
    VIEW_TRANSACTION: "View transaction",
    GOT_IT: "Got it",
    HELP: "Help"
  },
  
  // Status labels
  STATUS: {
    DEPOSITS: "Deposits",
    PREVIOUS: "Previous", 
    TOTAL: "Total",
    YIELD: "Yield",
    BALANCE: "Balance"
  }
} as const;

// Message formatting helpers
export const formatWelcomeBackMessage = (yieldAmount: number): string => {
  return `${MESSAGES.WELCOME_BACK.PREFIX}${yieldAmount} ${MESSAGES.WELCOME_BACK.CURRENCY}${MESSAGES.WELCOME_BACK.SUFFIX}`;
};

// Message type definitions for the reusable component and state management
export type MessageType = 'idle' | 'info' | 'success' | 'error' | 'loading';

export type MessageCategory = 'welcome' | 'welcome-back' | 'deposit' | 'withdraw' | 'vault-shares';

export interface MessageConfig {
  type: MessageType;
  category: MessageCategory;
  content: string;
  id?: string;
  persistent?: boolean; // Whether message stays until manually dismissed
  autoHide?: number; // Auto-hide after X milliseconds
}

// Export individual message categories for easier imports
export const { WELCOME, WELCOME_BACK, INFO, SUCCESS, ERROR, LOADING, UI, STATUS } = MESSAGES;
