import React, { useState, useEffect } from 'react';
import { Bell, Settings, Moon, Sun, AlertTriangle } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AIAnalysisView } from './components/AIAnalysisView';
import { IncidentsView } from './components/IncidentsView';
import { IncidentQAView } from './components/IncidentQAView';
import { DiagnosticPanel } from './components/DiagnosticPanel';
import { useTheme } from './contexts/ThemeContext';
import { useDiagnosticAgent } from './hooks/useDiagnosticAgent';

function App() {
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'ai-analysis' | 'incidents' | 'incident-qa' | 'diagnostics'>('dashboard');
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  // Diagnostic agent integration
  const {
    diagnosticData,
    isAnalyzing,
    analyzeDashboard,
    analyzeSpecificIssue,
    submitFeedback,
    hasIssues,
    criticalIssues,
    overallHealth
  } = useDiagnosticAgent({ autoAnalyze: true, interval: 60000 });

  // MVP scenario data
  const spikeData = {
    metric: "service.latency.avg",
    service: "auth-service",
    timestamp: "2025-01-27T12:30:00Z",
    value: 420
  };

  const logs = [
    { 
      timestamp: "2025-01-27T12:25:30Z", 
      log_text: "NullPointerException in AuthController at line 45" 
    },
    { 
      timestamp: "2025-01-27T12:26:10Z", 
      log_text: "WARN: DB connection pool timeout exceeded for user login" 
    }
  ];

  const knownIssue = {
    issue_id: "issue_101",
    title: "Null pointer on login",
    resolution: "Initialize session variable in AuthController before accessing user data."
  };

  const codeSnippet = {
    file: "AuthController.java",
    function: "login()",
    snippet: "if (session == null) throw new NullPointerException();"
  };

  // Simulate metric data
  const metricData = [
    { timestamp: "12:00", value: 85 },
    { timestamp: "12:05", value: 92 },
    { timestamp: "12:10", value: 78 },
    { timestamp: "12:15", value: 88 },
    { timestamp: "12:20", value: 95 },
    { timestamp: "12:25", value: 180 },
    { timestamp: "12:30", value: 420 }
  ];

  // Auto-start analysis simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalysisStarted(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleExplainClick = () => {
    setActiveSection('ai-analysis');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Header */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize transition-colors duration-200">
                {activeSection.replace('-', ' ')}
              </h2>
              
              <div className="flex items-center space-x-4">
                {/* Diagnostic Health Indicator */}
                {hasIssues && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      overallHealth === 'critical' ? 'bg-red-500' :
                      overallHealth === 'warning' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {criticalIssues.length > 0 ? `${criticalIssues.length} critical issues` : 'Issues detected'}
                    </span>
                  </div>
                )}
                
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors duration-200"
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button className="relative p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors duration-200">
                  <Bell className="w-5 h-5" />
                  {(hasIssues || criticalIssues.length > 0) && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <button className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors duration-200">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center space-x-2">
                  <img
                    className="w-8 h-8 rounded-full"
                    src="https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop"
                    alt="User avatar"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200">Sarah Chen</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
          {activeSection === 'dashboard' ? (
            <DashboardView 
              spikeData={spikeData} 
              metricData={metricData} 
              onExplainClick={handleExplainClick}
              diagnosticData={diagnosticData}
              onAnalyzeIssue={analyzeSpecificIssue}
            />
          ) : activeSection === 'ai-analysis' ? (
            <AIAnalysisView
              analysisStarted={analysisStarted}
              spikeData={spikeData}
              logs={logs}
              knownIssue={knownIssue}
              codeSnippet={codeSnippet}
            />
          ) : activeSection === 'incident-qa' ? (
            <IncidentQAView />
          ) : activeSection === 'diagnostics' ? (
            <DiagnosticPanel
              issues={diagnosticData?.issues || []}
              isAnalyzing={isAnalyzing}
              onAnalyze={analyzeDashboard}
              onSubmitFeedback={submitFeedback}
            />
          ) : (
            <IncidentsView />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;