import { useState, useEffect } from 'react';
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
  Textarea,
  Select,
  Button,
  Card,
  CardBody,
  useToast,
  Grid,
  GridItem,
  Badge,
  Icon,
  Flex,
  Spinner,
  SimpleGrid,
  Image,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiTarget, FiTrendingUp, FiBarChart, FiArrowRight, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import StreamlinedAnalysisForm from './StreamlinedAnalysisForm';
import KairosAILogo from '../../assets/KairosAI_logo.png';

// Animation keyframes for Global Business Network
const nodePulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
`;

// Global Business Network Node Component
const NetworkNode = ({ 
  x, 
  y, 
  label, 
  size = 8, 
  delay = 0,
  isMajor = false 
}: {
  x: string;
  y: string;
  label: string;
  size?: number;
  delay?: number;
  isMajor?: boolean;
}) => (
  <Box
    position="absolute"
    left={x}
    top={y}
    w={`${size}px`}
    h={`${size}px`}
    bg={isMajor ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.95)"}
    borderRadius="50%"
    animation={`${nodePulse} 3s ease-in-out infinite`}
    style={{ animationDelay: `${delay}s` }}
    boxShadow="0 0 12px rgba(255,255,255,0.8)"
    _before={{
      content: `"${label}"`,
      position: "absolute",
      top: "-30px",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "12px",
      color: "rgba(255,255,255,1)",
      fontWeight: "bold",
      whiteSpace: "nowrap",
      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
    }}
  />
);

// Dynamic Connection Line Component
const DynamicConnectionLine = ({ 
  fromX, 
  fromY, 
  toX, 
  toY, 
  opacity = 0.8
}: {
  fromX: string;
  fromY: string;
  toX: string;
  toY: string;
  opacity?: number;
}) => (
  <line
    x1={fromX}
    y1={fromY}
    x2={toX}
    y2={toY}
    stroke={`rgba(255,255,255,${opacity})`}
    strokeWidth="3"
    strokeDasharray="10,10"
    opacity={opacity}
    filter="drop-shadow(0 0 4px rgba(255,255,255,0.5))"
  >
    <animate
      attributeName="stroke-dashoffset"
      values="0;20"
      dur="3s"
      repeatCount="indefinite"
    />
  </line>
);

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    targetMarket: '',
    currentPositioning: '',
    brandDescription: '',
    website: '',
    email: '',
    customerSegment: '',
    expansionDirection: '',
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
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [timerExpired, setTimerExpired] = useState(false);
  const [hasAnalysisHistory, setHasAnalysisHistory] = useState(false);
  const [activeConnections, setActiveConnections] = useState<Array<{
    fromX: string;
    fromY: string;
    toX: string;
    toY: string;
    opacity: number;
    delay: number;
  }>>([]);
  const navigate = useNavigate();
  const toast = useToast();

  // City coordinates for dynamic connections
  const cities = [
    { x: "15%", y: "35%", label: "NYC" },
    { x: "85%", y: "25%", label: "Tokyo" },
    { x: "20%", y: "60%", label: "London" },
    { x: "80%", y: "40%", label: "Singapore" },
    { x: "25%", y: "75%", label: "LA" },
    { x: "75%", y: "65%", label: "Hong Kong" },
    { x: "50%", y: "20%", label: "Seoul" },
    { x: "40%", y: "80%", label: "Sydney" },
    { x: "60%", y: "15%", label: "Shanghai" },
    { x: "35%", y: "45%", label: "Frankfurt" },
    { x: "65%", y: "55%", label: "Dubai" },
    { x: "45%", y: "35%", label: "Toronto" },
  ];

  // Generate random connections
  const generateRandomConnections = () => {
    const numConnections = Math.floor(Math.random() * 4) + 3; // 3-6 connections
    const connections = [];
    const usedPairs = new Set(); // Prevent duplicate connections
    
    for (let i = 0; i < numConnections && connections.length < 6; i++) {
      const fromCity = cities[Math.floor(Math.random() * cities.length)];
      const toCity = cities[Math.floor(Math.random() * cities.length)];
      
      // Don't connect a city to itself and avoid duplicates
      const connectionKey = `${fromCity.label}-${toCity.label}`;
      const reverseKey = `${toCity.label}-${fromCity.label}`;
      
      if (fromCity.label !== toCity.label && !usedPairs.has(connectionKey) && !usedPairs.has(reverseKey)) {
        usedPairs.add(connectionKey);
        connections.push({
          fromX: fromCity.x,
          fromY: fromCity.y,
          toX: toCity.x,
          toY: toCity.y,
          opacity: Math.random() * 0.2 + 0.7, // 0.7 to 0.9 opacity (much brighter)
          delay: Math.random() * 2, // 0 to 2 seconds delay
        });
      }
    }
    
    // Ensure we have at least 2 connections
    if (connections.length < 2) {
      connections.push({
        fromX: "15%", fromY: "35%", toX: "85%", toY: "25%", opacity: 0.9, delay: 0
      });
      connections.push({
        fromX: "20%", fromY: "60%", toX: "80%", toY: "40%", opacity: 0.8, delay: 1
      });
    }
    
    return connections;
  };

  // Update connections every 2-4 seconds
  useEffect(() => {
    const updateConnections = () => {
      const newConnections = generateRandomConnections();
      console.log('Generated connections:', newConnections); // Debug log
      setActiveConnections(newConnections);
    };

    // Initial connections
    updateConnections();

    // Set up interval for random updates
    const interval = setInterval(updateConnections, Math.random() * 2000 + 2000); // 2-4 seconds

    return () => clearInterval(interval);
  }, []);

  // Check if user has analysis history
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check localStorage for analysis history
      const analysisHistory = localStorage.getItem(`analysis_${user.id}`);
      setHasAnalysisHistory(!!analysisHistory);
      
      // Pre-fill email if user is logged in
      if (!formData.email) {
        setFormData(prev => ({ ...prev, email: user.email }));
      }
    }
  }, [isAuthenticated, user]);

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
    e.preventDefault();
    toast({
      title: 'Analysis Started!',
      description: "We're analyzing your market entry opportunities. You'll be redirected to your dashboard shortly.",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    setLoading(true);
    setTimer(300);
    setTimerExpired(false);
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
      const [marketRes, competitorRes, arbitrageRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/market-analysis/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        fetch('http://localhost:8000/api/v1/competitor-analysis/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        fetch('http://localhost:8000/api/v1/segment-arbitrage/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      ]);
      if (!marketRes.ok) {
        const errorData = await marketRes.json();
        throw new Error(errorData.errors ? JSON.stringify(errorData.errors) : 'API error');
      }
      const data = await marketRes.json();
      localStorage.setItem('dashboardData', JSON.stringify(data));
      if (competitorRes.ok) {
        const competitorData = await competitorRes.json();
        console.log('Competitor API response:', competitorData);
        console.log('Competitor analysis data:', competitorData.competitor_analysis);
        localStorage.setItem('competitorSummary', JSON.stringify(competitorData.competitor_analysis));
      } else {
        console.log('Competitor API failed:', competitorRes.status);
        localStorage.setItem('competitorSummary', 'No competitor summary available.');
      }
      
      if (arbitrageRes.ok) {
        const arbitrageData = await arbitrageRes.json();
        console.log('Arbitrage API response:', arbitrageData);
        console.log('Arbitrage analysis data:', arbitrageData.segment_arbitrage);
        localStorage.setItem('segmentArbitrage', JSON.stringify(arbitrageData.segment_arbitrage));
      } else {
        console.log('Arbitrage API failed:', arbitrageRes.status);
        localStorage.setItem('segmentArbitrage', 'No arbitrage analysis available.');
      }
      setLoading(false);
      navigate('/dashboard');
    } catch (error: any) {
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

  // Show streamlined form for authenticated users without analysis history
  if (isAuthenticated && !hasAnalysisHistory) {
    return (
      <StreamlinedAnalysisForm
        customerSegments={customerSegments}
        expansionDirections={expansionDirections}
        targetMarkets={targetMarkets}
        companySizes={companySizes}
        revenueRanges={revenueRanges}
        fundingStages={fundingStages}
        expansionTimelines={expansionTimelines}
        budgetRanges={budgetRanges}
      />
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" w="100%">
      {loading && (
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
            <Text fontSize="md" color="gray.700">
              Estimated time remaining: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </Text>
            {timerExpired && (
              <Text color="red.500" fontWeight="bold">This is taking longer than expected. Please wait or try again later.</Text>
            )}
          </VStack>
        </Box>
      )}
      {/* Hero Section - Full Viewport */}
      <Box
        h="100vh"
        bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
        color="white"
        display="flex"
        alignItems="center"
        position="relative"
        overflow="hidden"
        w="100%"
      >
        {/* Global Business Network Background */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.4"
        >
          {/* Dynamic Connection Lines */}
          <svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {activeConnections.map((connection, index) => (
              <DynamicConnectionLine
                key={`${connection.fromX}-${connection.fromY}-${connection.toX}-${connection.toY}-${index}`}
                fromX={connection.fromX}
                fromY={connection.fromY}
                toX={connection.toX}
                toY={connection.toY}
                opacity={connection.opacity}
              />
            ))}
          </svg>

          {/* Major Business Hubs */}
          <NetworkNode x="15%" y="35%" label="NYC" size={12} delay={0} isMajor={true} />
          <NetworkNode x="85%" y="25%" label="Tokyo" size={12} delay={1} isMajor={true} />
          <NetworkNode x="20%" y="60%" label="London" size={10} delay={2} isMajor={true} />
          <NetworkNode x="80%" y="40%" label="Singapore" size={10} delay={3} isMajor={true} />
          <NetworkNode x="25%" y="75%" label="LA" size={8} delay={4} />
          <NetworkNode x="75%" y="65%" label="Hong Kong" size={8} delay={5} />
          <NetworkNode x="50%" y="20%" label="Seoul" size={8} delay={6} />
          <NetworkNode x="40%" y="80%" label="Sydney" size={8} delay={7} />
          <NetworkNode x="60%" y="15%" label="Shanghai" size={8} delay={8} />
          <NetworkNode x="35%" y="45%" label="Frankfurt" size={6} delay={9} />
          <NetworkNode x="65%" y="55%" label="Dubai" size={6} delay={10} />
          <NetworkNode x="45%" y="35%" label="Toronto" size={6} delay={11} />
        </Box>

        {/* Subtle Grid Pattern */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.05"
          backgroundImage="linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)"
          backgroundSize="50px 50px"
        />

        <Container maxW="100%" px={8} position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <VStack spacing={6}>
              <VStack spacing={2}>
                {/* KairosAI Logo */}
                <Image 
                  src={KairosAILogo} 
                  alt="KairosAI Logo" 
                  h="120px" 
                  w="auto"
                  objectFit="contain"
                  filter="brightness(0) invert(1) drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
                />
              <Heading 
                  size="2xl" 
                  fontWeight="extrabold" 
                  lineHeight="0.9"
                  letterSpacing="-0.02em"
                  bg="linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%)"
                  bgClip="text"
                  textShadow="0 2px 4px rgba(0,0,0,0.1)"
                  fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
              >
                KairosAI
              </Heading>
                <Box 
                  w="120px" 
                  h="3px" 
                  bg="linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 100%)"
                  borderRadius="full"
                />
              </VStack>
              
              <Text 
                fontSize="xl" 
                fontWeight="semibold"
                opacity="0.95"
                letterSpacing="0.01em"
                textAlign="center"
                maxW="4xl"
                lineHeight="1.3"
                fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
              >
                Executive Intelligence for Cross-Pacific Expansion
              </Text>
              
              <Text 
                fontSize="lg" 
                maxW="3xl" 
                opacity="0.9"
                lineHeight="1.6"
                textAlign="center"
                fontWeight="normal"
                letterSpacing="0.005em"
                fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
              >
                Stop waiting 6 months and spending six figures on market research. 
                KairosAI's autonomous AI agents deliver board-ready market intelligence, 
                competitive analysis, and strategic positioning for US-Asia expansion in minutes.
              </Text>
            </VStack>

            <HStack spacing={12} mt={8}>
              <VStack spacing={4}>
                <Box
                  w="80px"
                  h="80px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(255,255,255,0.15)"
                  borderRadius="2xl"
                  backdropFilter="blur(15px)"
                  border="1px solid rgba(255,255,255,0.2)"
                  _hover={{
                    transform: 'scale(1.05) translateY(-4px)',
                    transition: 'all 0.3s ease',
                    bg: 'rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <Icon as={FiTarget} boxSize={8} color="white" />
                </Box>
                <VStack spacing={2}>
                  <Text fontWeight="bold" fontSize="lg" color="white" letterSpacing="0.01em" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Autonomous Intelligence</Text>
                  <Text fontSize="sm" opacity="0.85" color="white" textAlign="center" maxW="140px" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">AI-driven market research</Text>
                </VStack>
              </VStack>

              <VStack spacing={4}>
                <Box
                  w="80px"
                  h="80px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(255,255,255,0.15)"
                  borderRadius="2xl"
                  backdropFilter="blur(15px)"
                  border="1px solid rgba(255,255,255,0.2)"
                  _hover={{
                    transform: 'scale(1.05) translateY(-4px)',
                    transition: 'all 0.3s ease',
                    bg: 'rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <Icon as={FiTrendingUp} boxSize={8} color="white" />
                </Box>
                <VStack spacing={2}>
                  <Text fontWeight="bold" fontSize="lg" color="white" letterSpacing="0.01em" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Perfect Timing</Text>
                  <Text fontSize="sm" opacity="0.85" color="white" textAlign="center" maxW="140px" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Seize market opportunities</Text>
                </VStack>
              </VStack>

              <VStack spacing={4}>
                <Box
                  w="80px"
                  h="80px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(255,255,255,0.15)"
                  borderRadius="2xl"
                  backdropFilter="blur(15px)"
                  border="1px solid rgba(255,255,255,0.2)"
                  _hover={{
                    transform: 'scale(1.05) translateY(-4px)',
                    transition: 'all 0.3s ease',
                    bg: 'rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <Icon as={FiBarChart} boxSize={8} color="white" />
                </Box>
                <VStack spacing={2}>
                  <Text fontWeight="bold" fontSize="lg" color="white" letterSpacing="0.01em" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Strategic Positioning</Text>
                  <Text fontSize="sm" opacity="0.85" color="white" textAlign="center" maxW="140px" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Data-driven market entry</Text>
                </VStack>
              </VStack>
            </HStack>

            <Button
              size="lg"
              bg="white"
              color="purple.600"
              _hover={{ 
                bg: 'gray.50',
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
              }}
              _active={{ 
                transform: 'translateY(-1px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              }}
              px={8}
              py={5}
              fontSize="lg"
              fontWeight="bold"
              borderRadius="xl"
              letterSpacing="0.01em"
              border="2px solid transparent"
              _focus={{
                boxShadow: '0 0 0 3px rgba(255,255,255,0.3)',
              }}
              onClick={() => {
                document.getElementById('analysis-form')?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
              rightIcon={<FiArrowRight />}
            >
              Start Your Analysis
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* How KairosAI Works Section */}
      <Box py={16} bg="white" w="100%">
        <Container maxW="100%" px={8}>
          <VStack spacing={12} textAlign="center">
            {/* Section Header */}
            <VStack spacing={4}>
              <Heading size="xl" color="gray.800">
                Why KairosAI is Different
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="3xl">
                Traditional market research takes months and costs six figures. 
                KairosAI delivers executive-ready insights in minutes using autonomous AI agents.
              </Text>
            </VStack>

            {/* Problem vs Solution Comparison */}
            <Card shadow="xl" borderRadius="2xl" bg="gradient-to-r from-red.50 to-green.50" border="1px solid" borderColor="gray.200" w="full" maxW="6xl">
              <CardBody p={8}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                  {/* Traditional Approach */}
                  <Box p={6} bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.200">
                    <VStack spacing={4} align="start">
                      <HStack spacing={3}>
                        <Box w="8" h="8" bg="red.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                          <Icon as={FiTarget} color="white" boxSize={4} />
                        </Box>
                        <Heading size="md" color="red.700">Traditional Market Research</Heading>
                      </HStack>
                      
                      <VStack spacing={3} align="start" w="full">
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="red.600" fontWeight="semibold">Timeline</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="red.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="red.700" fontWeight="bold">3-6 months</Text>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="red.600" fontWeight="semibold">Cost</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="red.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="red.700" fontWeight="bold">$50K - $200K</Text>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="red.600" fontWeight="semibold">Output</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="red.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="red.700" fontWeight="bold">Static PDF reports</Text>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="red.600" fontWeight="semibold">Updates</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="red.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="red.700" fontWeight="bold">One-time analysis</Text>
                          </HStack>
                        </VStack>
                      </VStack>
                      
                      <Text fontSize="sm" color="red.600" fontStyle="italic">
                        "By the time you get results, the market has already changed"
                      </Text>
                    </VStack>
                  </Box>

                  {/* KairosAI Approach */}
                  <Box p={6} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                    <VStack spacing={4} align="start">
                      <HStack spacing={3}>
                        <Box w="8" h="8" bg="green.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                          <Icon as={FiTrendingUp} color="white" boxSize={4} />
                        </Box>
                        <Heading size="md" color="green.700">KairosAI Platform</Heading>
                      </HStack>
                      
                      <VStack spacing={3} align="start" w="full">
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="green.600" fontWeight="semibold">Timeline</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="green.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="green.700" fontWeight="bold">5 minutes</Text>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="green.600" fontWeight="semibold">Cost</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="green.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="green.700" fontWeight="bold">Fraction of consultant fees</Text>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="green.600" fontWeight="semibold">Output</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="green.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="green.700" fontWeight="bold">Executive-ready deliverables</Text>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="green.600" fontWeight="semibold">Updates</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="green.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="green.700" fontWeight="bold">Continuous monitoring</Text>
                          </HStack>
                        </VStack>
                      </VStack>
                      
                      <Text fontSize="sm" color="green.600" fontStyle="italic">
                        "Real-time intelligence that evolves with your market"
                      </Text>
                    </VStack>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* How It Works Workflow */}
            <VStack spacing={8} w="full">
              <Heading size="lg" color="gray.800">How KairosAI Works</Heading>
              
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} w="full" maxW="5xl">
                {/* Step 1 */}
                <VStack spacing={4} p={6} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.200">
                  <Box w="12" h="12" bg="purple.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <Text color="white" fontWeight="bold" fontSize="lg">1</Text>
                  </Box>
                  <VStack spacing={2} textAlign="center">
                    <Heading size="sm" color="purple.700">Input Company Info</Heading>
                    <Text fontSize="sm" color="purple.600">Share your company details, target market, and expansion goals</Text>
                  </VStack>
                </VStack>

                {/* Step 2 */}
                <VStack spacing={4} p={6} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.200">
                  <Box w="12" h="12" bg="blue.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <Text color="white" fontWeight="bold" fontSize="lg">2</Text>
                  </Box>
                  <VStack spacing={2} textAlign="center">
                    <Heading size="sm" color="blue.700">AI Agents Research</Heading>
                    <Text fontSize="sm" color="blue.600">Autonomous agents analyze market data, competitors, and opportunities 24/7</Text>
                  </VStack>
                </VStack>

                {/* Step 3 */}
                <VStack spacing={4} p={6} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                  <Box w="12" h="12" bg="green.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <Text color="white" fontWeight="bold" fontSize="lg">3</Text>
                  </Box>
                  <VStack spacing={2} textAlign="center">
                    <Heading size="sm" color="green.700">Generate Insights</Heading>
                    <Text fontSize="sm" color="green.600">Get market intelligence dashboard and segment arbitrage opportunities</Text>
                  </VStack>
                </VStack>

                {/* Step 4 */}
                <VStack spacing={4} p={6} bg="orange.50" borderRadius="xl" border="1px solid" borderColor="orange.200">
                  <Box w="12" h="12" bg="orange.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <Text color="white" fontWeight="bold" fontSize="lg">4</Text>
                  </Box>
                  <VStack spacing={2} textAlign="center">
                    <Heading size="sm" color="orange.700">Executive Deliverables</Heading>
                    <Text fontSize="sm" color="orange.600">Download board presentations, investment memos, and strategic recommendations</Text>
                  </VStack>
                </VStack>
              </SimpleGrid>
            </VStack>

            {/* Unique Value Propositions */}
            <Card shadow="lg" borderRadius="xl" bg="gradient-to-r from-purple.50 to-blue.50" border="1px solid" borderColor="purple.200" w="full" maxW="5xl">
              <CardBody p={8}>
                <VStack spacing={6}>
                  <Heading size="lg" color="purple.700">What Makes KairosAI Unique</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                    {/* Left Column */}
                    <VStack spacing={4} align="start">
                      <Box p={4} bg="white" borderRadius="lg" border="1px solid" borderColor="purple.200" w="full">
                        <HStack spacing={3} mb={2}>
                          <Icon as={FiTarget} color="purple.500" boxSize={5} />
                          <Text fontWeight="bold" color="purple.700">Autonomous AI Agents</Text>
                        </HStack>
                        <Text fontSize="sm" color="purple.600">
                          Multiple specialized AI agents work simultaneously, analyzing market data, competitors, and opportunities around the clock.
                        </Text>
                      </Box>
                      
                      <Box p={4} bg="white" borderRadius="lg" border="1px solid" borderColor="purple.200" w="full">
                        <HStack spacing={3} mb={2}>
                          <Icon as={FiTrendingUp} color="purple.500" boxSize={5} />
                          <Text fontWeight="bold" color="purple.700">Executive-Ready Outputs</Text>
                        </HStack>
                        <Text fontSize="sm" color="purple.600">
                          Generate board presentations, investment memos, and strategic recommendations automatically - no manual report writing required.
                        </Text>
                      </Box>
                    </VStack>

                    {/* Right Column */}
                    <VStack spacing={4} align="start">
                      <Box p={4} bg="white" borderRadius="lg" border="1px solid" borderColor="purple.200" w="full">
                        <HStack spacing={3} mb={2}>
                          <Icon as={FiBarChart} color="purple.500" boxSize={5} />
                          <Text fontWeight="bold" color="purple.700">Segment Arbitrage Detection</Text>
                        </HStack>
                        <Text fontSize="sm" color="purple.600">
                          Discover hidden market opportunities and positioning gaps that competitors miss, maximizing your market entry value.
                        </Text>
                      </Box>
                      
                      <Box p={4} bg="white" borderRadius="lg" border="1px solid" borderColor="purple.200" w="full">
                        <HStack spacing={3} mb={2}>
                          <Icon as={FiUsers} color="purple.500" boxSize={5} />
                          <Text fontWeight="bold" color="purple.700">Cross-Pacific Expertise</Text>
                        </HStack>
                        <Text fontSize="sm" color="purple.600">
                          Built specifically for US-Asia market dynamics, understanding cultural nuances, regulatory requirements, and business practices.
                        </Text>
                      </Box>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Call to Action */}
            <VStack spacing={4}>
              <Heading size="md" color="gray.700">Ready to Transform Your Market Entry Strategy?</Heading>
              <HStack spacing={4}>
                <Button
                  size="lg"
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  _hover={{
                    bg: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
                  _active={{ transform: 'translateY(0)' }}
                  px={8}
              py={4}
              fontSize="md"
              fontWeight="bold"
                  borderRadius="lg"
              onClick={() => {
                document.getElementById('analysis-form')?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
              rightIcon={<FiArrowRight />}
            >
                  Start Your Free Analysis
            </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  color="purple.600"
                  borderColor="purple.300"
                  _hover={{
                    bg: 'purple.50',
                    borderColor: 'purple.400',
                    transform: 'translateY(-2px)',
                  }}
                  px={8}
                  py={4}
                  fontSize="md"
                  fontWeight="semibold"
                  borderRadius="lg"
                  onClick={() => {
                    navigate('/dashboard');
                  }}
                >
                  View Sample Results
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Form Section */}
      <Box id="analysis-form" py={8} bg="white" w="100%">
        <Container maxW="100%" px={4}>
          <Card shadow="lg" borderRadius="lg" overflow="hidden" maxW="800px" mx="auto">
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

            <CardBody p={4}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  {/* Customer Segment Selection */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" fontSize="sm">Customer Segment</FormLabel>
                    <Select
                      placeholder="Select your company type"
                      value={formData.customerSegment}
                      onChange={(e) => handleInputChange('customerSegment', e.target.value)}
                      size="sm"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
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
                    <FormLabel fontWeight="semibold" fontSize="sm">Expansion Direction</FormLabel>
                    <Select
                      placeholder="Select your expansion direction"
                      value={formData.expansionDirection}
                      onChange={(e) => handleInputChange('expansionDirection', e.target.value)}
                      size="sm"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
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
                        <FormLabel fontWeight="semibold" fontSize="sm">Company Name</FormLabel>
                        <Input
                          placeholder="Enter your company name"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          size="sm"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" fontSize="sm">Industry</FormLabel>
                        <Input
                          placeholder="e.g., Technology, Healthcare, Finance, Baked Goods"
                          value={formData.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          size="sm"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" fontSize="sm">Target Market</FormLabel>
                        <Select
                          placeholder="Select target market"
                          value={formData.targetMarket}
                          onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                          size="sm"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                        >
                          <option value="United States">United States</option>
                          <option value="China">China</option>
                          <option value="South Korea">South Korea</option>
                          <option value="Japan">Japan</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Hong Kong">Hong Kong</option>
                          <option value="Taiwan">Taiwan</option>
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="semibold" fontSize="sm">Website</FormLabel>
                        <Input
                          placeholder="https://yourcompany.com"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          size="sm"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" fontSize="sm">Current Brand Positioning</FormLabel>
                    <Textarea
                      placeholder="Describe how your brand is currently positioned in your home market..."
                      value={formData.currentPositioning}
                      onChange={(e) => handleInputChange('currentPositioning', e.target.value)}
                      size="sm"
                      rows={2}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" fontSize="sm">Brand Description</FormLabel>
                    <Textarea
                      placeholder="Describe your brand, products/services, and unique value proposition..."
                      value={formData.brandDescription}
                      onChange={(e) => handleInputChange('brandDescription', e.target.value)}
                      size="sm"
                      rows={3}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" fontSize="sm">Email Address</FormLabel>
                    <Input
                      type="email"
                      placeholder="your.email@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      size="sm"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    />
                  </FormControl>

                  {/* Additional Company Details Section */}
                  <Box p={4} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200">
                    <Heading size="sm" color="purple.700" mb={3}>
                      Additional Company Details (Optional but Recommended)
                    </Heading>
                    <Text fontSize="xs" color="purple.600" mb={4}>
                      These details help KairosAI generate more accurate and detailed analysis
                    </Text>
                    
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                      <GridItem>
                        <FormControl>
                          <FormLabel fontWeight="semibold" fontSize="sm">Company Size</FormLabel>
                          <Select
                            placeholder="Select company size"
                            value={formData.companySize}
                            onChange={(e) => handleInputChange('companySize', e.target.value)}
                            size="sm"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          >
                            <option value="1-10">1-10 employees (Startup)</option>
                            <option value="11-50">11-50 employees (Small)</option>
                            <option value="51-200">51-200 employees (Medium)</option>
                            <option value="201-1000">201-1000 employees (Large)</option>
                            <option value="1000+">1000+ employees (Enterprise)</option>
                          </Select>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel fontWeight="semibold" fontSize="sm">Annual Revenue</FormLabel>
                          <Select
                            placeholder="Select revenue range"
                            value={formData.annualRevenue}
                            onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                            size="sm"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          >
                            <option value="0-1M">$0 - $1M</option>
                            <option value="1M-10M">$1M - $10M</option>
                            <option value="10M-50M">$10M - $50M</option>
                            <option value="50M-200M">$50M - $200M</option>
                            <option value="200M+">$200M+</option>
                          </Select>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel fontWeight="semibold" fontSize="sm">Funding Stage</FormLabel>
                          <Select
                            placeholder="Select funding stage"
                            value={formData.fundingStage}
                            onChange={(e) => handleInputChange('fundingStage', e.target.value)}
                            size="sm"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          >
                            <option value="bootstrap">Bootstrap/Self-funded</option>
                            <option value="seed">Seed</option>
                            <option value="series-a">Series A</option>
                            <option value="series-b">Series B</option>
                            <option value="series-c">Series C+</option>
                            <option value="public">Public</option>
                          </Select>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel fontWeight="semibold" fontSize="sm">Current Markets</FormLabel>
                          <Input
                            placeholder="e.g., US, China, South Korea"
                            value={formData.currentMarkets}
                            onChange={(e) => handleInputChange('currentMarkets', e.target.value)}
                            size="sm"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel fontWeight="semibold" fontSize="sm">Key Products/Services</FormLabel>
                          <Textarea
                            placeholder="Describe your main products or services..."
                            value={formData.keyProducts}
                            onChange={(e) => handleInputChange('keyProducts', e.target.value)}
                            size="sm"
                            rows={2}
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel fontWeight="semibold" fontSize="sm">Competitive Advantage</FormLabel>
                          <Textarea
                            placeholder="What makes you unique vs competitors?"
                            value={formData.competitiveAdvantage}
                            onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
                            size="sm"
                            rows={2}
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel fontWeight="semibold" fontSize="sm">Expansion Timeline</FormLabel>
                          <Select
                            placeholder="When do you plan to expand?"
                            value={formData.expansionTimeline}
                            onChange={(e) => handleInputChange('expansionTimeline', e.target.value)}
                            size="sm"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          >
                            <option value="immediate">Immediate (0-3 months)</option>
                            <option value="short-term">Short-term (3-12 months)</option>
                            <option value="medium-term">Medium-term (1-2 years)</option>
                            <option value="long-term">Long-term (2+ years)</option>
                            <option value="exploring">Just exploring options</option>
                          </Select>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel fontWeight="semibold" fontSize="sm">Budget Range</FormLabel>
                          <Select
                            placeholder="Select budget range"
                            value={formData.budgetRange}
                            onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                            size="sm"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          >
                            <option value="0-50K">$0 - $50K</option>
                            <option value="50K-200K">$50K - $200K</option>
                            <option value="200K-500K">$200K - $500K</option>
                            <option value="500K-1M">$500K - $1M</option>
                            <option value="1M+">$1M+</option>
                          </Select>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel fontWeight="semibold" fontSize="sm">Regulatory Requirements</FormLabel>
                          <Textarea
                            placeholder="Any specific regulatory requirements or compliance needs?"
                            value={formData.regulatoryRequirements}
                            onChange={(e) => handleInputChange('regulatoryRequirements', e.target.value)}
                            size="sm"
                            rows={2}
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel fontWeight="semibold" fontSize="sm">Partnership Preferences</FormLabel>
                          <Textarea
                            placeholder="Preferred partnership types (distributors, JVs, etc.)"
                            value={formData.partnershipPreferences}
                            onChange={(e) => handleInputChange('partnershipPreferences', e.target.value)}
                            size="sm"
                            rows={2}
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          />
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </Box>

                  <Button
                    type="submit"
                    size="md"
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
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
                    rightIcon={<FiArrowRight />}
                  >
                    See KairosAI Analysis
                  </Button>
                </VStack>
              </form>

              {/* Features Preview */}
              <Box mt={4} p={3} bg="gray.50" borderRadius="lg">
                <Text fontSize="sm" color="gray.600" textAlign="center" mb={2}>
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
    </Box>
  );
};

export default LandingPage; 