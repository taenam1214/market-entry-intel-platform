import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import type { AnalysisData, AnalysisResponse, Competitor, ArbitrageOpportunity, ReportSelectorItem } from '../types/analysis';

interface DataContextType {
  analysisData: AnalysisData;
  refreshAnalysisData: () => void;
  loadSpecificReport: (reportId: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

const defaultAnalysisData: AnalysisData = {
  dashboardData: null,
  competitorSummary: null,
  arbitrageData: null,
  hasAnalysisHistory: false,
  isLoading: true,
  availableReports: [],
  currentReportId: null,
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [analysisData, setAnalysisData] = useState<AnalysisData>(defaultAnalysisData);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadSpecificReport = async (reportId: number) => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return;

    // Abort any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setAnalysisData(prev => ({ ...prev, isLoading: true }));

      const response = await fetch(API_ENDPOINTS.REPORTS.BY_ID(reportId.toString()), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        signal: controller.signal,
      });

      if (response.ok) {
        const report = await response.json();

        setAnalysisData(prev => ({
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
          competitorSummary: report.competitor_analysis as Competitor[],
          arbitrageData: report.segment_arbitrage as ArbitrageOpportunity[],
          currentReportId: report.id,
          isLoading: false,
        }));
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setAnalysisData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadAnalysisData = async () => {
    if (!isAuthenticated || !user) {
      setAnalysisData({ ...defaultAnalysisData, isLoading: false });
      return;
    }

    // Abort any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setAnalysisData(prev => ({ ...prev, isLoading: true }));

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');

      if (!token) {
        // Fall through to localStorage fallback
      } else {
        // Fetch available reports list
        const reportsResponse = await fetch(API_ENDPOINTS.REPORTS.SELECTOR, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          signal: controller.signal,
        });

        let availableReports: ReportSelectorItem[] = [];
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          availableReports = reportsData.reports || [];
        }

        // Fetch latest dashboard data
        const response = await fetch(API_ENDPOINTS.REPORTS.LATEST_DASHBOARD, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();

          if (data.has_data) {
            const latestReportId = availableReports.length > 0 ? availableReports[0].id : null;
            setAnalysisData({
              dashboardData: data.dashboard_data,
              competitorSummary: data.competitor_summary,
              arbitrageData: data.arbitrage_data,
              hasAnalysisHistory: true,
              isLoading: false,
              availableReports,
              currentReportId: latestReportId,
            });
            return;
          }
        }
      }

      // Fallback to localStorage if database fetch fails or no data found
      // All keys are user-scoped to prevent data leaking between accounts
      const analysisHistory = localStorage.getItem(`analysis_${user.id}`);
      const hasHistory = !!analysisHistory;

      let dashboardData: AnalysisResponse | null = null;
      let competitorSummary: Competitor[] | null = null;
      let arbitrageData: ArbitrageOpportunity[] | null = null;

      if (hasHistory) {
        const dashboardDataStr = localStorage.getItem(`dashboardData_${user.id}`);
        if (dashboardDataStr) {
          try {
            dashboardData = JSON.parse(dashboardDataStr);
          } catch {
            // Ignore parse errors
          }
        }

        const competitorDataStr = localStorage.getItem(`competitorSummary_${user.id}`);
        if (competitorDataStr) {
          try {
            competitorSummary = JSON.parse(competitorDataStr);
          } catch {
            // Ignore parse errors
          }
        }

        const arbitrageDataStr = localStorage.getItem(`segmentArbitrage_${user.id}`);
        if (arbitrageDataStr) {
          try {
            arbitrageData = JSON.parse(arbitrageDataStr);
          } catch {
            // Ignore parse errors
          }
        }
      }

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
      if ((error as Error).name === 'AbortError') return;
      setAnalysisData({ ...defaultAnalysisData, isLoading: false });
    }
  };

  const refreshAnalysisData = () => {
    loadAnalysisData();
  };

  // Load data when user changes
  useEffect(() => {
    loadAnalysisData();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [isAuthenticated, user?.id]);

  // Listen for storage changes to refresh data when analysis is completed
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.includes(`dashboardData_${user?.id}`) || e.key.includes(`competitorSummary_${user?.id}`) || e.key.includes(`segmentArbitrage_${user?.id}`) || e.key.includes(`analysis_${user?.id}`))) {
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
