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

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (localError) setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

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
      navigate('/dashboard');
    } catch (error: any) {
      setLocalError(error.message || 'Login failed');
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
              Welcome Back
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Sign in to your KairosAI account
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
                      placeholder="Enter your password"
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

                <Button
                  type="submit"
                  bg="gray.900"
                  color="white"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  spinner={<Spinner size="sm" />}
                  borderRadius="lg"
                  fontWeight="semibold"
                  _hover={{ bg: 'gray.800' }}
                >
                  Sign In
                </Button>
              </VStack>
            </form>
          </Box>

          <Text color="gray.600" textAlign="center">
            Don't have an account?{' '}
            <Link to="/register">
              <Text as="span" color="gray.900" fontWeight="semibold" _hover={{ textDecoration: 'underline' }}>
                Sign up here
              </Text>
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginPage;
