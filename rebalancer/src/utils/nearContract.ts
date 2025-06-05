import { providers, utils } from 'near-api-js';
import type { WalletSelector } from '@near-wallet-selector/core';

// NEAR network configuration
const NETWORK_ID: 'testnet' | 'mainnet' = 'testnet'; // Change to 'mainnet' for production
const CONTRACT_ID = 'your-contract.testnet'; // Replace with your contract ID

// RPC endpoint for the network
const RPC_URL = NETWORK_ID === 'mainnet' 
  ? 'https://rpc.mainnet.near.org' 
  : 'https://rpc.testnet.near.org';

export interface ContractCallOptions {
  methodName: string;
  args?: Record<string, unknown>;
  gas?: string;
  deposit?: string;
}

export interface ViewCallOptions {
  methodName: string;
  args?: Record<string, unknown>;
}

export class NearContract {
  private selector: WalletSelector;
  private contractId: string;

  constructor(selector: WalletSelector, contractId: string = CONTRACT_ID) {
    this.selector = selector;
    this.contractId = contractId;
  }

  /**
   * Call a view method on the contract (read-only, no gas required)
   */
  async viewMethod({ methodName, args = {} }: ViewCallOptions): Promise<unknown> {
    const provider = new providers.JsonRpcProvider({ url: RPC_URL });
    
    const result = await provider.query({
      request_type: 'call_function',
      finality: 'final',
      account_id: this.contractId,
      method_name: methodName,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
    });

    // @ts-expect-error - NEAR RPC response type is not properly typed
    return JSON.parse(Buffer.from(result.result).toString());
  }

  /**
   * Call a change method on the contract (requires wallet signature and gas)
   */
  async callMethod({ 
    methodName, 
    args = {}, 
    gas = '300000000000000', // 300 TGas
    deposit = '0' 
  }: ContractCallOptions): Promise<unknown> {
    const wallet = await this.selector.wallet();
    const accounts = await wallet.getAccounts();
    
    return await wallet.signAndSendTransaction({
      signerId: accounts[0].accountId,
      receiverId: this.contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName,
            args,
            gas,
            deposit,
          },
        },
      ],
    });
  }

  /**
   * Get account balance in NEAR
   */
  async getAccountBalance(accountId: string): Promise<string> {
    const provider = new providers.JsonRpcProvider({ url: RPC_URL });
    const account = await provider.query({
      request_type: 'view_account',
      finality: 'final',
      account_id: accountId,
    });

    // @ts-expect-error - NEAR RPC response type is not properly typed
    return utils.format.formatNearAmount(account.amount);
  }

  /**
   * Example portfolio-related contract methods
   * Replace these with your actual contract methods
   */

  // Get user's portfolio allocation
  async getPortfolioAllocation(accountId: string) {
    return this.viewMethod({
      methodName: 'get_portfolio_allocation',
      args: { account_id: accountId }
    });
  }

  // Deposit NEAR tokens
  async deposit(amount: string) {
    return this.callMethod({
      methodName: 'deposit',
      args: {},
      deposit: utils.format.parseNearAmount(amount) || '0'
    });
  }

  // Withdraw NEAR tokens
  async withdraw(amount: string) {
    return this.callMethod({
      methodName: 'withdraw',
      args: { amount: utils.format.parseNearAmount(amount) }
    });
  }

  // Rebalance portfolio
  async rebalancePortfolio(targetAllocations: Record<string, number>) {
    return this.callMethod({
      methodName: 'rebalance_portfolio',
      args: { target_allocations: targetAllocations }
    });
  }

  // Get portfolio value
  async getPortfolioValue(accountId: string) {
    return this.viewMethod({
      methodName: 'get_portfolio_value',
      args: { account_id: accountId }
    });
  }

  // Get rebalancing history
  async getRebalancingHistory(accountId: string) {
    return this.viewMethod({
      methodName: 'get_rebalancing_history',
      args: { account_id: accountId }
    });
  }
}

// Utility function to create a contract instance
export const createNearContract = (selector: WalletSelector, contractId?: string) => {
  return new NearContract(selector, contractId);
}; 