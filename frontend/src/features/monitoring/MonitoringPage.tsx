import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Heading, Text, Button, VStack, HStack,
  Select, Spinner, useToast, Card, CardBody, CardHeader,
  Badge, SimpleGrid, FormControl, FormLabel, Switch,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, IconButton,
  Alert, AlertIcon, Divider,
} from '@chakra-ui/react';
import { FiPlus, FiBell, FiTrash2, FiCheck, FiEye } from 'react-icons/fi';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

interface Report {
  id: number;
  company_name: string;
  target_market: string;
  industry: string;
}

interface Monitor {
  id: number;
  report: number;
  report_name?: string;
  frequency: string;
  is_active: boolean;
  last_checked?: string;
  created_at: string;
}

interface MonitorAlert {
  id: number;
  monitor: number;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  created_at: string;
}

const severityColorMap: Record<string, string> = {
  low: 'gray',
  medium: 'yellow',
  high: 'orange',
  critical: 'red',
};

const MonitoringPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertFilter, setAlertFilter] = useState<'all' | 'unread'>('all');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [frequency, setFrequency] = useState('daily');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const unreadCount = alerts.filter(a => !a.is_read).length;

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

  const fetchMonitors = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.MONITORS, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setMonitors(Array.isArray(data) ? data : data.results || []);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchAlerts = useCallback(async (filter: 'all' | 'unread') => {
    try {
      const url = filter === 'unread'
        ? `${API_ENDPOINTS.MONITORING.ALERTS}?unread=true`
        : API_ENDPOINTS.MONITORING.ALERTS;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(Array.isArray(data) ? data : data.results || []);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReports(), fetchMonitors(), fetchAlerts(alertFilter)]);
      setLoading(false);
    };
    loadData();
  }, [fetchReports, fetchMonitors, fetchAlerts, alertFilter]);

  const handleCreateMonitor = async () => {
    if (!selectedReportId) {
      toast({ title: 'Please select a report', status: 'warning', duration: 3000 });
      return;
    }
    setCreating(true);
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.MONITORS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ report_id: selectedReportId, frequency }),
      });
      if (!response.ok) throw new Error('Failed to create monitor');
      toast({ title: 'Monitor created successfully', status: 'success', duration: 3000 });
      onClose();
      setSelectedReportId(null);
      setFrequency('daily');
      await fetchMonitors();
    } catch {
      toast({ title: 'Failed to create monitor', status: 'error', duration: 3000 });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleMonitor = async (monitor: Monitor) => {
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.MONITOR_BY_ID(monitor.id), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: !monitor.is_active }),
      });
      if (!response.ok) throw new Error('Failed to toggle monitor');
      setMonitors(prev =>
        prev.map(m => m.id === monitor.id ? { ...m, is_active: !m.is_active } : m)
      );
    } catch {
      toast({ title: 'Failed to update monitor', status: 'error', duration: 3000 });
    }
  };

  const handleDeleteMonitor = async (id: number) => {
    setDeletingId(id);
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.MONITOR_BY_ID(id), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete monitor');
      setMonitors(prev => prev.filter(m => m.id !== id));
      toast({ title: 'Monitor deleted', status: 'success', duration: 3000 });
    } catch {
      toast({ title: 'Failed to delete monitor', status: 'error', duration: 3000 });
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkRead = async (alertId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.MONITORING.ALERT_READ(alertId), {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      setAlerts(prev =>
        prev.map(a => a.id === alertId ? { ...a, is_read: true } : a)
      );
    } catch {
      toast({ title: 'Failed to mark alert as read', status: 'error', duration: 3000 });
    }
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

  return (
    <Box minH="100vh" bg="#fafafa" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" color="gray.900" mb={1}>Market Monitoring</Heading>
              <Text color="gray.600">Track market changes and receive alerts on your reports.</Text>
            </Box>
            <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
              Set Up Monitoring
            </Button>
          </HStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} templateColumns={{ base: '1fr', lg: '40% 60%' }}>
            {/* Monitors List */}
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="gray.900">Active Monitors</Heading>
              {monitors.length === 0 ? (
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <VStack spacing={3} py={4}>
                      <FiBell size={32} color="#A0AEC0" />
                      <Text color="gray.500" textAlign="center">
                        No monitors set up yet. Click "Set Up Monitoring" to get started.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                monitors.map(monitor => (
                  <Card key={monitor.id} bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                    <CardBody>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="600" color="gray.900" fontSize="sm">
                            {monitor.report_name || getReportLabel(monitor.report)}
                          </Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" fontSize="xs">{monitor.frequency}</Badge>
                            <Badge colorScheme={monitor.is_active ? 'green' : 'gray'} fontSize="xs">
                              {monitor.is_active ? 'Active' : 'Paused'}
                            </Badge>
                          </HStack>
                          {monitor.last_checked && (
                            <Text fontSize="xs" color="gray.400">
                              Last checked: {new Date(monitor.last_checked).toLocaleDateString()}
                            </Text>
                          )}
                        </VStack>
                        <HStack spacing={2}>
                          <Switch
                            size="sm"
                            isChecked={monitor.is_active}
                            onChange={() => handleToggleMonitor(monitor)}
                            colorScheme="blue"
                          />
                          <IconButton
                            aria-label="Delete monitor"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            isLoading={deletingId === monitor.id}
                            onClick={() => handleDeleteMonitor(monitor.id)}
                          />
                        </HStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))
              )}
            </VStack>

            {/* Alerts Feed */}
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <HStack spacing={2}>
                  <Heading size="md" color="gray.900">Alerts</Heading>
                  {unreadCount > 0 && (
                    <Badge colorScheme="red" borderRadius="full" px={2} fontSize="xs">
                      {unreadCount}
                    </Badge>
                  )}
                </HStack>
                <Select
                  size="sm"
                  w="150px"
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value as 'all' | 'unread')}
                  borderColor="gray.300"
                >
                  <option value="all">All Alerts</option>
                  <option value="unread">Unread Only</option>
                </Select>
              </HStack>

              {alerts.length === 0 ? (
                <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <VStack spacing={3} py={4}>
                      <FiCheck size={32} color="#A0AEC0" />
                      <Text color="gray.500" textAlign="center">
                        {alertFilter === 'unread' ? 'No unread alerts.' : 'No alerts yet. Alerts will appear here when monitors detect changes.'}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                <VStack spacing={2} align="stretch">
                  {alerts.map(alert => (
                    <Card
                      key={alert.id}
                      bg={alert.is_read ? 'white' : 'blue.50'}
                      shadow="sm"
                      borderWidth="1px"
                      borderColor={alert.is_read ? 'gray.200' : 'blue.200'}
                    >
                      <CardBody py={3} px={4}>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack spacing={2}>
                              <Badge colorScheme={severityColorMap[alert.severity]} fontSize="xs">
                                {alert.severity}
                              </Badge>
                              <Text fontWeight="600" color="gray.900" fontSize="sm">
                                {alert.title}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">{alert.message}</Text>
                            <Text fontSize="xs" color="gray.400">
                              {new Date(alert.created_at).toLocaleString()}
                            </Text>
                          </VStack>
                          {!alert.is_read && (
                            <IconButton
                              aria-label="Mark as read"
                              icon={<FiEye />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => handleMarkRead(alert.id)}
                            />
                          )}
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Create Monitor Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="gray.900">Set Up Monitoring</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {reports.length === 0 ? (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">No reports available. Generate an analysis first.</Text>
                </Alert>
              ) : (
                <>
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
                    <FormLabel color="gray.700">Monitoring Frequency</FormLabel>
                    <Select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      borderColor="gray.300"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </Select>
                  </FormControl>
                </>
              )}
            </VStack>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateMonitor}
              isLoading={creating}
              isDisabled={!selectedReportId || reports.length === 0}
            >
              Create Monitor
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MonitoringPage;
