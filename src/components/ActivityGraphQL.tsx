'use client';

import React, { useState, useEffect } from 'react';
import { usePerformanceData } from '@/hooks/usePerformanceData';
import { useActivityData, getMockActivityData } from '@/hooks/useActivityData';
import Image from 'next/image';

const ActivityGraphQL = () => {
  const { loading } = usePerformanceData();
  const { activities, loading: activitiesLoading, error: activitiesError } = useActivityData(15);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 1, minutes: 25 });

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59 };
        }
        return { hours: 1, minutes: 25 }; // Reset countdown
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Use real activity data or fallback to mock data
  const displayActivities = activitiesError || activities.length === 0 
    ? getMockActivityData() 
    : activities;

  if (loading) {
    return (
      <div className="bg-black border border-gray-700 text-white rounded-lg h-[480px] overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Activity</h2>
          <div className="text-sm text-gray-400 flex items-center">
            <span>Rebalancing in {timeRemaining.hours}h {timeRemaining.minutes}m</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2"></div>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center h-32">
          <div className="text-gray-400">Loading activity...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border border-gray-700 text-white rounded-lg overflow-hidden h-[480px] flex flex-col">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col h-full">
        {/* Header with countdown */}
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Activity</h2>
          <div className="text-sm text-gray-400 flex items-center">
            <span>Rebalancing in {timeRemaining.hours}h {timeRemaining.minutes}m</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2"></div>
          </div>
        </div>

        {/* Activity List - No borders, clean design */}
        <div className="flex-1 p-4 pt-0 overflow-y-auto">
          {activitiesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Loading activity...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {displayActivities.map((activity, index) => (
                <div key={activity.id || index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Image
                      src={activity.icon}
                      alt={activity.type.toLowerCase()}
                      width={16}
                      height={16}
                      className="filter brightness-0 invert"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {activity.title}
                      {activity.description && (
                        <span className="text-gray-500"> {activity.description}</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                      {activity.transactionHash && (
                        <a
                          href={`https://basescan.org/tx/${activity.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          View Tx
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Header with countdown */}
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Activity</h2>
          <div className="text-sm text-gray-400 flex items-center">
            <span>Rebalancing in {timeRemaining.hours}h {timeRemaining.minutes}m</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2"></div>
          </div>
        </div>
        
        {/* Mobile Activity List */}
        <div className="p-4 pt-0">
          {activitiesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Loading activity...</div>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {displayActivities.map((activity, index) => (
                <div key={activity.id || index} className="flex items-center space-x-3 py-2">
                  <div className="w-8 h-8 bg-[#333] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image
                      src={activity.icon}
                      alt={activity.type.toLowerCase()}
                      width={16}
                      height={16}
                      className="filter brightness-0 invert"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-tight">
                      {activity.title}
                      {activity.description && (
                        <span className="text-gray-400"> {activity.description}</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                      {activity.transactionHash && (
                        <a
                          href={`https://basescan.org/tx/${activity.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Tx
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityGraphQL;