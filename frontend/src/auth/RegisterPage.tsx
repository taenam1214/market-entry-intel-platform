import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  Divider,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from './AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import type { GoogleUser } from '../types/googleAuth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Color mode values
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear local error when user starts typing
    if (localError) setLocalError(null);
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    if (!formData.password.trim()) {
      setLocalError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    if (!formData.first_name.trim()) {
      setLocalError('First name is required');
      return false;
    }
    if (!formData.last_name.trim()) {
      setLocalError('Last name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      // Navigate to dashboard on successful registration
      navigate('/dashboard');
    } catch (error: any) {
      setLocalError(error.message || 'Registration failed');
    }
  };

  const handleGoogleSuccess = async (_user: GoogleUser) => {
    try {
      // The GoogleAuthButton already handles the backend authentication
      // We just need to update the auth context and navigate
      navigate('/dashboard');
    } catch (error: any) {
      setLocalError(error.message || 'Google authentication failed');
    }
  };

  const handleGoogleError = (error: string) => {
    setLocalError(error);
  };

  const displayError = localError || error;

  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      <Container maxW="lg">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Button
              variant="ghost"
              leftIcon={<FiArrowLeft />}
              onClick={() => navigate('/')}
              alignSelf="flex-start"
              color="purple.600"
            >
              Back to Home
            </Button>
            
            <Heading 
              size="xl" 
              color={textColor}
              fontWeight="bold"
              fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
            >
              Join KairosAI
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Create your account to start your market intelligence journey
            </Text>
          </VStack>

          {/* Registration Form */}
          <Box bg={bg} p={8} borderRadius="xl" shadow="lg" border="1px" borderColor={borderColor}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {/* Error Alert */}
                {displayError && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>{displayError}</AlertDescription>
                  </Alert>
                )}

                {/* Name Fields */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel color={textColor} fontWeight="medium">
                      First Name
                    </FormLabel>
                    <Input
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      size="lg"
                      borderRadius="lg"
                      borderColor={borderColor}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                      }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color={textColor} fontWeight="medium">
                      Last Name
                    </FormLabel>
                    <Input
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      size="lg"
                      borderRadius="lg"
                      borderColor={borderColor}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                      }}
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Email Field */}
                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="medium">
                    Email Address
                  </FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    size="lg"
                    borderRadius="lg"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'purple.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                    }}
                  />
                </FormControl>

                {/* Password Fields */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel color={textColor} fontWeight="medium">
                      Password
                    </FormLabel>
                    <HStack>
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a password"
                        size="lg"
                        borderRadius="lg"
                        borderColor={borderColor}
                        _focus={{
                          borderColor: 'purple.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setShowPassword(!showPassword)}
                        color="gray.500"
                        _hover={{ color: 'purple.600' }}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </Button>
                    </HStack>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color={textColor} fontWeight="medium">
                      Confirm Password
                    </FormLabel>
                    <HStack>
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        size="lg"
                        borderRadius="lg"
                        borderColor={borderColor}
                        _focus={{
                          borderColor: 'purple.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        color="gray.500"
                        _hover={{ color: 'purple.600' }}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </Button>
                    </HStack>
                  </FormControl>
                </SimpleGrid>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="purple"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                  spinner={<Spinner size="sm" />}
                  borderRadius="lg"
                  fontWeight="semibold"
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  Create Account
                </Button>

                {/* Divider */}
                <HStack width="full">
                  <Divider />
                  <Text color="gray.500" fontSize="sm" px={2}>
                    OR
                  </Text>
                  <Divider />
                </HStack>

                {/* Google OAuth Button */}
                <GoogleAuthButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  isLoading={isLoading}
                />
              </VStack>
            </form>
          </Box>

          {/* Footer */}
          <VStack spacing={4}>
            <Divider />
            <Text color="gray.600" textAlign="center">
              Already have an account?{' '}
              <Link to="/login">
                <Text as="span" color="purple.600" fontWeight="semibold" _hover={{ textDecoration: 'underline' }}>
                  Sign in here
                </Text>
              </Link>
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default RegisterPage;