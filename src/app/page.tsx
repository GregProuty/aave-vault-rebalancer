'use client';

import { useState } from "react";
import ActivityGraphQL from "@/components/ActivityGraphQL";
import Allocation from "@/components/Allocation";
import StatusPanelFigma from "@/components/StatusPanelFigma";
import { EthereumWalletConnection } from "@/components/EthereumWalletConnection";
import { BalanceFigma } from "@/components/BalanceFigma";
// import PerformanceChart from "@/components/PerformanceChart"; // kept for reference only
import ResponsiveVaultChart from "@/components/ResponsiveVaultChart";
import { useAllocationData } from "@/hooks/useAllocationData";
import { usePerformanceData } from "@/hooks/usePerformanceData";
import { TransactionStatusProvider } from "@/contexts/TransactionStatusContext";
import { WelcomeProvider } from "@/contexts/WelcomeContext";
import { MessageStateProvider } from "@/contexts/MessageStateContext";
import { DepositProvider } from "@/contexts/DepositContext";
import Image from "next/image";


// Main content component
function MainContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { allocations, isLoading: allocationsLoading, error: allocationsError } = useAllocationData();
  const { 
    loading: performanceLoading
  } = usePerformanceData();
  
  const isLoading = allocationsLoading || performanceLoading;
  // Only show allocation error if there's a specific allocation error, not performance errors
  const hasAllocationError = allocationsError;

  // Welcome modal disabled - no popups

  return (
          <TransactionStatusProvider>
            <MessageStateProvider>
              <DepositProvider>
                <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Mobile Header with logo (left) and hamburger (right) */}
      <div className="flex justify-between items-center p-4 pt-12 md:hidden">
        <Image src="/logo.svg" alt="Yieldr" width={32} height={32} />
        <button
          aria-label="Open menu"
          className="p-2 rounded"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Fixed left sidebar */}
        <div className="fixed left-0 top-0 h-screen w-[360px] bg-gray1 border-r border-gray3">
          <div className="h-full flex flex-col text-white p-6">
            {/* Status Section */}
            <div className="flex-shrink-0">
              <StatusPanelFigma />
            </div>
            {/* Spacer pushes footer stack (actions + wallet) to bottom */}
            <div className="flex-1" />
            {/* Actions (Balance) above Wallet at the bottom */}
            <div className="flex-shrink-0 mb-6">
              <BalanceFigma />
            </div>
            <div className="pt-0 flex-shrink-0">
              <EthereumWalletConnection />
            </div>
          </div>
        </div>

        {/* Main content area centered; left padding accounts for sidebar width */}
        <div className="pl-[360px] min-h-[800px] max-h-[1400px] h-screen overflow-y-auto">
          {/* Constrain and center the main stack with equal top/bottom padding */}
          <div className="w-full max-w-[83.2rem] mx-auto px-6 py-6 min-h-full flex flex-col">
            {/* Chart section - fixed height */}
            <div className="flex-shrink-0 mb-4">
              <ResponsiveVaultChart height={360} />
            </div>

            {/* Bottom row - Allocation and Activity - fills remaining space */}
            <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
              <div className="h-full overflow-hidden">
                {isLoading ? (
                  <div className="bg-gray1 border border-gray3 text-primary p-6 rounded-lg h-full flex flex-col">
                    <h2 className="text-xl font-medium mb-6">Allocation</h2>
                    <div className="text-secondary text-center flex-1 flex items-center justify-center">Loading allocation data...</div>
                  </div>
                ) : hasAllocationError ? (
                  <div className="bg-gray1 border border-gray3 text-primary p-6 rounded-lg h-full flex flex-col">
                    <h2 className="text-xl font-medium mb-6">Allocation</h2>
                    <div className="text-red-400 text-center flex-1 flex items-center justify-center">Error loading data</div>
                  </div>
                ) : (
                  <div className="h-full overflow-hidden">
                    <Allocation allocations={allocations} />
                  </div>
                )}
              </div>
              <div className="h-full overflow-hidden">
                <ActivityGraphQL />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-[600px] max-h-[1200px] h-screen flex flex-col">
        {/* Mobile Header - already positioned above */}
        
        {/* Mobile Content with equal padding top/bottom */}
        <div className="flex-1 px-4 py-4 flex flex-col space-y-4 overflow-y-auto">
          {/* Performance Chart Card (new responsive) */}
          <div className="flex-shrink-0">
            <ResponsiveVaultChart height={300} />
          </div>
          
          {/* Allocation Card */}
          <div className="flex-shrink-0">
            {isLoading ? (
              <div className="bg-[#1a1a1a] border border-[#333] text-white p-6 rounded-lg">
                <h2 className="text-xl font-medium mb-6">Allocation</h2>
                <div className="text-gray-400 text-center py-8">Loading allocation data...</div>
              </div>
            ) : hasAllocationError ? (
              <div className="bg-[#1a1a1a] border border-[#333] text-white p-6 rounded-lg">
                <h2 className="text-xl font-medium mb-6">Allocation</h2>
                <div className="text-red-400 text-center py-8">Error loading data</div>
              </div>
            ) : (
              <Allocation allocations={allocations} />
            )}
          </div>
          
          {/* Activity Card */}
          <div className="flex-shrink-0">
            <ActivityGraphQL />
          </div>
          
          {/* Balance */}
          <div className="flex-shrink-0">
            <BalanceFigma />
          </div>
        </div>
      </div>
      {/* Mobile slide-over menu with Wallet (animated) */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-200 motion-reduce:transition-none ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 motion-reduce:transition-none ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 bg-gray1 border-l border-gray3 p-4 overflow-y-auto transform transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold">Menu</h2>
            <button aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} className="p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <EthereumWalletConnection />
          </div>
        </div>
      </div>
              </div>
              </DepositProvider>
            </MessageStateProvider>
          </TransactionStatusProvider>
  );
}

export default function Home() {
  return (
    <WelcomeProvider>
      <MainContent />
    </WelcomeProvider>
  );
}
