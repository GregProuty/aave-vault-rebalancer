'use client';

import React from 'react';
import { usePerformanceData } from '@/hooks/usePerformanceData';

interface PerformanceChartProps {
  width?: number;
  height?: number;
}

const PerformanceChart = ({ 
  width = 600, 
  height = 200 
}: PerformanceChartProps) => {
  const { vaultPerformanceData, loading, vaultData } = usePerformanceData();
  
  // Debug mode - set to false to remove debugging visuals
  const DEBUG_MODE = false;

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Check if we're using real data or fallback
  const isUsingRealData = vaultData && parseFloat(vaultData.totalAssets) > 0;
  const hasNoData = !vaultPerformanceData || vaultPerformanceData.length === 0;

  // Process performance data for dual line chart
  let vaultValues: number[] = [];
  let baselineValues: number[] = [];
  let dateLabels: string[] = [];
  let minValue = 0.98;
  let maxValue = 1.02;
  
  if (vaultPerformanceData && vaultPerformanceData.length > 0) {
    vaultValues = vaultPerformanceData.map(d => d.vaultSharePrice);
    baselineValues = vaultPerformanceData.map(d => d.baselineValue);
    dateLabels = vaultPerformanceData.map(d => d.date);
    
    const allValues = [...vaultValues, ...baselineValues];
    if (allValues.length > 0) {
      minValue = Math.min(...allValues);
      maxValue = Math.max(...allValues);
      
      // Add some padding to the range
      const range = maxValue - minValue;
      const padding = Math.max(range * 0.05, 0.01); // 5% padding, minimum 0.01
      minValue -= padding;
      maxValue += padding;
    }
  }

  // Create Y-axis scale
  const yAxisSteps = 4; // Reduced from 6 to prevent label overlap
  const yAxisValues: number[] = [];
  for (let i = 0; i <= yAxisSteps; i++) {
    const value = minValue + (maxValue - minValue) * (i / yAxisSteps);
    yAxisValues.push(value);
  }

  // Chart dimensions accounting for axis space (increased left margin for Y-axis label spacing)
  const chartMargin = { left: 75, right: 20, top: 20, bottom: 45 };
  const chartWidth = width - chartMargin.left - chartMargin.right;
  const chartHeight = height - chartMargin.top - chartMargin.bottom;

  // Create line paths for vault and baseline performance
  const createLinePath = (values: number[]) => {
    if (values.length === 0) return '';
    if (values.length === 1) {
      // Single point - draw a horizontal line across the chart
      const yNormalized = (values[0] - minValue) / (maxValue - minValue);
      const y = chartMargin.top + chartHeight - (yNormalized * chartHeight);
      return `M ${chartMargin.left} ${y} L ${chartMargin.left + chartWidth} ${y}`;
    }
    
    return values.map((value, index) => {
      const x = chartMargin.left + (index / (values.length - 1)) * chartWidth;
      const yNormalized = (value - minValue) / (maxValue - minValue);
      const y = chartMargin.top + chartHeight - (yNormalized * chartHeight);
      
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const vaultPath = createLinePath(vaultValues);
  const baselinePath = createLinePath(baselineValues);
  


  const formatSharePrice = (value: number) => {
    // Format share price values (around 1.0) with appropriate precision
    if (value >= 1) {
      return value.toFixed(4);
    } else {
      return value.toFixed(5);
    }
  };

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays}d ago`;
    
    // For older dates, show month/day
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Create X-axis time labels (show every few days to avoid crowding)
  const timeLabels = [];
  
  if (dateLabels.length > 0) {
    const labelInterval = Math.max(1, Math.floor(dateLabels.length / 6)); // Show ~6 labels max
    
    for (let i = 0; i < dateLabels.length; i += labelInterval) {
      const x = chartMargin.left + (i / Math.max(1, dateLabels.length - 1)) * chartWidth;
      timeLabels.push({
        x,
        label: formatDateLabel(dateLabels[i]),
        isFirst: i === 0,
        isLast: i >= dateLabels.length - labelInterval
      });
    }
    
    // Always include the last label if it's not already included
    if (dateLabels.length > 1 && timeLabels[timeLabels.length - 1]?.isLast !== true) {
      const lastIndex = dateLabels.length - 1;
      const x = chartMargin.left + chartWidth;
      timeLabels.push({
        x,
        label: formatDateLabel(dateLabels[lastIndex]),
        isFirst: false,
        isLast: true
      });
    }
  } else {
    // Fallback for when we don't have real dates (mock data scenario)
    const mockTimeLabels = ['30d ago', '20d ago', '10d ago', 'Today'];
    mockTimeLabels.forEach((label, index) => {
      const x = chartMargin.left + (index / (mockTimeLabels.length - 1)) * chartWidth;
      timeLabels.push({
        x,
        label,
        isFirst: index === 0,
        isLast: index === mockTimeLabels.length - 1
      });
    });
  }

  return (
    <div className="relative w-full h-full">
      <svg width={width} height={height} className="absolute bottom-10 left-0">
        {/* Y-axis grid lines */}
        {yAxisValues.map((value, i) => {
          const y = chartMargin.top + (chartHeight * i / yAxisSteps); // Start from top for highest values
          return (
            <g key={`grid-${i}`}>
              {/* Horizontal grid line */}
              <line
                x1={chartMargin.left}
                y1={y}
                x2={chartMargin.left + chartWidth}
                y2={y}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              {/* Y-axis label */}
              {DEBUG_MODE && (
                <rect
                  x={chartMargin.left - 55}
                  y={y - 8}
                  width={45}
                  height={16}
                  fill="rgba(0,255,0,0.1)"
                  stroke="green"
                  strokeWidth="1"
                  strokeDasharray="1,1"
                />
              )}
              <text
                x={chartMargin.left - 10}
                y={y + 4}
                fill="rgba(255, 255, 255, 0.6)"
                fontSize="11"
                textAnchor="end"
                fontFamily="monospace"
                stroke={DEBUG_MODE ? "green" : undefined}
                strokeWidth={DEBUG_MODE ? "0.3" : undefined}
              >
                {formatSharePrice(yAxisValues[yAxisSteps - i])}
              </text>
            </g>
          );
        })}
        
        {/* Y-axis line */}
        <line
          x1={chartMargin.left}
          y1={chartMargin.top}
          x2={chartMargin.left}
          y2={chartMargin.top + chartHeight}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
        />
        
        {/* X-axis line */}
        <line
          x1={chartMargin.left}
          y1={chartMargin.top + chartHeight}
          x2={chartMargin.left + chartWidth}
          y2={chartMargin.top + chartHeight}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
        />
        
        {/* X-axis time labels */}
        {timeLabels.map((timeLabel, index) => (
          <g key={`time-${index}`}>
            {/* Tick mark */}
            <line
              x1={timeLabel.x}
              y1={chartMargin.top + chartHeight}
              x2={timeLabel.x}
              y2={chartMargin.top + chartHeight + 5}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />
            {/* Time label */}
            <text
              x={timeLabel.x}
              y={chartMargin.top + chartHeight + 18}
              fill="rgba(255, 255, 255, 0.6)"
              fontSize="10"
              textAnchor="middle"
              fontFamily="system-ui"
            >
              {timeLabel.label}
            </text>
          </g>
        ))}
        
        {/* Performance lines */}
        {!hasNoData && (
          <>
            {/* Baseline AAVE line */}
            <path
              d={baselinePath}
              fill="none"
              stroke="rgba(255, 165, 0, 0.8)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            
            {/* Vault performance line */}
            <path
              d={vaultPath}
              fill="none"
              stroke="rgba(34, 197, 94, 0.9)"
              strokeWidth="2.5"
            />
            
            {/* Legend */}
            <g transform={`translate(${chartMargin.left + 10}, ${chartMargin.top + 10})`}>
              {/* Vault line legend */}
              <line x1="0" y1="0" x2="20" y2="0" stroke="rgba(34, 197, 94, 0.9)" strokeWidth="2.5" />
              <text x="25" y="4" fill="rgba(255, 255, 255, 0.8)" fontSize="11" fontFamily="system-ui">
                Vault Performance ({isUsingRealData ? 'Live' : 'No Data'})
              </text>
              
              {/* Baseline line legend */}
              <line x1="0" y1="16" x2="20" y2="16" stroke="rgba(255, 165, 0, 0.8)" strokeWidth="2" strokeDasharray="5,5" />
              <text x="25" y="20" fill="rgba(255, 255, 255, 0.8)" fontSize="11" fontFamily="system-ui">
                Baseline AAVE APY
              </text>
            </g>
          </>
        )}
        
        {/* Chart title with data source indicator */}
        <text
          x={chartMargin.left + chartWidth / 2}
          y={chartMargin.top - 5}
          fill="rgba(255, 255, 255, 0.8)"
          fontSize="12"
          textAnchor="middle"
          fontFamily="system-ui"
        >
          Vault Share Price vs Baseline AAVE {hasNoData ? '(No Data Yet)' : '(Live Data)'}
        </text>
        
        {/* Y-axis label - moved further left to avoid overlap */}
        {DEBUG_MODE && (
          <rect
            x={chartMargin.left - 68}
            y={chartMargin.top + chartHeight / 2 - 30}
            width={16}
            height={60}
            fill="rgba(255,0,0,0.1)"
            stroke="red"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        )}
        <text
          x={chartMargin.left - 60}
          y={chartMargin.top + chartHeight / 2}
          fill="rgba(255, 255, 255, 0.6)"
          fontSize="10"
          textAnchor="middle"
          fontFamily="system-ui"
          transform={`rotate(-90 ${chartMargin.left - 60} ${chartMargin.top + chartHeight / 2})`}
          stroke={DEBUG_MODE ? "red" : undefined}
          strokeWidth={DEBUG_MODE ? "0.5" : undefined}
        >
          Share Price
        </text>
        
        {/* X-axis label */}
        <text
          x={chartMargin.left + chartWidth / 2}
          y={height - 5}
          fill="rgba(255, 255, 255, 0.6)"
          fontSize="11"
          textAnchor="middle"
          fontFamily="system-ui"
        >
          Time
        </text>
        
        {/* Data source indicator */}
        {hasNoData && (
          <text
            x={chartMargin.left + chartWidth / 2}
            y={chartMargin.top + chartHeight / 2}
            fill="rgba(255, 255, 255, 0.5)"
            fontSize="14"
            textAnchor="middle"
            fontFamily="system-ui"
          >
            No performance data yet - waiting for vault deposits...
          </text>
        )}
      </svg>
    </div>
  );
};

export default PerformanceChart; 