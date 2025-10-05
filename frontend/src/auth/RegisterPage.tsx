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
      const result = await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      
      // Check if email verification is required
      if (result && result.email_verification_required) {
        // Navigate to email verification page
        navigate('/verify-email', {
          state: {
            email: formData.email,
            user: result.user,
            email_verification_required: true,
            email_send_failed: result.email_send_failed
          }
        });
      } else {
        // Navigate to dashboard on successful registration (e.g., Google OAuth)
        navigate('/dashboard');
      }
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
    <Box minH="100vh" bg="#140d28" py={12}>
      <Container maxW="xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Button
              variant="ghost"
              leftIcon={<FiArrowLeft />}
              onClick={() => navigate('/')}
              alignSelf="flex-start"
              color="white"
              _focus={{ boxShadow: 'none', outline: 'none' }}
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
            >
              Back to Home
            </Button>
            
            <Heading 
              size="xl" 
              color="white"
              fontWeight="bold"
              fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
            >
              Join KairosAI
            </Heading>
            <Text color="rgba(255,255,255,0.8)" fontSize="lg">
              Create your account to start your market intelligence journey
            </Text>
          </VStack>

          {/* Registration Form */}
          <Box 
            bg="rgba(255,255,255,0.05)" 
            p={8} 
            borderRadius="xl" 
            backdropFilter="blur(20px)"
            border="1px solid rgba(255,255,255,0.1)"
            boxShadow="0 8px 32px rgba(0,0,0,0.3)"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {/* Error Alert */}
                {displayError && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>{displayError}</AlertDescription>
                  </Alert>
                )}

                {/* First Name Field */}
                <FormControl isRequired>
                  <FormLabel color="white" fontWeight="medium">
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
                    bg="rgba(255,255,255,0.1)"
                    borderColor="rgba(255,255,255,0.2)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none',
                    }}
                    _hover={{
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  />
                </FormControl>

                {/* Last Name Field */}
                <FormControl isRequired>
                  <FormLabel color="white" fontWeight="medium">
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
                    bg="rgba(255,255,255,0.1)"
                    borderColor="rgba(255,255,255,0.2)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none',
                    }}
                    _hover={{
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  />
                </FormControl>

                {/* Email Field */}
                <FormControl isRequired>
                  <FormLabel color="white" fontWeight="medium">
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
                    bg="rgba(255,255,255,0.1)"
                    borderColor="rgba(255,255,255,0.2)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none',
                    }}
                    _hover={{
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  />
                </FormControl>

                {/* Password Field */}
                <FormControl isRequired>
                  <FormLabel color="white" fontWeight="medium">
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
                      bg="rgba(255,255,255,0.1)"
                      borderColor="rgba(255,255,255,0.2)"
                      color="white"
                      _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                      _focus={{
                        borderColor: 'rgba(255,255,255,0.2)',
                        bg: 'rgba(255,255,255,0.1)',
                        boxShadow: 'none',
                      }}
                      _hover={{
                        borderColor: 'rgba(255,255,255,0.3)',
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => setShowPassword(!showPassword)}
                      color="rgba(255,255,255,0.7)"
                      _focus={{ boxShadow: 'none', outline: 'none' }}
                      _hover={{ color: '#667eea', bg: 'rgba(255,255,255,0.1)' }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </HStack>
                </FormControl>

                {/* Confirm Password Field */}
                <FormControl isRequired>
                  <FormLabel color="white" fontWeight="medium">
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
                      bg="rgba(255,255,255,0.1)"
                      borderColor="rgba(255,255,255,0.2)"
                      color="white"
                      _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                      _focus={{
                        borderColor: 'rgba(255,255,255,0.2)',
                        bg: 'rgba(255,255,255,0.1)',
                        boxShadow: 'none',
                      }}
                      _hover={{
                        borderColor: 'rgba(255,255,255,0.3)',
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      color="rgba(255,255,255,0.7)"
                      _focus={{ boxShadow: 'none', outline: 'none' }}
                      _hover={{ color: '#667eea', bg: 'rgba(255,255,255,0.1)' }}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </HStack>
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                  spinner={<Spinner size="sm" />}
                  borderRadius="lg"
                  fontWeight="semibold"
                  border="none"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                  _hover={{
                    bg: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                  }}
                  _active={{ transform: 'translateY(0)' }}
                >
                  Create Account
                </Button>

                {/* Divider */}
                <HStack width="full">
                  <Divider borderColor="rgba(255,255,255,0.2)" />
                  <Text color="rgba(255,255,255,0.6)" fontSize="sm" px={2}>
                    OR
                  </Text>
                  <Divider borderColor="rgba(255,255,255,0.2)" />
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
            <Divider borderColor="rgba(255,255,255,0.2)" />
            <Text color="rgba(255,255,255,0.8)" textAlign="center">
              Already have an account?{' '}
              <Link to="/login">
                <Text as="span" color="#667eea" fontWeight="semibold" _hover={{ textDecoration: 'underline' }}>
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