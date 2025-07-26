import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, Clock, TrendingUp, AlertTriangle, CheckCircle, Zap, Database, Server, Users, Search } from 'lucide-react';

interface QueryResult {
  id: string;
  type: 'incident' | 'slo' | 'metric' | 'insight';
  title: string;
  description: string;
  timestamp?: string;
  confidence: number;
  data?: any;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  results?: QueryResult[];
}

export function IncidentQAView() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant for incident analysis and SLO monitoring. You can ask me questions like:\n\n• "What incidents happened in the last 24 hours?"\n• "Show me SLO compliance for auth-service"\n• "Why did latency spike at 12:30?"\n• "What\'s the MTTR trend this week?"',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sampleQueries = [
    "What incidents happened in the last 24 hours?",
    "Show me SLO compliance for auth-service",
    "Why did latency spike at 12:30?",
    "What's the MTTR trend this week?",
    "Which services have the most incidents?",
    "Show me database connection issues"
  ];

  // Auto-analyze on mount and interval
  useEffect(() => {
    // Listen for SLI breach analysis events
    const handleSLIBreachAnalysis = (event: CustomEvent) => {
      const query = "Analyze the SLI breach and figure out the root cause";
      setQuery(query);
      
      // Auto-submit the query
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: query,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      setTimeout(() => {
        const assistantMessage = generateResponse(query);
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        
        // Navigate to incident-qa view
        window.dispatchEvent(new CustomEvent('navigate-to-incident-qa'));
      }, 1500);
    };

    window.addEventListener('analyze-sli-breach', handleSLIBreachAnalysis as EventListener);
    
    return () => {
      window.removeEventListener('analyze-sli-breach', handleSLIBreachAnalysis as EventListener);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setQuery('');

    // Simulate AI processing
    setTimeout(() => {
      const assistantMessage = generateResponse(query);
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateResponse = (userQuery: string): ChatMessage => {
    const lowerQuery = userQuery.toLowerCase();
    
    if (lowerQuery.includes('sli breach') || lowerQuery.includes('root cause') || 
        lowerQuery.includes('bugrootcauseagent') || lowerQuery.includes('analyze') && lowerQuery.includes('breach')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Based on the analysis from the BugRootCauseAgent, the root cause of the latency spike in the auth-service at 12:30 UTC appears to be:\n\n1. A NullPointerException in the AuthController due to an uninitialized session variable when accessing user data. The suggested resolution is to initialize the session variable before accessing user data, following the steps from issue #101.\n\n2. Timeouts from the database connection pool being exhausted during high volumes of user logins. To address this, the BugRootCauseAgent recommends increasing the size of the database connection pool or optimizing the connection pooling implementation to handle higher loads.\n\n3. Lack of robust error handling and fallback mechanisms when database connections fail, leading to poor user experience during high load scenarios. Implementing better error handling and fallbacks is advised.',
        timestamp: new Date().toISOString(),
        results: [
          {
            id: 'rca-001',
            type: 'insight',
            title: 'NullPointerException in AuthController',
            description: 'Uninitialized session variable causing authentication failures',
            confidence: 95
          },
          {
            id: 'rca-002',
            type: 'insight',
            title: 'Database Connection Pool Exhaustion',
            description: 'High volume of logins overwhelming connection pool capacity',
            confidence: 88
          },
          {
            id: 'rca-003',
            type: 'insight',
            title: 'Insufficient Error Handling',
            description: 'Lack of fallback mechanisms during database connection failures',
            confidence: 82
          }
        ]
      };
    }

    if (lowerQuery.includes('incident') && lowerQuery.includes('24 hours')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I found 5 incidents in the last 24 hours. Here\'s a breakdown:',
        timestamp: new Date().toISOString(),
        results: [
          {
            id: 'INC-2024-001',
            type: 'incident',
            title: 'Snowflake Query Performance Degradation',
            description: 'Critical incident affecting data warehouse performance',
            timestamp: '5 minutes ago',
            confidence: 95
          },
          {
            id: 'INC-2024-002',
            type: 'incident',
            title: 'Authentication Service Latency',
            description: 'High latency in user authentication flows',
            timestamp: '23 minutes ago',
            confidence: 87
          },
          {
            id: 'INC-2024-003',
            type: 'incident',
            title: 'Payment Gateway Timeout',
            description: 'Intermittent timeouts in payment processing',
            timestamp: '2 hours ago',
            confidence: 92
          }
        ]
      };
    }

    if (lowerQuery.includes('slo') && lowerQuery.includes('auth')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Here\'s the SLO compliance status for auth-service:',
        timestamp: new Date().toISOString(),
        results: [
          {
            id: 'slo-auth-1',
            type: 'slo',
            title: 'Authentication Response Time',
            description: 'Target: <200ms, Current: 185ms (92.5% compliance)',
            confidence: 94
          },
          {
            id: 'slo-auth-2',
            type: 'slo',
            title: 'Authentication Success Rate',
            description: 'Target: >99.9%, Current: 99.2% (Below target)',
            confidence: 98
          }
        ]
      };
    }

    if (lowerQuery.includes('latency') && lowerQuery.includes('spike')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I analyzed the latency spike at 12:30. Here\'s what I found:',
        timestamp: new Date().toISOString(),
        results: [
          {
            id: 'analysis-1',
            type: 'insight',
            title: 'Root Cause: Null Pointer Exception',
            description: 'AuthController threw NullPointerException due to uninitialized session variable',
            confidence: 87
          },
          {
            id: 'metric-1',
            type: 'metric',
            title: 'Latency Impact',
            description: 'Peak latency reached 420ms (320% above baseline)',
            confidence: 100
          }
        ]
      };
    }

    if (lowerQuery.includes('mttr') && lowerQuery.includes('trend')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'MTTR trend analysis for this week:',
        timestamp: new Date().toISOString(),
        results: [
          {
            id: 'mttr-1',
            type: 'metric',
            title: 'Average MTTR',
            description: '12 minutes (improved from 17 minutes last week)',
            confidence: 96
          },
          {
            id: 'mttr-2',
            type: 'insight',
            title: 'Improvement Driver',
            description: 'AI-powered root cause analysis reduced investigation time by 40%',
            confidence: 89
          }
        ]
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'I understand you\'re asking about incidents and system performance. Could you be more specific? For example, you can ask about specific time periods, services, or metrics.',
      timestamp: new Date().toISOString()
    };
  };

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'slo':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'metric':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'insight':
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'incident':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'slo':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
      case 'metric':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
      case 'insight':
        return 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Incident Q&A</h1>
        <p className="text-gray-600 dark:text-gray-300">Ask questions about incidents, SLOs, and system performance in natural language</p>
      </div>

      {/* Sample Queries */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Try asking:</h3>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sample, index) => (
            <button
              key={index}
              onClick={() => handleSampleQuery(sample)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'} rounded-lg p-4`}>
                <div className="flex items-start space-x-3">
                  {message.type === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-line">{message.content}</p>
                    
                    {message.results && (
                      <div className="mt-4 space-y-3">
                        {message.results.map((result) => (
                          <div key={result.id} className={`border rounded-lg p-4 ${getResultColor(result.type)}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getResultIcon(result.type)}
                                <h4 className="font-medium text-gray-900 dark:text-white">{result.title}</h4>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                  {result.confidence}% confidence
                                </span>
                                {result.timestamp && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{result.timestamp}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{result.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about incidents, SLOs, metrics, or system performance..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}