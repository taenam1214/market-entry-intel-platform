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
  Grid,
  GridItem,
  Badge,
  Flex,
  Spinner,
  RadioGroup,
  Radio,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authService } from '../auth/authService';
import { useData } from '../contexts/DataContext';

interface AnalysisFormProps {
  // Optional props for customization
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  submitButtonText?: string;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({
  welcomeTitle = "Start Your US-Asia Market Analysis",
  welcomeSubtitle = "Let KairosAI autonomously research and analyze your cross-Pacific expansion opportunities",
  submitButtonText = "See KairosAI Analysis",
}) => {
  const { user } = useAuth();
  const { refreshAnalysisData } = useData();
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
    cycles: '3', // Default to 3 cycles
    // Additional detailed fields for better analysis
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
  const [timer, setTimer] = useState(300); // 5 minutes in seconds (default for 3 cycles)
  const [timerExpired, setTimerExpired] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Function to calculate timer duration based on cycles
  const getTimerDuration = (cycles: string): number => {
    switch (cycles) {
      case '3': return 300; // 5 minutes
      case '5': return 600; // 10 minutes
      case '7': return 900; // 15 minutes
      case '10': return 1200; // 20 minutes
      case '20': return 2400; // 40 minutes
      default: return 300; // Default to 5 minutes
    }
  };

  // Customer segments
  const customerSegments = [
    { 
      value: 'saas-tech', 
      label: 'SaaS/Tech Companies',
      description: 'Series A-B companies expanding to Asia'
    },
    { 
      value: 'manufacturing', 
      label: 'Manufacturing/Industrial',
      description: 'Companies with complex supply chains'
    },
    { 
      value: 'healthcare', 
      label: 'Healthcare/Pharma',
      description: 'Highly regulated, high-stakes expansion'
    },
    { 
      value: 'financial', 
      label: 'Financial Services',
      description: 'Regulatory complexity and compliance focus'
    },
    { 
      value: 'consumer', 
      label: 'Consumer Goods',
      description: 'Brand positioning and distribution channels'
    }
  ];

  const expansionDirections = [
    { 
      value: 'us-to-asia', 
      label: 'US → Asia (China/Korea)', 
      description: 'US companies expanding to Asian markets'
    },
    { 
      value: 'asia-to-us', 
      label: 'Asia → US', 
      description: 'Asian companies entering US market'
    },
    { 
      value: 'both', 
      label: 'Both Directions', 
      description: 'Multi-market expansion strategy'
    }
  ];

  // Target markets
  const targetMarkets = [
    { value: 'United States', label: 'United States' },
    { value: 'China', label: 'China' },
    { value: 'South Korea', label: 'South Korea' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Hong Kong', label: 'Hong Kong' },
    { value: 'Taiwan', label: 'Taiwan' },
  ];

  // Company sizes
  const companySizes = [
    { value: 'startup', label: 'Startup (1-10 employees)' },
    { value: 'small', label: 'Small (11-50 employees)' },
    { value: 'medium', label: 'Medium (51-250 employees)' },
    { value: 'large', label: 'Large (251-1000 employees)' },
    { value: 'enterprise', label: 'Enterprise (1000+ employees)' },
  ];

  // Revenue ranges
  const revenueRanges = [
    { value: 'under-1m', label: 'Under $1M' },
    { value: '1m-10m', label: '$1M - $10M' },
    { value: '10m-50m', label: '$10M - $50M' },
    { value: '50m-100m', label: '$50M - $100M' },
    { value: 'over-100m', label: 'Over $100M' },
  ];

  // Funding stages
  const fundingStages = [
    { value: 'pre-seed', label: 'Pre-Seed' },
    { value: 'seed', label: 'Seed' },
    { value: 'series-a', label: 'Series A' },
    { value: 'series-b', label: 'Series B' },
    { value: 'series-c', label: 'Series C+' },
    { value: 'ipo', label: 'IPO/Public' },
    { value: 'bootstrapped', label: 'Bootstrapped' },
  ];

  // Expansion timelines
  const expansionTimelines = [
    { value: '3-6-months', label: '3-6 months' },
    { value: '6-12-months', label: '6-12 months' },
    { value: '1-2-years', label: '1-2 years' },
    { value: '2-3-years', label: '2-3 years' },
    { value: 'over-3-years', label: 'Over 3 years' },
  ];

  // Budget ranges
  const budgetRanges = [
    { value: 'under-100k', label: 'Under $100K' },
    { value: '100k-500k', label: '$100K - $500K' },
    { value: '500k-1m', label: '$500K - $1M' },
    { value: '1m-5m', label: '$1M - $5M' },
    { value: 'over-5m', label: 'Over $5M' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (loading && timer === 0) {
      setTimerExpired(true);
    }
    return () => clearInterval(interval);
  }, [loading, timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🎯 handleSubmit called!');
    e.preventDefault();
    
    // Prevent double submission
    if (loading) {
      console.log('⚠️ Form already submitting, ignoring duplicate submission');
      return;
    }
    
    console.log('✓ Not currently loading, proceeding with submission');
    
    toast({
      title: 'Analysis Started!',
      description: "We're analyzing your market entry opportunities. You'll be redirected to your dashboard shortly.",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    setLoading(true);
    setTimer(getTimerDuration(formData.cycles));
    setTimerExpired(false);
    
    console.log('🚀 Starting analysis submission...', {
      companyName: formData.companyName,
      industry: formData.industry,
      targetMarket: formData.targetMarket,
      cycles: formData.cycles
    });
    
    try {
      const payload = {
        company_name: formData.companyName,
        industry: formData.industry,
        target_market: formData.targetMarket,
        website: formData.website,
        current_positioning: formData.currentPositioning,
        brand_description: formData.brandDescription,
        email: formData.email,
        customer_segment: formData.customerSegment,
        expansion_direction: formData.expansionDirection,
        cycles: formData.cycles,  // Add cycles parameter
        // Additional detailed fields
        company_size: formData.companySize,
        annual_revenue: formData.annualRevenue,
        funding_stage: formData.fundingStage,
        current_markets: formData.currentMarkets,
        key_products: formData.keyProducts,
        competitive_advantage: formData.competitiveAdvantage,
        expansion_timeline: formData.expansionTimeline,
        budget_range: formData.budgetRange,
        regulatory_requirements: formData.regulatoryRequirements,
        partnership_preferences: formData.partnershipPreferences,
      };
      
      console.log('📦 Payload created:', JSON.stringify(payload, null, 2).substring(0, 200) + '...');
      
      // Get authentication headers
      const authHeaders = authService.getAuthHeaders();
      console.log('🔑 Auth headers:', authHeaders);
      console.log('👤 User authenticated:', !!user);
      console.log('📧 User email:', user?.email);
      console.log('🎫 Token in localStorage:', !!localStorage.getItem('authToken'));
      
      // Call the comprehensive analysis endpoint (single call, all 3 analyses in parallel)
      console.log('📊 Calling comprehensive-analysis API (runs all 3 analyses in parallel)...');
      const response = await fetch('http://localhost:8000/api/v1/comprehensive-analysis/', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors ? JSON.stringify(errorData.errors) : 'API error');
      }
      const data = await response.json();
      console.log('✅ Comprehensive analysis complete!', {
        analysis_id: data.analysis_id,
        hasCompetitors: !!data.competitor_analysis,
        hasArbitrage: !!data.segment_arbitrage
      });
      // Store competitor and arbitrage data
      if (data.competitor_analysis) {
        localStorage.setItem('competitorSummary', JSON.stringify(data.competitor_analysis));
        console.log('💾 Saved competitor data to localStorage');
      }
      
      if (data.segment_arbitrage) {
        localStorage.setItem('segmentArbitrage', JSON.stringify(data.segment_arbitrage));
        console.log('💾 Saved arbitrage data to localStorage');
      }
      
      // Store all data globally (for backward compatibility)
      localStorage.setItem('dashboardData', JSON.stringify(data));
      
      // Store analysis data in localStorage for authenticated users (user-specific)
      if (user) {
        const analysisData = {
          formData: formData,
          dashboardData: data,
          competitorSummary: data.competitor_analysis || null,
          arbitrageData: data.segment_arbitrage || null
        };
        localStorage.setItem(`analysis_${user.id}`, JSON.stringify(analysisData));
        console.log('💾 Saved complete analysis to localStorage');
      }
      
      setLoading(false);
      
      // Refresh the data context to load from database
      setTimeout(() => {
        refreshAnalysisData();
      }, 500);
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ Analysis submission error:', error);
      console.error('Error stack:', error.stack);
      
      toast({
        title: 'Analysis Failed',
        description: error.message || 'An error occurred while analyzing the market.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Loading screen
  if (loading && !timerExpired) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        width="100vw"
        height="100vh"
        bg="rgba(255,255,255,0.8)"
        zIndex={9999}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" speed="0.7s" />
          <Text fontSize="lg" color="purple.700" fontWeight="bold">Running Market Analysis...</Text>
          <Text fontSize="md" color="white">
            Estimated time remaining: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </Text>
          {timerExpired && (
            <Text color="red.500" fontWeight="bold">This is taking longer than expected. Please wait or try again later.</Text>
          )}
        </VStack>
      </Box>
    );
  }

  return (
    <Box py={8} bg="#140d28" w="100%">
      <Container maxW="100%" px={4}>
        <Card shadow="lg" borderRadius="lg" overflow="hidden" maxW="7xl" mx="auto" bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)" backdropFilter="blur(20px)" boxShadow="0 8px 32px rgba(0,0,0,0.3)">
          <Box bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" p={4} color="white">
            <VStack spacing={2} textAlign="center">
              <Heading size="lg">
                {welcomeTitle}
              </Heading>
              <Text fontSize="md" opacity="0.9">
                {welcomeSubtitle}
              </Text>
            </VStack>
          </Box>

          <CardBody p={4} bg="rgba(255,255,255,0.05)" color="white">
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                {/* Customer Segment Selection */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" fontSize="sm" color="white">Customer Segment</FormLabel>
                  <Select
                    placeholder="Select your company type"
                    value={formData.customerSegment}
                    onChange={(e) => handleInputChange('customerSegment', e.target.value)}
                    size="sm"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    {customerSegments.map((segment) => (
                      <option key={segment.value} value={segment.value}>
                        {segment.label}
                      </option>
                    ))}
                  </Select>
                  {formData.customerSegment && (
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      {customerSegments.find(s => s.value === formData.customerSegment)?.description}
                    </Text>
                  )}
                </FormControl>

                {/* Expansion Direction Selection */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" fontSize="sm" color="white">Expansion Direction</FormLabel>
                  <Select
                    placeholder="Select your expansion direction"
                    value={formData.expansionDirection}
                    onChange={(e) => handleInputChange('expansionDirection', e.target.value)}
                    size="sm"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    {expansionDirections.map((direction) => (
                      <option key={direction.value} value={direction.value}>
                        {direction.label}
                      </option>
                    ))}
                  </Select>
                  {formData.expansionDirection && (
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      {expansionDirections.find(d => d.value === formData.expansionDirection)?.description}
                    </Text>
                  )}
                </FormControl>


                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" fontSize="sm" color="white">Company Name</FormLabel>
                      <Input
                        placeholder="Enter your company name"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        size="sm"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                        _focus={{ 
                          borderColor: 'rgba(255,255,255,0.2)',
                          bg: 'rgba(255,255,255,0.1)',
                          boxShadow: 'none'
                        }}
                        _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" fontSize="sm" color="white">Industry</FormLabel>
                      <Input
                        placeholder="e.g., Technology, Healthcare, Finance, Baked Goods"
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        size="sm"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                        _focus={{ 
                          borderColor: 'rgba(255,255,255,0.2)',
                          bg: 'rgba(255,255,255,0.1)',
                          boxShadow: 'none'
                        }}
                        _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" fontSize="sm" color="white">Target Market</FormLabel>
                      <Select
                        placeholder="Select target market"
                        value={formData.targetMarket}
                        onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                        size="sm"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                        _focus={{ 
                          borderColor: 'rgba(255,255,255,0.2)',
                          bg: 'rgba(255,255,255,0.1)',
                          boxShadow: 'none'
                        }}
                        _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                      >
                        {targetMarkets.map((market) => (
                          <option key={market.value} value={market.value}>
                            {market.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontWeight="semibold" fontSize="sm" color="white">Website</FormLabel>
                      <Input
                        placeholder="https://yourcompany.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        size="sm"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                        _focus={{ 
                          borderColor: 'rgba(255,255,255,0.2)',
                          bg: 'rgba(255,255,255,0.1)',
                          boxShadow: 'none'
                        }}
                        _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>

                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" fontSize="sm" color="white">Current Brand Positioning</FormLabel>
                  <Textarea
                    placeholder="Describe how your brand is currently positioned in your home market..."
                    value={formData.currentPositioning}
                    onChange={(e) => handleInputChange('currentPositioning', e.target.value)}
                    size="sm"
                    rows={2}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" fontSize="sm" color="white">Brand Description</FormLabel>
                  <Textarea
                    placeholder="Describe your brand, products/services, and unique value proposition..."
                    value={formData.brandDescription}
                    onChange={(e) => handleInputChange('brandDescription', e.target.value)}
                    size="sm"
                    rows={3}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  />
                </FormControl>

                {/* Cycles Selection */}
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" fontSize="sm" color="white">Cycles to be run</FormLabel>
                  <RadioGroup 
                    value={formData.cycles} 
                    onChange={(value) => handleInputChange('cycles', value)}
                    colorScheme="purple"
                  >
                    <HStack spacing={6} wrap="wrap">
                      <Radio value="3" color="white" _checked={{ bg: "purple.500", borderColor: "purple.500" }}>
                        <Text color="white" fontSize="sm">3 cycles</Text>
                      </Radio>
                      <Radio value="5" color="white" _checked={{ bg: "purple.500", borderColor: "purple.500" }}>
                        <Text color="white" fontSize="sm">5 cycles</Text>
                      </Radio>
                      <Radio value="7" color="white" _checked={{ bg: "purple.500", borderColor: "purple.500" }}>
                        <Text color="white" fontSize="sm">7 cycles</Text>
                      </Radio>
                      <Radio value="10" color="white" _checked={{ bg: "purple.500", borderColor: "purple.500" }}>
                        <Text color="white" fontSize="sm">10 cycles</Text>
                      </Radio>
                      <Radio value="20" color="white" _checked={{ bg: "purple.500", borderColor: "purple.500" }}>
                        <Text color="white" fontSize="sm">20 cycles</Text>
                      </Radio>
                    </HStack>
                  </RadioGroup>
                  <Text fontSize="xs" color="rgba(255,255,255,0.7)" mt={1}>
                    More cycles provide deeper analysis but take longer to complete
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" fontSize="sm" color="white">Email Address</FormLabel>
                  <Input
                    type="email"
                    placeholder="your.email@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    size="sm"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  />
                </FormControl>

                {/* Additional Company Details Section */}
                <Box p={4} bg="rgba(255,255,255,0.05)" borderRadius="lg" border="1px solid" borderColor="rgba(255,255,255,0.1)">
                  <Heading size="sm" color="white" mb={3}>
                    Additional Company Details (Optional but Recommended)
                  </Heading>
                  <Text fontSize="xs" color="rgba(255,255,255,0.8)" mb={4}>
                    These details help KairosAI generate more accurate and detailed analysis
                  </Text>
                  
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="semibold" fontSize="sm" color="white">Company Size</FormLabel>
                        <Select
                          placeholder="Select company size"
                          value={formData.companySize}
                          onChange={(e) => handleInputChange('companySize', e.target.value)}
                          size="sm"
                          borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
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
                        <FormLabel fontWeight="semibold" fontSize="sm" color="white">Annual Revenue</FormLabel>
                        <Select
                          placeholder="Select revenue range"
                          value={formData.annualRevenue}
                          onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                          size="sm"
                          borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                          {revenueRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                              {range.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="semibold" fontSize="sm" color="white">Funding Stage</FormLabel>
                        <Select
                          placeholder="Select funding stage"
                          value={formData.fundingStage}
                          onChange={(e) => handleInputChange('fundingStage', e.target.value)}
                          size="sm"
                          borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                          {fundingStages.map((stage) => (
                            <option key={stage.value} value={stage.value}>
                              {stage.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="semibold" fontSize="sm" color="white">Current Markets</FormLabel>
                        <Input
                          placeholder="e.g., US, China, South Korea"
                          value={formData.currentMarkets}
                          onChange={(e) => handleInputChange('currentMarkets', e.target.value)}
                          size="sm"
                          borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="semibold" fontSize="sm" color="white">Key Products/Services</FormLabel>
                        <Textarea
                          placeholder="Describe your main products or services..."
                          value={formData.keyProducts}
                          onChange={(e) => handleInputChange('keyProducts', e.target.value)}
                          size="sm"
                          rows={2}
                          borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="semibold" fontSize="sm" color="white">Competitive Advantage</FormLabel>
                        <Textarea
                          placeholder="What makes you unique vs competitors?"
                          value={formData.competitiveAdvantage}
                          onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
                          size="sm"
                          rows={2}
                          borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="semibold" fontSize="sm" color="white">Expansion Timeline</FormLabel>
                        <Select
                          placeholder="When do you plan to expand?"
                          value={formData.expansionTimeline}
                          onChange={(e) => handleInputChange('expansionTimeline', e.target.value)}
                          size="sm"
                          borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                          {expansionTimelines.map((timeline) => (
                            <option key={timeline.value} value={timeline.value}>
                              {timeline.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="semibold" fontSize="sm" color="white">Budget Range</FormLabel>
                        <Select
                          placeholder="Select budget range"
                          value={formData.budgetRange}
                          onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                          size="sm"
                          borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                          {budgetRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                              {range.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="semibold" fontSize="sm" color="white">Regulatory Requirements</FormLabel>
                        <Textarea
                          placeholder="Any specific regulatory requirements or compliance needs?"
                          value={formData.regulatoryRequirements}
                          onChange={(e) => handleInputChange('regulatoryRequirements', e.target.value)}
                          size="sm"
                          rows={2}
                          borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="semibold" fontSize="sm" color="white">Partnership Preferences</FormLabel>
                        <Textarea
                          placeholder="Preferred partnership types (distributors, JVs, etc.)"
                          value={formData.partnershipPreferences}
                          onChange={(e) => handleInputChange('partnershipPreferences', e.target.value)}
                          size="sm"
                          rows={2}
                          borderRadius="md"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.2)"
                    bg="rgba(255,255,255,0.1)"
                    color="white"
                    _placeholder={{ color: 'rgba(255,255,255,0.6)' }}
                    _focus={{ 
                      borderColor: 'rgba(255,255,255,0.2)',
                      bg: 'rgba(255,255,255,0.1)',
                      boxShadow: 'none'
                    }}
                    _hover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>

                <Button
                  type="submit"
                  size="md"
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  border="none"
                  _focus={{ boxShadow: 'none', outline: 'none' }}
                  _hover={{
                    bg: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: 'md',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  py={4}
                  fontSize="md"
                  fontWeight="bold"
                  borderRadius="lg"
                >
                  {submitButtonText}
                </Button>
              </VStack>
            </form>

            {/* Features Preview */}
            <Box mt={4} p={3} bg="rgba(255,255,255,0.05)" borderRadius="lg" border="1px solid rgba(255,255,255,0.1)">
              <Text fontSize="sm" color="rgba(255,255,255,0.8)" textAlign="center" mb={2}>
                KairosAI will autonomously deliver:
              </Text>
              <Flex justify="center" wrap="wrap" gap={2}>
                <Badge colorScheme="green" px={2} py={1} borderRadius="full" fontSize="sm">
                  Executive Summary & Go/No-Go Recommendations
                </Badge>
                <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="sm">
                  US-Asia Market Intelligence
                </Badge>
                <Badge colorScheme="purple" px={2} py={1} borderRadius="full" fontSize="sm">
                  Investment Memo & Board Presentations
                </Badge>
                <Badge colorScheme="orange" px={2} py={1} borderRadius="full" fontSize="sm">
                  Regulatory Compliance Analysis
                </Badge>
              </Flex>
            </Box>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default AnalysisForm;
