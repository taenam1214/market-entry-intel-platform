import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

interface AnalysisData {
  dashboardData: any;
  competitorSummary: any;
  arbitrageData: any;
  hasAnalysisHistory: boolean;
  isLoading: boolean;
}

interface DataContextType {
  analysisData: AnalysisData;
  refreshAnalysisData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    dashboardData: null,
    competitorSummary: null,
    arbitrageData: null,
    hasAnalysisHistory: false,
    isLoading: true,
  });

  const loadAnalysisData = () => {
    if (!isAuthenticated || !user) {
      setAnalysisData({
        dashboardData: null,
        competitorSummary: null,
        arbitrageData: null,
        hasAnalysisHistory: false,
        isLoading: false,
      });
      return;
    }

    setAnalysisData(prev => ({ ...prev, isLoading: true }));

    try {
      // Check for analysis history
      const analysisHistory = localStorage.getItem(`analysis_${user.id}`);
      const hasHistory = !!analysisHistory;

      let dashboardData = null;
      let competitorSummary = null;
      let arbitrageData = null;

      if (hasHistory) {
        // Load dashboard data
        const dashboardDataStr = localStorage.getItem('dashboardData');
        if (dashboardDataStr) {
          try {
            dashboardData = JSON.parse(dashboardDataStr);
          } catch (e) {
            console.error('Failed to parse dashboard data:', e);
          }
        }

        // Load competitor summary
        const competitorDataStr = localStorage.getItem('competitorSummary');
        if (competitorDataStr) {
          try {
            competitorSummary = JSON.parse(competitorDataStr);
          } catch (e) {
            console.error('Failed to parse competitor data:', e);
            competitorSummary = competitorDataStr;
          }
        }

        // Load arbitrage data
        const arbitrageDataStr = localStorage.getItem('segmentArbitrage');
        if (arbitrageDataStr) {
          try {
            arbitrageData = JSON.parse(arbitrageDataStr);
          } catch (e) {
            console.error('Failed to parse arbitrage data:', e);
            arbitrageData = arbitrageDataStr;
          }
        }
      }

      setAnalysisData({
        dashboardData,
        competitorSummary,
        arbitrageData,
        hasAnalysisHistory: hasHistory,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading analysis data:', error);
      setAnalysisData({
        dashboardData: null,
        competitorSummary: null,
        arbitrageData: null,
        hasAnalysisHistory: false,
        isLoading: false,
      });
    }
  };

  const refreshAnalysisData = () => {
    loadAnalysisData();
  };

  // Load data when user changes
  useEffect(() => {
    loadAnalysisData();
  }, [isAuthenticated, user?.id]);

  // Listen for storage changes to refresh data when analysis is completed
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.includes('dashboardData') || e.key.includes('competitorSummary') || e.key.includes('segmentArbitrage') || e.key.includes(`analysis_${user?.id}`))) {
        loadAnalysisData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.id]);

  return (
    <DataContext.Provider value={{ analysisData, refreshAnalysisData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
