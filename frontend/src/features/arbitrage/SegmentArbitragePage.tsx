import { Box, Container, Heading, Text, VStack, HStack, Card, CardBody, Badge, Spinner, Icon, Grid, Button } from '@chakra-ui/react';
import { FiTarget, FiTrendingUp, FiUsers, FiZap, FiArrowRight } from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';

const SegmentArbitragePage = () => {
  const { analysisData } = useData();
  const navigate = useNavigate();
  
  // Use data from centralized context
  const arbitrageData = analysisData.arbitrageData;
  const hasAnalysisHistory = analysisData.hasAnalysisHistory;
  const isLoading = analysisData.isLoading;

  // Remove the useEffect since we're now using centralized data context

  if (isLoading) {
    return (
      <Box p={6} w="100%">
        <Container maxW="100%" px={8}>
          <VStack py={8}>
            <Spinner size="xl" />
            <Text>Loading arbitrage analysis...</Text>
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
              <Icon as={FiTarget} boxSize={16} color="purple.400" />
              <Heading size="xl" color="gray.700">
                Segment Arbitrage Detection
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Discover untapped opportunities by analyzing gaps between market positioning 
                and competitor landscapes. Our AI detects segments where your brand can capture 
                higher value and underserved markets.
              </Text>
            </VStack>

            <VStack spacing={4} bg="white" p={8} borderRadius="xl" shadow="md" maxW="md" w="full">
              <Icon as={FiZap} boxSize={8} color="purple.500" />
              <Heading size="md" color="gray.800">
                Ready for Arbitrage Analysis?
              </Heading>
              <Text fontSize="md" color="gray.600" textAlign="center">
                Start your market analysis to unlock:
              </Text>
              <VStack spacing={2} align="start" w="full">
                <HStack>
                  <Badge colorScheme="green" borderRadius="full">✓</Badge>
                  <Text fontSize="sm">Competitor Positioning Gap Analysis</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="blue" borderRadius="full">✓</Badge>
                  <Text fontSize="sm">Underserved Segment Identification</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="purple" borderRadius="full">✓</Badge>
                  <Text fontSize="sm">Premium Pricing Opportunity Detection</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="orange" borderRadius="full">✓</Badge>
                  <Text fontSize="sm">Strategic Repositioning Recommendations</Text>
                </HStack>
              </VStack>
              <Button 
                colorScheme="purple" 
                size="lg" 
                rightIcon={<FiArrowRight />}
                onClick={() => navigate('/')}
                w="full"
                mt={4}
              >
                Start Your Analysis
              </Button>
            </VStack>

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
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <Box>
            <Heading size="xl" mb={2} color="gray.800">
              Segment Arbitrage Detection
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Detects gaps between how a brand is currently positioned in its home market versus how similar brands are perceived in the target market. Recommends alternate positioning strategies where the brand can capture underserved or higher-value segments.
            </Text>
          </Box>
          
          {(() => {
            console.log('Rendering arbitrage section with:', {
              arbitrageData,
              arbitrageDataType: typeof arbitrageData,
              isArray: Array.isArray(arbitrageData)
            });
            
            if (arbitrageData && typeof arbitrageData === 'string') {
              return (
                <Card shadow="xl" borderRadius="2xl" bg="white">
                  <CardBody p={8}>
                    <Box 
                      whiteSpace="pre-wrap" 
                      color="gray.800" 
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
                  {arbitrageData.map((opportunity: any, index: number) => (
                    <Card key={index} shadow="xl" borderRadius="2xl" bg="white" overflow="hidden">
                      <CardBody p={0}>
                        {/* Header Section */}
                        <Box p={8} bg="linear-gradient(135deg, purple.50 0%, blue.50 100%)" borderBottom="1px solid" borderColor="gray.200">
                          <VStack spacing={4} align="stretch">
                            {/* Main Title */}
                            <Box>
                              <Heading size="lg" color="purple.800" fontWeight="bold" mb={2}>
                                {opportunity.segment_name}
                              </Heading>
                              <Text fontSize="md" color="gray.600" fontWeight="medium">
                                Market Opportunity
                              </Text>
                            </Box>
                            
                            {/* Market Description */}
                            <Box 
                              bg="green.500" 
                              color="white" 
                              p={4} 
                              borderRadius="lg"
                              textAlign="center"
                            >
                              <Text fontSize="md" fontWeight="semibold" lineHeight="1.4">
                                {opportunity.market_size}
                              </Text>
                            </Box>
                          </VStack>
                        </Box>

                        {/* Content Grid */}
                        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={0} bg="gray.50">
                          {/* Left Column */}
                          <Box p={8}>
                            <VStack spacing={6} align="stretch">
                              {/* Current Market Gap */}
                              <Box>
                                <HStack mb={3} spacing={3}>
                                  <Icon as={FiTarget} color="blue.500" boxSize={5} />
                                  <Text fontSize="lg" fontWeight="bold" color="blue.700">
                                    Current Market Gap
                                  </Text>
                                </HStack>
                                <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                                  <Text color="gray.700" lineHeight="1.6">
                                    {opportunity.current_gap}
                                  </Text>
                                </Box>
                              </Box>

                              {/* Positioning Opportunity */}
                              <Box>
                                <HStack mb={3} spacing={3}>
                                  <Icon as={FiTrendingUp} color="green.500" boxSize={5} />
                                  <Text fontSize="lg" fontWeight="bold" color="green.700">
                                    Positioning Opportunity
                                  </Text>
                                </HStack>
                                <Box p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
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
                                  <Text fontSize="lg" fontWeight="bold" color="orange.700">
                                    Competitive Advantage
                                  </Text>
                                </HStack>
                                <Box p={4} bg="orange.50" borderRadius="lg" border="1px solid" borderColor="orange.200">
                                  <Text color="gray.700" lineHeight="1.6">
                                    {opportunity.competitive_advantage}
                                  </Text>
                                </Box>
                              </Box>

                              {/* Implementation Strategy */}
                              <Box>
                                <HStack mb={3} spacing={3}>
                                  <Icon as={FiUsers} color="teal.500" boxSize={5} />
                                  <Text fontSize="lg" fontWeight="bold" color="teal.700">
                                    Implementation Strategy
                                  </Text>
                                </HStack>
                                <Box p={4} bg="teal.50" borderRadius="lg" border="1px solid" borderColor="teal.200">
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
                <Card shadow="xl" borderRadius="2xl" bg="white">
                  <CardBody p={8}>
                    <VStack spacing={6} py={12}>
                      <Icon as={FiTarget} color="gray.400" boxSize={16} />
                      <Text fontSize="xl" color="gray.500" textAlign="center" fontWeight="medium">
                        No arbitrage analysis data available
                      </Text>
                      <Text color="gray.400" textAlign="center">
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