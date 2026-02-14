import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  FormControl,
  FormLabel,
  Divider,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertDescription,
  IconButton,
  Flex,
  Avatar,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiPlus,
  FiTrash2,
  FiMail,
  FiEdit3,
  FiUserPlus,
  FiSettings,
} from 'react-icons/fi';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

interface Organization {
  id: number;
  name: string;
  created_at: string;
  owner_id: number;
}

interface Member {
  id: number;
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'admin' | 'analyst' | 'viewer';
  joined_at: string;
}

interface Invite {
  id: number;
  email: string;
  role: string;
  status: string;
  invited_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'red',
  admin: 'orange',
  analyst: 'blue',
  viewer: 'gray',
};

const ROLE_OPTIONS = ['admin', 'analyst', 'viewer'];

const TeamPage = () => {
  const toast = useToast();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Create org form
  const [newOrgName, setNewOrgName] = useState('');

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('analyst');
  const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();

  // Rename org
  const [renameValue, setRenameValue] = useState('');
  const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();

  // Delete org confirmation
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Current user role in the selected org
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const isOwnerOrAdmin = currentUserRole === 'owner' || currentUserRole === 'admin';
  const isOwner = currentUserRole === 'owner';

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.TEAMS.ORGANIZATIONS, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch organizations');
      const data = await response.json();
      const orgs: Organization[] = Array.isArray(data) ? data : data.results || [];
      setOrganizations(orgs);
      if (orgs.length > 0 && !selectedOrg) {
        setSelectedOrg(orgs[0]);
      }
    } catch {
      // silently handle - user may have no orgs
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  const fetchMembers = useCallback(async (orgId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.TEAMS.MEMBERS(orgId), {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      const memberList: Member[] = Array.isArray(data) ? data : data.results || [];
      setMembers(memberList);

      // Determine current user role
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        try {
          const profileResp = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
            headers: getAuthHeaders(),
          });
          if (profileResp.ok) {
            const profile = await profileResp.json();
            const currentUserId = profile.id || profile.user?.id;
            const me = memberList.find((m: Member) => m.user_id === currentUserId);
            setCurrentUserRole(me?.role || null);
          }
        } catch {
          // ignore
        }
      }
    } catch {
      setMembers([]);
    }
  }, []);

  const fetchInvites = useCallback(async (orgId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.TEAMS.INVITES(orgId), {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch invites');
      const data = await response.json();
      setInvites(Array.isArray(data) ? data : data.results || []);
    } catch {
      setInvites([]);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    if (selectedOrg) {
      fetchMembers(selectedOrg.id);
      fetchInvites(selectedOrg.id);
    }
  }, [selectedOrg, fetchMembers, fetchInvites]);

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;
    setActionLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.TEAMS.ORGANIZATIONS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newOrgName.trim() }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || 'Failed to create organization');
      }
      const newOrg = await response.json();
      setOrganizations((prev) => [...prev, newOrg]);
      setSelectedOrg(newOrg);
      setNewOrgName('');
      toast({
        title: 'Organization Created',
        description: `"${newOrg.name}" has been created successfully.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedOrg) return;
    setActionLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.TEAMS.INVITE(selectedOrg.id), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || 'Failed to send invite');
      }
      toast({
        title: 'Invite Sent',
        description: `Invitation sent to ${inviteEmail}.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      setInviteEmail('');
      setInviteRole('analyst');
      onInviteClose();
      fetchInvites(selectedOrg.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.TEAMS.MEMBER_BY_ID(memberId), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || 'Failed to update role');
      }
      toast({
        title: 'Role Updated',
        description: 'Member role has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      if (selectedOrg) fetchMembers(selectedOrg.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    setActionLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.TEAMS.MEMBER_BY_ID(memberId), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || 'Failed to remove member');
      }
      toast({
        title: 'Member Removed',
        description: 'The member has been removed from the organization.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      if (selectedOrg) fetchMembers(selectedOrg.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameOrg = async () => {
    if (!renameValue.trim() || !selectedOrg) return;
    setActionLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.TEAMS.ORGANIZATION_BY_ID(selectedOrg.id), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || 'Failed to rename organization');
      }
      const updated = await response.json();
      setSelectedOrg(updated);
      setOrganizations((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      onRenameClose();
      toast({
        title: 'Organization Renamed',
        description: `Organization renamed to "${updated.name}".`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!selectedOrg) return;
    setActionLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.TEAMS.ORGANIZATION_BY_ID(selectedOrg.id), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || 'Failed to delete organization');
      }
      setOrganizations((prev) => prev.filter((o) => o.id !== selectedOrg.id));
      setSelectedOrg(null);
      setMembers([]);
      setInvites([]);
      setCurrentUserRole(null);
      onDeleteClose();
      toast({
        title: 'Organization Deleted',
        description: 'The organization has been permanently deleted.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="#fafafa" py={8}>
        <Container maxW="4xl">
          <VStack spacing={6} py={20}>
            <Spinner size="lg" color="gray.500" />
            <Text color="gray.500">Loading team data...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  // No organization state
  if (organizations.length === 0) {
    return (
      <Box minH="100vh" bg="#fafafa" py={8}>
        <Container maxW="4xl">
          <VStack spacing={8} align="stretch">
            <VStack spacing={2} textAlign="center">
              <Heading size="xl" color="gray.900">Team Management</Heading>
              <Text fontSize="lg" color="gray.500">
                Create an organization to start collaborating with your team.
              </Text>
            </VStack>

            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm" maxW="lg" mx="auto" w="full">
              <CardHeader>
                <HStack spacing={3}>
                  <FiUsers color="#4A5568" size={20} />
                  <Heading size="md" color="gray.900">Create Organization</Heading>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">
                      Organization Name
                    </FormLabel>
                    <Input
                      placeholder="e.g., Acme Corp"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCreateOrg(); }}
                    />
                  </FormControl>
                  <Button
                    leftIcon={<FiPlus />}
                    bg="gray.900"
                    color="white"
                    _hover={{ bg: 'gray.800' }}
                    _active={{ bg: 'gray.700' }}
                    onClick={handleCreateOrg}
                    isLoading={actionLoading}
                    isDisabled={!newOrgName.trim()}
                  >
                    Create Organization
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#fafafa" py={8}>
      <Container maxW="4xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <VStack spacing={1} align="start">
              <Heading size="xl" color="gray.900">{selectedOrg?.name || 'Team'}</Heading>
              <Text fontSize="md" color="gray.500">Manage members, roles, and invitations.</Text>
            </VStack>
            <HStack spacing={3}>
              {organizations.length > 1 && (
                <Select
                  value={selectedOrg?.id || ''}
                  onChange={(e) => {
                    const org = organizations.find((o) => o.id === parseInt(e.target.value));
                    if (org) setSelectedOrg(org);
                  }}
                  bg="white"
                  borderColor="gray.200"
                  maxW="250px"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </Select>
              )}
              {isOwnerOrAdmin && (
                <Button
                  leftIcon={<FiUserPlus />}
                  bg="gray.900"
                  color="white"
                  _hover={{ bg: 'gray.800' }}
                  _active={{ bg: 'gray.700' }}
                  onClick={onInviteOpen}
                  size="md"
                >
                  Invite Member
                </Button>
              )}
            </HStack>
          </Flex>

          {/* Members Section */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <HStack spacing={3}>
                <FiUsers color="#4A5568" size={20} />
                <Heading size="md" color="gray.900">
                  Members ({members.length})
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              {members.length === 0 ? (
                <Text color="gray.500" fontSize="sm" textAlign="center" py={6}>
                  No members found.
                </Text>
              ) : (
                <VStack spacing={0} align="stretch" divider={<Divider borderColor="gray.100" />}>
                  {members.map((member) => (
                    <Flex
                      key={member.id}
                      py={4}
                      align="center"
                      justify="space-between"
                      wrap="wrap"
                      gap={3}
                    >
                      <HStack spacing={3} flex={1} minW="200px">
                        <Avatar
                          size="sm"
                          name={`${member.first_name} ${member.last_name}`}
                          bg="gray.200"
                          color="gray.600"
                        />
                        <VStack spacing={0} align="start">
                          <Text fontSize="sm" fontWeight="medium" color="gray.900">
                            {member.first_name} {member.last_name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">{member.email}</Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={3}>
                        {isOwnerOrAdmin && member.role !== 'owner' ? (
                          <Select
                            size="sm"
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            w="120px"
                            bg="white"
                            borderColor="gray.200"
                            fontSize="xs"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Badge
                            colorScheme={ROLE_COLORS[member.role] || 'gray'}
                            variant="subtle"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                          >
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        )}
                        {isOwnerOrAdmin && member.role !== 'owner' && (
                          <IconButton
                            aria-label="Remove member"
                            icon={<FiTrash2 />}
                            variant="ghost"
                            size="sm"
                            color="red.500"
                            _hover={{ bg: 'red.50' }}
                            onClick={() => handleRemoveMember(member.id)}
                          />
                        )}
                      </HStack>
                    </Flex>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Pending Invites Section */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <HStack spacing={3}>
                <FiMail color="#4A5568" size={20} />
                <Heading size="md" color="gray.900">
                  Pending Invites ({invites.filter((i) => i.status === 'pending').length})
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              {invites.filter((i) => i.status === 'pending').length === 0 ? (
                <Text color="gray.500" fontSize="sm" textAlign="center" py={6}>
                  No pending invitations.
                </Text>
              ) : (
                <VStack spacing={0} align="stretch" divider={<Divider borderColor="gray.100" />}>
                  {invites
                    .filter((i) => i.status === 'pending')
                    .map((invite) => (
                      <Flex key={invite.id} py={4} align="center" justify="space-between">
                        <HStack spacing={3}>
                          <Avatar size="sm" name={invite.email} bg="gray.100" color="gray.500" />
                          <VStack spacing={0} align="start">
                            <Text fontSize="sm" fontWeight="medium" color="gray.900">
                              {invite.email}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              Invited {new Date(invite.invited_at).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge
                          colorScheme={ROLE_COLORS[invite.role] || 'gray'}
                          variant="subtle"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                        >
                          {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                        </Badge>
                      </Flex>
                    ))}
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Organization Settings (Owner Only) */}
          {isOwner && selectedOrg && (
            <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
              <CardHeader>
                <HStack spacing={3}>
                  <FiSettings color="#4A5568" size={20} />
                  <Heading size="md" color="gray.900">Organization Settings</Heading>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between" align="center">
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">Organization Name</Text>
                      <Text fontSize="sm" color="gray.500">{selectedOrg.name}</Text>
                    </VStack>
                    <Button
                      leftIcon={<FiEdit3 />}
                      variant="outline"
                      borderColor="gray.300"
                      color="gray.700"
                      _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
                      size="sm"
                      onClick={() => {
                        setRenameValue(selectedOrg.name);
                        onRenameOpen();
                      }}
                    >
                      Rename
                    </Button>
                  </HStack>
                  <Divider borderColor="gray.200" />
                  <HStack justify="space-between" align="center">
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" fontWeight="medium" color="red.600">Delete Organization</Text>
                      <Text fontSize="xs" color="gray.500">
                        Permanently delete this organization and remove all members.
                      </Text>
                    </VStack>
                    <Button
                      leftIcon={<FiTrash2 />}
                      variant="outline"
                      borderColor="red.300"
                      color="red.600"
                      _hover={{ bg: 'red.50', borderColor: 'red.400' }}
                      size="sm"
                      onClick={onDeleteOpen}
                    >
                      Delete
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>

        {/* Invite Member Modal */}
        <Modal isOpen={isInviteOpen} onClose={onInviteClose} isCentered>
          <ModalOverlay bg="blackAlpha.400" />
          <ModalContent bg="white" border="1px solid" borderColor="gray.200" shadow="lg">
            <ModalHeader>
              <HStack spacing={3}>
                <FiUserPlus color="#4A5568" size={20} />
                <Text color="gray.900">Invite Team Member</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="gray.500" />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Email Address</FormLabel>
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Role</FormLabel>
                  <Select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    bg="white"
                    borderColor="gray.200"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onInviteClose} color="gray.600">
                Cancel
              </Button>
              <Button
                bg="gray.900"
                color="white"
                _hover={{ bg: 'gray.800' }}
                _active={{ bg: 'gray.700' }}
                onClick={handleInvite}
                isLoading={actionLoading}
                isDisabled={!inviteEmail.trim()}
              >
                Send Invite
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Rename Organization Modal */}
        <Modal isOpen={isRenameOpen} onClose={onRenameClose} isCentered>
          <ModalOverlay bg="blackAlpha.400" />
          <ModalContent bg="white" border="1px solid" borderColor="gray.200" shadow="lg">
            <ModalHeader>
              <HStack spacing={3}>
                <FiEdit3 color="#4A5568" size={20} />
                <Text color="gray.900">Rename Organization</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="gray.500" />
            <ModalBody>
              <FormControl>
                <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">New Name</FormLabel>
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRenameOrg(); }}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onRenameClose} color="gray.600">
                Cancel
              </Button>
              <Button
                bg="gray.900"
                color="white"
                _hover={{ bg: 'gray.800' }}
                _active={{ bg: 'gray.700' }}
                onClick={handleRenameOrg}
                isLoading={actionLoading}
                isDisabled={!renameValue.trim()}
              >
                Rename
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Organization Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
          <ModalOverlay bg="blackAlpha.400" />
          <ModalContent bg="white" border="1px solid" borderColor="gray.200" shadow="lg">
            <ModalHeader>
              <Text color="red.600">Delete Organization</Text>
            </ModalHeader>
            <ModalCloseButton color="gray.500" />
            <ModalBody>
              <Alert status="error" borderRadius="md" mb={4}>
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  This action cannot be undone. All members will be removed and shared data will become inaccessible.
                </AlertDescription>
              </Alert>
              <Text fontSize="sm" color="gray.700">
                Are you sure you want to delete <strong>{selectedOrg?.name}</strong>?
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteClose} color="gray.600">
                Cancel
              </Button>
              <Button
                bg="red.600"
                color="white"
                _hover={{ bg: 'red.700' }}
                onClick={handleDeleteOrg}
                isLoading={actionLoading}
              >
                Delete Organization
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default TeamPage;
