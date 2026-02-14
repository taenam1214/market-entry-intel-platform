import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Button,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  useToast,
} from '@chakra-ui/react';
import { FiUsers, FiFileText, FiActivity, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../auth/AuthContext';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

interface AdminStats {
  total_users: number;
  total_reports: number;
  reports_by_status: Record<string, number>;
  users_by_tier: Record<string, number>;
  recent_signups: Array<{
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    subscription_tier: string;
    created_at: string;
  }>;
}

interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  subscription_tier: string;
  report_count: number;
  last_login: string | null;
  is_active: boolean;
  is_admin: boolean;
}

interface AdminReport {
  id: number;
  analysis_id: string;
  user_email: string;
  company_name: string;
  target_market: string;
  industry: string;
  status: string;
  created_at: string;
}

const AdminDashboardPage = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports'>('overview');
  const toast = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        fetch(API_ENDPOINTS.AUTH.ADMIN_DASHBOARD, { headers: getAuthHeaders() }),
        fetch(API_ENDPOINTS.AUTH.ADMIN_USERS, { headers: getAuthHeaders() }),
        fetch(API_ENDPOINTS.AUTH.ADMIN_REPORTS, { headers: getAuthHeaders() }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch {
      // Admin dashboard fetch failed
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: number, field: string, value: string | boolean) => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.ADMIN_USER_BY_ID(userId), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        toast({ title: 'User updated', status: 'success', duration: 2000 });
        fetchDashboardData();
      }
    } catch (err) {
      toast({ title: 'Update failed', status: 'error', duration: 3000 });
    }
  };

  if (!isAdmin) {
    return (
      <Box minH="100vh" bg="white" py={20}>
        <Container maxW="4xl" textAlign="center">
          <Heading size="lg" color="gray.700">Access Denied</Heading>
          <Text color="gray.500" mt={2}>You do not have permission to view this page.</Text>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="white" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="gray.600" />
          <Text color="gray.500">Loading admin dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#fafafa" py={8}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" color="gray.900">Admin Dashboard</Heading>
            <Text color="gray.500" mt={1}>Manage users, reports, and platform activity.</Text>
          </Box>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card bg="white" border="1px solid" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">Total Users</StatLabel>
                  <StatNumber color="gray.900">{stats?.total_users || 0}</StatNumber>
                  <StatHelpText color="gray.400">
                    {stats?.users_by_tier?.free || 0} free
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg="white" border="1px solid" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">Total Reports</StatLabel>
                  <StatNumber color="gray.900">{stats?.total_reports || 0}</StatNumber>
                  <StatHelpText color="gray.400">
                    {stats?.reports_by_status?.completed || 0} completed
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg="white" border="1px solid" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">Paid Users</StatLabel>
                  <StatNumber color="gray.900">
                    {(stats?.users_by_tier?.starter || 0) + (stats?.users_by_tier?.professional || 0) + (stats?.users_by_tier?.enterprise || 0)}
                  </StatNumber>
                  <StatHelpText color="gray.400">active subscriptions</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card bg="white" border="1px solid" borderColor="gray.200">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">Processing</StatLabel>
                  <StatNumber color="gray.900">{stats?.reports_by_status?.processing || 0}</StatNumber>
                  <StatHelpText color="gray.400">reports in progress</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Tab Navigation */}
          <HStack spacing={0} borderBottom="1px solid" borderColor="gray.200">
            {(['overview', 'users', 'reports'] as const).map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                borderBottom={activeTab === tab ? '2px solid' : '2px solid transparent'}
                borderColor={activeTab === tab ? 'gray.900' : 'transparent'}
                borderRadius={0}
                color={activeTab === tab ? 'gray.900' : 'gray.500'}
                fontWeight={activeTab === tab ? '600' : '400'}
                onClick={() => setActiveTab(tab)}
                px={4}
                py={3}
                _hover={{ color: 'gray.700', bg: 'transparent' }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </HStack>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <Card bg="white" border="1px solid" borderColor="gray.200">
              <CardBody>
                <Heading size="sm" color="gray.700" mb={4}>Recent Signups</Heading>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th color="gray.500">Email</Th>
                      <Th color="gray.500">Name</Th>
                      <Th color="gray.500">Tier</Th>
                      <Th color="gray.500">Joined</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {stats?.recent_signups?.map((u) => (
                      <Tr key={u.id}>
                        <Td color="gray.700" fontSize="sm">{u.email}</Td>
                        <Td color="gray.700" fontSize="sm">{u.first_name} {u.last_name}</Td>
                        <Td>
                          <Badge colorScheme={u.subscription_tier === 'free' ? 'gray' : 'green'} fontSize="xs">
                            {u.subscription_tier}
                          </Badge>
                        </Td>
                        <Td color="gray.500" fontSize="sm">
                          {new Date(u.created_at).toLocaleDateString()}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card bg="white" border="1px solid" borderColor="gray.200">
              <CardBody>
                <Heading size="sm" color="gray.700" mb={4}>All Users</Heading>
                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th color="gray.500">Email</Th>
                        <Th color="gray.500">Name</Th>
                        <Th color="gray.500">Role</Th>
                        <Th color="gray.500">Tier</Th>
                        <Th color="gray.500">Reports</Th>
                        <Th color="gray.500">Last Login</Th>
                        <Th color="gray.500">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.map((u) => (
                        <Tr key={u.id}>
                          <Td color="gray.700" fontSize="sm">{u.email}</Td>
                          <Td color="gray.700" fontSize="sm">{u.first_name} {u.last_name}</Td>
                          <Td>
                            <Select
                              size="xs"
                              value={u.role}
                              onChange={(e) => updateUser(u.id, 'role', e.target.value)}
                              w="100px"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </Select>
                          </Td>
                          <Td>
                            <Select
                              size="xs"
                              value={u.subscription_tier}
                              onChange={(e) => updateUser(u.id, 'subscription_tier', e.target.value)}
                              w="130px"
                            >
                              <option value="free">Free</option>
                              <option value="starter">Starter</option>
                              <option value="professional">Professional</option>
                              <option value="enterprise">Enterprise</option>
                            </Select>
                          </Td>
                          <Td color="gray.700" fontSize="sm">{u.report_count}</Td>
                          <Td color="gray.500" fontSize="sm">
                            {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                          </Td>
                          <Td>
                            <Button
                              size="xs"
                              variant={u.is_active ? 'outline' : 'solid'}
                              colorScheme={u.is_active ? 'red' : 'green'}
                              onClick={() => updateUser(u.id, 'is_active', !u.is_active)}
                            >
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          )}

          {activeTab === 'reports' && (
            <Card bg="white" border="1px solid" borderColor="gray.200">
              <CardBody>
                <Heading size="sm" color="gray.700" mb={4}>All Reports</Heading>
                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th color="gray.500">Company</Th>
                        <Th color="gray.500">Market</Th>
                        <Th color="gray.500">Industry</Th>
                        <Th color="gray.500">User</Th>
                        <Th color="gray.500">Status</Th>
                        <Th color="gray.500">Created</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {reports.map((r) => (
                        <Tr key={r.id}>
                          <Td color="gray.700" fontSize="sm">{r.company_name}</Td>
                          <Td color="gray.700" fontSize="sm">{r.target_market}</Td>
                          <Td color="gray.700" fontSize="sm">{r.industry}</Td>
                          <Td color="gray.500" fontSize="sm">{r.user_email}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                r.status === 'completed' ? 'green' :
                                r.status === 'processing' ? 'blue' :
                                r.status === 'failed' ? 'red' : 'gray'
                              }
                              fontSize="xs"
                            >
                              {r.status}
                            </Badge>
                          </Td>
                          <Td color="gray.500" fontSize="sm">
                            {new Date(r.created_at).toLocaleDateString()}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminDashboardPage;
