'use client';

import React from 'react';
import { usePerformanceData } from '@/hooks/usePerformanceData';

const ActivityGraphQL = () => {
  const { performanceData, vaultData, loading } = usePerformanceData();

  // Mock activity data for mobile design
  const getMobileActivity = () => [
    {
      type: 'deposit',
      icon: '💰',
      title: 'Rebalanced 10% from Base to Ethereum',
      time: '2m ago',
      amount: null
    },
    {
      type: 'deposit',
      icon: '💰',
      title: 'Received deposit of $1,230 from Gr3ss',
      time: '5m ago',
      amount: '+$1,230'
    },
    {
      type: 'yield',
      icon: '📈',
      title: 'Harvested $237 yield',
      time: '1h ago',
      amount: '+$237'
    },
    {
      type: 'withdraw',
      icon: '💸',
      title: 'Withdraw of $810 initiated by Gr4ss',
      time: '2h ago',
      amount: '-$810'
    },
    {
      type: 'deposit',
      icon: '💰',
      title: 'Received deposit to Ethereum',
      time: '3h ago',
      amount: '+$500'
    },
    {
      type: 'info',
      icon: '🔄',
      title: 'Allocated 25% to Arbitrum',
      time: '4h ago',
      amount: null
    },
    {
      type: 'info',
      icon: '🔄',
      title: 'Allocated 14% to Base',
      time: '6h ago',
      amount: null
    },
    {
      type: 'info',
      icon: '🔄',
      title: 'Allocated 9% to BNB Chain',
      time: '8h ago',
      amount: null
    }
  ];

  // Show real activity only when vault has actual data
  const getRecentActivity = () => {
    const activities = [];

    // Only show activities if vault has real assets
    if (vaultData && parseFloat(vaultData.totalAssets) > 0) {
      const latestSharePrice = vaultData.sharePrice.toFixed(4);
      const performance24h = vaultData.performance24h.toFixed(2);
      const totalAssets = parseFloat(vaultData.totalAssets).toFixed(2);
      
      activities.push({
        type: 'success',
        time: '2m ago',
        message: `Share price: $${latestSharePrice} (${performance24h}% 24h)`
      });

      // Show performance data if available
      if (performanceData.length > 0) {
        const latestData = performanceData[performanceData.length - 1];
        const latestGain = parseFloat(latestData.differential);
        if (!isNaN(latestGain)) {
          activities.push({
            type: latestGain > 0 ? 'success' : 'info',
            time: '1h ago',
            message: `Performance vs baseline: ${latestGain > 0 ? '+' : ''}${(latestGain * 100).toFixed(3)}%`
          });
        }
      }

      activities.push({
        type: 'info',
        time: '3h ago',
        message: `Total vault assets: $${totalAssets}`
      });
    } else {
      // Show waiting state when no real data
      activities.push({
        type: 'info',
        time: 'Now',
        message: 'Waiting for vault deposits...'
      });
    }

    return activities;
  };

  const statusEvents = [
    `📈 ${performanceData.length} days of historical data available`,
    ...(vaultData && parseFloat(vaultData.totalAssets) > 0 ? 
      ['✅ Vault has active deposits'] : 
      ['⏳ Waiting for first deposit'])
  ];

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border border-[#333] text-white rounded-lg h-full overflow-hidden">
        <div className="p-4 border-b border-[#333]">
          <h2 className="text-lg font-medium">Activity</h2>
        </div>
        <div className="p-4 flex items-center justify-center h-32">
          <div className="text-gray-400">Loading activity...</div>
        </div>
      </div>
    );
  }

  const activities = getRecentActivity();
  const mobileActivities = getMobileActivity();

  return (
    <div className="bg-[#1a1a1a] border border-[#333] text-white rounded-lg overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="p-4 border-b border-[#333]">
          <h2 className="text-lg font-medium">Activity</h2>
        </div>
        
        {/* Content */}
        <div className="flex flex-col">
          {/* Recent Activity */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Recent Events</h3>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Events */}
          <div className="border-t border-[#333] p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">System Status</h3>
            <div className="space-y-2">
              {statusEvents.map((event, index) => (
                <div key={index} className="text-xs text-gray-400 font-mono">
                  {event}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#333] flex justify-between items-center">
          <h2 className="text-lg font-medium">Activity</h2>
          <div className="text-sm text-gray-400 flex items-center">
            <span>Rebalancing in 5h 26m</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2"></div>
          </div>
        </div>
        
        {/* Mobile Activity List */}
        <div className="p-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {mobileActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                {/* Left side - Icon and details */}
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-[#333] rounded-full flex items-center justify-center text-sm">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-tight">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
                
                {/* Right side - Amount */}
                {activity.amount && (
                  <div className={`text-sm font-medium ${
                    activity.amount.startsWith('+') ? 'text-green-400' : 
                    activity.amount.startsWith('-') ? 'text-red-400' : 'text-white'
                  }`}>
                    {activity.amount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityGraphQL; 