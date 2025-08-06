'use client';

import { useState, useEffect } from "react";
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
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      // Only show welcome on mobile and if user hasn't dismissed it
      if (mobile && !localStorage.getItem('welcomeDismissed')) {
        setShowWelcome(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    localStorage.setItem('welcomeDismissed', 'true');
  };

  // Welcome Screen Component - Only show on mobile
  if (showWelcome && isMobile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Mobile Status Bar */}
        <div className="flex justify-between items-center p-4 pt-12">
          <div className="w-6 h-6">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <circle cx="5" cy="12" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="19" cy="12" r="2"/>
            </svg>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-1 bg-white rounded-full"></div>
            <div className="w-4 h-1 bg-white rounded-full"></div>
            <div className="w-4 h-1 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="px-6 pt-8">
          <h1 className="text-2xl font-medium mb-4">Welcome!</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            I am Yieldr, the first multichain agentic protocol. Read more
          </p>
          
          <div className="space-y-3">
            <button className="w-full bg-transparent border border-gray-600 text-white py-3 px-4 rounded-lg text-left">
              Help
            </button>
            <button 
              onClick={handleWelcomeClose}
              className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium"
            >
              Get started
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Mobile Status Bar */}
      <div className="flex justify-between items-center p-4 pt-12 md:hidden">
        <div className="w-6 h-6">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <circle cx="5" cy="12" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="19" cy="12" r="2"/>
          </svg>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-1 bg-white rounded-full"></div>
          <div className="w-4 h-1 bg-white rounded-full"></div>
          <div className="w-4 h-1 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block p-4">
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

      {/* Mobile Layout */}
      <div className="md:hidden px-4 pb-4 space-y-4">
        {/* Vault Info Card */}
        <PortfolioValue totalValue={totalValue} gains={totalGains} apy={currentApy} />
        
        {/* Allocation Card */}
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
        
        {/* Activity Card */}
        <ActivityGraphQL />
        
        {/* Wallet Connection */}
        <EthereumWalletConnection />
        
        {/* Vault Actions */}
        <VaultActions />
      </div>
    </div>
  );
}
