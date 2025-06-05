'use client';

import { useState } from 'react';
// import Image from "next/image";
import Activity from "@/components/Activity";
import Allocation from "@/components/Allocation";
import StatusPanel from "@/components/StatusPanel";
import { EthereumWalletConnection } from "@/components/EthereumWalletConnection";
import { VaultActions } from "@/components/VaultActions";
import PortfolioValue from "@/components/PortfolioValue";
import { ProtocolSwitcher } from "@/components/ProtocolSwitcher";
import { useAllocationData } from "@/hooks/useAllocationData";

export default function Home() {
  const [protocol, setProtocol] = useState<'near' | 'ethereum'>('ethereum');
  const { allocations, totalValue, isLoading, error } = useAllocationData(protocol);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Protocol Switcher */}
        <ProtocolSwitcher 
          currentProtocol={protocol}
          onProtocolChange={setProtocol}
        />

        {/* Top row */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          {/* Left - Status Panel */}
          <div className="col-span-3">
            <StatusPanel 
              nextRebalanceTime="6h 25m"
              messages={[
                { text: `Connect your ${protocol === 'ethereum' ? 'Ethereum' : 'NEAR'} wallet to get started!`, type: "info" }
              ]}
            />
          </div>
          
          {/* Right - Portfolio Value (spans remaining columns) */}
          <div className="col-span-9">
            <PortfolioValue totalValue={totalValue} gains={247000} apy={4.47} />
          </div>
        </div>
        
        {/* Bottom row */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left - Wallet Connection */}
          <div className="col-span-3">
            {protocol === 'ethereum' ? (
              <EthereumWalletConnection />
            ) : (
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">NEAR Wallet</h3>
                <p className="text-gray-400 text-center py-8">
                  NEAR wallet integration coming soon...
                </p>
              </div>
            )}
          </div>
          
          {/* Center Left - Vault Actions */}
          <div className="col-span-3">
            <VaultActions />
          </div>
          
          {/* Center Right - Allocation */}
          <div className="col-span-3">
            {isLoading ? (
              <div className="bg-[#1a1a1a] border border-[#333] text-white p-6 rounded-lg">
                <h2 className="text-xl font-medium mb-6">Allocation</h2>
                <div className="text-gray-400 text-center py-8">Loading allocation data...</div>
              </div>
            ) : error ? (
              <div className="bg-[#1a1a1a] border border-[#333] text-white p-6 rounded-lg">
                <h2 className="text-xl font-medium mb-6">Allocation</h2>
                <div className="text-red-400 text-center py-8">Error: {error}</div>
              </div>
            ) : (
              <Allocation allocations={allocations} />
            )}
          </div>
          
          {/* Right - Activity */}
          <div className="col-span-3">
            <Activity events={[
              `Connected to ${protocol === 'ethereum' ? 'Ethereum' : 'NEAR'} wallet`,
              "Vault contract loaded",
              "Ready for deposits and withdrawals",
              "Monitoring vault performance...",
              "AI agent ready for rebalancing",
              "Checking yield opportunities..."
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}
