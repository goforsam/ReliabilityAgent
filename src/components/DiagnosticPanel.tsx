import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Code, ThumbsUp, ThumbsDown, ExternalLink, ChevronDown, ChevronUp, Zap, Bug, Info, AlertCircle } from 'lucide-react';
import { DiagnosticIssue } from '../services/diagnosticAgent';

interface DiagnosticPanelProps {
  issues: DiagnosticIssue[];
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onSubmitFeedback: (issueId: string, feedback: { helpful: boolean; comment?: string; appliedFix?: boolean }) => void;
}

export function DiagnosticPanel({ issues, isAnalyzing, onAnalyze, onSubmitFeedback }: DiagnosticPanelProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [feedbackStates, setFeedbackStates] = useState<Record<string, { submitted: boolean; helpful?: boolean }>>({});

  const getIssueIcon = (type: DiagnosticIssue['type']) => {
    switch (type) {
      case 'performance':
        return <Zap className="w-5 h-5 text-orange-500" />;
      case 'error':
        return <Bug className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: DiagnosticIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleFeedback = (issueId: string, helpful: boolean) => {
    setFeedbackStates(prev => ({
      ...prev,
      [issueId]: { submitted: true, helpful }
    }));
    onSubmitFeedback(issueId, { helpful });
  };

  const toggleExpanded = (issueId: string) => {
    setExpandedIssue(expandedIssue === issueId ? null : issueId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Diagnostic Analysis</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              AI-powered dashboard health monitoring and optimization recommendations
            </p>
          </div>
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Run Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {issues.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Issues Found</h3>
            <p className="text-gray-600 dark:text-gray-300">Your dashboard is running optimally!</p>
          </div>
        ) : (
          issues.map((issue) => (
            <div key={issue.id} className="p-6">
              {/* Issue Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{issue.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {issue.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{issue.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Component: {issue.component}</span>
                      <span>•</span>
                      <span>{new Date(issue.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleExpanded(issue.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {expandedIssue === issue.id ? 
                    <ChevronUp className="w-5 h-5" /> : 
                    <ChevronDown className="w-5 h-5" />
                  }
                </button>
              </div>

              {/* Expanded Content */}
              {expandedIssue === issue.id && (
                <div className="space-y-6">
                  {/* Logs */}
                  {issue.logs.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Related Logs</h4>
                      <div className="space-y-2">
                        {issue.logs.map((log, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                            <code className="text-sm text-gray-800 dark:text-gray-200">{log}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recommendations</h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-blue-800 dark:text-blue-300 mb-3">{issue.recommendation.summary}</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                        {issue.recommendation.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Code Changes */}
                  {issue.recommendation.codeChanges && issue.recommendation.codeChanges.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Suggested Code Changes</h4>
                      {issue.recommendation.codeChanges.map((change, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Code className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{change.file}</span>
                          </div>
                          <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-green-400">
                              <code>{change.changes}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Was this helpful?</span>
                    {feedbackStates[issue.id]?.submitted ? (
                      <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Thank you for your feedback!</span>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFeedback(issue.id, true)}
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>Yes</span>
                        </button>
                        <button
                          onClick={() => handleFeedback(issue.id, false)}
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span>No</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}