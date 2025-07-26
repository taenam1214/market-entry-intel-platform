import { Box, Container, Grid, GridItem, Card, CardBody, Heading, Text, VStack, HStack, Stat, StatLabel, StatNumber, StatHelpText, Badge, Progress, Icon, Flex, SimpleGrid } from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiTarget, FiDollarSign, FiUsers, FiBarChart } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader';
import DataTable from '../../components/DataTable';

const ExecutiveDashboardPage = () => {
  const marketMetrics = [
    { label: 'Market Opportunity Score', value: '8.7/10', change: '+12%', trend: 'up', color: 'green' },
    { label: 'Competitive Intensity', value: 'Medium', change: '-5%', trend: 'down', color: 'blue' },
    { label: 'Entry Complexity', value: '6.2/10', change: '+3%', trend: 'up', color: 'orange' },
    { label: 'Revenue Potential', value: '$2.4M', change: '+18%', trend: 'up', color: 'purple' },
  ];

  const recentInsights = [
    { insight: 'Premium segment shows 40% less competition', priority: 'high', category: 'Opportunity' },
    { insight: 'Brand positioning gap identified in mid-market', priority: 'medium', category: 'Strategy' },
    { insight: 'Cultural alignment score: 85% positive', priority: 'low', category: 'Risk' },
  ];

  const topCompetitors = [
    { name: 'Competitor A', marketShare: '32%', strength: 'High', threat: 'Medium' },
    { name: 'Competitor B', marketShare: '28%', strength: 'Medium', threat: 'High' },
    { name: 'Competitor C', marketShare: '15%', strength: 'Low', threat: 'Low' },
  ];

  const columns = [
    { header: 'Competitor', accessor: 'name' },
    { header: 'Market Share', accessor: 'marketShare' },
    { header: 'Strength', accessor: 'strength' },
    { header: 'Threat Level', accessor: 'threat' },
  ];

  return (
    <Box p={6} bg="gray.50" minH="100vh" w="100%">
      <Container maxW="100%" px={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="xl" mb={2} color="gray.800">
              Executive Dashboard
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Market Entry Intelligence Overview
            </Text>
          </Box>

          {/* Key Metrics */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {marketMetrics.map((metric, index) => (
              <Card key={index} shadow="md" borderRadius="xl">
                <CardBody p={4}>
                  <VStack align="start" spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        {metric.label}
                      </Text>
                      <Icon
                        as={metric.trend === 'up' ? FiTrendingUp : FiTrendingDown}
                        color={metric.trend === 'up' ? 'green.500' : 'red.500'}
                        boxSize={3}
                      />
                    </HStack>
                    <Stat>
                      <StatNumber fontSize="xl" fontWeight="bold" color="gray.800">
                        {metric.value}
                      </StatNumber>
                    </Stat>
                    <HStack>
                      <Badge colorScheme={metric.color} variant="subtle" px={2} py={0.5} fontSize="sm">
                        {metric.change}
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
                        vs last month
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Main Content Grid */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            {/* Left Column */}
            <VStack spacing={4} align="stretch">
              {/* Market Opportunity Overview */}
              <Card shadow="lg" borderRadius="xl">
                <CardBody p={4}>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FiTarget} color="blue.500" boxSize={5} />
                      <Heading size="md">Market Opportunity Overview</Heading>
                    </HStack>
                    <Box w="full">
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="sm" fontWeight="medium">Market Entry Readiness</Text>
                        <Text fontSize="sm" fontWeight="bold">87%</Text>
                      </HStack>
                      <Progress value={87} colorScheme="blue" size="md" borderRadius="full" />
                    </Box>
                    <Text fontSize="sm" color="gray.600">
                      Your market entry strategy shows strong potential with identified opportunities
                      in the premium segment and clear competitive advantages.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              {/* Top Competitors */}
              <Card shadow="lg" borderRadius="xl">
                <CardBody p={4}>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FiUsers} color="purple.500" boxSize={5} />
                      <Heading size="md">Top Competitors Analysis</Heading>
                    </HStack>
                    <DataTable columns={columns} data={topCompetitors} />
                  </VStack>
                </CardBody>
              </Card>
            </VStack>

            {/* Right Column */}
            <VStack spacing={4} align="stretch">
              {/* Key Insights */}
              <Card shadow="lg" borderRadius="xl">
                <CardBody p={4}>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FiBarChart} color="green.500" boxSize={5} />
                      <Heading size="md">Key Insights</Heading>
                    </HStack>
                    <VStack align="start" spacing={2}>
                      {recentInsights.map((insight, index) => (
                        <Box key={index} p={2} bg="gray.50" borderRadius="lg" w="full">
                          <HStack justify="space-between" mb={1}>
                            <Badge
                              colorScheme={insight.priority === 'high' ? 'red' : insight.priority === 'medium' ? 'orange' : 'green'}
                              size="sm"
                              fontSize="sm"
                            >
                              {insight.priority}
                            </Badge>
                            <Badge colorScheme="blue" size="sm" fontSize="sm">
                              {insight.category}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.700">
                            {insight.insight}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Revenue Projection */}
              <Card shadow="lg" borderRadius="xl">
                <CardBody p={4}>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FiDollarSign} color="green.500" boxSize={5} />
                      <Heading size="md">Revenue Projection</Heading>
                    </HStack>
                    <VStack align="start" spacing={2}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Year 1 Revenue</Text>
                        <Text fontSize="xl" fontWeight="bold" color="green.600">$2.4M</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Year 3 Revenue</Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.600">$8.7M</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Market Share Target</Text>
                        <Text fontSize="xl" fontWeight="bold" color="purple.600">12%</Text>
                      </Box>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </Grid>

          {/* Action Items */}
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={4}>
              <VStack align="start" spacing={3}>
                <Heading size="md">Recommended Actions</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} w="full">
                  <Box p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                    <Text fontWeight="bold" color="blue.800" mb={1} fontSize="md">Immediate (Next 30 days)</Text>
                    <Text fontSize="sm" color="blue.700">Finalize premium segment positioning strategy</Text>
                  </Box>
                  <Box p={3} bg="orange.50" borderRadius="lg" border="1px solid" borderColor="orange.200">
                    <Text fontWeight="bold" color="orange.800" mb={1} fontSize="md">Short-term (3 months)</Text>
                    <Text fontSize="sm" color="orange.700">Launch pilot program in target market</Text>
                  </Box>
                  <Box p={3} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                    <Text fontWeight="bold" color="green.800" mb={1} fontSize="md">Long-term (6-12 months)</Text>
                    <Text fontSize="sm" color="green.700">Scale operations and capture 12% market share</Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default ExecutiveDashboardPage; 