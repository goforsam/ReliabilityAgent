import React from 'react';
import { BarChart3, Brain, ChevronRight, AlertTriangle, MessageCircle, Stethoscope } from 'lucide-react';

interface SidebarProps {
  activeSection: 'dashboard' | 'ai-analysis' | 'incidents' | 'incident-qa' | 'diagnostics';
  onSectionChange: (section: 'dashboard' | 'ai-analysis' | 'incidents' | 'incident-qa' | 'diagnostics') => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const navigationItems = [
    {
      id: 'dashboard' as const,
      name: 'Dashboard',
      icon: BarChart3,
      description: 'Service metrics and status'
    },
    {
      id: 'ai-analysis' as const,
      name: 'AI Analysis',
      icon: Brain,
      description: 'Root cause analysis workflow'
    },
    {
      id: 'incidents' as const,
      name: 'Recent Incidents & AI Insights',
      icon: AlertTriangle,
      description: 'AI-powered incident analysis'
    },
    {
      id: 'incident-qa' as const,
      name: 'Incident Q&A',
      icon: MessageCircle,
      description: 'Natural language query interface'
    },
    {
      id: 'diagnostics' as const,
      name: 'Dashboard Diagnostics',
      icon: Stethoscope,
      description: 'AI-powered performance analysis'
    }
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full transition-colors duration-200">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">AI RCA Assistant</h1>
            <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">v2.1.0</span>
          </div>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}