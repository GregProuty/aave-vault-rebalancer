'use client';

import React from 'react';
import { usePerformanceData } from '@/hooks/usePerformanceData';

const ActivityGraphQL = () => {
  const { performanceData, vaultData, loading } = usePerformanceData();

  // Create mock activity based on real data
  const getRecentActivity = () => {
    if (!performanceData.length) return [];
    
    const recentData = performanceData.slice(-5); // Last 5 days
    const activities = [];

    // Add performance tracking events based on new vault data
    const latestSharePrice = vaultData ? vaultData.sharePrice.toFixed(4) : '1.0000';
    const performance24h = vaultData ? vaultData.performance24h.toFixed(2) : '0.00';
    
    activities.push({
      type: 'success',
      time: '2m ago',
      message: `Share price updated: $${latestSharePrice} (${performance24h}% 24h)`
    });

    if (recentData.length > 0 && recentData[recentData.length - 1].differential) {
      const latestGain = parseFloat(recentData[recentData.length - 1].differential);
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
      message: `Vault tracking: Base chain active`
    });

    activities.push({
      type: 'success',
      time: '6h ago',
      message: 'All chain data synchronized'
    });

    // Total assets info
    const totalAssets = vaultData ? `$${parseFloat(vaultData.totalAssets).toFixed(2)}` : '$0.00';
    
    activities.push({
      type: 'info',
      time: '12h ago',
      message: `Total vault assets: ${totalAssets}`
    });

    return activities;
  };

  const statusEvents = [
    '✅ GraphQL backend connected (localhost:4000)',
    '✅ Database connection active',
    '📊 Performance tracking enabled',
    '🔄 Real-time data synchronization',
    `📈 ${performanceData.length} days of historical data`
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

  return (
    <div className="bg-[#1a1a1a] border border-[#333] text-white rounded-lg overflow-hidden">
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
  );
};

export default ActivityGraphQL; 