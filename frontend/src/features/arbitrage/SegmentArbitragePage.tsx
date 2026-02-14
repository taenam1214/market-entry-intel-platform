import { Box, Container, Heading, Text, VStack, HStack, Card, CardBody, Spinner, Icon, Grid, Button, Select, Flex } from '@chakra-ui/react';
import { FiTarget, FiTrendingUp, FiUsers, FiZap, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import type { ArbitrageOpportunity } from '../../types/analysis';

const SegmentArbitragePage = () => {
  const { analysisData, loadSpecificReport } = useData();
  const navigate = useNavigate();

  // Use data from centralized context
  const arbitrageData = analysisData.arbitrageData;
  const hasAnalysisHistory = analysisData.hasAnalysisHistory;
  const isLoading = analysisData.isLoading;
  const availableReports = analysisData.availableReports || [];
  const currentReportId = analysisData.currentReportId;

  // Handle report selection
  const handleReportChange = async (reportId: string) => {
    if (reportId) {
      await loadSpecificReport(parseInt(reportId));
    }
  };

  if (isLoading) {
    return (
      <Box p={6} bg="gray.50" minH="100vh" w="100%">
        <Container maxW="100%" px={8}>
          <VStack py={8}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading arbitrage analysis...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Show empty state for users without analysis history
  if (!hasAnalysisHistory || !arbitrageData) {
    return (
      <Box p={6} bg="gray.50" minH="100vh" w="100%">
        <Container maxW="4xl" px={8}>
          <VStack spacing={8} py={16} textAlign="center">
            <VStack spacing={4}>
              <Icon as={FiTarget} boxSize={16} color="blue.500" />
              <Heading size="xl" color="gray.900">
                Segment Arbitrage Detection
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Discover untapped opportunities by analyzing gaps between market positioning
                and competitor landscapes. Our AI detects segments where your brand can capture
                higher value and underserved markets.
              </Text>
            </VStack>

            <Card
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              shadow="sm"
              borderRadius="xl"
              maxW="md"
              w="full"
            >
              <CardBody p={8}>
                <VStack spacing={4}>
                  <Icon as={FiZap} boxSize={8} color="blue.500" />
                  <Heading size="md" color="gray.900">
                    Ready for Arbitrage Analysis?
                  </Heading>
                  <Text fontSize="md" color="gray.600" textAlign="center">
                    Start your market analysis to unlock:
                  </Text>
                  <VStack spacing={2} align="start" w="full">
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.700">Competitor Positioning Gap Analysis</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="blue.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.700">Underserved Segment Identification</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="purple.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.700">Premium Pricing Opportunity Detection</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="orange.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.700">Strategic Repositioning Recommendations</Text>
                    </HStack>
                  </VStack>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    rightIcon={<FiArrowRight />}
                    onClick={() => navigate('/')}
                    w="full"
                    mt={4}
                    _focus={{ boxShadow: 'none', outline: 'none' }}
                  >
                    Start Your Analysis
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Text fontSize="sm" color="gray.500" maxW="lg">
              Our arbitrage detection algorithms analyze competitor positioning across multiple
              dimensions to identify strategic opportunities for differentiation and premium capture.
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box p={6} bg="gray.50" minH="100vh" w="100%">
      <Container maxW="100%" px={8}>
        <VStack spacing={8} align="stretch" maxW="7xl" mx="auto">
          {/* Header Section */}
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Heading size="xl" mb={2} color="gray.900">
                  Segment Arbitrage Detection
                </Heading>
                <Text fontSize="lg" color="gray.600">
                  Detects gaps between how a brand is currently positioned in its home market versus how similar brands are perceived in the target market. Recommends alternate positioning strategies where the brand can capture underserved or higher-value segments.
                </Text>
              </Box>

              {/* Report Selector */}
              {availableReports.length > 1 && (
                <Box minW="300px">
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Select Report:
                  </Text>
                  <Select
                    value={currentReportId?.toString() || ''}
                    onChange={(e) => handleReportChange(e.target.value)}
                    bg="white"
                    color="gray.900"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
                  >
                    {availableReports.map((report) => (
                      <option key={report.id} value={report.id}>
                        {report.company_name} → {report.target_market}
                      </option>
                    ))}
                  </Select>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {availableReports.length} report{availableReports.length > 1 ? 's' : ''} available
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>

          {(() => {
            if (arbitrageData && typeof arbitrageData === 'string') {
              return (
                <Card
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  shadow="sm"
                  borderRadius="xl"
                >
                  <CardBody p={8}>
                    <Box
                      whiteSpace="pre-wrap"
                      color="gray.900"
                      fontFamily="mono"
                      fontSize="sm"
                      p={6}
                      bg="gray.50"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      {arbitrageData}
                    </Box>
                  </CardBody>
                </Card>
              );
            } else if (arbitrageData && Array.isArray(arbitrageData)) {
              return (
                <VStack spacing={8} align="stretch">
                  {arbitrageData.map((opportunity: ArbitrageOpportunity, index: number) => (
                    <Card
                      key={index}
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      shadow="sm"
                      borderRadius="xl"
                      overflow="hidden"
                    >
                      <CardBody p={0}>
                        {/* Header Section */}
                        <Box p={8} borderBottom="1px solid" borderColor="gray.100">
                          <VStack spacing={4} align="stretch">
                            {/* Main Title */}
                            <Box>
                              <Heading size="lg" color="gray.900" fontWeight="bold" mb={2}>
                                {opportunity.segment_name}
                              </Heading>
                              <Text fontSize="md" color="gray.500" fontWeight="medium">
                                Market Opportunity
                              </Text>
                            </Box>

                            {/* Market Size */}
                            <Box
                              bg="green.50"
                              color="green.800"
                              p={4}
                              borderRadius="lg"
                              border="1px solid"
                              borderColor="green.200"
                              textAlign="center"
                            >
                              <Text fontSize="md" fontWeight="semibold" lineHeight="1.4">
                                {opportunity.market_size}
                              </Text>
                            </Box>
                          </VStack>
                        </Box>

                        {/* Content Grid */}
                        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={0}>
                          {/* Left Column */}
                          <Box p={8}>
                            <VStack spacing={6} align="stretch">
                              {/* Current Market Gap */}
                              <Box>
                                <HStack mb={3} spacing={3}>
                                  <Icon as={FiTarget} color="blue.500" boxSize={5} />
                                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                                    Current Market Gap
                                  </Text>
                                </HStack>
                                <Box
                                  p={4}
                                  bg="blue.50"
                                  borderRadius="lg"
                                  border="1px solid"
                                  borderColor="blue.100"
                                >
                                  <Text color="gray.700" lineHeight="1.6">
                                    {opportunity.current_gap}
                                  </Text>
                                </Box>
                              </Box>

                              {/* Positioning Opportunity */}
                              <Box>
                                <HStack mb={3} spacing={3}>
                                  <Icon as={FiTrendingUp} color="green.500" boxSize={5} />
                                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                                    Positioning Opportunity
                                  </Text>
                                </HStack>
                                <Box
                                  p={4}
                                  bg="green.50"
                                  borderRadius="lg"
                                  border="1px solid"
                                  borderColor="green.100"
                                >
                                  <Text color="gray.700" lineHeight="1.6">
                                    {opportunity.positioning_opportunity}
                                  </Text>
                                </Box>
                              </Box>
                            </VStack>
                          </Box>

                          {/* Right Column */}
                          <Box p={8}>
                            <VStack spacing={6} align="stretch">
                              {/* Competitive Advantage */}
                              <Box>
                                <HStack mb={3} spacing={3}>
                                  <Icon as={FiZap} color="orange.500" boxSize={5} />
                                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                                    Competitive Advantage
                                  </Text>
                                </HStack>
                                <Box
                                  p={4}
                                  bg="orange.50"
                                  borderRadius="lg"
                                  border="1px solid"
                                  borderColor="orange.100"
                                >
                                  <Text color="gray.700" lineHeight="1.6">
                                    {opportunity.competitive_advantage}
                                  </Text>
                                </Box>
                              </Box>

                              {/* Implementation Strategy */}
                              <Box>
                                <HStack mb={3} spacing={3}>
                                  <Icon as={FiUsers} color="teal.500" boxSize={5} />
                                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                                    Implementation Strategy
                                  </Text>
                                </HStack>
                                <Box
                                  p={4}
                                  bg="teal.50"
                                  borderRadius="lg"
                                  border="1px solid"
                                  borderColor="teal.100"
                                >
                                  <Text color="gray.700" lineHeight="1.6">
                                    {opportunity.implementation_strategy}
                                  </Text>
                                </Box>
                              </Box>
                            </VStack>
                          </Box>
                        </Grid>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              );
            } else {
              return (
                <Card
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  shadow="sm"
                  borderRadius="xl"
                >
                  <CardBody p={8}>
                    <VStack spacing={6} py={12}>
                      <Icon as={FiTarget} color="gray.400" boxSize={16} />
                      <Text fontSize="xl" color="gray.900" textAlign="center" fontWeight="medium">
                        No arbitrage analysis data available
                      </Text>
                      <Text color="gray.500" textAlign="center">
                        Please run a market analysis first to generate segment arbitrage insights.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              );
            }
          })()}
        </VStack>
      </Container>
    </Box>
  );
};

export default SegmentArbitragePage;
