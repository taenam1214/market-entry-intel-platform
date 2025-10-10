import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { API_ENDPOINTS } from '../config/api';

interface AnalysisData {
  dashboardData: any;
  competitorSummary: any;
  arbitrageData: any;
  hasAnalysisHistory: boolean;
  isLoading: boolean;
  availableReports: any[];
  currentReportId: number | null;
}

interface DataContextType {
  analysisData: AnalysisData;
  refreshAnalysisData: () => void;
  loadSpecificReport: (reportId: number) => Promise<void>;
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
    availableReports: [],
    currentReportId: null,
  });

  const loadSpecificReport = async (reportId: number) => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return;

    try {
      setAnalysisData(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(API_ENDPOINTS.REPORTS.BY_ID(reportId.toString()), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        const report = await response.json();
        console.log('✅ Loaded specific report from DATABASE:', {
          id: report.id,
          company: report.company_name,
          hasCompetitors: !!report.competitor_analysis,
          competitorCount: Array.isArray(report.competitor_analysis) ? report.competitor_analysis.length : 0,
          hasArbitrage: !!report.segment_arbitrage,
          arbitrageCount: Array.isArray(report.segment_arbitrage) ? report.segment_arbitrage.length : 0
        });
        
        console.log('📊 Competitor data:', report.competitor_analysis);
        console.log('📊 Arbitrage data:', report.segment_arbitrage);
        
        setAnalysisData(prev => {
          const newData = {
            ...prev,
            dashboardData: {
              company_name: report.company_name,
              industry: report.industry,
              target_market: report.target_market,
              website: report.website,
              customer_segment: report.customer_segment,
              expansion_direction: report.expansion_direction,
              company_size: report.company_size,
              annual_revenue: report.annual_revenue,
              funding_stage: report.funding_stage,
              current_markets: report.current_markets,
              expansion_timeline: report.expansion_timeline,
              budget_range: report.budget_range,
              dashboard: report.dashboard_data,
              detailed_scores: report.detailed_scores,
              research_report: report.research_report,
              key_insights: report.key_insights,
              revenue_projections: report.revenue_projections,
              recommended_actions: report.recommended_actions,
            },
            competitorSummary: report.competitor_analysis,
            arbitrageData: report.segment_arbitrage,
            currentReportId: report.id,
            isLoading: false,
          };
          
          console.log('🔄 Setting new analysis data:', {
            hasCompetitors: !!newData.competitorSummary,
            hasArbitrage: !!newData.arbitrageData,
            currentReportId: report.id
          });
          
          return newData;
        });
      }
    } catch (error) {
      console.error('Error loading specific report:', error);
      setAnalysisData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadAnalysisData = async () => {
    if (!isAuthenticated || !user) {
      setAnalysisData({
        dashboardData: null,
        competitorSummary: null,
        arbitrageData: null,
        hasAnalysisHistory: false,
        isLoading: false,
        availableReports: [],
        currentReportId: null,
      });
      return;
    }

    setAnalysisData(prev => ({ ...prev, isLoading: true }));

    try {
      // First try to fetch from database
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        console.log('No auth token found, skipping database fetch');
        // Fall through to localStorage fallback
      } else {
        // Fetch available reports list
        const reportsResponse = await fetch(API_ENDPOINTS.REPORTS.SELECTOR, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        });

        let availableReports = [];
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          availableReports = reportsData.reports || [];
          console.log(`📋 Found ${availableReports.length} reports in database`);
        }

        // Fetch latest dashboard data
        const response = await fetch(API_ENDPOINTS.REPORTS.LATEST_DASHBOARD, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.has_data) {
            // Data fetched from database
            console.log('✅ Loading data from DATABASE:', {
              company: data.dashboard_data?.company_name,
              hasCompetitors: !!data.competitor_summary,
              hasArbitrage: !!data.arbitrage_data
            });
            // Set currentReportId to the latest report (first in the list)
            const latestReportId = availableReports.length > 0 ? availableReports[0].id : null;
            setAnalysisData({
              dashboardData: data.dashboard_data,
              competitorSummary: data.competitor_summary,
              arbitrageData: data.arbitrage_data,
              hasAnalysisHistory: true,
              isLoading: false,
              availableReports: availableReports,
              currentReportId: latestReportId,
            });
            return;
          }
        } else {
          console.warn('Failed to fetch from database, status:', response.status);
        }
      }

      // Fallback to localStorage if database fetch fails or no data found
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

      console.log('⚠️ Loading data from LOCALSTORAGE (fallback):', {
        hasDashboard: !!dashboardData,
        hasCompetitors: !!competitorSummary,
        hasArbitrage: !!arbitrageData
      });
      
      setAnalysisData({
        dashboardData,
        competitorSummary,
        arbitrageData,
        hasAnalysisHistory: hasHistory,
        isLoading: false,
        availableReports: [],
        currentReportId: null,
      });
    } catch (error) {
      console.error('Error loading analysis data:', error);
      setAnalysisData({
        dashboardData: null,
        competitorSummary: null,
        arbitrageData: null,
        hasAnalysisHistory: false,
        isLoading: false,
        availableReports: [],
        currentReportId: null,
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
    <DataContext.Provider value={{ analysisData, refreshAnalysisData, loadSpecificReport }}>
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
