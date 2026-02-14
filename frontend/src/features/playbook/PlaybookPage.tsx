import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Heading, Text, Button, VStack, HStack,
  Select, Spinner, useToast, Card, CardBody, CardHeader,
  Badge, SimpleGrid, Stat, StatLabel, StatNumber,
  FormControl, FormLabel, Accordion, AccordionItem,
  AccordionButton, AccordionPanel, AccordionIcon, Divider,
  List, ListItem, ListIcon,
} from '@chakra-ui/react';
import { FiPlay, FiCheckCircle, FiClock, FiDollarSign, FiUsers, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

interface Report {
  id: number;
  company_name: string;
  target_market: string;
  industry: string;
}

interface Milestone {
  title: string;
  description: string;
  estimated_cost: string;
  team_requirements: string;
}

interface Phase {
  phase_number: number;
  title: string;
  timeline: string;
  milestones: Milestone[];
}

interface Playbook {
  phases: Phase[];
  total_estimated_budget: string;
  total_timeline: string;
}

const phaseColors = ['blue', 'green', 'purple', 'orange'];

const PlaybookPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.REPORTS.LIST, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setReports(Array.isArray(data) ? data : data.results || []);
      }
    } catch {
      // silent
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerate = async () => {
    if (!selectedReportId) {
      toast({ title: 'Please select a report first', status: 'warning', duration: 3000 });
      return;
    }
    setLoading(true);
    setPlaybook(null);
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.PLAYBOOK(selectedReportId), {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to generate playbook');
      const data = await response.json();
      setPlaybook(data.playbook || data);
      toast({ title: 'Playbook generated successfully', status: 'success', duration: 3000 });
    } catch {
      toast({ title: 'Failed to generate playbook', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phaseNumber: number) => {
    return phaseColors[(phaseNumber - 1) % phaseColors.length];
  };

  if (reportsLoading) {
    return (
      <Box minH="100vh" bg="#fafafa" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#fafafa" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" color="gray.900" mb={1}>Market Entry Playbook</Heading>
            <Text color="gray.600">
              Generate a step-by-step playbook with timelines, milestones, and cost estimates for your market entry.
            </Text>
          </Box>

          {/* Report Selector & Generate */}
          <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
            <CardBody>
              <HStack spacing={4} align="end" wrap="wrap" gap={4}>
                <FormControl flex={1} minW="250px">
                  <FormLabel color="gray.700">Select Report</FormLabel>
                  <Select
                    placeholder="Choose a report..."
                    value={selectedReportId || ''}
                    onChange={(e) => setSelectedReportId(Number(e.target.value))}
                    borderColor="gray.300"
                  >
                    {reports.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.company_name} - {r.target_market} ({r.industry})
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  leftIcon={<FiPlay />}
                  colorScheme="blue"
                  onClick={handleGenerate}
                  isLoading={loading}
                  loadingText="Generating..."
                  isDisabled={!selectedReportId}
                  minW="180px"
                >
                  Generate Playbook
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Loading State */}
          {loading && (
            <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
              <CardBody>
                <VStack spacing={4} py={8}>
                  <Spinner size="xl" color="blue.500" thickness="3px" />
                  <Text color="gray.600" fontWeight="500">Generating your market entry playbook...</Text>
                  <Text color="gray.400" fontSize="sm">This may take a moment as we analyze your report data.</Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Playbook Results */}
          {playbook && !loading && (
            <>
              {/* Summary Stats */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <Stat>
                      <StatLabel color="gray.600">Total Phases</StatLabel>
                      <StatNumber color="gray.900">{playbook.phases?.length || 0}</StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <Stat>
                      <StatLabel color="gray.600">Estimated Budget</StatLabel>
                      <StatNumber color="gray.900" fontSize="xl">{playbook.total_estimated_budget}</StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <Stat>
                      <StatLabel color="gray.600">Total Timeline</StatLabel>
                      <StatNumber color="gray.900" fontSize="xl">{playbook.total_timeline}</StatNumber>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Phases Timeline */}
              <Accordion allowMultiple defaultIndex={[0]}>
                {playbook.phases.map((phase) => {
                  const color = getPhaseColor(phase.phase_number);
                  return (
                    <AccordionItem
                      key={phase.phase_number}
                      border="none"
                      mb={4}
                    >
                      <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200" overflow="hidden">
                        <AccordionButton
                          px={6}
                          py={4}
                          _hover={{ bg: 'gray.50' }}
                          borderLeftWidth="4px"
                          borderLeftColor={`${color}.500`}
                        >
                          <HStack flex={1} spacing={3}>
                            <Badge colorScheme={color} fontSize="sm" px={2} py={1}>
                              Phase {phase.phase_number}
                            </Badge>
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontWeight="600" color="gray.900" fontSize="md" textAlign="left">
                                {phase.title}
                              </Text>
                              <HStack spacing={2}>
                                <FiClock size={12} color="#718096" />
                                <Text fontSize="sm" color="gray.500">{phase.timeline}</Text>
                              </HStack>
                            </VStack>
                            <Badge colorScheme="gray" fontSize="xs">
                              {phase.milestones?.length || 0} milestone{(phase.milestones?.length || 0) !== 1 ? 's' : ''}
                            </Badge>
                          </HStack>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel px={6} pb={6}>
                          <Divider mb={4} />
                          <VStack spacing={4} align="stretch">
                            {phase.milestones.map((milestone, mIdx) => (
                              <Card
                                key={mIdx}
                                variant="outline"
                                borderColor="gray.200"
                                bg="gray.50"
                              >
                                <CardBody>
                                  <VStack align="start" spacing={3}>
                                    <HStack spacing={2}>
                                      <FiCheckCircle color="#38A169" />
                                      <Text fontWeight="600" color="gray.900" fontSize="sm">
                                        {milestone.title}
                                      </Text>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.600">
                                      {milestone.description}
                                    </Text>
                                    <HStack spacing={4} wrap="wrap" gap={2}>
                                      <HStack spacing={1}>
                                        <FiDollarSign size={14} color="#718096" />
                                        <Text fontSize="xs" color="gray.500">
                                          {milestone.estimated_cost}
                                        </Text>
                                      </HStack>
                                      <HStack spacing={1}>
                                        <FiUsers size={14} color="#718096" />
                                        <Text fontSize="xs" color="gray.500">
                                          {milestone.team_requirements}
                                        </Text>
                                      </HStack>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      </Card>
                    </AccordionItem>
                  );
                })}
              </Accordion>

              {/* Create Execution Plan */}
              <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                <CardBody>
                  <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" color="gray.900">Ready to execute?</Text>
                      <Text fontSize="sm" color="gray.500">
                        Create an execution plan to track progress against these milestones.
                      </Text>
                    </VStack>
                    <Button
                      rightIcon={<FiArrowRight />}
                      colorScheme="green"
                      onClick={() => navigate('/execution', { state: { reportId: selectedReportId } })}
                    >
                      Create Execution Plan
                    </Button>
                  </HStack>
                </CardBody>
              </Card>
            </>
          )}

          {/* Empty State */}
          {!playbook && !loading && (
            <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
              <CardBody>
                <VStack spacing={4} py={8}>
                  <FiPlay size={40} color="#A0AEC0" />
                  <Text color="gray.500" textAlign="center" maxW="md">
                    Select a report and click "Generate Playbook" to create your step-by-step market entry plan.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default PlaybookPage;
