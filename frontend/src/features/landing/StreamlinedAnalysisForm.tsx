import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useAuth } from '../../auth/AuthContext';
import AnalysisForm from '../../components/AnalysisForm';

interface StreamlinedAnalysisFormProps {
  customerSegments: Array<{ value: string; label: string; description: string }>;
  expansionDirections: Array<{ value: string; label: string; description: string }>;
  targetMarkets: Array<{ value: string; label: string }>;
  companySizes: Array<{ value: string; label: string }>;
  revenueRanges: Array<{ value: string; label: string }>;
  fundingStages: Array<{ value: string; label: string }>;
  expansionTimelines: Array<{ value: string; label: string }>;
  budgetRanges: Array<{ value: string; label: string }>;
}

const StreamlinedAnalysisForm: React.FC<StreamlinedAnalysisFormProps> = ({
  customerSegments,
  expansionDirections,
  targetMarkets,
  companySizes,
  revenueRanges,
  fundingStages,
  expansionTimelines,
  budgetRanges,
}) => {
  const { user } = useAuth();

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="100%" px={4}>
        <VStack spacing={8}>
          {/* Welcome Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color="gray.800">
              Welcome back, {user?.first_name}!
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Ready to start your market analysis? Let's gather some information about your expansion opportunity.
            </Text>
          </VStack>

          {/* Use the shared AnalysisForm component */}
          <AnalysisForm 
            showWelcomeMessage={true}
            welcomeTitle="Start Your US-Asia Market Analysis"
            welcomeSubtitle="Let KairosAI autonomously research and analyze your cross-Pacific expansion opportunities"
            submitButtonText="Start KairosAI Analysis"
            isStreamlined={true}
          />
        </VStack>
      </Container>
    </Box>
  );
};

export default StreamlinedAnalysisForm;
