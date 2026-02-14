import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Heading, Text, Button, VStack, HStack,
  Select, Spinner, useToast, Card, CardBody,
  Badge, SimpleGrid, FormControl, FormLabel, Switch,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, IconButton,
  Input, Divider,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiActivity, FiUsers } from 'react-icons/fi';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

interface Report {
  id: number;
  company_name: string;
  target_market: string;
  industry: string;
}

interface CompetitorTracker {
  id: number;
  report: number;
  competitor_name: string;
  is_active: boolean;
  created_at: string;
}

interface CompetitorUpdate {
  id: number;
  tracker: number;
  competitor_name?: string;
  title: string;
  description: string;
  update_type: string;
  source?: string;
  created_at: string;
}

const updateTypeColorMap: Record<string, string> = {
  product_launch: 'green',
  funding: 'blue',
  expansion: 'purple',
  hiring: 'orange',
  press: 'gray',
  partnership: 'teal',
  acquisition: 'red',
};

const CompetitorTrackingPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [trackers, setTrackers] = useState<CompetitorTracker[]>([]);
  const [updates, setUpdates] = useState<CompetitorUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [competitorName, setCompetitorName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const fetchTrackers = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.COMPETITOR_TRACKERS, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTrackers(Array.isArray(data) ? data : data.results || []);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchUpdates = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.COMPETITOR_UPDATES, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setUpdates(Array.isArray(data) ? data : data.results || []);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReports(), fetchTrackers(), fetchUpdates()]);
      setLoading(false);
    };
    loadData();
  }, [fetchReports, fetchTrackers, fetchUpdates]);

  const handleCreateTracker = async () => {
    if (!selectedReportId || !competitorName.trim()) {
      toast({ title: 'Please select a report and enter a competitor name', status: 'warning', duration: 3000 });
      return;
    }
    setCreating(true);
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.COMPETITOR_TRACKERS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          report_id: selectedReportId,
          competitor_name: competitorName.trim(),
        }),
      });
      if (!response.ok) throw new Error('Failed to create tracker');
      toast({ title: 'Competitor tracker created', status: 'success', duration: 3000 });
      onClose();
      setCompetitorName('');
      await fetchTrackers();
    } catch {
      toast({ title: 'Failed to create tracker', status: 'error', duration: 3000 });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTracker = async (tracker: CompetitorTracker) => {
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.COMPETITOR_TRACKER_BY_ID(tracker.id), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: !tracker.is_active }),
      });
      if (!response.ok) throw new Error('Failed to toggle tracker');
      setTrackers(prev =>
        prev.map(t => t.id === tracker.id ? { ...t, is_active: !t.is_active } : t)
      );
    } catch {
      toast({ title: 'Failed to update tracker', status: 'error', duration: 3000 });
    }
  };

  const handleDeleteTracker = async (id: number) => {
    setDeletingId(id);
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.COMPETITOR_TRACKER_BY_ID(id), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete tracker');
      setTrackers(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Tracker deleted', status: 'success', duration: 3000 });
    } catch {
      toast({ title: 'Failed to delete tracker', status: 'error', duration: 3000 });
    } finally {
      setDeletingId(null);
    }
  };

  const formatUpdateType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (loading) {
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
          <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" color="gray.900" mb={1}>Competitor Tracking</Heading>
              <Text color="gray.600">
                Monitor competitor activity in your target markets.
              </Text>
            </Box>
            <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
              Track Competitor
            </Button>
          </HStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} templateColumns={{ base: '1fr', lg: '40% 60%' }}>
            {/* Tracked Competitors */}
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="gray.900">Tracked Competitors</Heading>
              {trackers.length === 0 ? (
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <VStack spacing={3} py={4}>
                      <FiUsers size={32} color="#A0AEC0" />
                      <Text color="gray.500" textAlign="center">
                        No competitors tracked yet. Click "Track Competitor" to get started.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                trackers.map(tracker => (
                  <Card key={tracker.id} bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                    <CardBody>
                      <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="600" color="gray.900" fontSize="sm">
                            {tracker.competitor_name}
                          </Text>
                          <HStack spacing={2}>
                            <Badge colorScheme={tracker.is_active ? 'green' : 'gray'} fontSize="xs">
                              {tracker.is_active ? 'Active' : 'Paused'}
                            </Badge>
                            <Text fontSize="xs" color="gray.400">
                              Since {new Date(tracker.created_at).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </VStack>
                        <HStack spacing={2}>
                          <Switch
                            size="sm"
                            isChecked={tracker.is_active}
                            onChange={() => handleToggleTracker(tracker)}
                            colorScheme="blue"
                          />
                          <IconButton
                            aria-label="Delete tracker"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            isLoading={deletingId === tracker.id}
                            onClick={() => handleDeleteTracker(tracker.id)}
                          />
                        </HStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))
              )}
            </VStack>

            {/* Activity Timeline */}
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="gray.900">Activity Timeline</Heading>
              {updates.length === 0 ? (
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <VStack spacing={3} py={4}>
                      <FiActivity size={32} color="#A0AEC0" />
                      <Text color="gray.500" textAlign="center">
                        No competitor updates yet. Updates will appear here as tracked competitors are monitored.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <VStack spacing={3} align="stretch">
                  {updates.map(update => (
                    <Card key={update.id} bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                      <CardBody py={3} px={4}>
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="full" wrap="wrap" gap={2}>
                            <HStack spacing={2}>
                              <Badge
                                colorScheme={updateTypeColorMap[update.update_type] || 'gray'}
                                fontSize="xs"
                              >
                                {formatUpdateType(update.update_type)}
                              </Badge>
                              {update.competitor_name && (
                                <Text fontWeight="600" color="gray.700" fontSize="xs">
                                  {update.competitor_name}
                                </Text>
                              )}
                            </HStack>
                            <Text fontSize="xs" color="gray.400">
                              {new Date(update.created_at).toLocaleDateString()}
                            </Text>
                          </HStack>
                          <Text fontWeight="600" color="gray.900" fontSize="sm">
                            {update.title}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {update.description}
                          </Text>
                          {update.source && (
                            <Text fontSize="xs" color="gray.400">
                              Source: {update.source}
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Add Competitor Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="gray.900">Track Competitor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
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
              <FormControl>
                <FormLabel color="gray.700">Competitor Name</FormLabel>
                <Input
                  placeholder="e.g., Acme Corp"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  borderColor="gray.300"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateTracker}
              isLoading={creating}
              isDisabled={!selectedReportId || !competitorName.trim()}
            >
              Start Tracking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CompetitorTrackingPage;
