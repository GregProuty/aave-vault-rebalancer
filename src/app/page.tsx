'use client';

// import Image from "next/image";
import Activity from "@/components/Activity";
import Allocation from "@/components/Allocation";
import StatusPanel from "@/components/StatusPanel";
import { EthereumWalletConnection } from "@/components/EthereumWalletConnection";
import { VaultActions } from "@/components/VaultActions";
import PortfolioValue from "@/components/PortfolioValue";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          {/* Left - Status Panel */}
          <div className="col-span-3">
            <StatusPanel 
              nextRebalanceTime="6h 25m"
              messages={[
                { text: "Connect your Ethereum wallet to get started!", type: "info" }
              ]}
            />
          </div>
          
          {/* Right - Portfolio Value (spans remaining columns) */}
          <div className="col-span-9">
            <PortfolioValue totalValue={1230000} gains={247000} apy={4.47} />
          </div>
        </div>
        
        {/* Bottom row */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left - Ethereum Wallet Connection */}
          <div className="col-span-3">
            <EthereumWalletConnection />
          </div>
          
          {/* Center Left - Vault Actions */}
          <div className="col-span-3">
            <VaultActions />
          </div>
          
          {/* Center Right - Allocation */}
          <div className="col-span-3">
            <Allocation allocations={[
              { name: "Ethereum", icon: "Ξ", apy: 4.7, allocation: 44, color: "#627EEA" },
              { name: "Avalanche", icon: "A", apy: 4, allocation: 27, color: "#E84142" },
              { name: "Base", icon: "B", apy: 3.3, allocation: 14, color: "#0052FF" },
              { name: "BNB Chain", icon: "B", apy: 2.8, allocation: 9, color: "#F3BA2F" },
              { name: "Polygon", icon: "P", apy: 2.4, allocation: 6, color: "#8247E5" }
            ]} />
          </div>
          
          {/* Right - Activity */}
          <div className="col-span-3">
            <Activity events={["Connected to Ethereum wallet", "Vault contract loaded", "Ready for deposits and withdrawals", "Monitoring vault performance...", "AI agent ready for rebalancing", "Checking yield opportunities..."]} />
          </div>
        </div>
      </div>
    </div>
  );
}
