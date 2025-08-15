'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { ERC20_ABI, getUSDCAddress } from '@/utils/contracts';

export const EthereumWalletConnection: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });

  // Fetch USDC wallet balance for compact row display
  const { data: usdcBalance } = useReadContract({
    address: chainId ? (getUSDCAddress(chainId) as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!chainId }
  });

  return (
    <div className="text-primary w-full h-full flex flex-col">
      {/* Desktop Layout */}
      <div className="hidden md:block">
      <div className="space-y-4 flex-1 flex flex-col">
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
                        className="w-full bg-gray3 hover:bg-gray4 text-primary font-medium py-3 px-4 rounded-lg transition-colors border border-gray4"
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

                  // COMPACT one-line card matching Figma
                  const usdcNum = usdcBalance ? parseFloat(formatUnits(usdcBalance as bigint, 6)) : 0;
                  const usdcFormatted = usdcBalance ? usdcNum.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '';
                  return (
                    <div>
                      <button
                        onClick={openAccountModal}
                        className="w-full bg-gray2 border border-gray3 rounded-xl px-4 py-2 transition-colors hover:bg-gray1"
                      >
                        <div className="flex items-center justify-between">
                          {/* Left: wallet icon + short address */}
                          <div className="flex items-center gap-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                              <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2h-6a3 3 0 0 0 0 6h6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M21 11h-6a2 2 0 1 0 0 4h6v-4z" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                            <span className="text-base font-medium leading-none">{account.displayName}</span>
                          </div>
                          {/* Right: USDC balance and kebab */}
                          <div className="flex items-center gap-3">
                            <div className="text-right leading-tight">
                              <div className="text-sm font-medium text-secondary">{usdcFormatted}</div>
                              <div className="text-xs text-secondary">USDC</div>
                            </div>
                            <span className="text-secondary text-base">•••</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
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