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
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from './AuthContext';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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

      if (result && typeof result === 'object' && 'email_verification_required' in result) {
        navigate('/verify-email', {
          state: {
            email: formData.email,
            user: result.user,
            email_verification_required: true,
            email_send_failed: result.email_send_failed
          }
        });
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      setLocalError(error.message || 'Registration failed');
    }
  };

  const displayError = localError || error;

  return (
    <Box minH="100vh" bg="#fafafa" py={12}>
      <Container maxW="md">
        <VStack spacing={8} align="stretch">
          <VStack spacing={4} textAlign="center">
            <Button
              variant="ghost"
              leftIcon={<FiArrowLeft />}
              onClick={() => navigate('/')}
              alignSelf="flex-start"
              color="gray.600"
              _hover={{ bg: 'gray.100' }}
            >
              Back to Home
            </Button>

            <Heading
              size="xl"
              color="gray.900"
              fontWeight="bold"
            >
              Join KairosAI
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Create your account to start your market intelligence journey
            </Text>
          </VStack>

          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
            shadow="sm"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {displayError && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>{displayError}</AlertDescription>
                  </Alert>
                )}

                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="medium">
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
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="medium">
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
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="medium">
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
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="medium">
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
                    />
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => setShowPassword(!showPassword)}
                      color="gray.500"
                      _hover={{ color: 'gray.700', bg: 'gray.100' }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </HStack>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="medium">
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
                    />
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      color="gray.500"
                      _hover={{ color: 'gray.700', bg: 'gray.100' }}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </HStack>
                </FormControl>

                <Button
                  type="submit"
                  bg="gray.900"
                  color="white"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                  spinner={<Spinner size="sm" />}
                  borderRadius="lg"
                  fontWeight="semibold"
                  _hover={{ bg: 'gray.800' }}
                >
                  Create Account
                </Button>
              </VStack>
            </form>
          </Box>

          <Text color="gray.600" textAlign="center">
            Already have an account?{' '}
            <Link to="/login">
              <Text as="span" color="gray.900" fontWeight="semibold" _hover={{ textDecoration: 'underline' }}>
                Sign in here
              </Text>
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default RegisterPage;
