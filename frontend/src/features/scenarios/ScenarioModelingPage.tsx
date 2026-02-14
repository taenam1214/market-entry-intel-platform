import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Heading, Text, Button, VStack, HStack,
  Select, Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  Spinner, useToast, Card, CardBody, CardHeader, Badge, Stat,
  StatLabel, StatNumber, StatHelpText, StatArrow, SimpleGrid,
  FormControl, FormLabel, Divider, Icon, Alert, AlertIcon,
} from '@chakra-ui/react';
import { FiRefreshCw, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

interface Report {
  id: number;
  company_name: string;
  target_market: string;
  industry: string;
}

interface ScenarioResult {
  original_scores: {
    market_opportunity_score: number;
    competitive_intensity_score: number;
    entry_complexity_score: number;
    revenue_potential_y1: string;
    revenue_potential_y3: string;
  };
  adjusted_scores: {
    market_opportunity_score: number;
    competitive_intensity_score: number;
    entry_complexity_score: number;
    revenue_potential_y1: string;
    revenue_potential_y3: string;
  };
  deltas: Record<string, number>;
  variable_changes: Record<string, string>;
}

const ScenarioModelingPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const toast = useToast();

  // Scenario variables
  const [budget, setBudget] = useState('moderate');
  const [entryMode, setEntryMode] = useState('solo');
  const [timeline, setTimeline] = useState('12 months');
  const [teamSize, setTeamSize] = useState(5);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.REPORTS.LIST, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setReports(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.log('Failed to fetch reports');
    }
  };

  const runScenario = useCallback(async () => {
    if (!selectedReportId) {
      toast({ title: 'Select a report first', status: 'warning', duration: 3000 });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADVANCED.SCENARIO_MODEL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          report_id: selectedReportId,
          variable_changes: {
            budget: budget,
            entry_mode: entryMode,
            timeline: timeline,
            team_size: `${teamSize} people`,
          },
        }),
      });

      if (!response.ok) throw new Error('Scenario analysis failed');

      const data = await response.json();
      setResult(data);
    } catch (err) {
      toast({ title: 'Failed to run scenario', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [selectedReportId, budget, entryMode, timeline, teamSize, toast]);

  const getDeltaColor = (delta: number) => delta > 0 ? 'green.500' : delta < 0 ? 'red.500' : 'gray.500';

  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" color="gray.900" mb={2}>Scenario Modeling</Heading>
            <Text color="gray.600">Adjust variables to see how they impact your market entry scores.</Text>
          </Box>

          {/* Report Selector */}
          <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
            <CardBody>
              <FormControl>
                <FormLabel color="gray.700">Select Report to Model</FormLabel>
                <Select
                  placeholder="Choose a report..."
                  value={selectedReportId || ''}
                  onChange={(e) => setSelectedReportId(Number(e.target.value))}
                  borderColor="gray.300"
                >
                  {reports.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.company_name} → {r.target_market} ({r.industry})
                    </option>
                  ))}
                </Select>
              </FormControl>
            </CardBody>
          </Card>

          {/* Variable Controls */}
          <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
            <CardHeader>
              <Heading size="md" color="gray.900">Adjust Variables</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel color="gray.700">Budget Level</FormLabel>
                  <Select value={budget} onChange={(e) => setBudget(e.target.value)} borderColor="gray.300">
                    <option value="low">Low ($50K-$100K)</option>
                    <option value="moderate">Moderate ($100K-$500K)</option>
                    <option value="high">High ($500K-$1M)</option>
                    <option value="very_high">Very High ($1M+)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.700">Entry Mode</FormLabel>
                  <Select value={entryMode} onChange={(e) => setEntryMode(e.target.value)} borderColor="gray.300">
                    <option value="solo">Solo Entry</option>
                    <option value="joint_venture">Joint Venture</option>
                    <option value="franchise">Franchise</option>
                    <option value="acquisition">Acquisition</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.700">Timeline</FormLabel>
                  <Select value={timeline} onChange={(e) => setTimeline(e.target.value)} borderColor="gray.300">
                    <option value="6 months">6 Months</option>
                    <option value="12 months">12 Months</option>
                    <option value="18 months">18 Months</option>
                    <option value="24 months">24 Months</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.700">Team Size: {teamSize}</FormLabel>
                  <Slider value={teamSize} onChange={setTeamSize} min={1} max={50} step={1}>
                    <SliderTrack bg="gray.200">
                      <SliderFilledTrack bg="purple.500" />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <HStack justify="space-between" mt={1}>
                    <Text fontSize="xs" color="gray.500">1</Text>
                    <Text fontSize="xs" color="gray.500">50</Text>
                  </HStack>
                </FormControl>
              </SimpleGrid>

              <Button
                mt={6}
                colorScheme="purple"
                onClick={runScenario}
                isLoading={loading}
                loadingText="Modeling..."
                isDisabled={!selectedReportId}
                leftIcon={<FiRefreshCw />}
                size="lg"
                w="full"
              >
                Run Scenario
              </Button>
            </CardBody>
          </Card>

          {/* Results */}
          {result && (
            <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
              <CardHeader>
                <Heading size="md" color="gray.900">Scenario Results</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  {/* Market Opportunity */}
                  <Card borderWidth="1px" borderColor="gray.200">
                    <CardBody>
                      <Stat>
                        <StatLabel color="gray.600">Market Opportunity</StatLabel>
                        <StatNumber color="gray.900">
                          {result.adjusted_scores.market_opportunity_score}/10
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow type={result.deltas.market_opportunity_score >= 0 ? 'increase' : 'decrease'} />
                          {Math.abs(result.deltas.market_opportunity_score)} from original ({result.original_scores.market_opportunity_score}/10)
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  {/* Competitive Intensity */}
                  <Card borderWidth="1px" borderColor="gray.200">
                    <CardBody>
                      <Stat>
                        <StatLabel color="gray.600">Competitive Intensity</StatLabel>
                        <StatNumber color="gray.900">
                          {result.adjusted_scores.competitive_intensity_score}/10
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow type={result.deltas.competitive_intensity_score <= 0 ? 'increase' : 'decrease'} />
                          {Math.abs(result.deltas.competitive_intensity_score)} from original ({result.original_scores.competitive_intensity_score}/10)
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  {/* Entry Complexity */}
                  <Card borderWidth="1px" borderColor="gray.200">
                    <CardBody>
                      <Stat>
                        <StatLabel color="gray.600">Entry Complexity</StatLabel>
                        <StatNumber color="gray.900">
                          {result.adjusted_scores.entry_complexity_score}/10
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow type={result.deltas.entry_complexity_score <= 0 ? 'increase' : 'decrease'} />
                          {Math.abs(result.deltas.entry_complexity_score)} from original ({result.original_scores.entry_complexity_score}/10)
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Divider my={6} />

                {/* Revenue Comparison */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box p={4} borderWidth="1px" borderColor="gray.200" borderRadius="md">
                    <Text fontSize="sm" color="gray.500" mb={1}>Revenue Y1</Text>
                    <HStack justify="space-between">
                      <Box>
                        <Text fontSize="xs" color="gray.400">Original</Text>
                        <Text fontWeight="bold" color="gray.700">{result.original_scores.revenue_potential_y1}</Text>
                      </Box>
                      <Icon as={FiTrendingUp} color="purple.500" />
                      <Box textAlign="right">
                        <Text fontSize="xs" color="gray.400">Adjusted</Text>
                        <Text fontWeight="bold" color="purple.600">{result.adjusted_scores.revenue_potential_y1}</Text>
                      </Box>
                    </HStack>
                  </Box>
                  <Box p={4} borderWidth="1px" borderColor="gray.200" borderRadius="md">
                    <Text fontSize="sm" color="gray.500" mb={1}>Revenue Y3</Text>
                    <HStack justify="space-between">
                      <Box>
                        <Text fontSize="xs" color="gray.400">Original</Text>
                        <Text fontWeight="bold" color="gray.700">{result.original_scores.revenue_potential_y3}</Text>
                      </Box>
                      <Icon as={FiTrendingUp} color="purple.500" />
                      <Box textAlign="right">
                        <Text fontSize="xs" color="gray.400">Adjusted</Text>
                        <Text fontWeight="bold" color="purple.600">{result.adjusted_scores.revenue_potential_y3}</Text>
                      </Box>
                    </HStack>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default ScenarioModelingPage;
