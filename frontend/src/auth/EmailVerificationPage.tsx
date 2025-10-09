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
  useColorModeValue,
  Code,
  Divider,
} from '@chakra-ui/react';
import { FiArrowLeft, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from './AuthContext';

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
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  // Color mode values
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  // Countdown timer
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
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
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
      const response = await fetch(`http://localhost:8000/api/v1/auth/verify-email-code/`, {
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
        
        // Save token to localStorage for auto-login
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          console.log('✅ Token saved after email verification');
        }
        
        // Update user in context if we have user data
        if (data.user) {
          setUser(data.user);
        }
        
        // Redirect to dashboard after a short delay
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
      const response = await fetch(`http://localhost:8000/api/v1/auth/send-verification-email/`, {
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
        setTimeLeft(15 * 60); // Reset timer
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
    <Box minH="100vh" bg="#140d28" py={12}>
      <Container maxW="md">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h1"
              size="xl"
              bgGradient="linear(to-r, #667eea, #764ba2)"
              bgClip="text"
              fontWeight="bold"
            >
              Verify Your Email
            </Heading>
            <Text color="gray.400" fontSize="lg">
              We've sent a verification code to
            </Text>
            <Code colorScheme="purple" fontSize="md" px={3} py={1}>
              {email}
            </Code>
          </VStack>

          {/* Verification Form */}
          <Box
            bg={bg}
            p={8}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            boxShadow="xl"
          >
            <form onSubmit={handleVerifyCode}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="semibold">
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
                    _focus={{
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 1px #667eea',
                    }}
                  />
                </FormControl>

                {/* Timer */}
                {timeLeft > 0 && (
                  <Text color="gray.500" fontSize="sm">
                    Code expires in: <Text as="span" fontWeight="bold" color="red.500">
                      {formatTime(timeLeft)}
                    </Text>
                  </Text>
                )}

                {/* Error Message */}
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Success Message */}
                {success && (
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Verify Button */}
                <Button
                  type="submit"
                  colorScheme="purple"
                  size="lg"
                  width="full"
                  isLoading={isVerifying}
                  loadingText="Verifying..."
                  isDisabled={verificationCode.length !== 6 || timeLeft === 0}
                  leftIcon={<FiCheckCircle />}
                >
                  Verify Email
                </Button>

                <Divider />

                {/* Resend Code */}
                <VStack spacing={3} width="full">
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    Didn't receive the code?
                  </Text>
                  <Button
                    variant="outline"
                    colorScheme="purple"
                    size="md"
                    width="full"
                    onClick={handleResendCode}
                    isLoading={isResending}
                    loadingText="Sending..."
                    isDisabled={timeLeft > 14 * 60} // Disable for first minute
                    leftIcon={<FiRefreshCw />}
                  >
                    Resend Code
                  </Button>
                </VStack>

                {/* Back to Login */}
                <Button
                  variant="ghost"
                  colorScheme="purple"
                  size="sm"
                  onClick={handleBackToLogin}
                  leftIcon={<FiArrowLeft />}
                >
                  Back to Login
                </Button>
              </VStack>
            </form>
          </Box>

          {/* Help Text */}
          <Box textAlign="center">
            <Text color="gray.400" fontSize="sm">
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
