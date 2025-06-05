'use client';

import React from 'react';

interface ChartProps {
  width?: number;
  height?: number;
  dotSize?: number;
  dotSpacing?: number;
}

const Chart = ({ 
  width = 600, 
  height = 200, 
  dotSize = 1.5, 
  dotSpacing = 12 
}: ChartProps) => {
  const generateDots = () => {
    const dots = [];
    const cols = Math.floor(width / dotSpacing);
    const rows = Math.floor(height / dotSpacing);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * dotSpacing;
        const y = height - (row * dotSpacing); // Flip Y to start from bottom
        
        // Create a rising curve pattern from bottom-left to top-right
        const progress = col / cols; // 0 to 1 across width
        const curveHeight = Math.pow(progress, 0.7) * 0.8; // Exponential curve
        const normalizedRow = row / rows; // 0 to 1 from bottom to top
        
        // Determine if this dot should be visible based on the curve
        const shouldShow = normalizedRow <= curveHeight;
        
        // Add some density variation - more dots near the curve line
        const distanceFromCurve = Math.abs(normalizedRow - curveHeight);
        let opacity = 0;
        
        if (shouldShow) {
          // Main curve area - full opacity dots
          if (distanceFromCurve < 0.1) {
            opacity = 0.9;
          } else if (distanceFromCurve < 0.2) {
            opacity = 0.6;
          } else {
            opacity = 0.3;
          }
        } else {
          // Sparse dots above the curve
          if (Math.random() < 0.05) {
            opacity = 0.1;
          }
        }
        
        if (opacity > 0) {
          dots.push(
            <circle
              key={`${row}-${col}`}
              cx={x}
              cy={y}
              r={dotSize}
              fill="white"
              opacity={opacity}
            />
          );
        }
      }
    }
    
    return dots;
  };

  return (
    <div className="w-full h-full">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {generateDots()}
      </svg>
    </div>
  );
};

export default Chart; 