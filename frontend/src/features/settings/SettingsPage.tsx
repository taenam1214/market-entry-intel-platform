import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  InputGroup,
  InputRightElement,
  IconButton,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Switch,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiSave, FiEdit3, FiShield, FiCreditCard, FiKey, FiCopy, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { authService } from '../../auth/authService';
import { paymentService } from '../../services/paymentService';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<{tier: string; status: string; analyses_used: number; current_period_end: string | null} | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();
  const { isOpen: isEmailModalOpen, onOpen: onEmailModalOpen, onClose: onEmailModalClose } = useDisclosure();

  // Profile form state (for name changes only)
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  // Email form state
  const [emailForm, setEmailForm] = useState({
    new_email: '',
    current_password: '',
  });

  // API Keys state
  interface ApiKey {
    id: number;
    name: string;
    key_prefix: string;
    is_active: boolean;
    usage_count: number;
    created_at: string;
  }
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKeyFull, setCreatedKeyFull] = useState<string | null>(null);
  const [apiKeyActionLoading, setApiKeyActionLoading] = useState(false);
  const { isOpen: isCreateKeyOpen, onOpen: onCreateKeyOpen, onClose: onCreateKeyClose } = useDisclosure();
  const { isOpen: isDeleteKeyOpen, onOpen: onDeleteKeyOpen, onClose: onDeleteKeyClose } = useDisclosure();
  const [keyToDelete, setKeyToDelete] = useState<number | null>(null);

  const fetchApiKeys = async () => {
    setApiKeysLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.API_KEYS.LIST, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setApiKeys(Array.isArray(data) ? data : data.results || []);
      }
    } catch {
      // silently handle
    } finally {
      setApiKeysLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return;
    setApiKeyActionLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.API_KEYS.LIST, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.detail || 'Failed to create API key');
      }
      const data = await response.json();
      setCreatedKeyFull(data.key || data.api_key || null);
      setNewKeyName('');
      fetchApiKeys();
      toast({
        title: 'API Key Created',
        description: 'Copy your key now. It will not be shown again.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create API key';
      toast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setApiKeyActionLoading(false);
    }
  };

  const handleToggleApiKey = async (keyId: number, currentActive: boolean) => {
    try {
      const response = await fetch(API_ENDPOINTS.API_KEYS.BY_ID(keyId), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (!response.ok) throw new Error('Failed to update key');
      setApiKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, is_active: !currentActive } : k))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to toggle API key';
      toast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    }
  };

  const handleDeleteApiKey = async () => {
    if (keyToDelete === null) return;
    setApiKeyActionLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.API_KEYS.BY_ID(keyToDelete), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete API key');
      setApiKeys((prev) => prev.filter((k) => k.id !== keyToDelete));
      setKeyToDelete(null);
      onDeleteKeyClose();
      toast({
        title: 'API Key Deleted',
        description: 'The API key has been permanently deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete API key';
      toast({ title: 'Error', description: message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setApiKeyActionLoading(false);
    }
  };

  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'API key copied to clipboard.', status: 'success', duration: 2000, isClosable: true });
  };

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

  // Fetch subscription status on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const status = await paymentService.getSubscriptionStatus();
        setSubscription(status);
      } catch (error) {
        // Silently fail - subscription info is non-critical
        console.error('Failed to fetch subscription status:', error);
      }
    };
    fetchSubscription();
    fetchApiKeys();
  }, []);

  const getTierBadgeColor = (tier: string) => {
    switch ((tier || '').toLowerCase()) {
      case 'enterprise': return 'purple';
      case 'professional': return 'blue';
      case 'starter': return 'green';
      case 'free':
      default: return 'gray';
    }
  };

  const formatTierName = (tier: string) => {
    return (tier || '').charAt(0).toUpperCase() + (tier || '').slice(1).toLowerCase();
  };

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailInputChange = (field: string, value: string) => {
    setEmailForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authHeaders = authService.getAuthHeaders();
      const response = await fetch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user context with new data
        setUser(data.user);
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'An error occurred while updating your profile.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authHeaders = authService.getAuthHeaders();
      const response = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been changed successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        // Reset form and close modal
        setPasswordForm({
          old_password: '',
          new_password: '',
          new_password_confirm: '',
        });
        onPasswordModalClose();
      } else {
        throw new Error(data.error || 'Failed to change password');
      }
    } catch (error: any) {
      toast({
        title: 'Password Change Failed',
        description: error.message || 'An error occurred while changing your password.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authHeaders = authService.getAuthHeaders();
      const response = await fetch(API_ENDPOINTS.AUTH.CHANGE_EMAIL, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(emailForm),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user context with new data
        setUser(data.user);
        toast({
          title: 'Email Changed',
          description: 'Your email has been changed successfully. Please verify your new email address.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        // Reset form and close modal
        setEmailForm({
          new_email: '',
          current_password: '',
        });
        onEmailModalClose();
      } else {
        throw new Error(data.error || 'Failed to change email');
      }
    } catch (error: any) {
      toast({
        title: 'Email Change Failed',
        description: error.message || 'An error occurred while changing your email.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatus = () => {
    return user?.is_verified ? 'Verified' : 'Unverified';
  };

  const getVerificationColor = () => {
    return user?.is_verified ? 'green' : 'orange';
  };

  return (
    <Box py={8} bg="#fafafa" minH="100vh">
      <Container maxW="4xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={2} textAlign="center">
            <Heading size="xl" color="gray.900">Account Settings</Heading>
            <Text fontSize="lg" color="gray.500">
              Manage your account information and security preferences.
            </Text>
          </VStack>

          {/* Profile Information */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <HStack spacing={3}>
                <FiUser color="#4A5568" size={20} />
                <Heading size="md" color="gray.900">Profile Information</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <form onSubmit={handleProfileUpdate}>
                <VStack spacing={5} align="stretch">
                  <HStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">First Name</FormLabel>
                      <Input
                        placeholder="Enter your first name"
                        value={profileForm.first_name}
                        onChange={(e) => handleProfileInputChange('first_name', e.target.value)}
                        size="md"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Last Name</FormLabel>
                      <Input
                        placeholder="Enter your last name"
                        value={profileForm.last_name}
                        onChange={(e) => handleProfileInputChange('last_name', e.target.value)}
                        size="md"
                      />
                    </FormControl>
                  </HStack>

                  <HStack spacing={4} justify="space-between" align="center">
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">Account Status</Text>
                      <Badge colorScheme={getVerificationColor()} variant="subtle" px={3} py={1} borderRadius="full">
                        {getVerificationStatus()}
                      </Badge>
                    </VStack>

                    <Button
                      type="submit"
                      leftIcon={<FiSave />}
                      bg="gray.900"
                      color="white"
                      _hover={{ bg: 'gray.800' }}
                      _active={{ bg: 'gray.700' }}
                      isLoading={loading}
                      loadingText="Updating..."
                      size="md"
                    >
                      Update Profile
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Subscription & Billing */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <HStack spacing={3}>
                <FiCreditCard color="#4A5568" size={20} />
                <Heading size="md" color="gray.900">Subscription & Billing</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} justify="space-between" align="center">
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">Current Plan</Text>
                    <Badge
                      colorScheme={getTierBadgeColor(subscription?.tier || 'free')}
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                    >
                      {formatTierName(subscription?.tier || 'free')}
                    </Badge>
                  </VStack>
                  <VStack spacing={1} align="end">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">Analyses Used</Text>
                    <Text fontSize="sm" color="gray.600">
                      {subscription?.analyses_used ?? 0} this period
                    </Text>
                  </VStack>
                </HStack>

                {subscription?.current_period_end && (
                  <>
                    <Divider borderColor="gray.200" />
                    <HStack spacing={4} justify="space-between" align="center">
                      <VStack spacing={1} align="start">
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">Billing Period Ends</Text>
                        <Text fontSize="sm" color="gray.600">
                          {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Text>
                      </VStack>
                    </HStack>
                  </>
                )}

                <Divider borderColor="gray.200" />

                <HStack spacing={3} justify="flex-end">
                  {subscription?.tier && subscription.tier.toLowerCase() !== 'free' && (
                    <Button
                      variant="outline"
                      borderColor="gray.300"
                      color="gray.700"
                      _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
                      onClick={() => paymentService.openBillingPortal()}
                      size="md"
                    >
                      Manage Billing
                    </Button>
                  )}
                  <Button
                    bg="gray.900"
                    color="white"
                    _hover={{ bg: 'gray.800' }}
                    _active={{ bg: 'gray.700' }}
                    onClick={() => navigate('/pricing')}
                    size="md"
                  >
                    Upgrade Plan
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Email Settings */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <HStack spacing={3}>
                <FiMail color="#4A5568" size={20} />
                <Heading size="md" color="gray.900">Email Settings</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <HStack spacing={4} justify="space-between" align="center">
                <VStack spacing={1} align="start">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">Current Email</Text>
                  <Text fontSize="sm" color="gray.600">{user?.email || 'N/A'}</Text>
                </VStack>
                <Button
                  leftIcon={<FiEdit3 />}
                  variant="outline"
                  borderColor="gray.300"
                  color="gray.700"
                  _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
                  onClick={onEmailModalOpen}
                >
                  Change Email
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Security Settings */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <HStack spacing={3}>
                <FiShield color="#4A5568" size={20} />
                <Heading size="md" color="gray.900">Security Settings</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} justify="space-between" align="center">
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">Password</Text>
                    <Text fontSize="sm" color="gray.500">Change your account password</Text>
                  </VStack>
                  <Button
                    leftIcon={<FiLock />}
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.700"
                    _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
                    onClick={onPasswordModalOpen}
                  >
                    Change Password
                  </Button>
                </HStack>

                <Divider borderColor="gray.200" />

                <HStack spacing={4} justify="space-between" align="center">
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">Two-Factor Authentication</Text>
                    <Text fontSize="sm" color="gray.500">Add an extra layer of security to your account</Text>
                  </VStack>
                  <Badge colorScheme="gray" variant="subtle" px={3} py={1} borderRadius="full">
                    Coming Soon
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Account Information */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <HStack spacing={3}>
                <FiUser color="#4A5568" size={20} />
                <Heading size="md" color="gray.900">Account Information</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} justify="space-between" align="center">
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">Member Since</Text>
                    <Text fontSize="sm" color="gray.600">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </Text>
                  </VStack>
                </HStack>

                <Divider borderColor="gray.200" />

                <HStack spacing={4} justify="space-between" align="center">
                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">Account ID</Text>
                    <Text fontSize="sm" color="gray.500" fontFamily="mono">
                      {user?.id || 'N/A'}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* API Keys */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <FiKey color="#4A5568" size={20} />
                  <Heading size="md" color="gray.900">API Keys</Heading>
                </HStack>
                <Button
                  leftIcon={<FiPlus />}
                  bg="gray.900"
                  color="white"
                  _hover={{ bg: 'gray.800' }}
                  _active={{ bg: 'gray.700' }}
                  size="sm"
                  onClick={() => {
                    setCreatedKeyFull(null);
                    setNewKeyName('');
                    onCreateKeyOpen();
                  }}
                >
                  Create API Key
                </Button>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              {apiKeysLoading ? (
                <VStack py={6}>
                  <Spinner size="sm" color="gray.400" />
                  <Text fontSize="sm" color="gray.500">Loading API keys...</Text>
                </VStack>
              ) : apiKeys.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={6}>
                  No API keys created yet.
                </Text>
              ) : (
                <VStack spacing={0} align="stretch" divider={<Divider borderColor="gray.100" />}>
                  {apiKeys.map((apiKey) => (
                    <Flex key={apiKey.id} py={4} align="center" justify="space-between" wrap="wrap" gap={3}>
                      <VStack spacing={0} align="start" flex={1} minW="200px">
                        <HStack spacing={2}>
                          <Text fontSize="sm" fontWeight="medium" color="gray.900">
                            {apiKey.name}
                          </Text>
                          <Badge
                            colorScheme={apiKey.is_active ? 'green' : 'gray'}
                            variant="subtle"
                            fontSize="2xs"
                            borderRadius="full"
                          >
                            {apiKey.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </HStack>
                        <HStack spacing={3}>
                          <Text fontSize="xs" color="gray.500" fontFamily="mono">
                            {apiKey.key_prefix}{'********'}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {apiKey.usage_count} request{apiKey.usage_count !== 1 ? 's' : ''}
                          </Text>
                        </HStack>
                      </VStack>
                      <HStack spacing={3}>
                        <Switch
                          size="sm"
                          isChecked={apiKey.is_active}
                          onChange={() => handleToggleApiKey(apiKey.id, apiKey.is_active)}
                          colorScheme="green"
                        />
                        <IconButton
                          aria-label="Delete API key"
                          icon={<FiTrash2 />}
                          variant="ghost"
                          size="sm"
                          color="red.500"
                          _hover={{ bg: 'red.50' }}
                          onClick={() => {
                            setKeyToDelete(apiKey.id);
                            onDeleteKeyOpen();
                          }}
                        />
                      </HStack>
                    </Flex>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>

        {/* Email Change Modal */}
        <Modal isOpen={isEmailModalOpen} onClose={onEmailModalClose} isCentered>
          <ModalOverlay bg="blackAlpha.400" />
          <ModalContent bg="white" border="1px solid" borderColor="gray.200" shadow="lg">
            <ModalHeader>
              <HStack spacing={3}>
                <FiMail color="#4A5568" size={20} />
                <Text color="gray.900">Change Email Address</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="gray.500" />
            <form onSubmit={handleEmailChange}>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">New Email Address</FormLabel>
                    <Input
                      type="email"
                      placeholder="Enter your new email address"
                      value={emailForm.new_email}
                      onChange={(e) => handleEmailInputChange('new_email', e.target.value)}
                      size="md"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Current Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showEmailPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        value={emailForm.current_password}
                        onChange={(e) => handleEmailInputChange('current_password', e.target.value)}
                        size="md"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showEmailPassword ? 'Hide password' : 'Show password'}
                          icon={showEmailPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          color="gray.500"
                          onClick={() => setShowEmailPassword(!showEmailPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription fontSize="sm" color="gray.700">
                      Changing your email will require verification of the new address.
                    </AlertDescription>
                  </Alert>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onEmailModalClose} color="gray.600">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="gray.900"
                  color="white"
                  _hover={{ bg: 'gray.800' }}
                  _active={{ bg: 'gray.700' }}
                  isLoading={loading}
                  loadingText="Changing..."
                >
                  Change Email
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Password Change Modal */}
        <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose} isCentered>
          <ModalOverlay bg="blackAlpha.400" />
          <ModalContent bg="white" border="1px solid" borderColor="gray.200" shadow="lg">
            <ModalHeader>
              <HStack spacing={3}>
                <FiLock color="#4A5568" size={20} />
                <Text color="gray.900">Change Password</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="gray.500" />
            <form onSubmit={handlePasswordChange}>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Current Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        value={passwordForm.old_password}
                        onChange={(e) => handlePasswordInputChange('old_password', e.target.value)}
                        size="md"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                          icon={showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          color="gray.500"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">New Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        value={passwordForm.new_password}
                        onChange={(e) => handlePasswordInputChange('new_password', e.target.value)}
                        size="md"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          color="gray.500"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Confirm New Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        value={passwordForm.new_password_confirm}
                        onChange={(e) => handlePasswordInputChange('new_password_confirm', e.target.value)}
                        size="md"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          color="gray.500"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  {passwordForm.new_password && passwordForm.new_password_confirm &&
                   passwordForm.new_password !== passwordForm.new_password_confirm && (
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription fontSize="sm" color="gray.700">
                        New passwords do not match
                      </AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onPasswordModalClose} color="gray.600">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="gray.900"
                  color="white"
                  _hover={{ bg: 'gray.800' }}
                  _active={{ bg: 'gray.700' }}
                  isLoading={loading}
                  loadingText="Changing..."
                >
                  Change Password
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Create API Key Modal */}
        <Modal isOpen={isCreateKeyOpen} onClose={() => { onCreateKeyClose(); setCreatedKeyFull(null); }} isCentered>
          <ModalOverlay bg="blackAlpha.400" />
          <ModalContent bg="white" border="1px solid" borderColor="gray.200" shadow="lg">
            <ModalHeader>
              <HStack spacing={3}>
                <FiKey color="#4A5568" size={20} />
                <Text color="gray.900">Create API Key</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="gray.500" />
            <ModalBody>
              <VStack spacing={4}>
                {!createdKeyFull ? (
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Key Name</FormLabel>
                    <Input
                      placeholder="e.g., Production, Development"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCreateApiKey(); }}
                    />
                  </FormControl>
                ) : (
                  <VStack spacing={3} w="full">
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription fontSize="sm">
                        Copy this key now. It will not be shown again.
                      </AlertDescription>
                    </Alert>
                    <InputGroup>
                      <Input
                        value={createdKeyFull}
                        isReadOnly
                        fontSize="sm"
                        fontFamily="mono"
                        bg="#fafafa"
                        borderColor="gray.200"
                        pr="3rem"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="Copy key"
                          icon={<FiCopy />}
                          size="sm"
                          variant="ghost"
                          color="gray.600"
                          onClick={() => handleCopyKey(createdKeyFull)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </VStack>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              {!createdKeyFull ? (
                <>
                  <Button variant="ghost" mr={3} onClick={onCreateKeyClose} color="gray.600">
                    Cancel
                  </Button>
                  <Button
                    bg="gray.900"
                    color="white"
                    _hover={{ bg: 'gray.800' }}
                    _active={{ bg: 'gray.700' }}
                    onClick={handleCreateApiKey}
                    isLoading={apiKeyActionLoading}
                    isDisabled={!newKeyName.trim()}
                  >
                    Create Key
                  </Button>
                </>
              ) : (
                <Button bg="gray.900" color="white" _hover={{ bg: 'gray.800' }} onClick={() => { onCreateKeyClose(); setCreatedKeyFull(null); }}>
                  Done
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete API Key Confirmation Modal */}
        <Modal isOpen={isDeleteKeyOpen} onClose={onDeleteKeyClose} isCentered>
          <ModalOverlay bg="blackAlpha.400" />
          <ModalContent bg="white" border="1px solid" borderColor="gray.200" shadow="lg">
            <ModalHeader>
              <Text color="red.600">Delete API Key</Text>
            </ModalHeader>
            <ModalCloseButton color="gray.500" />
            <ModalBody>
              <Text fontSize="sm" color="gray.700">
                Are you sure you want to permanently delete this API key? Any applications using this key will lose access.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteKeyClose} color="gray.600">
                Cancel
              </Button>
              <Button
                bg="red.600"
                color="white"
                _hover={{ bg: 'red.700' }}
                onClick={handleDeleteApiKey}
                isLoading={apiKeyActionLoading}
              >
                Delete Key
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default SettingsPage;
