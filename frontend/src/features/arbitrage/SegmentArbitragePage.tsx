import { Box, Container, Heading, Text, VStack, HStack, Card, CardBody, Badge, SimpleGrid, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const SegmentArbitragePage = () => {
  const [arbitrageData, setArbitrageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const arbitrage = localStorage.getItem('segmentArbitrage');
    console.log('Raw arbitrage data from localStorage:', arbitrage);
    if (arbitrage) {
      try {
        const parsedArbitrage = JSON.parse(arbitrage);
        console.log('Parsed arbitrage data:', parsedArbitrage);
        setArbitrageData(parsedArbitrage);
      } catch (e) {
        console.log('Failed to parse arbitrage data, using as string:', e);
        setArbitrageData(arbitrage);
      }
    } else {
      console.log('No arbitrage data found in localStorage');
    }
    setLoading(false);
  }, []);

  if (loading) {
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

  return (
    <Box p={6} w="100%">
      <Container maxW="100%" px={8}>
        <Heading size="xl" mb={2} color="gray.800">
          Segment Arbitrage Detection
        </Heading>
        <Text fontSize="lg" color="gray.600" mb={6}>
          Detects gaps between how a brand is currently positioned in its home market versus how similar brands are perceived in the target market. Recommends alternate positioning strategies where the brand can capture underserved or higher-value segments.
        </Text>
        
        {(() => {
          console.log('Rendering arbitrage section with:', {
            arbitrageData,
            arbitrageDataType: typeof arbitrageData,
            isArray: Array.isArray(arbitrageData)
          });
          
          if (arbitrageData && typeof arbitrageData === 'string') {
            return (
              <Box whiteSpace="pre-wrap" color="gray.800" fontFamily="mono" fontSize="sm" p={4} bg="gray.50" borderRadius="md">
                {arbitrageData}
              </Box>
            );
          } else if (arbitrageData && Array.isArray(arbitrageData)) {
            return (
              <VStack align="start" spacing={6}>
                {arbitrageData.map((opportunity: any, index: number) => (
                  <Card key={index} shadow="lg" borderRadius="xl" w="full">
                    <CardBody p={6}>
                      <VStack align="start" spacing={4}>
                        <HStack justify="space-between" w="full">
                          <Heading size="md" color="purple.700">
                            {opportunity.segment_name}
                          </Heading>
                          <Badge colorScheme="green" variant="subtle" fontSize="sm">
                            {opportunity.market_size}
                          </Badge>
                        </HStack>
                        
                        <Box>
                          <Text fontWeight="bold" color="blue.700" mb={1}>
                            Current Market Gap:
                          </Text>
                          <Text color="gray.700" mb={3}>
                            {opportunity.current_gap}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" color="green.700" mb={1}>
                            Positioning Opportunity:
                          </Text>
                          <Text color="gray.700" mb={3}>
                            {opportunity.positioning_opportunity}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" color="orange.700" mb={1}>
                            Competitive Advantage:
                          </Text>
                          <Text color="gray.700" mb={3}>
                            {opportunity.competitive_advantage}
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" color="teal.700" mb={1}>
                            Implementation Strategy:
                          </Text>
                          <Text color="gray.700">
                            {opportunity.implementation_strategy}
                          </Text>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            );
          } else {
            return (
              <Box p={6} bg="gray.50" borderRadius="md">
                <Text color="gray.500" textAlign="center">
                  No arbitrage analysis data available. Please run a market analysis first.
                </Text>
              </Box>
            );
          }
        })()}
      </Container>
    </Box>
  );
};

export default SegmentArbitragePage; 