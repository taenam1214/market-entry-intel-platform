import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Spinner, useColorModeValue } from '@chakra-ui/react';
import { googleAuthService } from '../services/googleAuthService';
import type { GoogleAuthResponse, GoogleUser } from '../types/googleAuth';

interface GoogleAuthButtonProps {
  onSuccess: (user: GoogleUser) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  isLoading = false,
  disabled = false,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        await googleAuthService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        onError('Failed to load Google authentication');
      }
    };

    initializeGoogleAuth();
  }, [onError]);

  useEffect(() => {
    if (isInitialized && buttonRef.current && !isVerifying) {
      try {
        googleAuthService.renderButton(buttonRef.current, handleGoogleResponse);
      } catch (error) {
        console.error('Failed to render Google button:', error);
        onError('Failed to render Google authentication button');
      }
    }
  }, [isInitialized, isVerifying]);

  const handleGoogleResponse = async (response: GoogleAuthResponse) => {
    if (isVerifying) return;
    
    setIsVerifying(true);
    try {
      const user = await googleAuthService.verifyToken(response.credential);
      onSuccess(user);
    } catch (error: any) {
      onError(error.message || 'Google authentication failed');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading || isVerifying) {
    return (
      <Button
        width="full"
        size="lg"
        disabled
        bg={bg}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        _hover={{ bg: bg }}
        _active={{ bg: bg }}
      >
        <Spinner size="sm" mr={2} />
        {isVerifying ? 'Verifying...' : 'Loading...'}
      </Button>
    );
  }

  if (!isInitialized) {
    return (
      <Button
        width="full"
        size="lg"
        disabled
        bg={bg}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        _hover={{ bg: bg }}
        _active={{ bg: bg }}
      >
        <Spinner size="sm" mr={2} />
        Initializing...
      </Button>
    );
  }

  return (
    <Box
      ref={buttonRef}
      width="full"
      opacity={disabled ? 0.6 : 1}
      pointerEvents={disabled ? 'none' : 'auto'}
    />
  );
};

export default GoogleAuthButton;
