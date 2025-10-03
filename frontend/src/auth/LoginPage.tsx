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
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from './AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import type { GoogleUser } from '../types/googleAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Basic validation
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (!formData.email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (!formData.password.trim()) {
      setLocalError('Password is required');
      return;
    }

    try {
      await login(formData.email, formData.password);
      // Navigate to dashboard on successful login
      navigate('/dashboard');
    } catch (error: any) {
      setLocalError(error.message || 'Login failed');
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
      <Container maxW="md">
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
              Welcome Back
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Sign in to your KairosAI account
            </Text>
          </VStack>

          {/* Login Form */}
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

                {/* Password Field */}
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
                      placeholder="Enter your password"
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="purple"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  spinner={<Spinner size="sm" />}
                  borderRadius="lg"
                  fontWeight="semibold"
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  Sign In
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
              Don't have an account?{' '}
              <Link to="/register">
                <Text as="span" color="purple.600" fontWeight="semibold" _hover={{ textDecoration: 'underline' }}>
                  Sign up here
                </Text>
              </Link>
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginPage;