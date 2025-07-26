import React, { useMemo } from 'react';
import { TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';

interface DataPoint {
  timestamp: string;
  value: number;
}

interface MetricChartProps {
  data: DataPoint[];
  threshold: number;
  spikeValue: number;
  title: string;
  onExplainClick?: () => void;
}

export function MetricChart({ data, threshold, spikeValue, title, onExplainClick }: MetricChartProps) {
  // Optimize with useMemo for better performance
  const chartData = useMemo(() => {
    const maxValue = Math.max(...data.map(d => d.value), spikeValue);
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    
    return { maxValue, minValue, range };
  }, [data, spikeValue]);
  
  const { maxValue, minValue, range } = chartData;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onExplainClick}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Explain</span>
          </button>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Last 30 minutes</span>
          </div>
        </div>
      </div>
      
      {/* Simplified chart visualization */}
      <div className="relative h-32 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
        <div className="absolute inset-4">
          {/* Threshold line */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-orange-400"
            style={{ top: `${((maxValue - threshold) / range) * 100}%` }}
          >
            <span className="absolute -top-6 right-0 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
              Threshold: {threshold}ms
            </span>
          </div>
          
          {/* Spike indicator */}
          <div 
            className="absolute w-3 h-3 bg-red-500 rounded-full"
            style={{ 
              top: `${((maxValue - spikeValue) / range) * 100}%`,
              right: '20%'
            }}
          >
            <div className="absolute -top-8 -left-8 flex items-center space-x-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded text-xs whitespace-nowrap">
              <AlertTriangle className="w-3 h-3" />
              <span>{spikeValue}ms spike</span>
            </div>
          </div>
          
          {/* Simple line chart representation */}
          <svg className="w-full h-full">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-500"
              points={data.map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = ((maxValue - point.value) / range) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Current</span>
          <div className="font-semibold text-red-600">{spikeValue}ms</div>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Average</span>
          <div className="font-semibold text-gray-900 dark:text-gray-100">85ms</div>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Threshold</span>
          <div className="font-semibold text-orange-600">{threshold}ms</div>
        </div>
      </div>
    </div>
  );
}