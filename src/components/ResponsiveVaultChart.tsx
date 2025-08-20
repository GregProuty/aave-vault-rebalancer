'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { usePerformanceData } from '@/hooks/usePerformanceData';
import { useMockData } from '@/components/ClientProviders';

type XY = { x: number; y: number };

interface ResponsiveVaultChartProps {
  height?: number;
  className?: string;
  // Optional: override labels and ticks
  xLabels?: string[]; // Defaults: ['30D','20D','10D','Today']
  yTicks?: number[];  // Defaults: [1.0, 1.1, 1.2, 1.3]
  showHeader?: boolean;
  showMockToggle?: boolean;
}

// New responsive chart purpose-built to keep bottom (X) and right (Y) scales perfectly centered
// regardless of container size. Uses measured container width and scalable margins.
const ResponsiveVaultChart: React.FC<ResponsiveVaultChartProps> = ({
  height = 360,
  className,
  xLabels = ['30D', '20D', '10D', 'Today'],
  yTicks = [1.0, 1.1, 1.2, 1.3],
  showHeader = true,
  showMockToggle = true,
}) => {
  const { vaultPerformanceData, loading, totalVaultValue, vaultGains, currentApy } = usePerformanceData();

  // Measure container width to be fully responsive
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [localMock, setLocalMock] = useState<boolean>(false);
  const { useMock: globalMock, setUseMock } = useMockData();
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const paddingX = 0; // no horizontal padding inside the SVG container
  const paddingBottom = 24; // match pb-6 so content doesn't get clipped
  const headerHeight = showHeader ? 108 : 0;

  // Margins around the drawing area to place centered axes labels
  // Margins: right/bottom balanced so labels can be centered within gutters
  const margin = useMemo(() => ({ left: 36, right: 56, top: 12, bottom: 56 }), []);

  const innerWidth = Math.max(0, (containerWidth || 0) - paddingX * 2);
  const innerHeight = Math.max(160, height - headerHeight - paddingBottom);

  const chartWidth = Math.max(0, innerWidth - margin.left - margin.right);
  const chartHeight = Math.max(0, innerHeight - margin.top - margin.bottom);

  // Data prep (fallback mock if needed)
  const minValue = yTicks[0];
  const maxValue = yTicks[yTicks.length - 1];

  const { vaultValues, baselineValues } = useMemo(() => {
    const generateMock = () => {
      const days = 30; // 30D..Today -> 31 points

      // Piecewise linear anchors (index, value). Tuned to mimic Figma's turns.
      const yieldrAnchors: Array<[number, number]> = [
        [0, 1.00], [3, 1.04], [6, 1.10], [8, 1.08], [12, 1.15], [15, 1.19],
        [17, 1.18], [19, 1.21], [21, 1.20], [24, 1.24], [26, 1.26], [28, 1.29], [30, 1.30]
      ];

      const aaveAnchors: Array<[number, number]> = [
        [0, 1.00], [4, 1.02], [7, 1.05], [9, 1.04], [13, 1.07], [16, 1.09],
        [18, 1.085], [22, 1.10], [25, 1.105], [27, 1.11], [30, 1.13]
      ];

      const buildSeries = (anchors: Array<[number, number]>) => {
        const out = new Array<number>(days + 1).fill(0);
        for (let s = 0; s < anchors.length - 1; s++) {
          const [i0, v0] = anchors[s];
          const [i1, v1] = anchors[s + 1];
          const span = Math.max(1, i1 - i0);
          for (let i = 0; i < span; i++) {
            const t = i / span;
            // straight segments for angular look
            const val = v0 + (v1 - v0) * t;
            out[i0 + i] = Math.min(maxValue, Math.max(minValue, val));
          }
        }
        const [lastIdx, lastVal] = anchors[anchors.length - 1];
        out[lastIdx] = Math.min(maxValue, Math.max(minValue, lastVal));
        for (let i = 1; i < out.length; i++) {
          if (!out[i]) out[i] = out[i - 1];
        }
        return out;
      };

      const v = buildSeries(yieldrAnchors);
      const b = buildSeries(aaveAnchors);
      return { vaultValues: v, baselineValues: b };
    };

    const effectiveMock = localMock || globalMock;
    if (!effectiveMock && vaultPerformanceData && vaultPerformanceData.length > 0) {
      return {
        vaultValues: vaultPerformanceData.map(p => p.vaultSharePrice),
        baselineValues: vaultPerformanceData.map(p => p.baselineValue),
      };
    }
    return generateMock();
  }, [vaultPerformanceData, minValue, maxValue, localMock, globalMock]);

  const toPoint = (value: number, index: number, total: number): XY => {
    const x = margin.left + (chartWidth * (total === 1 ? 0 : index / (total - 1)));
    const yNorm = (value - minValue) / (maxValue - minValue);
    const y = margin.top + chartHeight - yNorm * chartHeight;
    return { x, y };
  };

  const linePath = (values: number[]) => {
    if (values.length === 0) return '';
    const pts = values.map((v, i) => toPoint(v, i, values.length));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  const vaultPath = linePath(vaultValues);
  const baselinePath = linePath(baselineValues);

  // Evenly spaced X labels at 0%, 33.333%, 66.666%, 100% positions – centered via textAnchor="middle"
  const xLabelPositions = useMemo(() => {
    const fracs = [0, 1 / 3, 2 / 3, 1];
    return fracs.map(f => margin.left + chartWidth * f);
  }, [chartWidth, margin.left]);

  if (loading && containerWidth === 0) {
    return (
      <div ref={containerRef} className={`relative w-full bg-gray1 border border-gray3 rounded-lg ${className || ''}`} style={{ height }} />
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full bg-gray1 border border-gray3 rounded-lg overflow-hidden ${className || ''}`} style={{ height }}>
      {showHeader && (
        <div className="flex justify-between items-start px-6 pt-6 pb-2">
          <div>
            <h2 className="text-primary text-lg font-semibold mb-2 font-display">Vault</h2>
            <div className="flex items-center space-x-2 mb-1">
              <img src="/usdc-icon.svg" alt="USDC" className="w-8 h-8" />
              <div className="flex items-baseline space-x-2">
                <span className="text-primary text-3xl font-semibold font-display">{totalVaultValue ? totalVaultValue.toFixed(2) : '0'}</span>
                <span className={`text-sm ${vaultGains && vaultGains >= 0 ? 'text-successGreen' : 'text-red-400'}`}>{vaultGains ? (vaultGains >= 0 ? '+' : '') + vaultGains.toFixed(2) : '+0'}</span>
              </div>
            </div>
            <span className="text-secondary text-sm">{currentApy ? (currentApy * 100).toFixed(2) + '% APY' : '4.47% APY'}</span>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {/* Legend */}
            <div className="hidden sm:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-white text-sm">Yieldr</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg width="12" height="12" className="flex-shrink-0">
                  <circle cx="6" cy="6" r="5" fill="transparent" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="2,2" />
                </svg>
                <span className="text-white text-sm">Aave</span>
              </div>
            </div>
            {showMockToggle && (
              <div className="mr-[-5px]">
                <button
                  onClick={() => setLocalMock(prev => { const next = !prev; setUseMock(next); return next; })}
                  className={`text-xs border border-gray3 rounded-md px-2 py-1 h-7 self-start ${(localMock || globalMock) ? 'bg-gray3 text-primary' : 'bg-gray2 text-secondary hover:bg-gray1'}`}
                  aria-pressed={localMock || globalMock}
                  title="Toggle mock data"
                >
                  {(localMock || globalMock) ? 'Mock: On' : 'Mock: Off'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="px-0 pb-6">
        <svg
          width="100%"
          height={innerHeight}
          viewBox={`0 0 ${innerWidth} ${innerHeight}`}
          style={{ overflow: 'visible' }}
        >
          {/* Grid + Ticks */}
          {yTicks.map((tick, idx) => {
            const yNorm = (tick - minValue) / (maxValue - minValue);
            const y = Math.round(margin.top + chartHeight - yNorm * chartHeight) + 0.5; // crisp lines
            const isLast = idx === yTicks.length - 1;
            const rightGutterCenterX = margin.left + chartWidth + margin.right / 2;
            return (
              <g key={`y-${tick}`}>
                <line x1={margin.left} y1={y} x2={margin.left + chartWidth} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2,2" />
                {/* Right axis labels - perfectly centered on line using dominant-baseline="middle" */}
                <text
                  x={rightGutterCenterX}
                  y={y}
                  fill="rgba(255,255,255,0.8)"
                  fontSize="12"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="system-ui, -apple-system"
                >
                  {tick.toFixed(1)}
                </text>
                {/* Draw right axis line only once spanning full chart */}
                {isLast && (
                  <line x1={margin.left + chartWidth} y1={margin.top} x2={margin.left + chartWidth} y2={margin.top + chartHeight} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                )}
              </g>
            );
          })}

          {/* Bottom axis line */}
          <line x1={margin.left} y1={Math.round(margin.top + chartHeight) + 0.5} x2={margin.left + chartWidth} y2={Math.round(margin.top + chartHeight) + 0.5} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* Bottom labels - perfectly centered under ticks */}
          {xLabels.map((label, i) => (
            <text
              key={`x-${label}`}
              x={xLabelPositions[i]}
              y={margin.top + chartHeight + margin.bottom / 2}
              fill="rgba(255,255,255,0.8)"
              fontSize="12"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="system-ui, -apple-system"
            >
              {label}
            </text>
          ))}

          {/* Lines */}
          {baselinePath && (
            <path d={baselinePath} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4,4" />
          )}
          {vaultPath && (
            <path d={vaultPath} fill="none" stroke="rgba(34,197,94,1)" strokeWidth="2.5" />
          )}
        </svg>
      </div>
    </div>
  );
};

export default ResponsiveVaultChart;


