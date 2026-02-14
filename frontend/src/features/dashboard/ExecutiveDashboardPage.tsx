import { Box, Container, Card, CardBody, Heading, Text, VStack, HStack, Stat, StatNumber, Badge, Progress, Icon, Flex, SimpleGrid, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, IconButton, Select, Spinner, useToast, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { FiTrendingUp, FiTarget, FiDollarSign, FiUsers, FiBarChart, FiInfo, FiDownload, FiArrowRight, FiShare2, FiCopy, FiLink } from 'react-icons/fi';
import { useState, useCallback } from 'react';
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import type { Competitor, KeyInsight, RevenueProjections, RecommendedActions } from '../../types/analysis';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricItem {
  label: string;
  value: string;
  change: string;
  trend: string;
  color: string;
  icon: React.ElementType;
  explanation: string | undefined;
}

interface WTPData {
  annualContract: string;
  avgContract: string;
  marketSize: string;
  growthRate: string;
  priceSensitivity: string;
  valueDrivers: string[];
  competitiveAdvantage: string;
}

interface SensitivityVariable {
  variable: string;
  base_impact: string;
  optimistic_impact: string;
  pessimistic_impact: string;
  sensitivity_score: number;
}

interface ScenarioData {
  probability: string;
  year_1_revenue: string;
  year_3_revenue: string;
  year_5_revenue: string;
  key_assumptions: string;
}

interface FinancialModelData {
  sensitivity_analysis: {
    variables: SensitivityVariable[];
    key_findings: string;
  };
  scenario_projections: {
    conservative: ScenarioData;
    base: ScenarioData;
    optimistic: ScenarioData;
  };
}

/**
 * Parse revenue strings like "$1.2M", "$800K", "$25M" to numeric values (in millions).
 */
const parseRevenueString = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.KMBkmb]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  const upper = value.toUpperCase();
  if (upper.includes('B')) return num * 1000;
  if (upper.includes('M')) return num;
  if (upper.includes('K')) return num / 1000;
  return num / 1_000_000; // assume raw dollar amount
};

const ExecutiveDashboardPage = () => {
  const { analysisData, loadSpecificReport } = useData();
  const navigate = useNavigate();
  const [showFullReport, setShowFullReport] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const dashboard = analysisData.dashboardData;
  const competitorSummary = analysisData.competitorSummary;
  const hasAnalysisHistory = analysisData.hasAnalysisHistory;
  const isLoading = analysisData.isLoading;
  const availableReports = analysisData.availableReports || [];
  const currentReportId = analysisData.currentReportId;

  const handleReportChange = async (reportId: string) => {
    if (reportId) {
      await loadSpecificReport(parseInt(reportId));
    }
  };

  const handleMetricClick = (metric: MetricItem) => {
    setSelectedMetric(metric);
    onOpen();
  };

  // ---------------------------------------------------------------------------
  // Financial Model State & Fetch
  // ---------------------------------------------------------------------------
  const [financialModel, setFinancialModel] = useState<FinancialModelData | null>(null);
  const [financialModelLoading, setFinancialModelLoading] = useState(false);
  const [financialModelError, setFinancialModelError] = useState<string | null>(null);

  const fetchFinancialModel = useCallback(async () => {
    if (!currentReportId) return;
    setFinancialModelLoading(true);
    setFinancialModelError(null);
    try {
      const response = await fetch(
        API_ENDPOINTS.ADVANCED.FINANCIAL_MODEL(currentReportId),
        { method: 'GET', headers: getAuthHeaders() }
      );
      if (!response.ok) {
        throw new Error(`Failed to load financial model (${response.status})`);
      }
      const data: FinancialModelData = await response.json();
      setFinancialModel(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setFinancialModelError(message);
    } finally {
      setFinancialModelLoading(false);
    }
  }, [currentReportId]);

  // ---------------------------------------------------------------------------
  // Share Report State & Handlers
  // ---------------------------------------------------------------------------
  const shareToast = useToast();
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleShareReport = async () => {
    if (!currentReportId) return;
    setShareLoading(true);
    try {
      const response = await fetch(
        API_ENDPOINTS.SHARING.SHARE_REPORT(currentReportId),
        { method: 'POST', headers: getAuthHeaders() }
      );
      if (!response.ok) throw new Error('Failed to share report');
      const data = await response.json();
      const token = data.share_token || data.token;
      const link = `${window.location.origin}/shared/${token}`;
      setShareLink(link);
      setIsShared(true);
      onShareOpen();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to share report';
      shareToast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setShareLoading(false);
    }
  };

  const handleUnshareReport = async () => {
    if (!currentReportId) return;
    setShareLoading(true);
    try {
      const response = await fetch(
        API_ENDPOINTS.SHARING.UNSHARE_REPORT(currentReportId),
        { method: 'POST', headers: getAuthHeaders() }
      );
      if (!response.ok) throw new Error('Failed to unshare report');
      setShareLink(null);
      setIsShared(false);
      onShareClose();
      shareToast({ title: 'Report Unshared', description: 'The public share link has been revoked.', status: 'success', duration: 3000, isClosable: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to unshare report';
      shareToast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      shareToast({ title: 'Copied', description: 'Share link copied to clipboard.', status: 'success', duration: 2000, isClosable: true });
    }
  };

  // ---------------------------------------------------------------------------
  // C-Level Deliverables Functions
  // ---------------------------------------------------------------------------

  const generateExecutiveSummary = () => {
    const companyName = dashboard?.company_name || 'Your Company';
    const segment = dashboard?.customer_segment || 'business';
    const direction = dashboard?.expansion_direction || 'global';
    const targetMarket = dashboard?.target_market || 'target market';
    const industry = dashboard?.industry || 'Technology';
    const currentMarkets = dashboard?.current_markets || 'Current markets';
    const companySize = dashboard?.company_size || 'Medium';
    const annualRevenue = dashboard?.annual_revenue || 'TBD';
    const fundingStage = dashboard?.funding_stage || 'Growth stage';
    const expansionTimeline = dashboard?.expansion_timeline || 'Medium-term';
    const budgetRange = dashboard?.budget_range || 'TBD';

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const executiveSummary = `
EXECUTIVE SUMMARY
${companyName} - Market Entry Analysis
Prepared: ${currentDate}
Confidential and Proprietary

═══════════════════════════════════════════════════════════════════════════════

EXECUTIVE OVERVIEW

${companyName} presents a compelling opportunity for strategic market expansion into ${targetMarket}, representing a significant growth opportunity in the ${industry} sector. This analysis evaluates the feasibility, risks, and strategic implications of ${direction === 'us-to-asia' ? 'US to Asia' : direction === 'asia-to-us' ? 'Asia to US' : 'multi-market'} expansion for our ${segment} business segment.

COMPANY PROFILE
• Company: ${companyName}
• Industry: ${industry}
• Current Markets: ${currentMarkets}
• Company Size: ${companySize} (${annualRevenue} annual revenue)
• Funding Stage: ${fundingStage}
• Expansion Timeline: ${expansionTimeline}
• Budget Allocation: ${budgetRange}

STRATEGIC CONTEXT

Our analysis indicates that ${targetMarket} represents a high-potential market for ${companyName}'s ${segment} solutions. The market demonstrates strong growth characteristics with favorable competitive dynamics and manageable entry barriers. This expansion aligns with our strategic objectives of international growth and market diversification.

KEY PERFORMANCE INDICATORS

Market Opportunity Assessment:
• Market Opportunity Score: ${dashboard?.dashboard?.market_opportunity_score || 'N/A'}/10
• Competitive Intensity: ${dashboard?.dashboard?.competitive_intensity || 'N/A'}
• Entry Complexity Score: ${dashboard?.dashboard?.entry_complexity_score || 'N/A'}/10
• Revenue Potential: ${dashboard?.dashboard?.revenue_potential || 'N/A'}

Financial Projections:
• Year 1 Revenue Target: ${dashboard?.revenue_projections?.year_1 || 'TBD'}
• Year 3 Revenue Target: ${dashboard?.revenue_projections?.year_3 || 'TBD'}
• Market Share Target (Y1): ${dashboard?.revenue_projections?.market_share_y1 || 'TBD'}
• Market Share Target (Y3): ${dashboard?.revenue_projections?.market_share_y3 || 'TBD'}

COMPETITIVE LANDSCAPE

The competitive analysis reveals ${dashboard?.dashboard?.competitive_intensity || 'moderate'} competitive intensity in the ${targetMarket} market. Key competitive factors include:
• Market saturation levels
• Pricing dynamics
• Regulatory requirements
• Local partnership opportunities
• Brand recognition challenges

RISK ASSESSMENT

Primary Risk Factors:
${dashboard?.key_insights?.filter((i: KeyInsight) => i.type === 'risk').map((i: KeyInsight, index: number) => `${index + 1}. ${i.title}: ${i.description}`).join('\n') || '1. Market entry complexity\n2. Regulatory compliance requirements\n3. Competitive positioning challenges\n4. Cultural and operational adaptation'}

STRATEGIC RECOMMENDATIONS

Immediate Actions (0-3 months):
${dashboard?.recommended_actions?.immediate || '• Conduct detailed market research and validation\n• Establish local legal and regulatory framework\n• Identify and engage potential local partners\n• Develop market entry strategy and timeline'}

Short-term Objectives (3-12 months):
${dashboard?.recommended_actions?.short_term || '• Launch pilot program in target market\n• Establish local operations and team\n• Develop go-to-market strategy\n• Initiate customer acquisition activities'}

Long-term Strategic Goals (1-3 years):
${dashboard?.recommended_actions?.long_term || '• Achieve market leadership position\n• Expand product portfolio for local market\n• Build sustainable competitive advantages\n• Scale operations and revenue growth'}

FINANCIAL IMPLICATIONS

Investment Requirements:
• Initial Market Entry Investment: ${budgetRange}
• Expected Break-even Timeline: 12-18 months
• ROI Projection: 3-5x within 3 years
• Risk-adjusted Return: Moderate to High

Resource Allocation:
• Human Resources: Local team establishment
• Technology: Market-specific product adaptation
• Marketing: Brand building and customer acquisition
• Operations: Supply chain and logistics setup

CONCLUSION

Based on comprehensive market analysis, ${companyName} is well-positioned for successful expansion into ${targetMarket}. The market opportunity presents strong growth potential with manageable risks and clear strategic value. We recommend proceeding with the market entry initiative, implementing the recommended phased approach to optimize success probability and minimize risk exposure.

The expansion aligns with our strategic objectives and provides a foundation for long-term international growth. With proper execution of the recommended strategies, this initiative is expected to contribute significantly to our revenue growth and market position.

NEXT STEPS

1. Board approval for market entry initiative
2. Resource allocation and team assignment
3. Detailed implementation planning
4. Local market validation and partnership development
5. Pilot program launch and monitoring

This analysis provides the foundation for informed decision-making and successful market entry execution.

═══════════════════════════════════════════════════════════════════════════════

Prepared by: KairosAI Market Entry Intelligence Platform
Analysis Date: ${currentDate}
Document Classification: Confidential - Executive Use Only
Review Cycle: Quarterly updates recommended

For questions or additional analysis, contact the Strategic Planning team.
    `.trim();

    const blob = new Blob([executiveSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName}-executive-summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateGoNoGoRecommendation = () => {
    const companyName = dashboard?.company_name || 'Your Company';
    const targetMarket = dashboard?.target_market || 'target market';
    const industry = dashboard?.industry || 'Technology';
    const marketScore = parseInt(dashboard?.dashboard?.market_opportunity_score) || 0;
    const complexityScore = parseInt(dashboard?.dashboard?.entry_complexity_score) || 0;
    const competitiveIntensity = dashboard?.dashboard?.competitive_intensity || 'Moderate';
    const revenuePotential = dashboard?.dashboard?.revenue_potential || 'TBD';
    const budgetRange = dashboard?.budget_range || 'TBD';
    const expansionTimeline = dashboard?.expansion_timeline || 'Medium-term';

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let recommendation = 'NO-GO';
    let confidence = 'Low';
    let rationale = 'Insufficient data for recommendation';
    let riskLevel = 'High';
    let priority = 'Low';

    if (marketScore >= 7 && complexityScore <= 6) {
      recommendation = 'GO';
      confidence = 'High';
      rationale = 'Strong market opportunity with manageable entry complexity';
      riskLevel = 'Low';
      priority = 'High';
    } else if (marketScore >= 5 && complexityScore <= 7) {
      recommendation = 'GO';
      confidence = 'Medium';
      rationale = 'Moderate opportunity with acceptable complexity';
      riskLevel = 'Medium';
      priority = 'Medium';
    } else if (marketScore >= 4) {
      recommendation = 'CONDITIONAL GO';
      confidence = 'Medium';
      rationale = 'Proceed with caution and additional preparation';
      riskLevel = 'Medium-High';
      priority = 'Medium';
    } else {
      recommendation = 'NO-GO';
      confidence = 'High';
      rationale = 'Low market opportunity or high complexity';
      riskLevel = 'High';
      priority = 'Low';
    }

    const goNoGoDoc = `
GO/NO-GO DECISION FRAMEWORK
${companyName} - Market Entry Analysis
${targetMarket} Market Expansion
Prepared: ${currentDate}
Confidential and Proprietary

═══════════════════════════════════════════════════════════════════════════════

EXECUTIVE DECISION SUMMARY

DECISION: ${recommendation}
CONFIDENCE LEVEL: ${confidence}
RISK LEVEL: ${riskLevel}
PRIORITY: ${priority}

This document provides a comprehensive analysis and recommendation for ${companyName}'s proposed expansion into the ${targetMarket} market within the ${industry} sector.

STRATEGIC CONTEXT

Company: ${companyName}
Target Market: ${targetMarket}
Industry Sector: ${industry}
Analysis Date: ${currentDate}
Decision Framework: KairosAI Market Entry Intelligence Platform

MARKET OPPORTUNITY ASSESSMENT

Quantitative Analysis:
• Market Opportunity Score: ${marketScore}/10
• Entry Complexity Score: ${complexityScore}/10
• Competitive Intensity: ${competitiveIntensity}
• Revenue Potential: ${revenuePotential}

Qualitative Factors:
• Market maturity and growth potential
• Regulatory environment complexity
• Competitive landscape dynamics
• Cultural and operational considerations
• Technology and infrastructure requirements

DECISION RATIONALE

${rationale}

The decision is based on comprehensive analysis of market opportunity, entry complexity, competitive dynamics, and strategic alignment with company objectives. The ${confidence.toLowerCase()} confidence level reflects the quality and completeness of available data and market intelligence.

RISK ASSESSMENT

Primary Risk Factors:
${dashboard?.key_insights?.filter((i: KeyInsight) => i.type === 'risk').map((i: KeyInsight, index: number) => `${index + 1}. ${i.title}: ${i.description}`).join('\n') || '1. Market entry complexity and regulatory requirements\n2. Competitive positioning and market saturation\n3. Cultural and operational adaptation challenges\n4. Financial investment and ROI uncertainty'}

Risk Mitigation Strategies:
${'• Establish local partnerships and advisory relationships\n• Implement phased market entry approach\n• Develop comprehensive risk management framework\n• Maintain flexible resource allocation strategy'}

FINANCIAL IMPLICATIONS

Investment Requirements:
• Budget Range: ${budgetRange}
• Timeline: ${expansionTimeline}
• Expected ROI: ${marketScore >= 7 ? '3-5x within 3 years' : marketScore >= 5 ? '2-3x within 3 years' : '1-2x within 3 years'}
• Break-even Period: ${marketScore >= 7 ? '12-18 months' : marketScore >= 5 ? '18-24 months' : '24+ months'}

Resource Allocation:
• Human Resources: ${marketScore >= 7 ? 'Full local team establishment' : marketScore >= 5 ? 'Hybrid local-remote team' : 'Minimal local presence'}
• Technology: ${marketScore >= 7 ? 'Full product localization' : marketScore >= 5 ? 'Selective feature adaptation' : 'Basic market entry'}
• Marketing: ${marketScore >= 7 ? 'Comprehensive brand building' : marketScore >= 5 ? 'Targeted customer acquisition' : 'Minimal marketing investment'}

STRATEGIC RECOMMENDATIONS

${recommendation === 'GO' ?
  `IMMEDIATE ACTIONS (0-3 months):
1. Proceed with market entry planning and resource allocation
2. Establish local legal and regulatory framework
3. Identify and engage key local partners and advisors
4. Develop comprehensive go-to-market strategy
5. Initiate pilot program planning and execution

SHORT-TERM OBJECTIVES (3-12 months):
1. Launch pilot program in target market
2. Establish local operations and team structure
3. Develop market-specific product adaptations
4. Initiate customer acquisition and relationship building
5. Monitor performance and adjust strategy as needed

LONG-TERM GOALS (1-3 years):
1. Achieve sustainable market position and revenue growth
2. Expand product portfolio for local market needs
3. Build competitive advantages and market leadership
4. Scale operations and team for continued growth
5. Evaluate additional market expansion opportunities` :
  recommendation === 'CONDITIONAL GO' ?
  `IMMEDIATE ACTIONS (0-3 months):
1. Conduct additional market research and validation
2. Develop comprehensive risk mitigation strategies
3. Consider pilot program approach with limited investment
4. Establish local advisory relationships
5. Prepare detailed contingency planning

SHORT-TERM OBJECTIVES (3-12 months):
1. Launch limited pilot program with defined success metrics
2. Monitor market conditions and competitive dynamics
3. Evaluate pilot results and adjust strategy accordingly
4. Maintain flexible resource allocation
5. Prepare for potential full market entry decision

LONG-TERM GOALS (1-3 years):
1. Based on pilot results, decide on full market entry
2. If successful, scale operations and investment
3. If unsuccessful, pivot strategy or exit market
4. Apply learnings to other market opportunities
5. Maintain strategic flexibility for future opportunities` :
  `IMMEDIATE ACTIONS (0-3 months):
1. Reconsider market selection and evaluate alternatives
2. Focus resources on higher-potential opportunities
3. Conduct additional market research for other markets
4. Reassess strategic priorities and resource allocation
5. Document learnings for future market entry decisions

SHORT-TERM OBJECTIVES (3-12 months):
1. Identify and evaluate alternative market opportunities
2. Focus on strengthening current market position
3. Develop improved market entry frameworks and processes
4. Build internal capabilities for future expansion
5. Monitor target market for potential future opportunities

LONG-TERM GOALS (1-3 years):
1. Reassess target market conditions and opportunities
2. Consider market entry when conditions improve
3. Focus on core market growth and profitability
4. Develop strategic partnerships for future expansion
5. Maintain market intelligence and monitoring capabilities`}

SUCCESS METRICS AND MONITORING

Key Performance Indicators:
• Revenue growth and market share achievement
• Customer acquisition and retention rates
• Operational efficiency and cost management
• Competitive positioning and market recognition
• ROI and profitability targets

Monitoring Framework:
• Monthly performance reviews and adjustments
• Quarterly strategic assessments and planning
• Annual comprehensive market analysis updates
• Continuous competitive intelligence gathering
• Regular stakeholder communication and reporting

CONCLUSION

Based on comprehensive analysis using the KairosAI Market Entry Intelligence Platform, the recommendation for ${companyName}'s expansion into ${targetMarket} is ${recommendation} with ${confidence.toLowerCase()} confidence.

${recommendation === 'GO' ?
  'This market opportunity presents strong potential for growth and strategic value. With proper execution of the recommended strategies, this expansion is expected to contribute significantly to company growth and market position.' :
  recommendation === 'CONDITIONAL GO' ?
  'This market opportunity requires careful consideration and phased approach. The conditional recommendation allows for risk mitigation while maintaining strategic flexibility for future opportunities.' :
  'This market opportunity does not currently align with optimal strategic priorities. Resources should be focused on higher-potential opportunities while maintaining market intelligence for future consideration.'}

The decision framework provides a solid foundation for informed strategic planning and successful market entry execution.

═══════════════════════════════════════════════════════════════════════════════

Prepared by: KairosAI Market Entry Intelligence Platform
Analysis Date: ${currentDate}
Document Classification: Confidential - Executive Use Only
Review Cycle: Quarterly updates recommended

For questions or additional analysis, contact the Strategic Planning team.
    `.trim();

    const blob = new Blob([goNoGoDoc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName}-go-no-go-recommendation.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateInvestmentMemo = () => {
    const companyName = dashboard?.company_name || 'Your Company';
    const segment = dashboard?.customer_segment || 'business';
    const targetMarket = dashboard?.target_market || 'target market';
    const industry = dashboard?.industry || 'Technology';
    const revenue = dashboard?.revenue_projections || {} as RevenueProjections;
    const marketScore = parseInt(dashboard?.dashboard?.market_opportunity_score) || 0;
    const complexityScore = parseInt(dashboard?.dashboard?.entry_complexity_score) || 0;
    const budgetRange = dashboard?.budget_range || 'TBD';
    const expansionTimeline = dashboard?.expansion_timeline || 'Medium-term';
    const companySize = dashboard?.company_size || 'Medium';
    const annualRevenue = dashboard?.annual_revenue || 'TBD';
    const fundingStage = dashboard?.funding_stage || 'Growth stage';
    const direction = dashboard?.expansion_direction || 'global';

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const investmentMemo = `
INVESTMENT MEMORANDUM
${companyName} - Market Entry Opportunity
${targetMarket} Market Expansion
Prepared: ${currentDate}
Confidential and Proprietary

═══════════════════════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY

This investment memorandum presents a comprehensive analysis of ${companyName}'s proposed expansion into the ${targetMarket} market within the ${industry} sector. The analysis evaluates market opportunity, competitive dynamics, financial projections, and strategic implications to support informed investment decision-making.

INVESTMENT THESIS

${companyName} presents a compelling opportunity for strategic market expansion into ${targetMarket}, representing a significant growth opportunity in the ${segment} business segment. The market demonstrates strong growth characteristics with favorable competitive dynamics and manageable entry barriers, aligning with our strategic objectives of international growth and market diversification.

COMPANY PROFILE

Company Overview:
• Company: ${companyName}
• Industry: ${industry}
• Business Segment: ${segment}
• Company Size: ${companySize} (${annualRevenue} annual revenue)
• Funding Stage: ${fundingStage}
• Current Markets: ${dashboard?.current_markets || 'Current markets'}

Strategic Position:
• Market Position: ${marketScore >= 7 ? 'Strong competitive position' : marketScore >= 5 ? 'Moderate competitive position' : 'Developing competitive position'}
• Growth Stage: ${fundingStage}
• International Experience: ${dashboard?.current_markets ? 'Existing international presence' : 'Domestic market focus'}
• Technology Capabilities: ${segment === 'saas-tech' ? 'Advanced technology platform' : 'Industry-specific solutions'}

MARKET ANALYSIS

Target Market Overview:
• Market: ${targetMarket}
• Industry Sector: ${industry}
• Market Opportunity Score: ${marketScore}/10
• Entry Complexity Score: ${complexityScore}/10
• Competitive Intensity: ${dashboard?.dashboard?.competitive_intensity || 'Moderate'}

Market Characteristics:
• Market Size: ${marketScore >= 7 ? 'Large and growing' : marketScore >= 5 ? 'Moderate size with growth potential' : 'Smaller market with limited growth'}
• Growth Rate: ${marketScore >= 7 ? 'High growth (15%+ annually)' : marketScore >= 5 ? 'Moderate growth (8-15% annually)' : 'Slow growth (<8% annually)'}
• Market Maturity: ${complexityScore <= 6 ? 'Emerging with opportunities' : complexityScore <= 7 ? 'Developing market' : 'Mature market with barriers'}
• Regulatory Environment: ${complexityScore <= 6 ? 'Favorable regulatory climate' : complexityScore <= 7 ? 'Moderate regulatory requirements' : 'Complex regulatory environment'}

Competitive Landscape:
• Competitive Intensity: ${dashboard?.dashboard?.competitive_intensity || 'Moderate'}
• Market Saturation: ${marketScore >= 7 ? 'Low saturation with opportunities' : marketScore >= 5 ? 'Moderate saturation' : 'High saturation with limited opportunities'}
• Key Competitors: Established local and international players
• Competitive Advantages: Technology innovation and market expertise

FINANCIAL PROJECTIONS

Revenue Projections:
• Year 1 Revenue Target: ${revenue.year_1 || 'TBD'}
• Year 3 Revenue Target: ${revenue.year_3 || 'TBD'}
• Market Share Target (Y1): ${revenue.market_share_y1 || 'TBD'}
• Market Share Target (Y3): ${revenue.market_share_y3 || 'TBD'}

Financial Performance Metrics:
• Expected CAGR: ${marketScore >= 7 ? '25-40%' : marketScore >= 5 ? '15-25%' : '5-15%'}
• Gross Margin: ${segment === 'saas-tech' ? '70-85%' : segment === 'healthcare' ? '60-75%' : '50-70%'}
• Operating Margin: ${marketScore >= 7 ? '20-30%' : marketScore >= 5 ? '15-25%' : '10-20%'}
• Break-even Timeline: ${marketScore >= 7 ? '12-18 months' : marketScore >= 5 ? '18-24 months' : '24+ months'}

Investment Requirements:
• Initial Investment: ${budgetRange}
• Timeline: ${expansionTimeline}
• Expected ROI: ${marketScore >= 7 ? '3-5x within 3 years' : marketScore >= 5 ? '2-3x within 3 years' : '1-2x within 3 years'}
• Payback Period: ${marketScore >= 7 ? '2-3 years' : marketScore >= 5 ? '3-4 years' : '4+ years'}

RISK ASSESSMENT

Primary Risk Factors:
${dashboard?.key_insights?.filter((i: KeyInsight) => i.type === 'risk').map((i: KeyInsight, index: number) => `${index + 1}. ${i.title}: ${i.description}`).join('\n') || '1. Market entry complexity and regulatory requirements\n2. Competitive positioning and market saturation\n3. Cultural and operational adaptation challenges\n4. Financial investment and ROI uncertainty\n5. Technology and infrastructure requirements'}

Risk Mitigation Strategies:
${'• Establish local partnerships and advisory relationships\n• Implement phased market entry approach\n• Develop comprehensive risk management framework\n• Maintain flexible resource allocation strategy\n• Invest in cultural and operational training'}

Risk-Reward Analysis:
• Risk Level: ${marketScore >= 7 && complexityScore <= 6 ? 'Low' : marketScore >= 5 && complexityScore <= 7 ? 'Medium' : 'High'}
• Reward Potential: ${marketScore >= 7 ? 'High' : marketScore >= 5 ? 'Medium' : 'Low'}
• Risk-Adjusted Return: ${marketScore >= 7 && complexityScore <= 6 ? 'High' : marketScore >= 5 && complexityScore <= 7 ? 'Medium' : 'Low'}

STRATEGIC IMPLICATIONS

Strategic Alignment:
• International Growth: ${direction === 'us-to-asia' || direction === 'asia-to-us' || direction === 'both' ? 'Aligns with international expansion strategy' : 'Supports domestic market diversification'}
• Market Diversification: ${targetMarket !== 'Current markets' ? 'Provides geographic diversification' : 'Supports market segment diversification'}
• Technology Development: ${segment === 'saas-tech' ? 'Enables technology platform expansion' : 'Supports industry-specific solution development'}

Competitive Advantages:
• Technology Innovation: ${segment === 'saas-tech' ? 'Advanced technology platform and capabilities' : 'Industry-specific expertise and solutions'}
• Market Knowledge: ${dashboard?.current_markets ? 'Existing international market experience' : 'Deep domestic market understanding'}
• Operational Excellence: ${companySize === 'Large' || companySize === 'Enterprise' ? 'Established operational capabilities' : 'Agile and adaptable operations'}

IMPLEMENTATION PLAN

Phase 1 - Market Entry (0-6 months):
• Market research and validation
• Legal and regulatory framework establishment
• Local partnership development
• Pilot program planning and execution
• Team establishment and training

Phase 2 - Market Development (6-18 months):
• Product localization and adaptation
• Customer acquisition and relationship building
• Operational scaling and optimization
• Brand building and market recognition
• Performance monitoring and adjustment

Phase 3 - Market Expansion (18-36 months):
• Market share growth and leadership
• Product portfolio expansion
• Operational scaling and efficiency
• Strategic partnership development
• Additional market opportunity evaluation

SUCCESS METRICS

Key Performance Indicators:
• Revenue Growth: ${revenue.year_1 || 'TBD'} (Y1), ${revenue.year_3 || 'TBD'} (Y3)
• Market Share: ${revenue.market_share_y1 || 'TBD'} (Y1), ${revenue.market_share_y3 || 'TBD'} (Y3)
• Customer Acquisition: ${marketScore >= 7 ? '100+ customers in Y1' : marketScore >= 5 ? '50+ customers in Y1' : '25+ customers in Y1'}
• Operational Efficiency: ${marketScore >= 7 ? 'Break-even in 12-18 months' : marketScore >= 5 ? 'Break-even in 18-24 months' : 'Break-even in 24+ months'}

Monitoring Framework:
• Monthly performance reviews and adjustments
• Quarterly strategic assessments and planning
• Annual comprehensive market analysis updates
• Continuous competitive intelligence gathering
• Regular stakeholder communication and reporting

INVESTMENT RECOMMENDATION

Based on comprehensive analysis using the KairosAI Market Entry Intelligence Platform, we recommend ${marketScore >= 7 ? 'proceeding with this market entry opportunity' : marketScore >= 5 ? 'proceeding with caution and phased approach' : 'reconsidering this market entry opportunity'}.

Rationale:
${marketScore >= 7 ?
  'This market opportunity presents strong potential for growth and strategic value. The high market opportunity score combined with manageable entry complexity creates an attractive investment opportunity with favorable risk-reward characteristics.' :
  marketScore >= 5 ?
  'This market opportunity presents moderate potential with acceptable risk levels. A phased approach with careful monitoring and adjustment will optimize success probability while managing risk exposure.' :
  'This market opportunity presents limited potential relative to investment requirements and risk exposure. Resources may be better allocated to higher-potential opportunities.'}

Expected Outcomes:
• Revenue Contribution: ${revenue.year_3 || 'TBD'} by Year 3
• Market Position: ${revenue.market_share_y3 || 'TBD'} market share by Year 3
• Strategic Value: ${marketScore >= 7 ? 'High strategic value and growth potential' : marketScore >= 5 ? 'Moderate strategic value with growth potential' : 'Limited strategic value'}

CONCLUSION

The ${targetMarket} market expansion represents a ${marketScore >= 7 ? 'high-potential' : marketScore >= 5 ? 'moderate-potential' : 'limited-potential'} opportunity for ${companyName} with ${marketScore >= 7 ? 'strong' : marketScore >= 5 ? 'moderate' : 'limited'} strategic value and growth potential.

${marketScore >= 7 ?
  'With proper execution of the recommended strategies, this expansion is expected to contribute significantly to company growth, market position, and long-term strategic objectives.' :
  marketScore >= 5 ?
  'With careful execution and monitoring, this expansion can provide valuable market experience and moderate growth contribution while maintaining strategic flexibility.' :
  'This expansion requires careful consideration of alternative opportunities and resource allocation priorities.'}

The investment framework provides a solid foundation for informed decision-making and successful market entry execution.

═══════════════════════════════════════════════════════════════════════════════

Prepared by: KairosAI Market Entry Intelligence Platform
Analysis Date: ${currentDate}
Document Classification: Confidential - Executive Use Only
Review Cycle: Quarterly updates recommended

For questions or additional analysis, contact the Strategic Planning team.
    `.trim();

    const blob = new Blob([investmentMemo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName}-investment-memo.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportBoardPresentation = () => {
    const companyName = dashboard?.company_name || 'Your Company';
    const segment = dashboard?.customer_segment || 'business';
    const targetMarket = dashboard?.target_market || 'target market';
    const industry = dashboard?.industry || 'Technology';
    const marketScore = parseInt(dashboard?.dashboard?.market_opportunity_score) || 0;
    const complexityScore = parseInt(dashboard?.dashboard?.entry_complexity_score) || 0;
    const competitiveIntensity = dashboard?.dashboard?.competitive_intensity || 'Moderate';
    const revenue = dashboard?.revenue_projections || {} as RevenueProjections;
    const budgetRange = dashboard?.budget_range || 'TBD';
    const expansionTimeline = dashboard?.expansion_timeline || 'Medium-term';
    const companySize = dashboard?.company_size || 'Medium';
    const annualRevenue = dashboard?.annual_revenue || 'TBD';

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const presentation = `
BOARD PRESENTATION
${companyName} - Market Entry Strategy
${targetMarket} Market Expansion
Prepared: ${currentDate}
Confidential and Proprietary

═══════════════════════════════════════════════════════════════════════════════

SLIDE 1: EXECUTIVE SUMMARY

Strategic Opportunity:
• Market: ${targetMarket} in ${industry} sector
• Business Segment: ${segment}
• Market Opportunity Score: ${marketScore}/10
• Entry Complexity Score: ${complexityScore}/10
• Competitive Intensity: ${competitiveIntensity}

Key Metrics:
• Company Size: ${companySize} (${annualRevenue} annual revenue)
• Expansion Timeline: ${expansionTimeline}
• Budget Allocation: ${budgetRange}
• Expected ROI: ${marketScore >= 7 ? '3-5x within 3 years' : marketScore >= 5 ? '2-3x within 3 years' : '1-2x within 3 years'}

Strategic Recommendation:
${marketScore >= 7 ? 'Proceed with market entry - High opportunity with manageable complexity' : marketScore >= 5 ? 'Proceed with caution - Moderate opportunity requiring careful execution' : 'Reconsider market entry - Limited opportunity relative to investment requirements'}

SLIDE 2: MARKET ANALYSIS

Market Overview:
• Target Market: ${targetMarket}
• Industry Sector: ${industry}
• Market Characteristics: ${marketScore >= 7 ? 'Large and growing market with high potential' : marketScore >= 5 ? 'Moderate market with growth opportunities' : 'Smaller market with limited growth potential'}
• Growth Rate: ${marketScore >= 7 ? 'High growth (15%+ annually)' : marketScore >= 5 ? 'Moderate growth (8-15% annually)' : 'Slow growth (<8% annually)'}

Competitive Landscape:
• Competitive Intensity: ${competitiveIntensity}
• Market Saturation: ${marketScore >= 7 ? 'Low saturation with opportunities' : marketScore >= 5 ? 'Moderate saturation' : 'High saturation with limited opportunities'}
• Key Competitors: Established local and international players
• Competitive Advantages: Technology innovation and market expertise

Entry Complexity:
• Regulatory Environment: ${complexityScore <= 6 ? 'Favorable regulatory climate' : complexityScore <= 7 ? 'Moderate regulatory requirements' : 'Complex regulatory environment'}
• Cultural Considerations: ${complexityScore <= 6 ? 'Minimal cultural barriers' : complexityScore <= 7 ? 'Moderate cultural adaptation required' : 'Significant cultural adaptation required'}
• Infrastructure Requirements: ${complexityScore <= 6 ? 'Basic infrastructure sufficient' : complexityScore <= 7 ? 'Moderate infrastructure investment' : 'Significant infrastructure investment'}

SLIDE 3: FINANCIAL PROJECTIONS

Revenue Projections:
• Year 1 Revenue Target: ${revenue.year_1 || 'TBD'}
• Year 3 Revenue Target: ${revenue.year_3 || 'TBD'}
• Market Share Target (Y1): ${revenue.market_share_y1 || 'TBD'}
• Market Share Target (Y3): ${revenue.market_share_y3 || 'TBD'}

Financial Performance:
• Expected CAGR: ${marketScore >= 7 ? '25-40%' : marketScore >= 5 ? '15-25%' : '5-15%'}
• Gross Margin: ${segment === 'saas-tech' ? '70-85%' : segment === 'healthcare' ? '60-75%' : '50-70%'}
• Operating Margin: ${marketScore >= 7 ? '20-30%' : marketScore >= 5 ? '15-25%' : '10-20%'}
• Break-even Timeline: ${marketScore >= 7 ? '12-18 months' : marketScore >= 5 ? '18-24 months' : '24+ months'}

Investment Requirements:
• Initial Investment: ${budgetRange}
• Timeline: ${expansionTimeline}
• Payback Period: ${marketScore >= 7 ? '2-3 years' : marketScore >= 5 ? '3-4 years' : '4+ years'}
• Risk-Adjusted Return: ${marketScore >= 7 && complexityScore <= 6 ? 'High' : marketScore >= 5 && complexityScore <= 7 ? 'Medium' : 'Low'}

SLIDE 4: RISK ASSESSMENT

Primary Risk Factors:
${dashboard?.key_insights?.filter((i: KeyInsight) => i.type === 'risk').map((i: KeyInsight, index: number) => `${index + 1}. ${i.title}: ${i.description}`).join('\n') || '1. Market entry complexity and regulatory requirements\n2. Competitive positioning and market saturation\n3. Cultural and operational adaptation challenges\n4. Financial investment and ROI uncertainty'}

Risk Mitigation Strategies:
${'• Establish local partnerships and advisory relationships\n• Implement phased market entry approach\n• Develop comprehensive risk management framework\n• Maintain flexible resource allocation strategy'}

Risk-Reward Analysis:
• Risk Level: ${marketScore >= 7 && complexityScore <= 6 ? 'Low' : marketScore >= 5 && complexityScore <= 7 ? 'Medium' : 'High'}
• Reward Potential: ${marketScore >= 7 ? 'High' : marketScore >= 5 ? 'Medium' : 'Low'}
• Overall Assessment: ${marketScore >= 7 && complexityScore <= 6 ? 'Favorable risk-reward profile' : marketScore >= 5 && complexityScore <= 7 ? 'Acceptable risk-reward profile' : 'Challenging risk-reward profile'}

SLIDE 5: IMPLEMENTATION PLAN

Phase 1 - Market Entry (0-6 months):
• Market research and validation
• Legal and regulatory framework establishment
• Local partnership development
• Pilot program planning and execution
• Team establishment and training

Phase 2 - Market Development (6-18 months):
• Product localization and adaptation
• Customer acquisition and relationship building
• Operational scaling and optimization
• Brand building and market recognition
• Performance monitoring and adjustment

Phase 3 - Market Expansion (18-36 months):
• Market share growth and leadership
• Product portfolio expansion
• Operational scaling and efficiency
• Strategic partnership development
• Additional market opportunity evaluation

Key Milestones:
• Month 3: Pilot program launch
• Month 6: First customer acquisition
• Month 12: Break-even achievement
• Month 18: Market share target (Y1)
• Month 36: Market share target (Y3)

SLIDE 6: STRATEGIC RECOMMENDATIONS

Immediate Actions (0-3 months):
${dashboard?.recommended_actions?.immediate || '• Conduct detailed market research and validation\n• Establish local legal and regulatory framework\n• Identify and engage potential local partners\n• Develop market entry strategy and timeline'}

Short-term Objectives (3-12 months):
${dashboard?.recommended_actions?.short_term || '• Launch pilot program in target market\n• Establish local operations and team\n• Develop go-to-market strategy\n• Initiate customer acquisition activities'}

Long-term Strategic Goals (1-3 years):
${dashboard?.recommended_actions?.long_term || '• Achieve market leadership position\n• Expand product portfolio for local market\n• Build sustainable competitive advantages\n• Scale operations and revenue growth'}

Success Metrics:
• Revenue Growth: ${revenue.year_1 || 'TBD'} (Y1), ${revenue.year_3 || 'TBD'} (Y3)
• Market Share: ${revenue.market_share_y1 || 'TBD'} (Y1), ${revenue.market_share_y3 || 'TBD'} (Y3)
• Customer Acquisition: ${marketScore >= 7 ? '100+ customers in Y1' : marketScore >= 5 ? '50+ customers in Y1' : '25+ customers in Y1'}
• Operational Efficiency: ${marketScore >= 7 ? 'Break-even in 12-18 months' : marketScore >= 5 ? 'Break-even in 18-24 months' : 'Break-even in 24+ months'}

SLIDE 7: BOARD RECOMMENDATION

Recommendation:
${marketScore >= 7 ? 'Proceed with market entry opportunity' : marketScore >= 5 ? 'Proceed with caution and phased approach' : 'Reconsider market entry opportunity'}

Rationale:
${marketScore >= 7 ?
  'This market opportunity presents strong potential for growth and strategic value. The high market opportunity score combined with manageable entry complexity creates an attractive investment opportunity with favorable risk-reward characteristics.' :
  marketScore >= 5 ?
  'This market opportunity presents moderate potential with acceptable risk levels. A phased approach with careful monitoring and adjustment will optimize success probability while managing risk exposure.' :
  'This market opportunity presents limited potential relative to investment requirements and risk exposure. Resources may be better allocated to higher-potential opportunities.'}

Expected Outcomes:
• Revenue Contribution: ${revenue.year_3 || 'TBD'} by Year 3
• Market Position: ${revenue.market_share_y3 || 'TBD'} market share by Year 3
• Strategic Value: ${marketScore >= 7 ? 'High strategic value and growth potential' : marketScore >= 5 ? 'Moderate strategic value with growth potential' : 'Limited strategic value'}

Next Steps:
1. Board approval for market entry initiative
2. Resource allocation and team assignment
3. Detailed implementation planning
4. Local market validation and partnership development
5. Pilot program launch and monitoring

SLIDE 8: QUESTIONS & DISCUSSION

Key Discussion Points:
• Resource allocation priorities and constraints
• Risk tolerance and mitigation strategies
• Timeline adjustments and milestone modifications
• Alternative market opportunities
• Success metrics and monitoring framework

Supporting Information:
• Detailed financial models and projections
• Competitive analysis and market intelligence
• Regulatory requirements and compliance framework
• Implementation timeline and resource requirements
• Risk assessment and mitigation strategies

Contact Information:
• Strategic Planning Team: [Contact Details]
• Market Intelligence: [Contact Details]
• Financial Analysis: [Contact Details]

═══════════════════════════════════════════════════════════════════════════════

Prepared by: KairosAI Market Entry Intelligence Platform
Analysis Date: ${currentDate}
Document Classification: Confidential - Executive Use Only
Review Cycle: Quarterly updates recommended

For questions or additional analysis, contact the Strategic Planning team.
    `.trim();

    const blob = new Blob([presentation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName}-board-presentation.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadReport = () => {
    if (!researchReport) return;

    const blob = new Blob([researchReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'competitor-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadProfessionalReport = async (reportType: string) => {
    const reportId = dashboard?.id;
    if (!reportId) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://market-entry-intel-platform-production.up.railway.app/api/v1'}/reports/${reportId}/download/${reportType}/`,
        {
          method: 'GET',
          headers: {
            ...(token && { Authorization: `Token ${token}` }),
          },
        }
      );

      if (response.status === 403) {
        // Tier not high enough - show upgrade prompt
        alert('Please upgrade your plan to download this report type.');
        return;
      }

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = reportType === 'board-presentation' ? 'pptx' : 'pdf';
      const companyName = (dashboard?.company_name || 'report').replace(/\s+/g, '-').toLowerCase();
      a.download = `${companyName}-${reportType}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback to text generation
      if (reportType === 'executive-summary') generateExecutiveSummary();
      else if (reportType === 'go-nogo') generateGoNoGoRecommendation();
      else if (reportType === 'investment-memo') generateInvestmentMemo();
      else if (reportType === 'board-presentation') exportBoardPresentation();
    }
  };

  const formatReportContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    const formattedElements: React.JSX.Element[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('# ')) {
        formattedElements.push(
          <Heading key={index} size="lg" color="gray.900" mb={3} mt={5}>
            {trimmedLine.replace('# ', '')}
          </Heading>
        );
      } else if (trimmedLine.startsWith('## ')) {
        formattedElements.push(
          <Heading key={index} size="md" color="gray.800" mb={2} mt={4}>
            {trimmedLine.replace('## ', '')}
          </Heading>
        );
      } else if (trimmedLine.startsWith('### ')) {
        formattedElements.push(
          <Heading key={index} size="sm" color="gray.700" mb={2} mt={3}>
            {trimmedLine.replace('### ', '')}
          </Heading>
        );
      } else if (trimmedLine.startsWith('#### ')) {
        formattedElements.push(
          <Text key={index} fontSize="sm" color="gray.700" mb={2} mt={3} fontWeight="semibold">
            {trimmedLine.replace('#### ', '')}
          </Text>
        );
      } else if (trimmedLine.startsWith('- **')) {
        const text = trimmedLine.replace('- **', '').replace('**:', '');
        const description = trimmedLine.split('**:').slice(1).join('**:');
        formattedElements.push(
          <Box key={index} mb={2} pl={4}>
            <Text fontSize="sm" fontWeight="bold" color="gray.800" display="inline">
              {text}:
            </Text>
            <Text fontSize="sm" color="gray.600" display="inline" ml={2}>
              {description}
            </Text>
          </Box>
        );
      } else if (trimmedLine.startsWith('- ')) {
        formattedElements.push(
          <Box key={index} mb={1} pl={4}>
            <Text fontSize="sm" color="gray.600">{trimmedLine.replace('- ', '')}</Text>
          </Box>
        );
      } else if (trimmedLine.includes('**') && trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        const formattedParts = parts.map((part, partIndex) => {
          if (partIndex % 2 === 1) {
            return <Text key={partIndex} as="span" fontSize="sm" fontWeight="bold" color="gray.800">{part}</Text>;
          }
          return <Text key={partIndex} as="span" fontSize="sm" color="gray.600">{part}</Text>;
        });
        formattedElements.push(
          <Text key={index} mb={3} fontSize="sm" lineHeight="1.6">
            {formattedParts}
          </Text>
        );
      } else if (trimmedLine.length > 0) {
        formattedElements.push(
          <Text key={index} mb={3} fontSize="sm" color="gray.600" lineHeight="1.6">
            {trimmedLine}
          </Text>
        );
      } else {
        formattedElements.push(<Box key={index} h={2} />);
      }
    });

    return formattedElements;
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <Box p={6} bg="#fafafa" minH="100vh" w="100%">
        <Container maxW="4xl" px={8}>
          <VStack spacing={8} py={16} textAlign="center">
            <VStack spacing={4}>
              <Icon as={FiBarChart} boxSize={16} color="gray.400" />
              <Heading size="xl" color="gray.900">
                Loading Dashboard...
              </Heading>
              <Text fontSize="lg" color="gray.500" maxW="2xl">
                Preparing your market intelligence dashboard.
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    );
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------
  if (!hasAnalysisHistory || !dashboard) {
    return (
      <Box p={6} bg="#fafafa" minH="100vh" w="100%">
        <Container maxW="4xl" px={8}>
          <VStack spacing={8} py={16} textAlign="center">
            <VStack spacing={4}>
              <Icon as={FiBarChart} boxSize={16} color="gray.400" />
              <Heading size="xl" color="gray.900">
                Welcome to Your Executive Dashboard
              </Heading>
              <Text fontSize="lg" color="gray.500" maxW="2xl">
                Start your market intelligence journey by running your first analysis.
                Our AI agents will provide comprehensive insights, competitive analysis,
                and strategic recommendations for your market expansion.
              </Text>
            </VStack>

            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm" borderRadius="xl" maxW="md" w="full">
              <CardBody p={8}>
                <VStack spacing={4}>
                  <Icon as={FiTarget} boxSize={8} color="gray.400" />
                  <Heading size="md" color="gray.900">
                    Ready to Get Started?
                  </Heading>
                  <Text fontSize="md" color="gray.500" textAlign="center">
                    Launch your first market analysis to unlock:
                  </Text>
                  <VStack spacing={2} align="start" w="full">
                    <HStack>
                      <Badge colorScheme="green" borderRadius="full">&#10003;</Badge>
                      <Text fontSize="sm" color="gray.700">Executive Summary & Go/No-Go Recommendations</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="blue" borderRadius="full">&#10003;</Badge>
                      <Text fontSize="sm" color="gray.700">Competitive Intelligence Reports</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="purple" borderRadius="full">&#10003;</Badge>
                      <Text fontSize="sm" color="gray.700">Market Entry Strategy & Financial Projections</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="orange" borderRadius="full">&#10003;</Badge>
                      <Text fontSize="sm" color="gray.700">Regulatory & Compliance Analysis</Text>
                    </HStack>
                  </VStack>
                  <Button
                    bg="gray.900"
                    color="white"
                    size="lg"
                    rightIcon={<FiArrowRight />}
                    onClick={() => navigate('/')}
                    w="full"
                    mt={4}
                    _hover={{ bg: 'gray.800' }}
                    _focus={{ boxShadow: 'none', outline: 'none' }}
                  >
                    Start Your Analysis
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Text fontSize="sm" color="gray.500" maxW="lg">
              Our autonomous AI agents will research market opportunities, analyze competitors,
              and generate board-ready reports in minutes, not months.
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  // ---------------------------------------------------------------------------
  // Main dashboard data extraction
  // ---------------------------------------------------------------------------
  const customerSegment = dashboard?.customer_segment || 'business';

  const getWTPData = (segment: string): WTPData => {
    const wtpData: { [key: string]: WTPData } = {
      'saas-tech': {
        annualContract: '$50K - $500K',
        avgContract: '$200K',
        marketSize: '$2.5B',
        growthRate: '25%',
        priceSensitivity: 'Medium',
        valueDrivers: ['ROI', 'Scalability', 'Integration'],
        competitiveAdvantage: 'Technology innovation'
      },
      'manufacturing': {
        annualContract: '$100K - $2M',
        avgContract: '$500K',
        marketSize: '$1.8B',
        growthRate: '18%',
        priceSensitivity: 'Low',
        valueDrivers: ['Efficiency', 'Compliance', 'Supply Chain'],
        competitiveAdvantage: 'Industry expertise'
      },
      'healthcare': {
        annualContract: '$200K - $1M',
        avgContract: '$400K',
        marketSize: '$3.2B',
        growthRate: '22%',
        priceSensitivity: 'Low',
        valueDrivers: ['Compliance', 'Patient Safety', 'Efficiency'],
        competitiveAdvantage: 'Regulatory compliance'
      },
      'financial': {
        annualContract: '$150K - $3M',
        avgContract: '$750K',
        marketSize: '$2.8B',
        growthRate: '20%',
        priceSensitivity: 'Low',
        valueDrivers: ['Security', 'Compliance', 'Risk Management'],
        competitiveAdvantage: 'Security & compliance'
      },
      'consumer': {
        annualContract: '$25K - $500K',
        avgContract: '$150K',
        marketSize: '$1.2B',
        growthRate: '15%',
        priceSensitivity: 'High',
        valueDrivers: ['Brand', 'Customer Experience', 'Market Reach'],
        competitiveAdvantage: 'Brand positioning'
      },
      'business': {
        annualContract: '$50K - $500K',
        avgContract: '$200K',
        marketSize: '$2.0B',
        growthRate: '20%',
        priceSensitivity: 'Medium',
        valueDrivers: ['ROI', 'Efficiency', 'Scalability'],
        competitiveAdvantage: 'General business solutions'
      }
    };
    return wtpData[segment] || wtpData['business'];
  };

  const wtpData = getWTPData(customerSegment);

  const metrics: MetricItem[] = [
    {
      label: 'Market Opportunity Score',
      value: `${dashboard.dashboard.market_opportunity_score}/10`,
      change: dashboard.dashboard.market_opportunity_change || '',
      trend: (dashboard.dashboard.market_opportunity_change || '').startsWith('+') ? 'up' : 'down',
      color: 'green',
      icon: FiTrendingUp,
      explanation: dashboard.detailed_scores?.market_opportunity_rationale,
    },
    {
      label: 'Competitive Intensity',
      value: dashboard.dashboard.competitive_intensity,
      change: dashboard.dashboard.competitive_intensity_change || '',
      trend: (dashboard.dashboard.competitive_intensity_change || '').startsWith('+') ? 'up' : 'down',
      color: 'blue',
      icon: FiBarChart,
      explanation: dashboard.detailed_scores?.competitive_intensity_rationale,
    },
    {
      label: 'Entry Complexity',
      value: `${dashboard.dashboard.entry_complexity_score}/10`,
      change: dashboard.dashboard.entry_complexity_change || '',
      trend: (dashboard.dashboard.entry_complexity_change || '').startsWith('+') ? 'up' : 'down',
      color: 'orange',
      icon: FiTarget,
      explanation: dashboard.detailed_scores?.entry_complexity_rationale,
    },
    {
      label: 'Revenue Potential',
      value: dashboard.dashboard.revenue_potential,
      change: dashboard.dashboard.revenue_potential_change || '',
      trend: (dashboard.dashboard.revenue_potential_change || '').startsWith('+') ? 'up' : 'down',
      color: 'purple',
      icon: FiDollarSign,
      explanation: dashboard.detailed_scores?.revenue_rationale,
    },
  ];

  const insights: KeyInsight[] = dashboard.key_insights || [];
  const recommended: Partial<RecommendedActions> = dashboard.recommended_actions || {};
  const researchReport: string = dashboard.research_report || '';
  const revenue: Partial<RevenueProjections> = dashboard.revenue_projections || {};

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box p={6} bg="#fafafa" minH="100vh" w="100%">
      <Container maxW="100%" px={8}>
        <VStack spacing={6} align="stretch" maxW="7xl" mx="auto">

          {/* Header */}
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Heading size="xl" mb={1} color="gray.900">
                  Executive Dashboard
                </Heading>
                <Text fontSize="md" color="gray.500">
                  Market Entry Intelligence Overview
                </Text>
              </Box>

              <HStack spacing={3} align="end">
                {availableReports.length > 1 && (
                  <Box minW="300px">
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      Select Report:
                    </Text>
                    <Select
                      value={currentReportId?.toString() || ''}
                      onChange={(e) => handleReportChange(e.target.value)}
                      bg="white"
                      color="gray.900"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'gray.400', boxShadow: 'none' }}
                    >
                      {availableReports.map((report) => (
                        <option key={report.id} value={report.id}>
                          {report.company_name} &rarr; {report.target_market}
                        </option>
                      ))}
                    </Select>
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      {availableReports.length} report{availableReports.length > 1 ? 's' : ''} available
                    </Text>
                  </Box>
                )}
                {currentReportId && (
                  <Button
                    leftIcon={<FiShare2 />}
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.700"
                    _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
                    onClick={handleShareReport}
                    isLoading={shareLoading}
                    size="md"
                  >
                    Share
                  </Button>
                )}
              </HStack>
            </Flex>
          </Box>

          {/* Customer Segment Context Bar */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody p={4}>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <HStack spacing={3}>
                    <Text fontSize="lg" fontWeight="bold" color="gray.900">
                      {dashboard?.customer_segment ?
                        (() => {
                          const segments: { [key: string]: string } = {
                            'saas-tech': 'SaaS/Tech Companies',
                            'manufacturing': 'Manufacturing/Industrial',
                            'healthcare': 'Healthcare/Pharma',
                            'financial': 'Financial Services',
                            'consumer': 'Consumer Goods'
                          };
                          return segments[dashboard.customer_segment] || 'Business';
                        })() : 'Business'
                      }
                    </Text>
                    <Text fontSize="md" color="gray.400">&rarr;</Text>
                    <Text fontSize="lg" fontWeight="bold" color="gray.900">
                      {dashboard?.expansion_direction ?
                        (() => {
                          const directions: { [key: string]: string } = {
                            'us-to-asia': 'US to Asia',
                            'asia-to-us': 'Asia to US',
                            'both': 'Multi-Market Expansion'
                          };
                          return directions[dashboard.expansion_direction] || 'Global Expansion';
                        })() : 'Global Expansion'
                      }
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {dashboard?.customer_segment ?
                      (() => {
                        const descriptions: { [key: string]: string } = {
                          'saas-tech': 'Series A-B companies expanding to Asia',
                          'manufacturing': 'Companies with complex supply chains',
                          'healthcare': 'Highly regulated, high-stakes expansion',
                          'financial': 'Regulatory complexity and compliance focus',
                          'consumer': 'Brand positioning and distribution channels'
                        };
                        return descriptions[dashboard.customer_segment] || 'Market expansion analysis';
                      })() : 'Market expansion analysis'
                    }
                  </Text>
                </VStack>
                <VStack align="end" spacing={1}>
                  <Badge colorScheme="gray" variant="subtle" px={3} py={1} fontSize="sm">
                    {dashboard?.company_size ?
                      (() => {
                        const sizes: { [key: string]: string } = {
                          '1-10': 'Startup',
                          '11-50': 'Small',
                          '51-200': 'Medium',
                          '201-1000': 'Large',
                          '1000+': 'Enterprise'
                        };
                        return sizes[dashboard.company_size] || 'Business';
                      })() : 'Business'
                    }
                  </Badge>
                  <Text fontSize="xs" color="gray.400">
                    {dashboard?.annual_revenue ?
                      (() => {
                        const revenues: { [key: string]: string } = {
                          '0-1M': '$0-1M Revenue',
                          '1M-10M': '$1M-10M Revenue',
                          '10M-50M': '$10M-50M Revenue',
                          '50M-200M': '$50M-200M Revenue',
                          '200M+': '$200M+ Revenue'
                        };
                        return revenues[dashboard.annual_revenue] || 'Revenue Range';
                      })() : 'Revenue Range'
                    }
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          {/* C-Level Deliverables Section */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody p={6}>
              <HStack justify="space-between" mb={4}>
                <Heading size="md" color="gray.900">
                  C-Level Deliverables
                </Heading>
                <Badge colorScheme="green" variant="subtle" px={3} py={1}>
                  Executive Ready
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500" mb={4}>
                Generate executive-ready documents and decision frameworks for board presentations and strategic planning
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
                <Button
                  size="md"
                  bg="gray.900"
                  color="white"
                  _hover={{ bg: 'gray.800' }}
                  _active={{ bg: 'gray.700' }}
                  onClick={() => downloadProfessionalReport('executive-summary')}
                  leftIcon={<Icon as={FiTarget} />}
                  fontWeight="medium"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                >
                  Executive Summary
                </Button>

                <Button
                  size="md"
                  variant="outline"
                  borderColor="gray.200"
                  color="gray.700"
                  _hover={{ bg: 'gray.50' }}
                  _active={{ bg: 'gray.100' }}
                  onClick={() => downloadProfessionalReport('go-nogo')}
                  leftIcon={<Icon as={FiTrendingUp} />}
                  fontWeight="medium"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                >
                  Go/No-Go Decision
                </Button>

                <Button
                  size="md"
                  variant="outline"
                  borderColor="gray.200"
                  color="gray.700"
                  _hover={{ bg: 'gray.50' }}
                  _active={{ bg: 'gray.100' }}
                  onClick={() => downloadProfessionalReport('investment-memo')}
                  leftIcon={<Icon as={FiDollarSign} />}
                  fontWeight="medium"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                >
                  Investment Memo
                </Button>

                <Button
                  size="md"
                  variant="outline"
                  borderColor="gray.200"
                  color="gray.700"
                  _hover={{ bg: 'gray.50' }}
                  _active={{ bg: 'gray.100' }}
                  onClick={() => downloadProfessionalReport('board-presentation')}
                  leftIcon={<Icon as={FiDownload} />}
                  fontWeight="medium"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                >
                  Board Presentation
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Metrics Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {metrics.map((metric, idx) => (
              <Card
                key={idx}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                shadow="sm"
                borderRadius="xl"
                _hover={{ shadow: 'md', transform: 'translateY(-1px)' }}
                transition="all 0.2s"
              >
                <CardBody p={5}>
                  <VStack align="start" spacing={3}>
                    <HStack w="full" justify="space-between">
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        {metric.label}
                      </Text>
                      <Icon as={metric.icon} color="gray.400" boxSize={5} />
                    </HStack>
                    <Stat>
                      <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                        {metric.value}
                      </StatNumber>
                    </Stat>
                    <HStack>
                      <Badge colorScheme={metric.color} variant="subtle" px={2} py={0.5} fontSize="xs">
                        {metric.change}
                      </Badge>
                      <Text fontSize="xs" color="gray.400">
                        vs last month
                      </Text>
                    </HStack>
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor="gray.200"
                      color="gray.600"
                      leftIcon={<FiInfo />}
                      onClick={() => handleMetricClick(metric)}
                      w="full"
                      mt={1}
                      _hover={{ bg: 'gray.50' }}
                      _focus={{ boxShadow: 'none', outline: 'none' }}
                    >
                      View Details
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* WTP Analysis Section */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody p={6}>
              <HStack justify="space-between" mb={4}>
                <Heading size="md" color="gray.900">
                  Willingness To Pay Analysis
                </Heading>
                <Badge colorScheme="blue" variant="subtle" px={3} py={1}>
                  {customerSegment === 'saas-tech' ? 'SaaS/Tech' :
                   customerSegment === 'manufacturing' ? 'Manufacturing' :
                   customerSegment === 'healthcare' ? 'Healthcare' :
                   customerSegment === 'financial' ? 'Financial' :
                   customerSegment === 'consumer' ? 'Consumer' : 'Business'} Segment
                </Badge>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={1}>Market Size</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.900">{wtpData.marketSize}</Text>
                  <Text fontSize="xs" color="gray.400">Addressable market</Text>
                </Box>

                <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={1}>Growth Rate</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.900">{wtpData.growthRate}</Text>
                  <Text fontSize="xs" color="gray.400">Annual growth</Text>
                </Box>

                <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={1}>Price Sensitivity</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.900">{wtpData.priceSensitivity}</Text>
                  <Text fontSize="xs" color="gray.400">Pricing flexibility</Text>
                </Box>
              </SimpleGrid>

              <VStack align="start" spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>Key Value Drivers</Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {wtpData.valueDrivers.map((driver: string, index: number) => (
                      <Badge key={index} colorScheme="gray" variant="subtle" px={3} py={1}>
                        {driver}
                      </Badge>
                    ))}
                  </HStack>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>Competitive Advantage</Text>
                  <Text fontSize="sm" color="gray.600" bg="#fafafa" p={3} borderRadius="md" border="1px solid" borderColor="gray.100">
                    {wtpData.competitiveAdvantage}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>Pricing Strategy Recommendation</Text>
                  <Text fontSize="sm" color="gray.600" bg="#fafafa" p={3} borderRadius="md" border="1px solid" borderColor="gray.100">
                    {wtpData.priceSensitivity === 'Low' ?
                      'Premium pricing strategy recommended - customers value quality and compliance over cost' :
                      wtpData.priceSensitivity === 'High' ?
                      'Value-based pricing strategy recommended - emphasize ROI and competitive advantages' :
                      'Balanced pricing strategy recommended - competitive pricing with value differentiation'
                    }
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Key Insights Section */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody p={6}>
              <HStack justify="space-between" mb={6}>
                <Heading size="md" color="gray.900">Comprehensive Market Intelligence</Heading>
                <Badge colorScheme="blue" variant="subtle" px={3} py={1}>
                  {insights.length} Key Insights
                </Badge>
              </HStack>

              {/* Executive Summary Insights */}
              {insights.filter((insight: KeyInsight) => insight.priority === 'high').length > 0 && (
                <Box mb={6}>
                  <Heading size="sm" color="gray.800" mb={3} display="flex" alignItems="center">
                    <Icon as={FiTarget} mr={2} color="gray.500" />
                    Executive Summary & Strategic Overview
                  </Heading>
                  <VStack align="start" spacing={3}>
                    {insights.filter((insight: KeyInsight) => insight.priority === 'high').map((insight: KeyInsight, i: number) => (
                      <Box key={i} p={4} bg="#fafafa" borderRadius="lg" w="full" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'sm' }} transition="all 0.2s">
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="semibold" color="gray.900" fontSize="sm">{insight.title}</Text>
                          <Badge colorScheme="purple" variant="subtle" size="sm">High Priority</Badge>
                        </HStack>
                        <Text color="gray.600" fontSize="sm" lineHeight="1.6">{insight.description}</Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Market Opportunity Insights */}
              {insights.filter((insight: KeyInsight) => insight.type === 'opportunity').length > 0 && (
                <Box mb={6}>
                  <Heading size="sm" color="gray.800" mb={3} display="flex" alignItems="center">
                    <Icon as={FiTrendingUp} mr={2} color="gray.500" />
                    Market Opportunity & Growth Potential
                  </Heading>
                  <VStack align="start" spacing={3}>
                    {insights.filter((insight: KeyInsight) => insight.type === 'opportunity').map((insight: KeyInsight, i: number) => (
                      <Box key={i} p={4} bg="#fafafa" borderRadius="lg" w="full" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'sm' }} transition="all 0.2s">
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="semibold" color="gray.900" fontSize="sm">{insight.title}</Text>
                          <Badge colorScheme="green" variant="subtle" size="sm">Opportunity</Badge>
                        </HStack>
                        <Text color="gray.600" fontSize="sm" lineHeight="1.6">{insight.description}</Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Risk Insights */}
              {insights.filter((insight: KeyInsight) => insight.type === 'risk').length > 0 && (
                <Box mb={6}>
                  <Heading size="sm" color="gray.800" mb={3} display="flex" alignItems="center">
                    <Icon as={FiUsers} mr={2} color="gray.500" />
                    Risk Assessment & Mitigation Strategies
                  </Heading>
                  <VStack align="start" spacing={3}>
                    {insights.filter((insight: KeyInsight) => insight.type === 'risk').map((insight: KeyInsight, i: number) => (
                      <Box key={i} p={4} bg="#fafafa" borderRadius="lg" w="full" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'sm' }} transition="all 0.2s">
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="semibold" color="gray.900" fontSize="sm">{insight.title}</Text>
                          <Badge colorScheme="red" variant="subtle" size="sm">Risk</Badge>
                        </HStack>
                        <Text color="gray.600" fontSize="sm" lineHeight="1.6">{insight.description}</Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Strategy Insights */}
              {insights.filter((insight: KeyInsight) => insight.type === 'strategy').length > 0 && (
                <Box mb={6}>
                  <Heading size="sm" color="gray.800" mb={3} display="flex" alignItems="center">
                    <Icon as={FiDollarSign} mr={2} color="gray.500" />
                    Strategic Recommendations & Next Steps
                  </Heading>
                  <VStack align="start" spacing={3}>
                    {insights.filter((insight: KeyInsight) => insight.type === 'strategy').map((insight: KeyInsight, i: number) => (
                      <Box key={i} p={4} bg="#fafafa" borderRadius="lg" w="full" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'sm' }} transition="all 0.2s">
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="semibold" color="gray.900" fontSize="sm">{insight.title}</Text>
                          <Badge colorScheme="blue" variant="subtle" size="sm">Strategy</Badge>
                        </HStack>
                        <Text color="gray.600" fontSize="sm" lineHeight="1.6">{insight.description}</Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* No insights fallback */}
              {insights.length === 0 && (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500" fontSize="md">No detailed insights available.</Text>
                  <Text color="gray.400" fontSize="sm">Please run a comprehensive market analysis to generate insights.</Text>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Competitor Analysis Section */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody p={6}>
              <Heading size="md" mb={4} color="gray.900">Competitor Analysis</Heading>
              {(() => {
                if (competitorSummary && typeof competitorSummary === 'string') {
                  return (
                    <Box whiteSpace="pre-wrap" color="gray.700" fontFamily="mono" fontSize="sm" p={3} bg="#fafafa" borderRadius="md" border="1px solid" borderColor="gray.100">
                      {competitorSummary}
                    </Box>
                  );
                } else if (competitorSummary && Array.isArray(competitorSummary)) {
                  return (
                    <VStack align="start" spacing={4}>
                      {/* Competitor Overview Stats */}
                      <Box w="full" p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                        <HStack justify="space-between" mb={3}>
                          <Text fontWeight="semibold" color="gray.900" fontSize="sm">Market Overview</Text>
                          <Badge colorScheme="gray" variant="subtle">
                            {competitorSummary.length} Competitors Analyzed
                          </Badge>
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="bold" color="gray.900">
                              {competitorSummary.filter((c: Competitor) => c.market_share !== 'unknown').length}
                            </Text>
                            <Text fontSize="xs" color="gray.500">With Market Share Data</Text>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="bold" color="gray.900">
                              {competitorSummary.filter((c: Competitor) => c.years_in_market).length}
                            </Text>
                            <Text fontSize="xs" color="gray.500">With Experience Data</Text>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="bold" color="gray.900">
                              {competitorSummary.filter((c: Competitor) => c.headquarters).length}
                            </Text>
                            <Text fontSize="xs" color="gray.500">With Location Data</Text>
                          </Box>
                        </SimpleGrid>
                      </Box>

                      {/* Detailed Competitor Cards */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        {competitorSummary.map((competitor: Competitor, index: number) => (
                          <Box key={index} p={4} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" w="full" _hover={{ shadow: 'sm' }} transition="all 0.2s">
                            <VStack align="start" spacing={3}>
                              <HStack justify="space-between" w="full">
                                <Text fontWeight="semibold" color="gray.900" fontSize="sm">
                                  {competitor.name}
                                </Text>
                                <Badge colorScheme={competitor.market_share === 'unknown' ? 'gray' : 'green'} variant="subtle">
                                  {competitor.market_share}
                                </Badge>
                              </HStack>

                              <Text color="gray.600" fontSize="sm" lineHeight="1.5">
                                {competitor.description}
                              </Text>

                              <SimpleGrid columns={2} spacing={3} w="full">
                                {competitor.years_in_market && (
                                  <Box>
                                    <Text fontSize="xs" color="gray.400" fontWeight="medium">Years in Market</Text>
                                    <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                                      {competitor.years_in_market} years
                                    </Text>
                                  </Box>
                                )}

                                {competitor.headquarters && (
                                  <Box>
                                    <Text fontSize="xs" color="gray.400" fontWeight="medium">Headquarters</Text>
                                    <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                                      {competitor.headquarters}
                                    </Text>
                                  </Box>
                                )}
                              </SimpleGrid>

                              <Box w="full">
                                <HStack spacing={2} flexWrap="wrap">
                                  {competitor.market_share !== 'unknown' && (
                                    <Badge colorScheme="green" variant="outline" size="sm">
                                      Market Leader
                                    </Badge>
                                  )}
                                  {parseInt(competitor.years_in_market || '0') > 10 && (
                                    <Badge colorScheme="blue" variant="outline" size="sm">
                                      Established Player
                                    </Badge>
                                  )}
                                  {parseInt(competitor.years_in_market || '0') < 5 && (
                                    <Badge colorScheme="orange" variant="outline" size="sm">
                                      Emerging Player
                                    </Badge>
                                  )}
                                  {competitor.headquarters && competitor.headquarters.includes('China') && (
                                    <Badge colorScheme="red" variant="outline" size="sm">
                                      Local Player
                                    </Badge>
                                  )}
                                  {competitor.headquarters && !competitor.headquarters.includes('China') && (
                                    <Badge colorScheme="purple" variant="outline" size="sm">
                                      International Player
                                    </Badge>
                                  )}
                                </HStack>
                              </Box>
                            </VStack>
                          </Box>
                        ))}
                      </SimpleGrid>

                      {/* Market Share Analysis */}
                      {competitorSummary.filter((c: Competitor) => c.market_share !== 'unknown').length > 0 && (
                        <Box w="full" p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                          <Text fontWeight="semibold" color="gray.900" mb={3} fontSize="sm">Market Share Analysis</Text>
                          <VStack align="start" spacing={2}>
                            {competitorSummary
                              .filter((c: Competitor) => c.market_share !== 'unknown')
                              .sort((a: Competitor, b: Competitor) => parseFloat(b.market_share || '0') - parseFloat(a.market_share || '0'))
                              .map((competitor: Competitor, index: number) => (
                                <HStack key={index} w="full" justify="space-between">
                                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                    {competitor.name}
                                  </Text>
                                  <HStack spacing={2}>
                                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                                      {competitor.market_share}
                                    </Text>
                                    <Progress
                                      value={parseFloat(competitor.market_share || '0')}
                                      size="sm"
                                      colorScheme="gray"
                                      w="100px"
                                      borderRadius="full"
                                    />
                                  </HStack>
                                </HStack>
                              ))}
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  );
                } else {
                  return <Text color="gray.500" fontSize="sm">No competitor data available.</Text>;
                }
              })()}
            </CardBody>
          </Card>

          {/* Research Report Section */}
          {researchReport && (
            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm" borderRadius="xl">
              <CardBody p={6}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md" color="gray.900">Full Competitor Analysis Report</Heading>
                  <IconButton
                    aria-label="Download report as text file"
                    icon={<FiDownload />}
                    variant="outline"
                    borderColor="gray.200"
                    color="gray.600"
                    size="sm"
                    onClick={downloadReport}
                    _hover={{ bg: 'gray.50' }}
                    _focus={{ boxShadow: 'none', outline: 'none' }}
                  />
                </Flex>
                <Button
                  mb={4}
                  variant="outline"
                  borderColor="gray.200"
                  color="gray.700"
                  size="sm"
                  onClick={() => setShowFullReport(v => !v)}
                  _hover={{ bg: 'gray.50' }}
                >
                  {showFullReport ? 'Hide Full Report' : 'Show Full Report'}
                </Button>
                {showFullReport && (
                  <Box mt={2} p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" maxH="600px" overflowY="auto">
                    {formatReportContent(researchReport)}
                  </Box>
                )}
              </CardBody>
            </Card>
          )}

          {/* Revenue Projection Section */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody p={6}>
              <Heading size="md" mb={4} color="gray.900">Revenue Projection</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Text fontSize="sm" color="gray.500" mb={1}>Year 1 Revenue</Text>
                  <Text fontSize="xl" fontWeight="bold" color="gray.900">{revenue.year_1}</Text>
                </Box>
                <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Text fontSize="sm" color="gray.500" mb={1}>Year 3 Revenue</Text>
                  <Text fontSize="xl" fontWeight="bold" color="gray.900">{revenue.year_3}</Text>
                </Box>
                <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Text fontSize="sm" color="gray.500" mb={1}>Market Share Target (Y1/Y3)</Text>
                  <Text fontSize="xl" fontWeight="bold" color="gray.900">{revenue.market_share_y1} / {revenue.market_share_y3}</Text>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Financial Model Section */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color="gray.900">Financial Model</Heading>
                <Button
                  size="sm"
                  bg="gray.900"
                  color="white"
                  _hover={{ bg: 'gray.800' }}
                  onClick={fetchFinancialModel}
                  isLoading={financialModelLoading}
                  loadingText="Generating..."
                  isDisabled={!currentReportId}
                >
                  {financialModel ? 'Regenerate Financial Model' : 'Generate Financial Model'}
                </Button>
              </Flex>

              {financialModelLoading && (
                <Flex justify="center" align="center" py={12} direction="column" gap={3}>
                  <Spinner size="lg" color="gray.500" />
                  <Text fontSize="sm" color="gray.500">Generating financial model analysis...</Text>
                </Flex>
              )}

              {financialModelError && !financialModelLoading && (
                <Box p={4} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.200">
                  <Text fontSize="sm" color="red.600">{financialModelError}</Text>
                </Box>
              )}

              {!financialModel && !financialModelLoading && !financialModelError && (
                <Box p={8} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100" textAlign="center">
                  <Icon as={FiBarChart} boxSize={8} color="gray.400" mb={3} />
                  <Text fontSize="sm" color="gray.500">
                    Click "Generate Financial Model" to run sensitivity analysis and scenario projections for this report.
                  </Text>
                </Box>
              )}

              {financialModel && !financialModelLoading && (
                <VStack spacing={6} align="stretch">
                  {/* Sensitivity Analysis - Tornado Chart */}
                  <Box>
                    <Text fontWeight="semibold" color="gray.900" mb={3} fontSize="sm">
                      Sensitivity Analysis (Revenue Impact by Variable)
                    </Text>
                    <Box bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100" p={4}>
                      <ResponsiveContainer width="100%" height={Math.max(250, (financialModel.sensitivity_analysis.variables?.length || 0) * 50)}>
                        <RechartsBarChart
                          layout="vertical"
                          data={(financialModel.sensitivity_analysis.variables || [])
                            .sort((a, b) => b.sensitivity_score - a.sensitivity_score)
                            .slice(0, 8)
                            .map(v => ({
                              name: (v.variable || '').length > 28 ? (v.variable || '').substring(0, 28) + '...' : v.variable,
                              fullName: v.variable,
                              pessimistic: parseRevenueString(v.pessimistic_impact),
                              base: parseRevenueString(v.base_impact),
                              optimistic: parseRevenueString(v.optimistic_impact),
                              range: parseRevenueString(v.optimistic_impact) - parseRevenueString(v.pessimistic_impact),
                              score: v.sensitivity_score,
                            }))}
                          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" tick={{ fontSize: 11, fill: '#718096' }} tickFormatter={(v: number) => `$${v.toFixed(1)}M`} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#4a5568' }} width={115} />
                          <Tooltip
                            formatter={(value: number, name: string) => [`$${value.toFixed(2)}M`, (name || '').charAt(0).toUpperCase() + (name || '').slice(1)]}
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="pessimistic" name="Pessimistic" fill="#fc8181" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="base" name="Base" fill="#90cdf4" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="optimistic" name="Optimistic" fill="#68d391" radius={[0, 0, 0, 0]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </Box>
                    {financialModel.sensitivity_analysis.key_findings && (
                      <Box mt={3} p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.100">
                        <Text fontSize="xs" fontWeight="semibold" color="blue.700" mb={1}>Key Findings</Text>
                        <Text fontSize="xs" color="blue.600" lineHeight="1.5">
                          {financialModel.sensitivity_analysis.key_findings}
                        </Text>
                      </Box>
                    )}
                  </Box>

                  {/* Scenario Projections Chart */}
                  <Box>
                    <Text fontWeight="semibold" color="gray.900" mb={3} fontSize="sm">
                      Scenario Revenue Projections
                    </Text>
                    <Box bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100" p={4}>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart
                          data={[
                            {
                              period: 'Year 1',
                              Conservative: parseRevenueString(financialModel.scenario_projections?.conservative?.year_1_revenue),
                              Base: parseRevenueString(financialModel.scenario_projections?.base?.year_1_revenue),
                              Optimistic: parseRevenueString(financialModel.scenario_projections?.optimistic?.year_1_revenue),
                            },
                            {
                              period: 'Year 3',
                              Conservative: parseRevenueString(financialModel.scenario_projections?.conservative?.year_3_revenue),
                              Base: parseRevenueString(financialModel.scenario_projections?.base?.year_3_revenue),
                              Optimistic: parseRevenueString(financialModel.scenario_projections?.optimistic?.year_3_revenue),
                            },
                            {
                              period: 'Year 5',
                              Conservative: parseRevenueString(financialModel.scenario_projections?.conservative?.year_5_revenue),
                              Base: parseRevenueString(financialModel.scenario_projections?.base?.year_5_revenue),
                              Optimistic: parseRevenueString(financialModel.scenario_projections?.optimistic?.year_5_revenue),
                            },
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#4a5568' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#718096' }} tickFormatter={(v: number) => `$${v.toFixed(1)}M`} />
                          <Tooltip
                            formatter={(value: number, name: string) => [`$${value.toFixed(2)}M`, name]}
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="Conservative" fill="#fc8181" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Base" fill="#90cdf4" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Optimistic" fill="#68d391" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Scenario Details Cards */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
                      <Box p={4} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.100">
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="semibold" color="red.700" fontSize="sm">Conservative</Text>
                          <Badge colorScheme="red" variant="subtle" fontSize="xs">{financialModel.scenario_projections?.conservative?.probability || 'N/A'}</Badge>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="red.600">Y1: {financialModel.scenario_projections?.conservative?.year_1_revenue || 'N/A'}</Text>
                          <Text fontSize="xs" color="red.600">Y3: {financialModel.scenario_projections?.conservative?.year_3_revenue || 'N/A'}</Text>
                          <Text fontSize="xs" color="red.600">Y5: {financialModel.scenario_projections?.conservative?.year_5_revenue || 'N/A'}</Text>
                        </VStack>
                        {financialModel.scenario_projections?.conservative?.key_assumptions && (
                          <Text fontSize="xs" color="red.500" mt={2} noOfLines={3}>
                            {financialModel.scenario_projections.conservative.key_assumptions}
                          </Text>
                        )}
                      </Box>
                      <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.100">
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="semibold" color="blue.700" fontSize="sm">Base Case</Text>
                          <Badge colorScheme="blue" variant="subtle" fontSize="xs">{financialModel.scenario_projections?.base?.probability || 'N/A'}</Badge>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="blue.600">Y1: {financialModel.scenario_projections?.base?.year_1_revenue || 'N/A'}</Text>
                          <Text fontSize="xs" color="blue.600">Y3: {financialModel.scenario_projections?.base?.year_3_revenue || 'N/A'}</Text>
                          <Text fontSize="xs" color="blue.600">Y5: {financialModel.scenario_projections?.base?.year_5_revenue || 'N/A'}</Text>
                        </VStack>
                        {financialModel.scenario_projections?.base?.key_assumptions && (
                          <Text fontSize="xs" color="blue.500" mt={2} noOfLines={3}>
                            {financialModel.scenario_projections.base.key_assumptions}
                          </Text>
                        )}
                      </Box>
                      <Box p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.100">
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="semibold" color="green.700" fontSize="sm">Optimistic</Text>
                          <Badge colorScheme="green" variant="subtle" fontSize="xs">{financialModel.scenario_projections?.optimistic?.probability || 'N/A'}</Badge>
                        </HStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="green.600">Y1: {financialModel.scenario_projections?.optimistic?.year_1_revenue || 'N/A'}</Text>
                          <Text fontSize="xs" color="green.600">Y3: {financialModel.scenario_projections?.optimistic?.year_3_revenue || 'N/A'}</Text>
                          <Text fontSize="xs" color="green.600">Y5: {financialModel.scenario_projections?.optimistic?.year_5_revenue || 'N/A'}</Text>
                        </VStack>
                        {financialModel.scenario_projections?.optimistic?.key_assumptions && (
                          <Text fontSize="xs" color="green.500" mt={2} noOfLines={3}>
                            {financialModel.scenario_projections.optimistic.key_assumptions}
                          </Text>
                        )}
                      </Box>
                    </SimpleGrid>
                  </Box>
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Recommended Actions Section */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm" borderRadius="xl">
            <CardBody p={6}>
              <Heading size="md" mb={4} color="gray.900">Recommended Actions</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Text fontWeight="semibold" color="gray.900" mb={2} fontSize="sm">Immediate</Text>
                  <Text fontSize="sm" color="gray.600">{recommended.immediate}</Text>
                </Box>
                <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Text fontWeight="semibold" color="gray.900" mb={2} fontSize="sm">Short-term</Text>
                  <Text fontSize="sm" color="gray.600">{recommended.short_term}</Text>
                </Box>
                <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Text fontWeight="semibold" color="gray.900" mb={2} fontSize="sm">Long-term</Text>
                  <Text fontSize="sm" color="gray.600">{recommended.long_term}</Text>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Metric Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="white" border="1px solid" borderColor="gray.200">
          <ModalHeader color="gray.900">
            {selectedMetric?.label} - Detailed Analysis
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={4}>
              <HStack w="full" justify="space-between" p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                <VStack align="start" spacing={1}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                    {selectedMetric?.value}
                  </Text>
                  <Badge colorScheme={selectedMetric?.color} variant="subtle">
                    {selectedMetric?.change}
                  </Badge>
                </VStack>
                <Icon as={selectedMetric?.icon} color="gray.400" boxSize={8} />
              </HStack>

              <Box w="full">
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
                  Analysis & Rationale
                </Text>
                <Box p={4} bg="#fafafa" borderRadius="md" border="1px solid" borderColor="gray.100">
                  <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                    {selectedMetric?.explanation || 'No detailed explanation available for this metric.'}
                  </Text>
                </Box>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button bg="gray.900" color="white" _hover={{ bg: 'gray.800' }} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Share Report Modal */}
      <Modal isOpen={isShareOpen} onClose={onShareClose} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent bg="white" border="1px solid" borderColor="gray.200" shadow="lg">
          <ModalHeader>
            <HStack spacing={3}>
              <FiLink color="#4A5568" size={20} />
              <Text color="gray.900">Share Report</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="gray.500" />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Anyone with this link can view a read-only version of this report.
              </Text>
              {shareLink && (
                <InputGroup>
                  <Input
                    value={shareLink}
                    isReadOnly
                    fontSize="sm"
                    bg="#fafafa"
                    borderColor="gray.200"
                    pr="4rem"
                  />
                  <InputRightElement width="4rem">
                    <IconButton
                      aria-label="Copy link"
                      icon={<FiCopy />}
                      size="sm"
                      variant="ghost"
                      color="gray.600"
                      onClick={handleCopyShareLink}
                    />
                  </InputRightElement>
                </InputGroup>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            {isShared && (
              <Button
                variant="outline"
                borderColor="red.300"
                color="red.600"
                _hover={{ bg: 'red.50' }}
                mr={3}
                onClick={handleUnshareReport}
                isLoading={shareLoading}
                size="sm"
              >
                Unshare
              </Button>
            )}
            <Button bg="gray.900" color="white" _hover={{ bg: 'gray.800' }} onClick={onShareClose} size="sm">
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ExecutiveDashboardPage;
