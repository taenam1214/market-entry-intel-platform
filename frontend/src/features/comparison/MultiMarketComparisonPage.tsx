import React, { useState, useEffect } from 'react';
import {
  Box, Container, Heading, Text, Button, Input, VStack, HStack,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Spinner, useToast,
  Alert, AlertIcon, Flex, Card, CardBody, CardHeader, Tag, TagLabel,
  TagCloseButton, FormControl, FormLabel, Divider, Icon,
} from '@chakra-ui/react';
import { FiBarChart2, FiPlus, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

interface MarketScore {
  market: string;
  market_opportunity_score: number;
  competitive_intensity: string;
  competitive_intensity_score: number;
  entry_complexity_score: number;
  revenue_potential_y1: string;
  revenue_potential_y3: string;
  overall_attractiveness: number;
}

interface ComparisonResult {
  id: number;
  company_name: string;
  target_markets: string[];
  comparison: {
    ranked_markets: Array<{
      market: string;
      rank: number;
      overall_attractiveness: number;
      market_opportunity_score: number;
      competitive_intensity_score: number;
      entry_complexity_score: number;
      revenue_potential_y1: string;
      revenue_potential_y3: string;
    }>;
    recommendation: string;
  };
  individual_scores: MarketScore[];
  status: string;
}

interface PastComparison {
  id: number;
  company_name: string;
  industry: string;
  target_markets: string[];
  status: string;
  created_at: string;
}

const MultiMarketComparisonPage: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [marketInput, setMarketInput] = useState('');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [pastComparisons, setPastComparisons] = useState<PastComparison[]>([]);
  const toast = useToast();

  useEffect(() => {
    fetchPastComparisons();
  }, []);

  const fetchPastComparisons = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ADVANCED.MULTI_MARKET_REPORTS, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setPastComparisons(data);
      }
    } catch (err) {
      console.log('Failed to fetch past comparisons');
    }
  };

  const addMarket = () => {
    const trimmed = marketInput.trim();
    if (trimmed && !selectedMarkets.includes(trimmed) && selectedMarkets.length < 5) {
      setSelectedMarkets([...selectedMarkets, trimmed]);
      setMarketInput('');
    }
  };

  const removeMarket = (market: string) => {
    setSelectedMarkets(selectedMarkets.filter(m => m !== market));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMarket();
    }
  };

  const handleSubmit = async () => {
    if (!companyName || !industry || selectedMarkets.length < 2) {
      toast({ title: 'Please fill in all fields and select at least 2 markets', status: 'warning', duration: 3000 });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(API_ENDPOINTS.ADVANCED.MULTI_MARKET, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          company_name: companyName,
          industry: industry,
          target_markets: selectedMarkets,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      fetchPastComparisons();
      toast({ title: 'Comparison complete', status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Failed to run comparison', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, inverse = false) => {
    const adjusted = inverse ? 10 - score : score;
    if (adjusted >= 7) return 'green.500';
    if (adjusted >= 4) return 'orange.500';
    return 'red.500';
  };

  const getScoreBg = (score: number, inverse = false) => {
    const adjusted = inverse ? 10 - score : score;
    if (adjusted >= 7) return 'green.50';
    if (adjusted >= 4) return 'orange.50';
    return 'red.50';
  };

  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" color="gray.900" mb={2}>Multi-Market Comparison</Heading>
            <Text color="gray.600">Compare 2-5 target markets side by side to find the best entry opportunity.</Text>
          </Box>

          {/* Input Form */}
          <Card bg="white" shadow="sm" borderColor="gray.200" borderWidth="1px">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700" fontSize="sm">Company Name</FormLabel>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color="gray.700" fontSize="sm">Industry</FormLabel>
                    <Input
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Enter industry"
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel color="gray.700" fontSize="sm">Target Markets ({selectedMarkets.length}/5)</FormLabel>
                  <HStack>
                    <Input
                      value={marketInput}
                      onChange={(e) => setMarketInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a market and press Enter"
                      bg="white"
                      borderColor="gray.300"
                    />
                    <Button onClick={addMarket} leftIcon={<FiPlus />} colorScheme="purple" isDisabled={selectedMarkets.length >= 5}>
                      Add
                    </Button>
                  </HStack>
                  <HStack mt={2} flexWrap="wrap" spacing={2}>
                    {selectedMarkets.map(market => (
                      <Tag key={market} size="md" colorScheme="purple" borderRadius="full">
                        <TagLabel>{market}</TagLabel>
                        <TagCloseButton onClick={() => removeMarket(market)} />
                      </Tag>
                    ))}
                  </HStack>
                </FormControl>

                <Button
                  colorScheme="purple"
                  onClick={handleSubmit}
                  isLoading={loading}
                  loadingText="Analyzing markets..."
                  isDisabled={!companyName || !industry || selectedMarkets.length < 2}
                  leftIcon={<FiBarChart2 />}
                  size="lg"
                >
                  Compare Markets
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Loading */}
          {loading && (
            <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
              <CardBody>
                <VStack spacing={4} py={8}>
                  <Spinner size="xl" color="purple.500" />
                  <Text color="gray.600">Running parallel analysis across {selectedMarkets.length} markets...</Text>
                  <Text color="gray.400" fontSize="sm">This may take a few minutes</Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Results */}
          {result && (
            <VStack spacing={6} align="stretch">
              {/* Recommendation */}
              <Alert status="info" borderRadius="md" bg="purple.50" borderColor="purple.200" borderWidth="1px">
                <AlertIcon color="purple.500" />
                <Box>
                  <Text fontWeight="bold" color="gray.900">Recommendation</Text>
                  <Text color="gray.700">{result.comparison?.recommendation}</Text>
                </Box>
              </Alert>

              {/* Comparison Table */}
              <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                <CardHeader>
                  <Heading size="md" color="gray.900">Market Comparison</Heading>
                </CardHeader>
                <CardBody overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th color="gray.600">Metric</Th>
                        {result.comparison?.ranked_markets?.map(m => (
                          <Th key={m.market} textAlign="center" color="gray.600">
                            <VStack spacing={1}>
                              <Text>{m.market}</Text>
                              <Badge colorScheme={m.rank === 1 ? 'green' : m.rank === 2 ? 'blue' : 'gray'}>
                                #{m.rank}
                              </Badge>
                            </VStack>
                          </Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="medium" color="gray.700">Market Opportunity</Td>
                        {result.comparison?.ranked_markets?.map(m => (
                          <Td key={m.market} textAlign="center" bg={getScoreBg(m.market_opportunity_score)}>
                            <Text fontWeight="bold" color={getScoreColor(m.market_opportunity_score)}>
                              {m.market_opportunity_score}/10
                            </Text>
                          </Td>
                        ))}
                      </Tr>
                      <Tr>
                        <Td fontWeight="medium" color="gray.700">Competitive Intensity</Td>
                        {result.comparison?.ranked_markets?.map(m => (
                          <Td key={m.market} textAlign="center" bg={getScoreBg(m.competitive_intensity_score, true)}>
                            <Text fontWeight="bold" color={getScoreColor(m.competitive_intensity_score, true)}>
                              {m.competitive_intensity_score}/10
                            </Text>
                          </Td>
                        ))}
                      </Tr>
                      <Tr>
                        <Td fontWeight="medium" color="gray.700">Entry Complexity</Td>
                        {result.comparison?.ranked_markets?.map(m => (
                          <Td key={m.market} textAlign="center" bg={getScoreBg(m.entry_complexity_score, true)}>
                            <Text fontWeight="bold" color={getScoreColor(m.entry_complexity_score, true)}>
                              {m.entry_complexity_score}/10
                            </Text>
                          </Td>
                        ))}
                      </Tr>
                      <Tr>
                        <Td fontWeight="medium" color="gray.700">Revenue Y1</Td>
                        {result.comparison?.ranked_markets?.map(m => (
                          <Td key={m.market} textAlign="center">
                            <Text color="gray.800">{m.revenue_potential_y1}</Text>
                          </Td>
                        ))}
                      </Tr>
                      <Tr>
                        <Td fontWeight="medium" color="gray.700">Revenue Y3</Td>
                        {result.comparison?.ranked_markets?.map(m => (
                          <Td key={m.market} textAlign="center">
                            <Text color="gray.800">{m.revenue_potential_y3}</Text>
                          </Td>
                        ))}
                      </Tr>
                      <Tr bg="gray.50">
                        <Td fontWeight="bold" color="gray.900">Overall Score</Td>
                        {result.comparison?.ranked_markets?.map(m => (
                          <Td key={m.market} textAlign="center">
                            <Text fontWeight="bold" fontSize="lg" color={getScoreColor(m.overall_attractiveness)}>
                              {m.overall_attractiveness}/10
                            </Text>
                          </Td>
                        ))}
                      </Tr>
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </VStack>
          )}

          {/* Past Comparisons */}
          {pastComparisons.length > 0 && (
            <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
              <CardHeader>
                <Heading size="md" color="gray.900">Previous Comparisons</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {pastComparisons.map(pc => (
                    <Flex key={pc.id} p={3} borderWidth="1px" borderColor="gray.200" borderRadius="md" justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="medium" color="gray.900">{pc.company_name} ({pc.industry})</Text>
                        <HStack mt={1} spacing={2}>
                          {pc.target_markets.map(m => (
                            <Tag key={m} size="sm" colorScheme="gray">{m}</Tag>
                          ))}
                        </HStack>
                      </Box>
                      <Text fontSize="sm" color="gray.500">{new Date(pc.created_at).toLocaleDateString()}</Text>
                    </Flex>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default MultiMarketComparisonPage;
