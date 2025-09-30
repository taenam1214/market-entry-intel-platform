import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  Flex,
  SimpleGrid,
  Button,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiTarget, FiTrendingUp, FiBarChart, FiArrowRight, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import AnalysisForm from '../../components/AnalysisForm';

// Animation keyframes for Global Business Network
const nodePulse = keyframes`
  0% { opacity: 0; transform: scale(0.8); }
  20% { opacity: 1; transform: scale(1); }
  80% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.8); }
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
    bg={isMajor ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.95)"}
    borderRadius="50%"
    animation={`${nodePulse} 12s ease-in-out infinite`}
    style={{ animationDelay: `${delay}s` }}
    boxShadow="0 0 12px rgba(0,0,0,0.8)"
    _before={{
      content: `"${label}"`,
      position: "absolute",
      top: "-30px",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "12px",
      color: "rgba(0,0,0,1)",
      fontWeight: "bold",
      whiteSpace: "nowrap",
      textShadow: "0 2px 4px rgba(255,255,255,0.5)",
    }}
  />
);

// Dynamic Connection Line Component
const DynamicConnectionLine = ({ 
  fromX, 
  fromY, 
  toX, 
  toY, 
  opacity = 0.8,
  delay = 0
}: {
  fromX: string;
  fromY: string;
  toX: string;
  toY: string;
  opacity?: number;
  delay?: number;
}) => (
  <line
    x1={fromX}
    y1={fromY}
    x2={toX}
    y2={toY}
    stroke={`rgba(0,0,0,${opacity})`}
    strokeWidth="3"
    strokeDasharray="10,10"
    opacity={opacity}
    filter="drop-shadow(0 0 4px rgba(0,0,0,0.5))"
  >
    <animate
      attributeName="stroke-dashoffset"
      values="0;20"
      dur="3s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="opacity"
      values="0;1;1;0"
      dur="12s"
      repeatCount="indefinite"
      begin={`${delay}s`}
    />
  </line>
);

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
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
    const numConnections = Math.floor(Math.random() * 2) + 1; // 1-2 connections
    const connections = [];
    const usedPairs = new Set(); // Prevent duplicate connections
    
    for (let i = 0; i < numConnections && connections.length < 2; i++) {
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
    
    // Ensure we have at least 1 connection
    if (connections.length < 1) {
      connections.push({
        fromX: "15%", fromY: "35%", toX: "85%", toY: "25%", opacity: 0.9, delay: 0
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
    }
  }, [isAuthenticated, user]);

  // Show streamlined form for authenticated users without analysis history
  if (isAuthenticated && !hasAnalysisHistory) {
  return (
      <Box minH="100vh" bg="white" py={8}>
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
  }

  return (
    <Box minH="100vh" bg="white" w="100%">
      {/* Hero Section - Full Viewport */}
      <Box
        h="100vh"
        bg="#ebe8fc"
        color="black"
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
                delay={connection.delay}
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
          <VStack spacing={8} textAlign="center" align="center" maxW="7xl" mx="auto">
            <VStack spacing={6} align="start" w="100%">
              <VStack spacing={2} align="start" w="100%">
              <Heading 
                  fontSize="96px"
                  fontWeight="extrabold" 
                  lineHeight="0.9"
                  letterSpacing="-0.02em"
                  bg="linear-gradient(135deg, #000000 0%, #333333 100%)"
                  bgClip="text"
                  textShadow="0 2px 4px rgba(0,0,0,0.1)"
                  fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
                  textAlign="left"
                  alignSelf="start"
              >
                KairosAI
              </Heading>
                <Box 
                  w="360px" 
                  h="3px" 
                  bg="linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)"
                  borderRadius="full"
                />
              </VStack>
              
              <Text 
                fontSize="80px" 
                fontWeight="semibold"
                opacity="0.95"
                letterSpacing="0.01em"
                textAlign="left"
                maxW="7xl"
                lineHeight="1.3"
                fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
                alignSelf="start"
              >
                Executive Intelligence for Cross-Pacific Expansion
              </Text>
              
              <Text 
                fontSize="24px" 
                maxW="7xl" 
                opacity="0.9"
                lineHeight="1.6"
                textAlign="left"
                fontWeight="normal"
                letterSpacing="0.005em"
                fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
                alignSelf="start"
              >
                Stop waiting 6 months and spending six figures on market research. 
                KairosAI's autonomous AI agents deliver board-ready market intelligence, 
                competitive analysis, and strategic positioning for US-Asia expansion in minutes.
              </Text>
            </VStack>

            <HStack spacing={0} mt={8} align="flex-start" justify="space-evenly" w="100%" maxW="7xl" mx="auto">
              <VStack spacing={4} align="center" flex="0 0 auto">
                <Box
                  w="80px"
                  h="80px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(0,0,0,0.15)"
                  borderRadius="2xl"
                  backdropFilter="blur(15px)"
                  border="1px solid rgba(0,0,0,0.2)"
                  _hover={{
                    transition: 'all 0.3s ease',
                    bg: 'rgba(0,0,0,0.25)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <Icon as={FiTarget} boxSize={8} color="black" />
                </Box>
                <VStack spacing={2} align="center" w="140px">
                  <Text fontWeight="bold" fontSize="lg" color="black" letterSpacing="0.01em" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" textAlign="center">Autonomous Intelligence</Text>
                  <Text fontSize="sm" opacity="0.85" color="black" textAlign="center" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">AI-driven market research</Text>
                </VStack>
              </VStack>

              <VStack spacing={4} align="center" flex="0 0 auto">
                <Box
                  w="80px"
                  h="80px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(0,0,0,0.15)"
                  borderRadius="2xl"
                  backdropFilter="blur(15px)"
                  border="1px solid rgba(0,0,0,0.2)"
                  _hover={{
                    transition: 'all 0.3s ease',
                    bg: 'rgba(0,0,0,0.25)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <Icon as={FiTrendingUp} boxSize={8} color="black" />
                </Box>
                <VStack spacing={2} align="center" w="140px">
                  <Text fontWeight="bold" fontSize="lg" color="black" letterSpacing="0.01em" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" textAlign="center">Perfect Timing</Text>
                  <Text fontSize="sm" opacity="0.85" color="black" textAlign="center" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Seize market opportunities</Text>
                </VStack>
              </VStack>

              <VStack spacing={4} align="center" flex="0 0 auto">
                <Box
                  w="80px"
                  h="80px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(0,0,0,0.15)"
                  borderRadius="2xl"
                  backdropFilter="blur(15px)"
                  border="1px solid rgba(0,0,0,0.2)"
                  _hover={{
                    transition: 'all 0.3s ease',
                    bg: 'rgba(0,0,0,0.25)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <Icon as={FiBarChart} boxSize={8} color="black" />
                </Box>
                <VStack spacing={2} align="center" w="140px">
                  <Text fontWeight="bold" fontSize="lg" color="black" letterSpacing="0.01em" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" textAlign="center">Strategic Positioning</Text>
                  <Text fontSize="sm" opacity="0.85" color="black" textAlign="center" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Data-driven market entry</Text>
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

      {/* Tagline Section with Gradient Transition */}
      <Box 
        py={16} 
        w="100%"
        bg="linear-gradient(to bottom, #ebe8fc 0%, #ebe8fc 20%, rgba(235, 232, 252, 0.8) 40%, rgba(235, 232, 252, 0.4) 60%, rgba(235, 232, 252, 0.1) 80%, white 100%)"
      >
        <Container maxW="100%" px={8}>
          <VStack spacing={0} textAlign="left" align="start" maxW="7xl" mx="auto">
            <Text 
              fontSize="32px" 
              fontWeight="normal" 
              color="#667EEA" 
              letterSpacing="0.01em"
              fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
            >
              AI intelligence for global expansion
            </Text>
            <VStack spacing={0} textAlign="left" align="start" mt={6}>
              <Text 
                fontSize="54px" 
                color="gray.700"
                fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
              >
                Traditional market research takes 6 months.
              </Text>
              <Text 
                fontSize="54px" 
                fontWeight="normal"
                color="black"
                fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
              >
                Let KairosAI do it in minutes.
                </Text>
              </VStack>
          </VStack>
        </Container>
            </Box>

      {/* How KairosAI Works Section with Continued Gradient */}
      <Box 
        py={16} 
        w="100%"
        bg="linear-gradient(to bottom, rgba(235, 232, 252, 0.1) 0%, rgba(235, 232, 252, 0.05) 30%, white 100%)"
      >
        <Container maxW="100%" px={8}>
          <VStack spacing={12} textAlign="left" align="start" maxW="7xl" mx="auto">
            {/* Section Header */}
            <VStack spacing={4} align="start" w="100%">
              <Heading 
                fontSize="54px" 
                fontWeight="normal"
                opacity="0.95"
                letterSpacing="0.01em"
                textAlign="left"
                lineHeight="1.3"
                fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
                color="black"
              >
                Why KairosAI?
              </Heading>
              <VStack spacing={2} align="start" w="100%">
                <Text 
                  fontSize="32px" 
                  opacity="0.9"
                  lineHeight="1.6"
                  textAlign="left"
                  fontWeight="normal"
                  letterSpacing="0.005em"
                  fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
                  color="black"
                >
                  Traditional market research takes months and costs six figures.
                </Text>
                <Text 
                  fontSize="32px" 
                  opacity="0.9"
                  lineHeight="1.6"
                  textAlign="left"
                  fontWeight="normal"
                  letterSpacing="0.005em"
                  fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
                  color="black"
                >
                  KairosAI delivers executive-ready insights in <Text as="span" color="#667EEA" fontWeight="bold">minutes.</Text>
                </Text>
              </VStack>
            </VStack>

            {/* Problem vs Solution Comparison */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full" maxW="7xl">
                  {/* Traditional Approach */}
                  <Box p={6} bg="red.50" borderRadius="xl">
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
                  <Box p={6} bg="green.50" borderRadius="xl">
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

            {/* How It Works Workflow */}
            <VStack spacing={8} w="full">
              <Heading size="lg" color="gray.800">How KairosAI Works</Heading>
              
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} w="full" maxW="7xl">
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
            <Card shadow="lg" borderRadius="xl" bg="gradient-to-r from-purple.50 to-blue.50" border="1px solid" borderColor="purple.200" w="full" maxW="7xl">
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
      <AnalysisForm />
    </Box>
  );
};

export default LandingPage; 