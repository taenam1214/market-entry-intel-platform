export interface DashboardData {
  market_opportunity_score: number;
  market_opportunity_change: string;
  competitive_intensity: string;
  competitive_intensity_score: number;
  competitive_intensity_change: string;
  entry_complexity_score: number;
  entry_complexity_change: string;
  revenue_potential: string;
  revenue_potential_change: string;
  market_entry_readiness: number;
  readiness_description: string;
}

export interface Competitor {
  name: string;
  description: string;
  market_share: string;
  years_in_market: string;
  headquarters: string;
}

export interface ArbitrageOpportunity {
  segment_name: string;
  current_gap: string;
  positioning_opportunity: string;
  market_size: string;
  competitive_advantage: string;
  implementation_strategy: string;
}

export interface RevenueProjections {
  year_1: string;
  year_3: string;
  market_share_y1: string;
  market_share_y3: string;
}

export interface KeyInsight {
  type: 'opportunity' | 'risk' | 'strategy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export interface RecommendedActions {
  immediate: string[];
  short_term: string[];
  long_term: string[];
}

export interface DetailedScores {
  market_opportunity_score: number;
  competitive_intensity_score: number;
  entry_complexity_score: number;
  revenue_potential_y1: string;
  revenue_potential_y3: string;
  market_share_target_y1: string;
  market_share_target_y3: string;
  confidence_level: string;
}

export interface ResearchReport {
  title: string;
  content: string;
  sources: string[];
}

export interface AnalysisResponse {
  analysis_id: string;
  status: string;
  timestamp: string;
  company_info: Record<string, string>;
  dashboard: DashboardData;
  detailed_scores: DetailedScores;
  research_report: ResearchReport;
  competitor_analysis: Competitor[];
  segment_arbitrage: ArbitrageOpportunity[];
  key_insights: KeyInsight[];
  revenue_projections: RevenueProjections;
  recommended_actions: RecommendedActions;
  message: string;
}

export interface MarketReport {
  id: number;
  analysis_id: string;
  company_name: string;
  industry: string;
  target_market: string;
  website: string | null;
  customer_segment: string | null;
  expansion_direction: string | null;
  company_size: string | null;
  annual_revenue: string | null;
  funding_stage: string | null;
  current_markets: string | null;
  expansion_timeline: string | null;
  budget_range: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dashboard_data: DashboardData;
  detailed_scores: DetailedScores;
  research_report: ResearchReport;
  competitor_analysis: Competitor[];
  segment_arbitrage: ArbitrageOpportunity[];
  key_insights: KeyInsight[];
  revenue_projections: RevenueProjections;
  recommended_actions: RecommendedActions;
  created_at: string;
}

export interface ReportSelectorItem {
  id: number;
  company_name: string;
  target_market: string;
  industry: string;
  status: string;
  created_at: string;
}

export interface AnalysisData {
  dashboardData: AnalysisResponse | null;
  competitorSummary: Competitor[] | null;
  arbitrageData: ArbitrageOpportunity[] | null;
  hasAnalysisHistory: boolean;
  isLoading: boolean;
  availableReports: ReportSelectorItem[];
  currentReportId: number | null;
}
