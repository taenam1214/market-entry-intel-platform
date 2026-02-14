import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  Code,
  Divider,
} from '@chakra-ui/react';
import { FiArrowLeft, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS } from '../config/api';

interface LocationState {
  email?: string;
  user?: any;
  email_verification_required?: boolean;
}

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  const state = location.state as LocationState;
  const email = state?.email || user?.email || '';

  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    if (error) setError(null);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: verificationCode,
          verification_type: 'signup',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email verified successfully! Redirecting to dashboard...');

        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }

        if (data.user) {
          setUser(data.user);
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (error: any) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setSuccess(null);
    setIsResending(true);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.SEND_VERIFICATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          verification_type: 'signup',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Verification code sent successfully!');
        setTimeLeft(15 * 60);
      } else {
        setError(data.error || 'Failed to resend verification code');
      }
    } catch (error: any) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg="#fafafa" py={12}>
      <Container maxW="md">
        <VStack spacing={8} align="stretch">
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h1"
              size="xl"
              color="gray.900"
              fontWeight="bold"
            >
              Verify Your Email
            </Heading>
            <Text color="gray.600" fontSize="lg">
              We've sent a verification code to
            </Text>
            <Code fontSize="md" px={3} py={1}>
              {email}
            </Code>
          </VStack>

          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
            shadow="sm"
          >
            <form onSubmit={handleVerifyCode}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color="gray.700" fontWeight="semibold">
                    Verification Code
                  </FormLabel>
                  <Input
                    type="text"
                    value={verificationCode}
                    onChange={handleCodeChange}
                    placeholder="Enter 6-digit code"
                    size="lg"
                    textAlign="center"
                    fontSize="xl"
                    letterSpacing="0.2em"
                    fontWeight="bold"
                    maxLength={6}
                  />
                </FormControl>

                {timeLeft > 0 && (
                  <Text color="gray.500" fontSize="sm">
                    Code expires in:{' '}
                    <Text as="span" fontWeight="bold" color="red.500">
                      {formatTime(timeLeft)}
                    </Text>
                  </Text>
                )}

                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  bg="gray.900"
                  color="white"
                  size="lg"
                  width="full"
                  isLoading={isVerifying}
                  loadingText="Verifying..."
                  isDisabled={verificationCode.length !== 6 || timeLeft === 0}
                  leftIcon={<FiCheckCircle />}
                  _hover={{ bg: 'gray.800' }}
                >
                  Verify Email
                </Button>

                <Divider borderColor="gray.200" />

                <VStack spacing={3} width="full">
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    Didn't receive the code?
                  </Text>
                  <Button
                    variant="outline"
                    size="md"
                    width="full"
                    onClick={handleResendCode}
                    isLoading={isResending}
                    loadingText="Sending..."
                    isDisabled={timeLeft > 14 * 60}
                    leftIcon={<FiRefreshCw />}
                    borderColor="gray.300"
                    color="gray.700"
                    _hover={{ bg: 'gray.50' }}
                  >
                    Resend Code
                  </Button>
                </VStack>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToLogin}
                  leftIcon={<FiArrowLeft />}
                  color="gray.600"
                  _hover={{ bg: 'gray.100' }}
                >
                  Back to Login
                </Button>
              </VStack>
            </form>
          </Box>

          <Box textAlign="center">
            <Text color="gray.500" fontSize="sm">
              Check your spam folder if you don't see the email.
              <br />
              The verification code will expire in 15 minutes.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default EmailVerificationPage;
