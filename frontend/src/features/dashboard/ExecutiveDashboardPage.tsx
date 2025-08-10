import { Box, Container, Grid, GridItem, Card, CardBody, Heading, Text, VStack, HStack, Stat, StatLabel, StatNumber, StatHelpText, Badge, Progress, Icon, Flex, SimpleGrid, Button, Spinner, Collapse, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, IconButton } from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiTarget, FiDollarSign, FiUsers, FiBarChart, FiInfo, FiX, FiDownload } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader';
import DataTable from '../../components/DataTable';
import { useEffect, useState } from 'react';
import React from 'react';

const ExecutiveDashboardPage = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [competitorSummary, setCompetitorSummary] = useState<any>(null);
  const [loadingCompetitorSummary, setLoadingCompetitorSummary] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [competitorError, setCompetitorError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const data = localStorage.getItem('dashboardData');
    if (data) {
      setDashboard(JSON.parse(data));
    }
    const competitor = localStorage.getItem('competitorSummary');
    console.log('Raw competitor data from localStorage:', competitor);
    if (competitor) {
      try {
        const parsedCompetitor = JSON.parse(competitor);
        console.log('Parsed competitor data:', parsedCompetitor);
        setCompetitorSummary(parsedCompetitor);
      } catch (e) {
        console.log('Failed to parse competitor data, using as string:', e);
        setCompetitorSummary(competitor);
      }
    } else {
      console.log('No competitor data found in localStorage');
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

  const handleMetricClick = (metric: any) => {
    setSelectedMetric(metric);
    onOpen();
  };

  // Function to download report as text file
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

  // Function to parse and format markdown-like content
  const formatReportContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    const formattedElements: React.JSX.Element[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('# ')) {
        // Main title
        formattedElements.push(
          <Heading key={index} size="lg" color="purple.800" mb={3} mt={5}>
            {trimmedLine.replace('# ', '')}
          </Heading>
        );
      } else if (trimmedLine.startsWith('## ')) {
        // Section header
        formattedElements.push(
          <Heading key={index} size="md" color="blue.700" mb={2} mt={4}>
            {trimmedLine.replace('## ', '')}
          </Heading>
        );
      } else if (trimmedLine.startsWith('### ')) {
        // Subsection header
        formattedElements.push(
          <Heading key={index} size="sm" color="teal.700" mb={2} mt={3}>
            {trimmedLine.replace('### ', '')}
          </Heading>
        );
      } else if (trimmedLine.startsWith('#### ')) {
        // Sub-subsection header
        formattedElements.push(
          <Text key={index} fontSize="sm" color="gray.700" mb={2} mt={3} fontWeight="semibold">
            {trimmedLine.replace('#### ', '')}
          </Text>
        );
      } else if (trimmedLine.startsWith('- **')) {
        // Bold bullet points
        const text = trimmedLine.replace('- **', '').replace('**:', '');
        const description = trimmedLine.split('**:').slice(1).join('**:');
        formattedElements.push(
          <Box key={index} mb={2} pl={4}>
            <Text fontSize="sm" fontWeight="bold" color="gray.800" display="inline">
              {text}:
            </Text>
            <Text fontSize="sm" color="gray.700" display="inline" ml={2}>
              {description}
            </Text>
          </Box>
        );
      } else if (trimmedLine.startsWith('- ')) {
        // Regular bullet points
        formattedElements.push(
          <Box key={index} mb={1} pl={4}>
            <Text fontSize="sm" color="gray.700">• {trimmedLine.replace('- ', '')}</Text>
          </Box>
        );
      } else if (trimmedLine.includes('**') && trimmedLine.includes('**')) {
        // Bold text within paragraph
        const parts = trimmedLine.split('**');
        const formattedParts = parts.map((part, partIndex) => {
          if (partIndex % 2 === 1) {
            return <Text key={partIndex} as="span" fontSize="sm" fontWeight="bold" color="gray.800">{part}</Text>;
          }
          return <Text key={partIndex} as="span" fontSize="sm" color="gray.700">{part}</Text>;
        });
        formattedElements.push(
          <Text key={index} mb={3} fontSize="sm" lineHeight="1.6">
            {formattedParts}
          </Text>
        );
      } else if (trimmedLine.length > 0) {
        // Regular paragraph
        formattedElements.push(
          <Text key={index} mb={3} fontSize="sm" color="gray.700" lineHeight="1.6">
            {trimmedLine}
          </Text>
        );
      } else {
        // Empty line for spacing
        formattedElements.push(<Box key={index} h={2} />);
      }
    });

    return formattedElements;
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
              <Card key={idx} shadow="xl" borderRadius="2xl" bg={`${metric.color}.50`} _hover={{ boxShadow: '2xl', transform: 'translateY(-2px)' }} transition="all 0.2s">
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
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme={metric.color}
                      leftIcon={<FiInfo />}
                      onClick={() => handleMetricClick(metric)}
                      w="full"
                      mt={2}
                      _hover={{ bg: `${metric.color}.100` }}
                    >
                      View Details
                    </Button>
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
              {(() => {
                console.log('Rendering competitor section with:', {
                  loadingCompetitorSummary,
                  competitorError,
                  competitorSummary,
                  competitorSummaryType: typeof competitorSummary,
                  isArray: Array.isArray(competitorSummary)
                });
                
                if (loadingCompetitorSummary) {
                  return <VStack py={8}><Spinner size="xl" /></VStack>;
                } else if (competitorError) {
                  return <Text color="red.500">{competitorError}</Text>;
                } else if (competitorSummary && typeof competitorSummary === 'string') {
                  return (
                    <Box whiteSpace="pre-wrap" color="gray.800" fontFamily="mono" fontSize="sm" p={2} bg="gray.50" borderRadius="md">
                      {competitorSummary}
                    </Box>
                  );
                } else if (competitorSummary && Array.isArray(competitorSummary)) {
                  return (
                    <VStack align="start" spacing={4}>
                      {/* Competitor Overview Stats */}
                      <Box w="full" p={4} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200">
                        <HStack justify="space-between" mb={3}>
                          <Text fontWeight="bold" color="purple.800" fontSize="md">Market Overview</Text>
                          <Badge colorScheme="purple" variant="solid">
                            {competitorSummary.length} Competitors Analyzed
                          </Badge>
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="bold" color="purple.700">
                              {competitorSummary.filter((c: any) => c.market_share !== 'unknown').length}
                            </Text>
                            <Text fontSize="sm" color="purple.600">With Market Share Data</Text>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="bold" color="purple.700">
                              {competitorSummary.filter((c: any) => c.years_in_market).length}
                            </Text>
                            <Text fontSize="sm" color="purple.600">With Experience Data</Text>
                          </Box>
                          <Box textAlign="center">
                            <Text fontSize="lg" fontWeight="bold" color="purple.700">
                              {competitorSummary.filter((c: any) => c.headquarters).length}
                            </Text>
                            <Text fontSize="sm" color="purple.600">With Location Data</Text>
                          </Box>
                        </SimpleGrid>
                      </Box>

                      {/* Detailed Competitor Cards */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        {competitorSummary.map((competitor: any, index: number) => (
                          <Box key={index} p={4} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" w="full" _hover={{ boxShadow: 'md', transform: 'translateY(-1px)' }} transition="all 0.2s">
                            <VStack align="start" spacing={3}>
                              <HStack justify="space-between" w="full">
                                <Text fontWeight="bold" color="purple.700" fontSize="md">
                                  {competitor.name}
                                </Text>
                                <Badge colorScheme={competitor.market_share === 'unknown' ? 'gray' : 'green'} variant="subtle">
                                  {competitor.market_share}
                                </Badge>
                              </HStack>
                              
                              <Text color="gray.700" fontSize="sm" lineHeight="1.5">
                                {competitor.description}
                              </Text>

                              <SimpleGrid columns={2} spacing={3} w="full">
                                {competitor.years_in_market && (
                                  <Box>
                                    <Text fontSize="xs" color="gray.500" fontWeight="semibold">Years in Market</Text>
                                    <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                      {competitor.years_in_market} years
                                    </Text>
                                  </Box>
                                )}
                                
                                {competitor.headquarters && (
                                  <Box>
                                    <Text fontSize="xs" color="gray.500" fontWeight="semibold">Headquarters</Text>
                                    <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                      {competitor.headquarters}
                                    </Text>
                                  </Box>
                                )}
                              </SimpleGrid>

                              {/* Competitive Positioning Indicators */}
                              <Box w="full">
                                <Text fontSize="xs" color="gray.500" fontWeight="semibold" mb={1}>Competitive Profile</Text>
                                <HStack spacing={2} flexWrap="wrap">
                                  {competitor.market_share !== 'unknown' && (
                                    <Badge colorScheme="green" variant="outline" size="sm">
                                      Market Leader
                                    </Badge>
                                  )}
                                  {parseInt(competitor.years_in_market) > 10 && (
                                    <Badge colorScheme="blue" variant="outline" size="sm">
                                      Established Player
                                    </Badge>
                                  )}
                                  {parseInt(competitor.years_in_market) < 5 && (
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
                      {competitorSummary.filter((c: any) => c.market_share !== 'unknown').length > 0 && (
                        <Box w="full" p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                          <Text fontWeight="bold" color="green.800" mb={3}>Market Share Analysis</Text>
                          <VStack align="start" spacing={2}>
                            {competitorSummary
                              .filter((c: any) => c.market_share !== 'unknown')
                              .sort((a: any, b: any) => parseFloat(b.market_share) - parseFloat(a.market_share))
                              .map((competitor: any, index: number) => (
                                <HStack key={index} w="full" justify="space-between">
                                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                    {competitor.name}
                                  </Text>
                                  <HStack spacing={2}>
                                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                                      {competitor.market_share}
                                    </Text>
                                    <Progress 
                                      value={parseFloat(competitor.market_share)} 
                                      size="sm" 
                                      colorScheme="green" 
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
                  return <Text color="gray.500">No competitor data available.</Text>;
                }
              })()}
            </CardBody>
          </Card>

          {/* Full Competitor Analysis Report Section */}
          {researchReport && (
            <Card shadow="lg" borderRadius="xl">
              <CardBody p={6}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md" color="purple.700">Full Competitor Analysis Report</Heading>
                  <IconButton
                    aria-label="Download report as text file"
                    icon={<FiDownload />}
                    colorScheme="purple"
                    variant="outline"
                    size="sm"
                    onClick={downloadReport}
                    _hover={{ bg: 'purple.50' }}
                  />
                </Flex>
                <Button mb={4} colorScheme="purple" variant="outline" onClick={() => setShowFullReport(v => !v)}>
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

      {/* Metric Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={`${selectedMetric?.color}.700`}>
            {selectedMetric?.label} - Detailed Analysis
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={4}>
              <HStack w="full" justify="space-between" p={4} bg={`${selectedMetric?.color}.50`} borderRadius="lg">
                <VStack align="start" spacing={1}>
                  <Text fontSize="lg" fontWeight="bold" color={`${selectedMetric?.color}.900`}>
                    {selectedMetric?.value}
                  </Text>
                  <Badge colorScheme={selectedMetric?.color} variant="solid">
                    {selectedMetric?.change}
                  </Badge>
                </VStack>
                <Icon as={selectedMetric?.icon} color={`${selectedMetric?.color}.500`} boxSize={8} />
              </HStack>
              
              <Box w="full">
                <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={3}>
                  Analysis & Rationale
                </Text>
                <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                  <Text fontSize="sm" color="gray.700" lineHeight="1.6">
                    {selectedMetric?.explanation || 'No detailed explanation available for this metric.'}
                  </Text>
                </Box>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme={selectedMetric?.color} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ExecutiveDashboardPage; 