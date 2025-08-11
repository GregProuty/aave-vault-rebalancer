'use client';

import { useState, useEffect } from "react";
import ActivityGraphQL from "@/components/ActivityGraphQL";
import Allocation from "@/components/Allocation";
import StatusPanelFigma from "@/components/StatusPanelFigma";
import { EthereumWalletConnection } from "@/components/EthereumWalletConnection";
import { BalanceFigma } from "@/components/BalanceFigma";
import PerformanceChart from "@/components/PerformanceChart";
import { useAllocationData } from "@/hooks/useAllocationData";
import { usePerformanceData } from "@/hooks/usePerformanceData";
import { TransactionStatusProvider } from "@/contexts/TransactionStatusContext";


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
    <TransactionStatusProvider>
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
      <div className="hidden md:block p-6">
        <div className="w-full max-w-7xl mx-auto">

          {/* Main Layout - 2 columns for better width utilization */}
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column - Increased height to accommodate all components */}
            <div className="col-span-4 flex flex-col">
              <div className="bg-black border border-gray-700 rounded-lg text-white h-[900px] flex flex-col">
                {/* Status Section - Fixed height */}
                <div className="p-6 flex-shrink-0">
                  <StatusPanelFigma />
                </div>
                
                {/* Balance Section - Flexible height, no scrolling */}
                <div className="p-6 flex-1">
                  <BalanceFigma />
                </div>
                
                {/* Wallet Section - Fixed height anchored to bottom */}
                <div className="p-6 flex-shrink-0">
                  <EthereumWalletConnection />
                </div>
              </div>
            </div>
            
            {/* Main Content Column - Performance Chart and below components */}
            <div className="col-span-8 flex flex-col space-y-4">
              {/* Performance Chart - Much wider now */}
              <PerformanceChart width={1100} height={400} />
              
              {/* Bottom row - Allocation and Activity with equal heights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="h-full">
                  {isLoading ? (
                    <div className="bg-black border border-gray-700 text-white p-6 rounded-lg h-full">
                      <h2 className="text-xl font-medium mb-6">Allocation</h2>
                      <div className="text-gray-400 text-center py-8">Loading allocation data...</div>
                    </div>
                  ) : hasError ? (
                    <div className="bg-black border border-gray-700 text-white p-6 rounded-lg h-full">
                      <h2 className="text-xl font-medium mb-6">Allocation</h2>
                      <div className="text-red-400 text-center py-8">Error loading data</div>
                    </div>
                  ) : (
                    <Allocation allocations={allocations} />
                  )}
                </div>
                
                <div className="h-full">
                  <ActivityGraphQL />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden px-4 pb-4 space-y-4">
        {/* Performance Chart Card */}
        <PerformanceChart width={350} height={300} isMobile={true} />
        
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
        
        {/* Balance */}
        <BalanceFigma />
      </div>
      </div>
    </TransactionStatusProvider>
  );
}
