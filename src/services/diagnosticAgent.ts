export interface DiagnosticIssue {
  id: string;
  type: 'performance' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  component: string;
  timestamp: string;
  logs: string[];
  recommendation: {
    summary: string;
    steps: string[];
    codeChanges?: {
      file: string;
      changes: string;
    }[];
  };
  confidence: number;
}

export interface DiagnosticResponse {
  issues: DiagnosticIssue[];
  overallHealth: 'healthy' | 'warning' | 'critical';
  analysisTimestamp: string;
}

class DiagnosticAgentService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = '/api/diagnostic', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Diagnostic Agent API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async analyzeDashboard(context?: {
    timeRange?: string;
    services?: string[];
    includeMetrics?: boolean;
  }): Promise<DiagnosticResponse> {
    return this.makeRequest<DiagnosticResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify({
        type: 'dashboard_analysis',
        context: {
          timeRange: context?.timeRange || '1h',
          services: context?.services || [],
          includeMetrics: context?.includeMetrics ?? true,
          timestamp: new Date().toISOString(),
        }
      })
    });
  }

  async analyzeSpecificIssue(issueData: {
    service: string;
    metric: string;
    value: number;
    timestamp: string;
    logs?: string[];
  }): Promise<DiagnosticResponse> {
    return this.makeRequest<DiagnosticResponse>('/analyze/issue', {
      method: 'POST',
      body: JSON.stringify({
        type: 'specific_issue',
        data: issueData
      })
    });
  }

  async getRecommendations(issueId: string): Promise<DiagnosticIssue['recommendation']> {
    return this.makeRequest<DiagnosticIssue['recommendation']>(`/recommendations/${issueId}`);
  }

  async submitFeedback(issueId: string, feedback: {
    helpful: boolean;
    comment?: string;
    appliedFix?: boolean;
  }): Promise<void> {
    await this.makeRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        issueId,
        feedback,
        timestamp: new Date().toISOString()
      })
    });
  }
}

// Create singleton instance
export const diagnosticAgent = new DiagnosticAgentService(
  import.meta.env.VITE_REACT_APP_DIAGNOSTIC_API_URL || '/api/diagnostic',
  import.meta.env.VITE_REACT_APP_DIAGNOSTIC_API_KEY
);

// Mock data for development/demo purposes
export const mockDiagnosticResponse: DiagnosticResponse = {
  issues: [
    {
      id: 'diag-001',
      type: 'performance',
      title: 'Slow Dashboard Loading',
      description: 'Dashboard components are taking 3.2s to load, 200% above baseline',
      severity: 'high',
      component: 'MetricChart',
      timestamp: new Date().toISOString(),
      logs: [
        'WARN: React component MetricChart render time: 1200ms',
        'INFO: Large dataset detected: 10,000+ data points',
        'WARN: No virtualization detected for large list rendering'
      ],
      recommendation: {
        summary: 'Implement data virtualization and optimize chart rendering',
        steps: [
          'Add React.memo() to MetricChart component',
          'Implement data pagination or virtualization',
          'Use useMemo() for expensive calculations',
          'Consider lazy loading for non-critical charts'
        ],
        codeChanges: [
          {
            file: 'src/components/MetricChart.tsx',
            changes: `// Add React.memo for performance
export const MetricChart = React.memo(({ data, threshold, spikeValue, title, onExplainClick }: MetricChartProps) => {
  // Use useMemo for expensive calculations
  const chartData = useMemo(() => {
    return data.slice(-50); // Limit to last 50 points
  }, [data]);
  
  // Rest of component...
});`
          }
        ]
      },
      confidence: 92
    },
    {
      id: 'diag-002',
      type: 'error',
      title: 'Memory Leak in Timeline Component',
      description: 'Timeline component not cleaning up event listeners',
      severity: 'medium',
      component: 'Timeline',
      timestamp: new Date().toISOString(),
      logs: [
        'ERROR: EventListener not removed on component unmount',
        'WARN: Memory usage increasing over time in Timeline',
        'INFO: 15+ event listeners detected'
      ],
      recommendation: {
        summary: 'Add proper cleanup in useEffect hooks',
        steps: [
          'Add cleanup function to useEffect',
          'Remove event listeners on unmount',
          'Use AbortController for fetch requests'
        ],
        codeChanges: [
          {
            file: 'src/components/Timeline.tsx',
            changes: `useEffect(() => {
  const handleResize = () => { /* handler */ };
  window.addEventListener('resize', handleResize);
  
  // Cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);`
          }
        ]
      },
      confidence: 87
    }
  ],
  overallHealth: 'warning',
  analysisTimestamp: new Date().toISOString()
};