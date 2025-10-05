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
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiSave, FiEdit3, FiShield } from 'react-icons/fi';
import { useAuth } from '../../auth/AuthContext';
import { authService } from '../../auth/authService';

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
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

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

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
      const response = await fetch('http://localhost:8000/api/v1/auth/profile/update/', {
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
      const response = await fetch('http://localhost:8000/api/v1/auth/change-password/', {
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
      const response = await fetch('http://localhost:8000/api/v1/auth/change-email/', {
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
    <Box py={8} bg="#140d28" minH="100vh">
      <Container maxW="4xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color="white" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Account Settings</Heading>
            <Text fontSize="lg" color="rgba(255,255,255,0.8)">
              Manage your account information and security preferences.
            </Text>
          </VStack>

          {/* Profile Information */}
          <Card 
            bg="rgba(255,255,255,0.05)" 
            border="1px solid rgba(255,255,255,0.1)"
            backdropFilter="blur(20px)"
            boxShadow="0 8px 32px rgba(0,0,0,0.3)"
          >
            <CardHeader>
              <HStack spacing={3}>
                <FiUser color="#667eea" size={24} />
                <Heading size="md" color="white" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Profile Information</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleProfileUpdate}>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" fontSize="sm" color="white">First Name</FormLabel>
                      <Input
                        placeholder="Enter your first name"
                        value={profileForm.first_name}
                        onChange={(e) => handleProfileInputChange('first_name', e.target.value)}
                        size="md"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="rgba(255,255,255,0.2)"
                        bg="rgba(255,255,255,0.1)"
                        color="white"
                        _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                        _focus={{ 
                          borderColor: 'rgba(255,255,255,0.2)',
                          bg: 'rgba(255,255,255,0.1)',
                          boxShadow: 'none'
                        }}
                        _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" fontSize="sm" color="white">Last Name</FormLabel>
                      <Input
                        placeholder="Enter your last name"
                        value={profileForm.last_name}
                        onChange={(e) => handleProfileInputChange('last_name', e.target.value)}
                        size="md"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="rgba(255,255,255,0.2)"
                        bg="rgba(255,255,255,0.1)"
                        color="white"
                        _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                        _focus={{ 
                          borderColor: 'rgba(255,255,255,0.2)',
                          bg: 'rgba(255,255,255,0.1)',
                          boxShadow: 'none'
                        }}
                        _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                      />
                    </FormControl>
                  </HStack>

                  <HStack spacing={4} justify="space-between" align="center">
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" fontWeight="semibold" color="white">Account Status</Text>
                      <Badge colorScheme={getVerificationColor()} variant="subtle" px={3} py={1} borderRadius="full">
                        {getVerificationStatus()}
                      </Badge>
                    </VStack>

                    <Button
                      type="submit"
                      leftIcon={<FiSave />}
                      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      color="white"
                      border="none"
                      _focus={{ boxShadow: 'none', outline: 'none' }}
                      _hover={{
                        bg: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: 'md',
                      }}
                      _active={{ transform: 'translateY(0)' }}
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

          {/* Email Settings */}
          <Card 
            bg="rgba(255,255,255,0.05)" 
            border="1px solid rgba(255,255,255,0.1)"
            backdropFilter="blur(20px)"
            boxShadow="0 8px 32px rgba(0,0,0,0.3)"
          >
            <CardHeader>
              <HStack spacing={3}>
                <FiMail color="#667eea" size={24} />
                <Heading size="md" color="white" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Email Settings</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} justify="space-between" align="center">
                  <VStack spacing={1} align="start">
                    <Text fontSize="md" fontWeight="semibold" color="white">Current Email</Text>
                    <Text fontSize="sm" color="rgba(255,255,255,0.8)">{user?.email || 'N/A'}</Text>
                  </VStack>
                  <Button
                    leftIcon={<FiEdit3 />}
                    variant="outline"
                    borderColor="rgba(255,255,255,0.2)"
                    color="white"
                    _focus={{ boxShadow: 'none', outline: 'none' }}
                    _hover={{
                      bg: 'rgba(255,255,255,0.1)',
                      borderColor: '#667eea',
                      color: '#667eea',
                    }}
                    onClick={onEmailModalOpen}
                  >
                    Change Email
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Security Settings */}
          <Card 
            bg="rgba(255,255,255,0.05)" 
            border="1px solid rgba(255,255,255,0.1)"
            backdropFilter="blur(20px)"
            boxShadow="0 8px 32px rgba(0,0,0,0.3)"
          >
            <CardHeader>
              <HStack spacing={3}>
                <FiShield color="#667eea" size={24} />
                <Heading size="md" color="white" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Security Settings</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} justify="space-between" align="center">
                  <VStack spacing={1} align="start">
                    <Text fontSize="md" fontWeight="semibold" color="white">Password</Text>
                    <Text fontSize="sm" color="rgba(255,255,255,0.8)">Change your account password</Text>
                  </VStack>
                  <Button
                    leftIcon={<FiLock />}
                    variant="outline"
                    borderColor="rgba(255,255,255,0.2)"
                    color="white"
                    _focus={{ boxShadow: 'none', outline: 'none' }}
                    _hover={{
                      bg: 'rgba(255,255,255,0.1)',
                      borderColor: '#667eea',
                      color: '#667eea',
                    }}
                    onClick={onPasswordModalOpen}
                  >
                    Change Password
                  </Button>
                </HStack>

                <Divider />

                <HStack spacing={4} justify="space-between" align="center">
                  <VStack spacing={1} align="start">
                    <Text fontSize="md" fontWeight="semibold" color="gray.800">Two-Factor Authentication</Text>
                    <Text fontSize="sm" color="gray.600">Add an extra layer of security to your account</Text>
                  </VStack>
                  <Badge colorScheme="gray" variant="subtle" px={3} py={1} borderRadius="full">
                    Coming Soon
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Account Information */}
          <Card 
            bg="rgba(255,255,255,0.05)" 
            border="1px solid rgba(255,255,255,0.1)"
            backdropFilter="blur(20px)"
            boxShadow="0 8px 32px rgba(0,0,0,0.3)"
          >
            <CardHeader>
              <HStack spacing={3}>
                <FiMail color="#667eea" size={24} />
                <Heading size="md" color="white" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Account Information</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} justify="space-between" align="center">
                  <VStack spacing={1} align="start">
                    <Text fontSize="md" fontWeight="semibold" color="white">Member Since</Text>
                    <Text fontSize="sm" color="rgba(255,255,255,0.8)">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </Text>
                  </VStack>
                </HStack>

                <Divider />

                <HStack spacing={4} justify="space-between" align="center">
                  <VStack spacing={1} align="start">
                    <Text fontSize="md" fontWeight="semibold" color="gray.800">Account ID</Text>
                    <Text fontSize="sm" color="gray.600" fontFamily="mono">
                      {user?.id || 'N/A'}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Email Change Modal */}
        <Modal isOpen={isEmailModalOpen} onClose={onEmailModalClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={3}>
                <FiMail color="#667eea" size={20} />
                <Text>Change Email Address</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleEmailChange}>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" fontSize="sm" color="gray.700">New Email Address</FormLabel>
                    <Input
                      type="email"
                      placeholder="Enter your new email address"
                      value={emailForm.new_email}
                      onChange={(e) => handleEmailInputChange('new_email', e.target.value)}
                      size="md"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.300"
                      bg="white"
                      color="gray.800"
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" fontSize="sm" color="gray.700">Current Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showEmailPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        value={emailForm.current_password}
                        onChange={(e) => handleEmailInputChange('current_password', e.target.value)}
                        size="md"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.300"
                        bg="white"
                        color="gray.800"
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showEmailPassword ? 'Hide password' : 'Show password'}
                          icon={showEmailPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          _focus={{ boxShadow: 'none', outline: 'none' }}
                          onClick={() => setShowEmailPassword(!showEmailPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      Changing your email will require verification of the new address.
                    </AlertDescription>
                  </Alert>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onEmailModalClose} _focus={{ boxShadow: 'none', outline: 'none' }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  border="none"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                  _hover={{
                    bg: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }}
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
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={3}>
                <FiLock color="#667eea" size={20} />
                <Text>Change Password</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handlePasswordChange}>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" fontSize="sm" color="gray.700">Current Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        value={passwordForm.old_password}
                        onChange={(e) => handlePasswordInputChange('old_password', e.target.value)}
                        size="md"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.300"
                        bg="white"
                        color="gray.800"
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                          icon={showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          _focus={{ boxShadow: 'none', outline: 'none' }}
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" fontSize="sm" color="gray.700">New Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        value={passwordForm.new_password}
                        onChange={(e) => handlePasswordInputChange('new_password', e.target.value)}
                        size="md"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.300"
                        bg="white"
                        color="gray.800"
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          _focus={{ boxShadow: 'none', outline: 'none' }}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" fontSize="sm" color="gray.700">Confirm New Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        value={passwordForm.new_password_confirm}
                        onChange={(e) => handlePasswordInputChange('new_password_confirm', e.target.value)}
                        size="md"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.300"
                        bg="white"
                        color="gray.800"
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          variant="ghost"
                          size="sm"
                          _focus={{ boxShadow: 'none', outline: 'none' }}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  {passwordForm.new_password && passwordForm.new_password_confirm && 
                   passwordForm.new_password !== passwordForm.new_password_confirm && (
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription fontSize="sm">
                        New passwords do not match
                      </AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onPasswordModalClose} _focus={{ boxShadow: 'none', outline: 'none' }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  border="none"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                  _hover={{
                    bg: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }}
                  isLoading={loading}
                  loadingText="Changing..."
                >
                  Change Password
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default SettingsPage;
