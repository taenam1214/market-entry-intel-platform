import React, { useState, useEffect } from 'react';
import {
  Box, Container, Heading, Text, Button, VStack, HStack,
  Select, Spinner, useToast, Card, CardBody, CardHeader,
  SimpleGrid, Icon, Badge, FormControl, FormLabel, Divider,
  Accordion, AccordionItem, AccordionButton, AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FiShield, FiGlobe, FiUsers, FiLink } from 'react-icons/fi';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import ReactMarkdown from 'react-markdown';

interface Report {
  id: number;
  company_name: string;
  target_market: string;
  industry: string;
  deep_dives?: Record<string, { module: string; content: string; generated_at: string }>;
}

const modules = [
  {
    id: 'regulatory',
    title: 'Regulatory Compliance',
    description: 'Detailed compliance checklist with costs, timelines, and required permits.',
    icon: FiShield,
    color: 'blue',
  },
  {
    id: 'cultural',
    title: 'Cultural Adaptation',
    description: 'Cultural brief covering business etiquette, consumer behavior, and localization.',
    icon: FiGlobe,
    color: 'green',
  },
  {
    id: 'talent',
    title: 'Talent Landscape',
    description: 'Hiring guide with salary benchmarks, recruitment channels, and labor laws.',
    icon: FiUsers,
    color: 'purple',
  },
  {
    id: 'partners',
    title: 'Local Partners',
    description: 'Partner recommendations with selection criteria and partnership structures.',
    icon: FiLink,
    color: 'orange',
  },
];

const DeepDivePage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loadingModule, setLoadingModule] = useState<string | null>(null);
  const [deepDiveResults, setDeepDiveResults] = useState<Record<string, { content: string; generated_at: string }>>({});
  const toast = useToast();

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
        const reportList = Array.isArray(data) ? data : data.results || [];
        setReports(reportList);
      }
    } catch (err) {
      console.log('Failed to fetch reports');
    }
  };

  const handleReportSelect = (reportId: number) => {
    setSelectedReportId(reportId);
    const report = reports.find(r => r.id === reportId);
    setSelectedReport(report || null);
    // Load any existing deep dives
    if (report?.deep_dives) {
      setDeepDiveResults(report.deep_dives);
    } else {
      setDeepDiveResults({});
    }
  };

  const runDeepDive = async (module: string) => {
    if (!selectedReportId) {
      toast({ title: 'Select a report first', status: 'warning', duration: 3000 });
      return;
    }

    setLoadingModule(module);
    try {
      const response = await fetch(API_ENDPOINTS.ADVANCED.DEEP_DIVE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          report_id: selectedReportId,
          module: module,
        }),
      });

      if (!response.ok) throw new Error('Deep dive failed');

      const data = await response.json();
      setDeepDiveResults(prev => ({
        ...prev,
        [module]: data.result,
      }));
      toast({ title: `${module} deep dive complete`, status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Failed to run deep dive', status: 'error', duration: 3000 });
    } finally {
      setLoadingModule(null);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" color="gray.900" mb={2}>Deep-Dive Research</Heading>
            <Text color="gray.600">Run specialized research modules on your market analysis reports.</Text>
          </Box>

          {/* Report Selector */}
          <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
            <CardBody>
              <FormControl>
                <FormLabel color="gray.700">Select Report</FormLabel>
                <Select
                  placeholder="Choose a report..."
                  value={selectedReportId || ''}
                  onChange={(e) => handleReportSelect(Number(e.target.value))}
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

          {/* Module Cards */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {modules.map(mod => {
              const hasResult = !!deepDiveResults[mod.id];
              const isLoading = loadingModule === mod.id;

              return (
                <Card
                  key={mod.id}
                  bg="white"
                  shadow="sm"
                  borderWidth="1px"
                  borderColor={hasResult ? `${mod.color}.200` : 'gray.200'}
                >
                  <CardBody>
                    <HStack spacing={4} mb={3}>
                      <Box p={2} borderRadius="md" bg={`${mod.color}.50`}>
                        <Icon as={mod.icon} boxSize={5} color={`${mod.color}.500`} />
                      </Box>
                      <Box flex={1}>
                        <HStack>
                          <Text fontWeight="bold" color="gray.900">{mod.title}</Text>
                          {hasResult && <Badge colorScheme="green" fontSize="xs">Complete</Badge>}
                        </HStack>
                        <Text fontSize="sm" color="gray.600">{mod.description}</Text>
                      </Box>
                    </HStack>
                    <Button
                      size="sm"
                      colorScheme={mod.color}
                      variant={hasResult ? 'outline' : 'solid'}
                      onClick={() => runDeepDive(mod.id)}
                      isLoading={isLoading}
                      loadingText="Researching..."
                      isDisabled={!selectedReportId || (!!loadingModule && !isLoading)}
                      w="full"
                    >
                      {hasResult ? 'Re-run' : 'Run'} {mod.title}
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>

          {/* Results */}
          {Object.keys(deepDiveResults).length > 0 && (
            <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
              <CardHeader>
                <Heading size="md" color="gray.900">Research Results</Heading>
              </CardHeader>
              <CardBody>
                <Accordion allowMultiple>
                  {modules.filter(mod => deepDiveResults[mod.id]).map(mod => (
                    <AccordionItem key={mod.id} borderColor="gray.200">
                      <AccordionButton>
                        <HStack flex={1} textAlign="left" spacing={3}>
                          <Icon as={mod.icon} color={`${mod.color}.500`} />
                          <Text fontWeight="medium" color="gray.900">{mod.title}</Text>
                          {deepDiveResults[mod.id]?.generated_at && (
                            <Text fontSize="xs" color="gray.400">
                              {new Date(deepDiveResults[mod.id].generated_at).toLocaleString()}
                            </Text>
                          )}
                        </HStack>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Box
                          p={4}
                          bg="gray.50"
                          borderRadius="md"
                          fontSize="sm"
                          color="gray.800"
                          lineHeight="1.7"
                          sx={{
                            'h1, h2, h3': { fontWeight: 'bold', mt: 4, mb: 2, color: 'gray.900' },
                            'ul, ol': { pl: 6, mb: 3 },
                            'li': { mb: 1 },
                            'p': { mb: 3 },
                            'strong': { color: 'gray.900' },
                          }}
                        >
                          <ReactMarkdown>{deepDiveResults[mod.id]?.content || 'No content available'}</ReactMarkdown>
                        </Box>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default DeepDivePage;
