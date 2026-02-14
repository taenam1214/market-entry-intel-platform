import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Badge,
  SimpleGrid,
  Spinner,
  Divider,
  Progress,
  Stat,
  StatNumber,
  Icon,
  Alert,
  AlertIcon,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FiTrendingUp, FiTarget, FiDollarSign, FiUsers, FiCheckCircle, FiAlertTriangle, FiZap } from 'react-icons/fi';
import { API_ENDPOINTS } from '../../config/api';

interface SharedDashboard {
  market_opportunity_score: number;
  competitive_intensity: string;
  competitive_intensity_score: number;
  entry_complexity_score: number;
  revenue_potential: string;
  market_entry_readiness: number;
  readiness_description: string;
}

interface SharedInsight {
  type: 'opportunity' | 'risk' | 'strategy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

interface SharedCompetitor {
  name: string;
  description: string;
  market_share: string;
  years_in_market: string;
  headquarters: string;
}

interface SharedRevenueProjections {
  year_1: string;
  year_3: string;
  market_share_y1: string;
  market_share_y3: string;
}

interface SharedActions {
  immediate: string[] | string;
  short_term: string[] | string;
  long_term: string[] | string;
}

interface SharedReportData {
  company_name: string;
  target_market: string;
  industry: string;
  dashboard: SharedDashboard;
  key_insights: SharedInsight[];
  competitor_analysis: SharedCompetitor[];
  revenue_projections: SharedRevenueProjections;
  recommended_actions: SharedActions;
  created_at?: string;
}

const INSIGHT_ICONS: Record<string, React.ElementType> = {
  opportunity: FiTrendingUp,
  risk: FiAlertTriangle,
  strategy: FiZap,
};

const INSIGHT_COLORS: Record<string, string> = {
  opportunity: 'green',
  risk: 'red',
  strategy: 'blue',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'red',
  medium: 'orange',
  low: 'gray',
};

const SharedReportPage = () => {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<SharedReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedReport = async () => {
      if (!token) {
        setError('Invalid share link.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(API_ENDPOINTS.SHARING.SHARED_REPORT(token));
        if (response.status === 404) {
          setError('This shared report was not found or the link has expired.');
          setLoading(false);
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to load shared report.');
        }
        const data = await response.json();
        setReport(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchSharedReport();
  }, [token]);

  const normalizeActions = (actions: string[] | string | undefined): string[] => {
    if (!actions) return [];
    if (Array.isArray(actions)) return actions;
    return (actions || '').split('\n').map((s) => s.replace(/^[\s\-*]+/, '').trim()).filter(Boolean);
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="#fafafa" py={8}>
        <Container maxW="5xl">
          <VStack spacing={6} py={20}>
            <Spinner size="lg" color="gray.500" />
            <Text color="gray.500">Loading shared report...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error || !report) {
    return (
      <Box minH="100vh" bg="#fafafa" py={8}>
        <Container maxW="5xl">
          <VStack spacing={6} py={20}>
            <Alert status="error" borderRadius="md" maxW="lg">
              <AlertIcon />
              <AlertDescription>{error || 'Report not found.'}</AlertDescription>
            </Alert>
            <Text fontSize="sm" color="gray.400">
              If you believe this is an error, please contact the person who shared this link.
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  const { dashboard, key_insights, competitor_analysis, revenue_projections, recommended_actions } = report;

  return (
    <Box minH="100vh" bg="#fafafa" py={8}>
      <Container maxW="5xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full" mb={3}>
              Shared Report
            </Badge>
            <Heading size="xl" color="gray.900" mb={2}>
              {report.company_name}
            </Heading>
            <Text fontSize="lg" color="gray.500">
              Market Entry Analysis: {report.target_market}
            </Text>
            <Text fontSize="sm" color="gray.400" mt={1}>
              Industry: {report.industry}
              {report.created_at && ` | Generated: ${new Date(report.created_at).toLocaleDateString()}`}
            </Text>
          </Box>

          {/* Dashboard Metrics */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
              <CardBody p={5}>
                <VStack spacing={3} align="start">
                  <HStack spacing={2}>
                    <Icon as={FiTarget} color="blue.500" boxSize={5} />
                    <Text fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase">
                      Market Opportunity
                    </Text>
                  </HStack>
                  <Stat>
                    <StatNumber fontSize="2xl" color="gray.900">
                      {dashboard.market_opportunity_score}/10
                    </StatNumber>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>

            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
              <CardBody p={5}>
                <VStack spacing={3} align="start">
                  <HStack spacing={2}>
                    <Icon as={FiUsers} color="orange.500" boxSize={5} />
                    <Text fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase">
                      Competitive Intensity
                    </Text>
                  </HStack>
                  <Stat>
                    <StatNumber fontSize="2xl" color="gray.900">
                      {dashboard.competitive_intensity}
                    </StatNumber>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>

            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
              <CardBody p={5}>
                <VStack spacing={3} align="start">
                  <HStack spacing={2}>
                    <Icon as={FiTrendingUp} color="purple.500" boxSize={5} />
                    <Text fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase">
                      Entry Complexity
                    </Text>
                  </HStack>
                  <Stat>
                    <StatNumber fontSize="2xl" color="gray.900">
                      {dashboard.entry_complexity_score}/10
                    </StatNumber>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>

            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
              <CardBody p={5}>
                <VStack spacing={3} align="start">
                  <HStack spacing={2}>
                    <Icon as={FiDollarSign} color="green.500" boxSize={5} />
                    <Text fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase">
                      Revenue Potential
                    </Text>
                  </HStack>
                  <Stat>
                    <StatNumber fontSize="2xl" color="gray.900">
                      {dashboard.revenue_potential}
                    </StatNumber>
                  </Stat>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Market Readiness */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardBody p={5}>
              <HStack justify="space-between" mb={3}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Market Entry Readiness</Text>
                <Text fontSize="sm" fontWeight="bold" color="gray.900">
                  {dashboard.market_entry_readiness}%
                </Text>
              </HStack>
              <Progress
                value={dashboard.market_entry_readiness}
                size="sm"
                borderRadius="full"
                colorScheme={dashboard.market_entry_readiness >= 70 ? 'green' : dashboard.market_entry_readiness >= 40 ? 'orange' : 'red'}
              />
              {dashboard.readiness_description && (
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {dashboard.readiness_description}
                </Text>
              )}
            </CardBody>
          </Card>

          {/* Key Insights */}
          {key_insights && key_insights.length > 0 && (
            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
              <CardHeader pb={2}>
                <Heading size="md" color="gray.900">Key Insights</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={0} align="stretch" divider={<Divider borderColor="gray.100" />}>
                  {key_insights.map((insight, idx) => (
                    <HStack key={idx} py={4} spacing={4} align="start">
                      <Icon
                        as={INSIGHT_ICONS[insight.type] || FiTarget}
                        color={`${INSIGHT_COLORS[insight.type] || 'gray'}.500`}
                        boxSize={5}
                        mt={0.5}
                      />
                      <Box flex={1}>
                        <HStack spacing={2} mb={1}>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                            {insight.title}
                          </Text>
                          <Badge
                            colorScheme={PRIORITY_COLORS[insight.priority] || 'gray'}
                            variant="subtle"
                            fontSize="2xs"
                            borderRadius="full"
                          >
                            {insight.priority}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600" lineHeight="1.5">
                          {insight.description}
                        </Text>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Competitor Analysis */}
          {competitor_analysis && competitor_analysis.length > 0 && (
            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
              <CardHeader pb={2}>
                <Heading size="md" color="gray.900">Competitor Analysis</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {competitor_analysis.map((comp, idx) => (
                    <Box key={idx} p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100">
                      <Text fontSize="sm" fontWeight="bold" color="gray.900" mb={1}>
                        {comp.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600" mb={2} lineHeight="1.5">
                        {comp.description}
                      </Text>
                      <HStack spacing={4} wrap="wrap">
                        {comp.market_share && (
                          <Text fontSize="xs" color="gray.500">
                            Market Share: <Text as="span" fontWeight="medium" color="gray.700">{comp.market_share}</Text>
                          </Text>
                        )}
                        {comp.headquarters && (
                          <Text fontSize="xs" color="gray.500">
                            HQ: <Text as="span" fontWeight="medium" color="gray.700">{comp.headquarters}</Text>
                          </Text>
                        )}
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          )}

          {/* Revenue Projections */}
          {revenue_projections && (
            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
              <CardHeader pb={2}>
                <Heading size="md" color="gray.900">Revenue Projections</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100" textAlign="center">
                    <Text fontSize="xs" color="gray.500" mb={1}>Year 1 Revenue</Text>
                    <Text fontSize="lg" fontWeight="bold" color="gray.900">{revenue_projections.year_1}</Text>
                  </Box>
                  <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100" textAlign="center">
                    <Text fontSize="xs" color="gray.500" mb={1}>Year 3 Revenue</Text>
                    <Text fontSize="lg" fontWeight="bold" color="gray.900">{revenue_projections.year_3}</Text>
                  </Box>
                  <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100" textAlign="center">
                    <Text fontSize="xs" color="gray.500" mb={1}>Market Share Y1</Text>
                    <Text fontSize="lg" fontWeight="bold" color="gray.900">{revenue_projections.market_share_y1}</Text>
                  </Box>
                  <Box p={4} bg="#fafafa" borderRadius="lg" border="1px solid" borderColor="gray.100" textAlign="center">
                    <Text fontSize="xs" color="gray.500" mb={1}>Market Share Y3</Text>
                    <Text fontSize="lg" fontWeight="bold" color="gray.900">{revenue_projections.market_share_y3}</Text>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
          )}

          {/* Recommended Actions */}
          {recommended_actions && (
            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
              <CardHeader pb={2}>
                <Heading size="md" color="gray.900">Recommended Actions</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={5} align="stretch">
                  {normalizeActions(recommended_actions.immediate).length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                        Immediate (0-3 months)
                      </Text>
                      <List spacing={2}>
                        {normalizeActions(recommended_actions.immediate).map((action, idx) => (
                          <ListItem key={idx} fontSize="sm" color="gray.600" display="flex" alignItems="start">
                            <ListIcon as={FiCheckCircle} color="green.500" mt={0.5} />
                            {action}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {normalizeActions(recommended_actions.short_term).length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                        Short-term (3-12 months)
                      </Text>
                      <List spacing={2}>
                        {normalizeActions(recommended_actions.short_term).map((action, idx) => (
                          <ListItem key={idx} fontSize="sm" color="gray.600" display="flex" alignItems="start">
                            <ListIcon as={FiCheckCircle} color="blue.500" mt={0.5} />
                            {action}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {normalizeActions(recommended_actions.long_term).length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                        Long-term (1-3 years)
                      </Text>
                      <List spacing={2}>
                        {normalizeActions(recommended_actions.long_term).map((action, idx) => (
                          <ListItem key={idx} fontSize="sm" color="gray.600" display="flex" alignItems="start">
                            <ListIcon as={FiCheckCircle} color="purple.500" mt={0.5} />
                            {action}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Footer */}
          <Box textAlign="center" py={6}>
            <Divider borderColor="gray.200" mb={6} />
            <Text fontSize="sm" color="gray.400">
              Powered by <Text as="span" fontWeight="semibold" color="gray.500">KairosAI</Text> Market Entry Intelligence Platform
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default SharedReportPage;
