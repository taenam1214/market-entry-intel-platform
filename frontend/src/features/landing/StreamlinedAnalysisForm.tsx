import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  CardBody,
  useToast,
  Badge,
  Flex,
  Spinner,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

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
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    targetMarket: '',
    currentPositioning: '',
    brandDescription: '',
    website: '',
    email: user?.email || '',
    customerSegment: '',
    expansionDirection: '',
    // Additional detailed fields
    companySize: '',
    annualRevenue: '',
    fundingStage: '',
    currentMarkets: '',
    keyProducts: '',
    competitiveAdvantage: '',
    expansionTimeline: '',
    budgetRange: '',
    regulatoryRequirements: '',
    partnershipPreferences: '',
  });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [timerExpired, setTimerExpired] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Timer effect
  useEffect(() => {
    if (loading && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setTimerExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading, timer]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Store analysis data in localStorage
      if (user) {
        localStorage.setItem(`analysis_${user.id}`, JSON.stringify(formData));
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Analysis Started!",
        description: "KairosAI is now generating your market intelligence report.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start analysis. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !timerExpired) {
    return (
      <Box minH="100vh" bg="gray.50" py={12}>
        <Container maxW="4xl">
          <VStack spacing={8} textAlign="center">
            <VStack spacing={4}>
              <Spinner size="xl" color="purple.500" thickness="4px" />
              <Heading size="lg" color="purple.600">
                KairosAI is Analyzing Your Market Opportunity
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Our AI agents are autonomously researching competitors, market trends, and strategic opportunities for your expansion.
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {formatTime(timer)}
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="4xl">
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

          {/* Analysis Form */}
          <Card shadow="lg" borderRadius="lg" overflow="hidden" maxW="800px" w="full">
            <Box bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" p={4} color="white">
              <VStack spacing={2} textAlign="center">
                <Heading size="lg">
                  Start Your US-Asia Market Analysis
                </Heading>
                <Text fontSize="md" opacity="0.9">
                  Let KairosAI autonomously research and analyze your cross-Pacific expansion opportunities
                </Text>
              </VStack>
            </Box>

            <CardBody p={6}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  {/* Customer Segment Selection */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Customer Segment</FormLabel>
                    <Select
                      placeholder="Select your company type"
                      value={formData.customerSegment}
                      onChange={(e) => handleInputChange('customerSegment', e.target.value)}
                      size="lg"
                    >
                      {customerSegments.map((segment) => (
                        <option key={segment.value} value={segment.value}>
                          {segment.label}
                        </option>
                      ))}
                    </Select>
                    {formData.customerSegment && (
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        {customerSegments.find(s => s.value === formData.customerSegment)?.description}
                      </Text>
                    )}
                  </FormControl>

                  {/* Expansion Direction Selection */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Expansion Direction</FormLabel>
                    <Select
                      placeholder="Select your expansion direction"
                      value={formData.expansionDirection}
                      onChange={(e) => handleInputChange('expansionDirection', e.target.value)}
                      size="lg"
                    >
                      {expansionDirections.map((direction) => (
                        <option key={direction.value} value={direction.value}>
                          {direction.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Company Details Grid */}
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold">Company Name</FormLabel>
                        <Input
                          placeholder="Enter your company name"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          size="lg"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold">Industry</FormLabel>
                        <Input
                          placeholder="e.g., Technology, Healthcare, Finance"
                          value={formData.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          size="lg"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  {/* Target Market */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Target Market</FormLabel>
                    <Select
                      placeholder="Select target market"
                      value={formData.targetMarket}
                      onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                      size="lg"
                    >
                      {targetMarkets.map((market) => (
                        <option key={market.value} value={market.value}>
                          {market.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Company Description */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Brand Description</FormLabel>
                    <Textarea
                      placeholder="Describe your brand, products/services, and unique value proposition..."
                      value={formData.brandDescription}
                      onChange={(e) => handleInputChange('brandDescription', e.target.value)}
                      rows={4}
                      resize="vertical"
                    />
                  </FormControl>

                  {/* Additional Company Details */}
                  <Box p={4} bg="purple.50" borderRadius="lg">
                    <Heading size="md" color="purple.700" mb={4}>
                      Additional Company Details (Optional but Recommended)
                    </Heading>
                    <Text fontSize="sm" color="purple.600" mb={4}>
                      These details help KairosAI generate more accurate and detailed analysis
                    </Text>
                    
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                      <GridItem>
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="semibold">Company Size</FormLabel>
                          <Select
                            placeholder="Select company size"
                            value={formData.companySize}
                            onChange={(e) => handleInputChange('companySize', e.target.value)}
                            size="md"
                          >
                            {companySizes.map((size) => (
                              <option key={size.value} value={size.value}>
                                {size.label}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="semibold">Annual Revenue</FormLabel>
                          <Select
                            placeholder="Select revenue range"
                            value={formData.annualRevenue}
                            onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                            size="md"
                          >
                            {revenueRanges.map((range) => (
                              <option key={range.value} value={range.value}>
                                {range.label}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </Box>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    colorScheme="purple"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="Starting Analysis..."
                  >
                    Start KairosAI Analysis
                  </Button>
                </VStack>
              </form>

              {/* Features Preview */}
              <Box mt={6} p={4} bg="gray.50" borderRadius="lg">
                <Text fontSize="sm" color="gray.600" textAlign="center" mb={3}>
                  KairosAI will autonomously deliver:
                </Text>
                <Flex justify="center" wrap="wrap" gap={2}>
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                    Executive Summary & Go/No-Go Recommendations
                  </Badge>
                  <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                    US-Asia Market Intelligence
                  </Badge>
                  <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                    Investment Memo & Board Presentations
                  </Badge>
                  <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                    Regulatory Compliance Analysis
                  </Badge>
                </Flex>
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default StreamlinedAnalysisForm;
