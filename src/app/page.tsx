'use client';

// import Image from "next/image";
import ActivityGraphQL from "@/components/ActivityGraphQL";
import Allocation from "@/components/Allocation";
import StatusPanel from "@/components/StatusPanel";
import { EthereumWalletConnection } from "@/components/EthereumWalletConnection";
import { VaultActions } from "@/components/VaultActions";
import PortfolioValue from "@/components/PortfolioValue";
import { useAllocationData } from "@/hooks/useAllocationData";
import { usePerformanceData } from "@/hooks/usePerformanceData";
import GraphQLTest from "@/components/GraphQLTest";

export default function Home() {
  const { allocations, isLoading: allocationsLoading, error: allocationsError } = useAllocationData();
  const { 
    totalValue, 
    totalGains, 
    currentApy, 
    loading: performanceLoading, 
    error: performanceError
  } = usePerformanceData();
  
  const isLoading = allocationsLoading || performanceLoading;
  const hasError = allocationsError || performanceError;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          {/* Left - Status Panel */}
          <div className="col-span-3">
            <StatusPanel 
              nextRebalanceTime={null}
              messages={[
                { text: hasError ? "GraphQL backend disconnected - check console" : "GraphQL backend connected", type: hasError ? "error" : "success" as const },
                ...(allocationsError || performanceError ? [] : [
                  { text: "Data collection active", type: "success" as const }
                ]),
                { text: "Connect Ethereum wallet to deposit", type: "warning" as const }
              ]}
            />
            <div className="mt-2">
              <GraphQLTest />
            </div>
          </div>
          
          {/* Right - Portfolio Value (spans remaining columns) */}
          <div className="col-span-9">
            <PortfolioValue totalValue={totalValue} gains={totalGains} apy={currentApy} />
          </div>
        </div>
        
        {/* Main row */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left - Wallet Connection */}
          <div className="col-span-3">
            <EthereumWalletConnection />
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
            ) : hasError ? (
              <div className="bg-[#1a1a1a] border border-[#333] text-white p-6 rounded-lg">
                <h2 className="text-xl font-medium mb-6">Allocation</h2>
                <div className="text-red-400 text-center py-8">Error loading data</div>
              </div>
            ) : (
              <Allocation allocations={allocations} />
            )}
          </div>
          
          {/* Right - Activity */}
          <div className="col-span-3">
            <ActivityGraphQL />
          </div>
        </div>
      </div>
    </div>
  );
}
