import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Heading, Text, Button, VStack, HStack,
  Select, Spinner, useToast, Card, CardBody, CardHeader,
  Badge, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
  FormControl, FormLabel, Checkbox, Input, Textarea,
  Progress, Divider, InputGroup, InputLeftAddon,
} from '@chakra-ui/react';
import { FiPlus, FiTarget, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

interface Report {
  id: number;
  company_name: string;
  target_market: string;
  industry: string;
}

interface PlanMilestone {
  id: number;
  title: string;
  description: string;
  phase: string;
  target_date?: string;
  is_completed: boolean;
  actual_cost?: number;
  estimated_cost?: string;
  notes?: string;
}

interface ExecutionPlan {
  id: number;
  report: number;
  report_name?: string;
  status: string;
  created_at: string;
  milestones: PlanMilestone[];
  total_projected_cost?: string;
  total_actual_cost?: number;
}

const ExecutionTrackerPage: React.FC = () => {
  const location = useLocation();
  const incomingReportId = (location.state as { reportId?: number } | null)?.reportId || null;

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(incomingReportId);
  const [plans, setPlans] = useState<ExecutionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ExecutionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  const fetchReports = useCallback(async () => {
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
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.EXECUTION_PLANS, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        const planList: ExecutionPlan[] = Array.isArray(data) ? data : data.results || [];
        setPlans(planList);
        if (planList.length > 0 && !selectedPlan) {
          await fetchPlanDetail(planList[0].id);
        }
      }
    } catch {
      // silent
    }
  }, [selectedPlan]);

  const fetchPlanDetail = async (planId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.EXECUTION_PLAN_BY_ID(planId), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data: ExecutionPlan = await response.json();
        setSelectedPlan(data);
      }
    } catch {
      toast({ title: 'Failed to load plan details', status: 'error', duration: 3000 });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReports(), fetchPlans()]);
      setLoading(false);
    };
    loadData();
  }, [fetchReports, fetchPlans]);

  const handleCreatePlan = async () => {
    if (!selectedReportId) {
      toast({ title: 'Please select a report', status: 'warning', duration: 3000 });
      return;
    }
    setCreating(true);
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.EXECUTION_PLANS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ report_id: selectedReportId }),
      });
      if (!response.ok) throw new Error('Failed to create plan');
      const newPlan: ExecutionPlan = await response.json();
      toast({ title: 'Execution plan created', status: 'success', duration: 3000 });
      await fetchPlans();
      await fetchPlanDetail(newPlan.id);
    } catch {
      toast({ title: 'Failed to create execution plan', status: 'error', duration: 3000 });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateMilestone = async (milestoneId: number, updates: Partial<PlanMilestone>) => {
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.MILESTONES(milestoneId), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update milestone');
      const updated: PlanMilestone = await response.json();
      if (selectedPlan) {
        setSelectedPlan({
          ...selectedPlan,
          milestones: selectedPlan.milestones.map(m =>
            m.id === milestoneId ? { ...m, ...updated } : m
          ),
        });
      }
    } catch {
      toast({ title: 'Failed to update milestone', status: 'error', duration: 3000 });
    }
  };

  const getCompletionPercent = () => {
    if (!selectedPlan || selectedPlan.milestones.length === 0) return 0;
    const completed = selectedPlan.milestones.filter(m => m.is_completed).length;
    return Math.round((completed / selectedPlan.milestones.length) * 100);
  };

  const getStatusLabel = () => {
    const percent = getCompletionPercent();
    if (percent >= 75) return { label: 'Ahead', color: 'green' };
    if (percent >= 40) return { label: 'On Track', color: 'blue' };
    return { label: 'Behind', color: 'orange' };
  };

  const getTotalActualCost = () => {
    if (!selectedPlan) return 0;
    return (selectedPlan.milestones || []).reduce((sum, m) => sum + (m.actual_cost || 0), 0);
  };

  const getMilestonesByPhase = () => {
    if (!selectedPlan) return {};
    const grouped: Record<string, PlanMilestone[]> = {};
    for (const m of selectedPlan.milestones) {
      const phase = m.phase || 'General';
      if (!grouped[phase]) grouped[phase] = [];
      grouped[phase].push(m);
    }
    return grouped;
  };

  const getReportLabel = (reportId: number) => {
    const report = reports.find(r => r.id === reportId);
    return report ? `${report.company_name} - ${report.target_market}` : `Report #${reportId}`;
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="#fafafa" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  const completionPercent = getCompletionPercent();
  const status = getStatusLabel();
  const phaseGroups = getMilestonesByPhase();

  return (
    <Box minH="100vh" bg="#fafafa" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" color="gray.900" mb={1}>Execution Tracker</Heading>
            <Text color="gray.600">
              Track your market entry progress with milestone checklists and cost tracking.
            </Text>
          </Box>

          {/* Controls */}
          <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
            <CardBody>
              <HStack spacing={4} align="end" wrap="wrap" gap={4}>
                <FormControl flex={1} minW="200px">
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
                {plans.length > 0 && (
                  <FormControl flex={1} minW="200px">
                    <FormLabel color="gray.700">Select Plan</FormLabel>
                    <Select
                      value={selectedPlan?.id || ''}
                      onChange={(e) => fetchPlanDetail(Number(e.target.value))}
                      borderColor="gray.300"
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.report_name || getReportLabel(p.report)} - {new Date(p.created_at).toLocaleDateString()}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  onClick={handleCreatePlan}
                  isLoading={creating}
                  isDisabled={!selectedReportId}
                  minW="180px"
                >
                  Create Execution Plan
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Plan Detail */}
          {selectedPlan ? (
            <>
              {/* Progress Summary */}
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <Stat>
                      <StatLabel color="gray.600">Overall Progress</StatLabel>
                      <StatNumber color="gray.900">{completionPercent}%</StatNumber>
                      <Progress
                        value={completionPercent}
                        size="sm"
                        colorScheme={status.color}
                        borderRadius="full"
                        mt={2}
                      />
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <Stat>
                      <StatLabel color="gray.600">Status</StatLabel>
                      <HStack spacing={2} mt={1}>
                        <Badge colorScheme={status.color} fontSize="md" px={3} py={1}>
                          {status.label}
                        </Badge>
                      </HStack>
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <Stat>
                      <StatLabel color="gray.600">Milestones</StatLabel>
                      <StatNumber color="gray.900">
                        {selectedPlan.milestones.filter(m => m.is_completed).length}/{selectedPlan.milestones.length}
                      </StatNumber>
                      <StatHelpText color="gray.500">completed</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <Stat>
                      <StatLabel color="gray.600">Actual Cost</StatLabel>
                      <StatNumber color="gray.900" fontSize="xl">
                        ${(getTotalActualCost() || 0).toLocaleString()}
                      </StatNumber>
                      {selectedPlan.total_projected_cost && (
                        <StatHelpText color="gray.500">
                          projected: {selectedPlan.total_projected_cost}
                        </StatHelpText>
                      )}
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Phase Milestones */}
              {Object.entries(phaseGroups).map(([phase, milestones]) => {
                const phaseCompleted = milestones.filter(m => m.is_completed).length;
                const phaseTotal = milestones.length;
                return (
                  <Card key={phase} bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                    <CardHeader pb={2}>
                      <HStack justify="space-between" align="center">
                        <HStack spacing={2}>
                          <FiTarget color="#4A5568" />
                          <Heading size="sm" color="gray.900">{phase}</Heading>
                        </HStack>
                        <HStack spacing={2}>
                          <Text fontSize="sm" color="gray.500">
                            {phaseCompleted}/{phaseTotal} complete
                          </Text>
                          <Progress
                            value={phaseTotal > 0 ? (phaseCompleted / phaseTotal) * 100 : 0}
                            size="sm"
                            colorScheme="blue"
                            borderRadius="full"
                            w="80px"
                          />
                        </HStack>
                      </HStack>
                    </CardHeader>
                    <CardBody pt={0}>
                      <VStack spacing={3} align="stretch">
                        {milestones.map(milestone => (
                          <Box
                            key={milestone.id}
                            p={4}
                            borderWidth="1px"
                            borderColor="gray.200"
                            borderRadius="md"
                            bg={milestone.is_completed ? 'green.50' : 'white'}
                          >
                            <HStack align="start" spacing={3}>
                              <Checkbox
                                isChecked={milestone.is_completed}
                                onChange={(e) =>
                                  handleUpdateMilestone(milestone.id, { is_completed: e.target.checked })
                                }
                                colorScheme="green"
                                mt={1}
                              />
                              <VStack align="start" spacing={2} flex={1}>
                                <HStack justify="space-between" w="full" wrap="wrap" gap={2}>
                                  <Text
                                    fontWeight="600"
                                    color={milestone.is_completed ? 'gray.500' : 'gray.900'}
                                    fontSize="sm"
                                    textDecoration={milestone.is_completed ? 'line-through' : 'none'}
                                  >
                                    {milestone.title}
                                  </Text>
                                  {milestone.target_date && (
                                    <HStack spacing={1}>
                                      <FiClock size={12} color="#718096" />
                                      <Text fontSize="xs" color="gray.500">
                                        Target: {new Date(milestone.target_date).toLocaleDateString()}
                                      </Text>
                                    </HStack>
                                  )}
                                </HStack>
                                {milestone.description && (
                                  <Text fontSize="sm" color="gray.600">{milestone.description}</Text>
                                )}
                                <HStack spacing={4} wrap="wrap" gap={2}>
                                  <FormControl maxW="180px">
                                    <InputGroup size="sm">
                                      <InputLeftAddon>$</InputLeftAddon>
                                      <Input
                                        type="number"
                                        placeholder="Actual cost"
                                        value={milestone.actual_cost || ''}
                                        onChange={(e) =>
                                          handleUpdateMilestone(milestone.id, {
                                            actual_cost: e.target.value ? Number(e.target.value) : undefined,
                                          })
                                        }
                                        borderColor="gray.300"
                                      />
                                    </InputGroup>
                                  </FormControl>
                                  {milestone.estimated_cost && (
                                    <Text fontSize="xs" color="gray.400">
                                      Est: {milestone.estimated_cost}
                                    </Text>
                                  )}
                                </HStack>
                                <Textarea
                                  size="sm"
                                  placeholder="Add notes..."
                                  value={milestone.notes || ''}
                                  onChange={(e) =>
                                    handleUpdateMilestone(milestone.id, { notes: e.target.value })
                                  }
                                  rows={1}
                                  borderColor="gray.300"
                                  resize="vertical"
                                />
                              </VStack>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </>
          ) : (
            <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
              <CardBody>
                <VStack spacing={4} py={8}>
                  <FiCheckCircle size={40} color="#A0AEC0" />
                  <Text color="gray.500" textAlign="center" maxW="md">
                    {plans.length === 0
                      ? 'No execution plans yet. Select a report and create one to start tracking your market entry progress.'
                      : 'Select an execution plan to view and update milestones.'}
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

export default ExecutionTrackerPage;
