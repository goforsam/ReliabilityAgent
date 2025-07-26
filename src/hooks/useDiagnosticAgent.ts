import { useState, useEffect, useCallback } from 'react';
import { diagnosticAgent, DiagnosticResponse, DiagnosticIssue, mockDiagnosticResponse } from '../services/diagnosticAgent';

interface UseDiagnosticAgentOptions {
  autoAnalyze?: boolean;
  interval?: number;
  useMockData?: boolean;
}

export function useDiagnosticAgent(options: UseDiagnosticAgentOptions = {}) {
  const { autoAnalyze = false, interval = 30000, useMockData = true } = options;
  
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDashboard = useCallback(async (context?: {
    timeRange?: string;
    services?: string[];
    includeMetrics?: boolean;
  }) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      let response: DiagnosticResponse;
      
      if (useMockData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        response = mockDiagnosticResponse;
      } else {
        response = await diagnosticAgent.analyzeDashboard(context);
      }
      
      setDiagnosticData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze dashboard';
      setError(errorMessage);
      console.error('Diagnostic analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [useMockData]);

  const analyzeSpecificIssue = useCallback(async (issueData: {
    service: string;
    metric: string;
    value: number;
    timestamp: string;
    logs?: string[];
  }) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      let response: DiagnosticResponse;
      
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Create mock response based on the specific issue
        response = {
          ...mockDiagnosticResponse,
          issues: mockDiagnosticResponse.issues.filter(issue => 
            issue.component.toLowerCase().includes(issueData.service.toLowerCase())
          )
        };
      } else {
        response = await diagnosticAgent.analyzeSpecificIssue(issueData);
      }
      
      setDiagnosticData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze specific issue';
      setError(errorMessage);
      console.error('Specific issue analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [useMockData]);

  const submitFeedback = useCallback(async (issueId: string, feedback: {
    helpful: boolean;
    comment?: string;
    appliedFix?: boolean;
  }) => {
    try {
      if (!useMockData) {
        await diagnosticAgent.submitFeedback(issueId, feedback);
      }
      // Update local state to reflect feedback
      setDiagnosticData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          issues: prev.issues.map(issue => 
            issue.id === issueId 
              ? { ...issue, feedbackSubmitted: true }
              : issue
          )
        };
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  }, [useMockData]);

  // Auto-analyze on mount and interval
  useEffect(() => {
    if (autoAnalyze) {
      analyzeDashboard();
      
      if (interval > 0) {
        const intervalId = setInterval(() => {
          analyzeDashboard();
        }, interval);
        
        return () => clearInterval(intervalId);
      }
    }
  }, [autoAnalyze, interval, analyzeDashboard]);

  return {
    diagnosticData,
    isAnalyzing,
    error,
    analyzeDashboard,
    analyzeSpecificIssue,
    submitFeedback,
    hasIssues: diagnosticData?.issues.length > 0,
    criticalIssues: diagnosticData?.issues.filter(issue => issue.severity === 'critical') || [],
    overallHealth: diagnosticData?.overallHealth || 'healthy'
  };
}