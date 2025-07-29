import { Box, Container, Grid, GridItem, Card, CardBody, Heading, Text, VStack, HStack, Stat, StatLabel, StatNumber, StatHelpText, Badge, Progress, Icon, Flex, SimpleGrid, Button, Spinner, Collapse, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiTarget, FiDollarSign, FiUsers, FiBarChart } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader';
import DataTable from '../../components/DataTable';
import { useEffect, useState } from 'react';

const ExecutiveDashboardPage = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [competitorSummary, setCompetitorSummary] = useState<string>('');
  const [loadingCompetitorSummary, setLoadingCompetitorSummary] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [competitorError, setCompetitorError] = useState<string | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<number | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('dashboardData');
    if (data) {
      setDashboard(JSON.parse(data));
    }
    const competitor = localStorage.getItem('competitorSummary');
    if (competitor) {
      setCompetitorSummary(competitor);
    }
  }, []);

  const fetchCompetitorSummary = async (companyInfo: any) => {
    setLoadingCompetitorSummary(true);
    setCompetitorError(null);
    try {
      const res = await fetch('http://localhost:8000/api/v1/competitor-analysis/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyInfo),
      });
      const data = await res.json();
      if (data.competitor_analysis) {
        setCompetitorSummary(data.competitor_analysis);
      } else {
        setCompetitorSummary('No competitor summary available.');
      }
    } catch (e) {
      setCompetitorError('Failed to fetch competitor analysis.');
    }
    setLoadingCompetitorSummary(false);
  };

  if (!dashboard) {
    return (
      <Box p={6} bg="gray.50" minH="100vh" w="100%">
        <Container maxW="100%" px={8}>
          <Heading size="lg">No analysis data found</Heading>
          <Text mt={2}>Please run a market analysis from the landing page.</Text>
        </Container>
      </Box>
    );
  }

  // Extract data from API response
  const metrics = [
    {
      label: 'Market Opportunity Score',
      value: `${dashboard.dashboard.market_opportunity_score}/10`,
      change: dashboard.dashboard.market_opportunity_change,
      trend: dashboard.dashboard.market_opportunity_change.startsWith('+') ? 'up' : 'down',
      color: 'green',
      icon: FiTrendingUp,
      explanation: dashboard.detailed_scores?.market_opportunity_rationale,
    },
    {
      label: 'Competitive Intensity',
      value: dashboard.dashboard.competitive_intensity,
      change: dashboard.dashboard.competitive_intensity_change,
      trend: dashboard.dashboard.competitive_intensity_change.startsWith('+') ? 'up' : 'down',
      color: 'blue',
      icon: FiBarChart,
      explanation: dashboard.detailed_scores?.competitive_intensity_rationale,
    },
    {
      label: 'Entry Complexity',
      value: `${dashboard.dashboard.entry_complexity_score}/10`,
      change: dashboard.dashboard.entry_complexity_change,
      trend: dashboard.dashboard.entry_complexity_change.startsWith('+') ? 'up' : 'down',
      color: 'orange',
      icon: FiTarget,
      explanation: dashboard.detailed_scores?.entry_complexity_rationale,
    },
    {
      label: 'Revenue Potential',
      value: dashboard.dashboard.revenue_potential,
      change: dashboard.dashboard.revenue_potential_change,
      trend: dashboard.dashboard.revenue_potential_change.startsWith('+') ? 'up' : 'down',
      color: 'purple',
      icon: FiDollarSign,
      explanation: dashboard.detailed_scores?.revenue_rationale,
    },
  ];
  const insights = dashboard.key_insights || [];
  const recommended = dashboard.recommended_actions || {};
  const researchReport = dashboard.research_report || '';
  const revenue = dashboard.revenue_projections || {};

  return (
    <Box p={6} bg="gray.50" minH="100vh" w="100%">
      <Container maxW="100%" px={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="xl" mb={2} color="gray.800">
              Executive Dashboard
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Market Entry Intelligence Overview
            </Text>
          </Box>

          {/* Metrics Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {metrics.map((metric, idx) => (
              <Card key={idx} shadow="xl" borderRadius="2xl" bg={`${metric.color}.50`} _hover={{ boxShadow: '2xl', transform: 'scale(1.03)' }} transition="all 0.2s" cursor="pointer" onClick={() => setExpandedMetric(expandedMetric === idx ? null : idx)}>
                <CardBody p={6}>
                  <VStack align="start" spacing={3}>
                    <HStack w="full" justify="space-between">
                      <Text fontSize="md" color={`${metric.color}.700`} fontWeight="bold">
                        {metric.label}
                      </Text>
                      <Icon as={metric.icon} color={`${metric.color}.500`} boxSize={6} />
                    </HStack>
                    <Stat>
                      <StatNumber fontSize="2xl" fontWeight="extrabold" color={`${metric.color}.900`}>
                        {metric.value}
                      </StatNumber>
                    </Stat>
                    <HStack>
                      <Badge colorScheme={metric.color} variant="solid" px={3} py={1} fontSize="md">
                        {metric.change}
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
                        vs last month
                      </Text>
                    </HStack>
                    <Collapse in={expandedMetric === idx} animateOpacity>
                      <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                        <Text fontSize="sm" color="gray.700">{metric.explanation}</Text>
                      </Box>
                    </Collapse>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Key Insights Section */}
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={6}>
              <Heading size="md" mb={4} color="blue.700">Key Insights</Heading>
              <VStack align="start" spacing={4}>
                {insights.length === 0 ? <Text>No insights available.</Text> : insights.map((insight: any, i: number) => (
                  <Box key={i} p={3} bg="gray.50" borderRadius="md" w="full" boxShadow="sm">
                    <Text fontWeight="bold" color="blue.700">{insight.title}</Text>
                    <Text color="gray.700">{insight.description}</Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Competitor Analysis Section */}
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={6}>
              <Heading size="md" mb={4} color="purple.700">Competitor Analysis</Heading>
              {loadingCompetitorSummary ? (
                <VStack py={8}><Spinner size="xl" /></VStack>
              ) : competitorError ? (
                <Text color="red.500">{competitorError}</Text>
              ) : (
                <Box whiteSpace="pre-wrap" color="gray.800" fontFamily="mono" fontSize="sm" p={2} bg="gray.50" borderRadius="md">
                  {competitorSummary}
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Full Competitor Analysis Report Section */}
          {researchReport && (
            <Card shadow="lg" borderRadius="xl">
              <CardBody p={6}>
                <Heading size="md" mb={4} color="purple.700">Full Competitor Analysis Report</Heading>
                <Button mb={4} colorScheme="purple" variant="outline" onClick={() => setShowFullReport(v => !v)}>
                  {showFullReport ? 'Hide Full Report' : 'Show Full Report'}
                </Button>
                {showFullReport && (
                  <Box mt={2} whiteSpace="pre-wrap" color="gray.800" fontFamily="mono" fontSize="sm" p={2} bg="gray.100" borderRadius="md">
                    {researchReport}
                  </Box>
                )}
              </CardBody>
            </Card>
          )}

          {/* Revenue Projection Section */}
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={6}>
              <Heading size="md" mb={4} color="green.700">Revenue Projection</Heading>
              <VStack align="start" spacing={2}>
                <Box>
                  <Text fontSize="sm" color="gray.600">Year 1 Revenue</Text>
                  <Text fontSize="xl" fontWeight="bold" color="green.600">{revenue.year_1}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">Year 3 Revenue</Text>
                  <Text fontSize="xl" fontWeight="bold" color="blue.600">{revenue.year_3}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">Market Share Target (Y1/Y3)</Text>
                  <Text fontSize="xl" fontWeight="bold" color="purple.600">{revenue.market_share_y1} / {revenue.market_share_y3}</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Recommended Actions Section */}
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={6}>
              <Heading size="md" mb={4} color="orange.700">Recommended Actions</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                  <Text fontWeight="bold" color="blue.800" mb={1} fontSize="md">Immediate</Text>
                  <Text fontSize="sm" color="blue.700">{recommended.immediate}</Text>
                </Box>
                <Box p={4} bg="orange.50" borderRadius="lg" border="1px solid" borderColor="orange.200">
                  <Text fontWeight="bold" color="orange.800" mb={1} fontSize="md">Short-term</Text>
                  <Text fontSize="sm" color="orange.700">{recommended.short_term}</Text>
                </Box>
                <Box p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                  <Text fontWeight="bold" color="green.800" mb={1} fontSize="md">Long-term</Text>
                  <Text fontSize="sm" color="green.700">{recommended.long_term}</Text>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default ExecutiveDashboardPage; 