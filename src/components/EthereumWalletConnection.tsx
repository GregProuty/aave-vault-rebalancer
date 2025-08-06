'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId } from 'wagmi';

export const EthereumWalletConnection: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Ethereum Wallet</h3>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      
      <div className="space-y-4">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            // Note: If your app doesn't use authentication, you
            // can remove all 'authenticationStatus' checks
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={openChainModal}
                          className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 16,
                                height: 16,
                                borderRadius: 999,
                                overflow: 'hidden',
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: 16, height: 16 }}
                                />
                              )}
                            </div>
                          )}
                          <span>{chain.name}</span>
                        </button>
                      </div>

                      <button
                        onClick={openAccountModal}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{account.displayName}</span>
                          <span className="text-xs text-gray-400">
                            {account.displayBalance
                              ? ` ${account.displayBalance}`
                              : ''}
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>

          {isConnected && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Wallet Balance</div>
              <div className="text-sm text-white">
                {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Chain ID: {chainId}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout - Show compact wallet info if connected */}
      <div className="md:hidden">
        {isConnected ? (
          <div className="p-4">
            <h3 className="text-lg font-medium text-white mb-3">Wallet Connected</h3>
            <ConnectButton.Custom>
              {({ account, openAccountModal }) => (
                <button
                  onClick={openAccountModal}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{account?.displayName}</span>
                    <span className="text-xs text-gray-400">
                      {balance ? `${parseFloat(balance.formatted).toFixed(3)} ${balance.symbol}` : ''}
                    </span>
                  </div>
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        ) : (
          <div className="p-4">
            <h3 className="text-lg font-medium text-white mb-3">Connect Wallet</h3>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        )}
      </div>
    </div>
  );
}; 