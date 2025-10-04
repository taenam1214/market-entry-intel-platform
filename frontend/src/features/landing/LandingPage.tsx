import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Button,
  Fade,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Link,
  Image,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiTarget, FiTrendingUp, FiBarChart, FiArrowRight, FiArrowDown, FiUsers, FiMessageCircle, FiEdit3, FiCpu, FiZap, FiFileText, FiMail } from 'react-icons/fi';
import { FaLinkedin, FaYoutube } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import AnalysisForm from '../../components/AnalysisForm';
import KairosAILogo from '../../assets/KairosAI_logo.png';

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
    bg={isMajor ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.95)"}
    borderRadius="50%"
    animation={`${nodePulse} 12s ease-in-out infinite`}
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
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [activeConnections, setActiveConnections] = useState<Array<{
    fromX: string;
    fromY: string;
    toX: string;
    toY: string;
    opacity: number;
    delay: number;
  }>>([]);
  const navigate = useNavigate();
  const { isOpen: isSignupModalOpen, onOpen: onSignupModalOpen, onClose: onSignupModalClose } = useDisclosure();

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

  // Handle analysis button click
  const handleAnalysisClick = () => {
    if (!isAuthenticated) {
      onSignupModalOpen();
      } else {
      setShowAnalysisForm(true);
      setTimeout(() => {
        document.getElementById('analysis-form')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  };

  // Handle signup navigation
  const handleSignup = () => {
    onSignupModalClose();
    navigate('/register');
  };

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
              welcomeTitle="Start Your US-Asia Market Analysis"
              welcomeSubtitle="Let KairosAI autonomously research and analyze your cross-Pacific expansion opportunities"
              submitButtonText="Start KairosAI Analysis"
            />
          </VStack>
        </Container>
        </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#140d28" w="100%">
      {/* Hero Section - Full Viewport */}
      <Box
        h="100vh"
        bg="#140d28"
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
                  bg="linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)"
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
                  bg="linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 100%)"
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
                color="white"
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
                color="white"
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
                  bg="rgba(255,255,255,0.15)"
                  borderRadius="2xl"
                  backdropFilter="blur(15px)"
                  border="1px solid rgba(255,255,255,0.2)"
                  _hover={{
                    transition: 'all 0.3s ease',
                    bg: 'rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 32px rgba(255,255,255,0.1)',
                  }}
                >
                  <Icon as={FiTarget} boxSize={8} color="white" />
                </Box>
                <VStack spacing={2} align="center" w="140px">
                  <Text fontWeight="bold" fontSize="lg" color="white" letterSpacing="0.01em" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" textAlign="center">Autonomous Intelligence</Text>
                  <Text fontSize="sm" opacity="0.85" color="white" textAlign="center" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">AI-driven market research</Text>
                </VStack>
              </VStack>

              <VStack spacing={4} align="center" flex="0 0 auto">
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
                    transition: 'all 0.3s ease',
                    bg: 'rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 32px rgba(255,255,255,0.1)',
                  }}
                >
                  <Icon as={FiTrendingUp} boxSize={8} color="white" />
                </Box>
                <VStack spacing={2} align="center" w="140px">
                  <Text fontWeight="bold" fontSize="lg" color="white" letterSpacing="0.01em" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" textAlign="center">Perfect Timing</Text>
                  <Text fontSize="sm" opacity="0.85" color="white" textAlign="center" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Seize market opportunities</Text>
                </VStack>
              </VStack>

              <VStack spacing={4} align="center" flex="0 0 auto">
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
                    transition: 'all 0.3s ease',
                    bg: 'rgba(255,255,255,0.25)',
                    boxShadow: '0 8px 32px rgba(255,255,255,0.1)',
                  }}
                >
                  <Icon as={FiBarChart} boxSize={8} color="white" />
                </Box>
                <VStack spacing={2} align="center" w="140px">
                  <Text fontWeight="bold" fontSize="lg" color="white" letterSpacing="0.01em" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" textAlign="center">Strategic Positioning</Text>
                  <Text fontSize="sm" opacity="0.85" color="white" textAlign="center" fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif">Data-driven market entry</Text>
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
              onClick={handleAnalysisClick}
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
        bg="#140d28"
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
                color="white"
                fontFamily="'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
              >
                Traditional market research takes 6 months.
              </Text>
              <Text 
                fontSize="54px" 
                fontWeight="normal"
                color="white"
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
        bg="#140d28"
      >
        <Container maxW="100%" px={8}>
          <VStack spacing={12} textAlign="left" align="start" maxW="7xl" mx="auto">
            {/* Problem vs Solution Comparison */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full" maxW="7xl">
                  {/* Traditional Approach */}
                  <Box p={6} bg="gray.800" borderRadius="xl">
                    <VStack spacing={4} align="start">
                      <HStack spacing={3}>
                        <Box w="8" h="8" bg="red.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                          <Icon as={FiTarget} color="white" boxSize={4} />
                        </Box>
                        <Heading size="md" color="white">Traditional Market Research</Heading>
                      </HStack>
                      
                      <VStack spacing={3} align="start" w="full">
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.300" fontWeight="semibold">Timeline</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="red.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="white" fontWeight="bold">3-6 months</Text>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.300" fontWeight="semibold">Cost</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="red.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="white" fontWeight="bold">$50K - $200K</Text>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.300" fontWeight="semibold">Output</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="red.500" borderRadius="full" mt={2} />
                            <VStack spacing={1} align="start">
                              <Text fontSize="md" color="white" fontWeight="bold">Static PDF reports</Text>
                              <Text fontSize="xs" color="gray.400">Generic templates, outdated data, limited insights</Text>
                            </VStack>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.300" fontWeight="semibold">Updates</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="red.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="white" fontWeight="bold">One-time analysis</Text>
                          </HStack>
                        </VStack>
                      </VStack>
                      
                      <Text fontSize="sm" color="gray.300" fontStyle="italic">
                        "By the time you get results, the market has already changed"
                      </Text>
                    </VStack>
                  </Box>

                  {/* KairosAI Approach */}
                  <Box p={6} bg="gray.800" borderRadius="xl">
                    <VStack spacing={4} align="start">
                      <HStack spacing={3}>
                        <Box w="8" h="8" bg="green.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                          <Icon as={FiTrendingUp} color="white" boxSize={4} />
                        </Box>
                        <Heading size="md" color="white">KairosAI Platform</Heading>
                      </HStack>
                      
                      <VStack spacing={3} align="start" w="full">
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.300" fontWeight="semibold">Timeline</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="green.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="white" fontWeight="bold">5 minutes</Text>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.300" fontWeight="semibold">Cost</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="green.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="white" fontWeight="bold">Fraction of consultant fees</Text>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.300" fontWeight="semibold">Output</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="green.500" borderRadius="full" mt={2} />
                            <VStack spacing={1} align="start">
                              <Text fontSize="md" color="white" fontWeight="bold">Executive-ready deliverables</Text>
                              <Text fontSize="xs" color="gray.400">Interactive dashboards, board presentations, investment memos, strategic recommendations</Text>
                            </VStack>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color="gray.300" fontWeight="semibold">Updates</Text>
                          <HStack spacing={2} align="start">
                            <Box w="4px" h="4px" bg="green.500" borderRadius="full" mt={2} />
                            <Text fontSize="md" color="white" fontWeight="bold">Continuous monitoring</Text>
                          </HStack>
                        </VStack>
                      </VStack>
                      
                      <Text fontSize="sm" color="gray.300" fontStyle="italic">
                        "Real-time intelligence that evolves with your market"
                    </Text>
                    </VStack>
                  </Box>
                </SimpleGrid>

            {/* How It Works Workflow */}
            <VStack spacing={8} w="full" mt={32}>
              <Heading size="3xl" color="white" fontWeight="normal">KairosAI does it All. </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full" maxW="7xl">
                {/* Step 1 */}
                <VStack spacing={6} p={8} bg="gray.800" borderRadius="xl">
                  <Box w="16" h="16" bg="purple.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiEdit3} color="white" boxSize={8} />
                  </Box>
                  <VStack spacing={3} textAlign="center">
                    <Heading size="md" color="white">Input Company Info</Heading>
                    <Text fontSize="md" color="gray.300">Simply provide your company details, industry, target markets, and expansion goals. Our intuitive form captures everything from brand positioning to competitive advantages, creating a comprehensive foundation for AI-powered analysis.</Text>
                  </VStack>
                </VStack>

                {/* Step 2 */}
                <VStack spacing={6} p={8} bg="gray.800" borderRadius="xl">
                  <Box w="16" h="16" bg="blue.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiCpu} color="white" boxSize={8} />
                  </Box>
                  <VStack spacing={3} textAlign="center">
                    <Heading size="md" color="white">AI Agents Research</Heading>
                    <Text fontSize="md" color="gray.300">Multiple specialized autonomous AI agents work 24/7 to analyze market data, competitor strategies, regulatory requirements, and cross-Pacific business dynamics. They continuously research and synthesize information from thousands of sources to build comprehensive market intelligence.</Text>
                  </VStack>
                </VStack>

                {/* Step 3 */}
                <VStack spacing={6} p={8} bg="gray.800" borderRadius="xl">
                  <Box w="16" h="16" bg="green.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiZap} color="white" boxSize={8} />
                  </Box>
                  <VStack spacing={3} textAlign="center">
                    <Heading size="md" color="white">Generate Insights</Heading>
                    <Text fontSize="md" color="gray.300">Access interactive market intelligence dashboards with real-time data visualization, segment arbitrage opportunities that reveal hidden market gaps, competitive positioning analysis, and strategic recommendations. Ask questions anytime through our 24/7 AI consultant chatbot for instant insights.</Text>
                  </VStack>
                </VStack>

                {/* Step 4 */}
                <VStack spacing={6} p={8} bg="gray.800" borderRadius="xl">
                  <Box w="16" h="16" bg="teal.500" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiFileText} color="white" boxSize={8} />
                  </Box>
                  <VStack spacing={3} textAlign="center">
                    <Heading size="md" color="white">Executive Deliverables</Heading>
                    <Text fontSize="md" color="gray.300">Download polished, board-ready documentations, comprehensive investment memos, strategic go-to-market recommendations, regulatory compliance analysis, and partnership opportunity briefs. Every deliverable is professionally formatted and ready to share with stakeholders, investors, and leadership teams.</Text>
                  </VStack>
                </VStack>
              </SimpleGrid>
            </VStack>

            {/* Unique Value Propositions */}
            <VStack spacing={0} w="full" maxW="7xl" mt={32}>
              <Heading size="3xl" color="white" fontWeight="normal" fontSize="54px" mb={8}>What We Offer</Heading>
              
              <VStack spacing={0} w="full" divider={<Box h="1px" bg="gray.700" w="full" />}>
                {/* Empty spacer for top divider */}
                <Box py={0} w="full" />
                
                {/* Feature 1 - Autonomous AI Agents */}
                <HStack spacing={20} align="start" py={10} w="full">
                  <HStack spacing={4} minW="400px">
                    <Icon as={FiTarget} color="white" boxSize={8} />
                    <Heading size="lg" color="white" fontSize="28px" fontWeight="normal">Autonomous AI Agents</Heading>
                  </HStack>
                  <Text fontSize="xl" color="gray.300" lineHeight="1.9" flex={1}>
                    Multiple specialized AI agents work simultaneously 24/7, analyzing market data, competitor strategies, regulatory requirements, and cross-Pacific business dynamics. They continuously research and synthesize information from thousands of sources to build comprehensive market intelligence tailored to your expansion goals.
                    </Text>
                </HStack>
                
                {/* Feature 2 - Executive-Ready Outputs */}
                <HStack spacing={20} align="start" py={10} w="full">
                  <HStack spacing={4} minW="400px">
                    <Icon as={FiTrendingUp} color="white" boxSize={8} />
                    <Heading size="lg" color="white" fontSize="28px" fontWeight="normal">Executive-Ready Outputs</Heading>
                  </HStack>
                  <Text fontSize="xl" color="gray.300" lineHeight="1.9" flex={1}>
                    Generate polished, board-ready presentations, comprehensive investment memos, strategic go-to-market recommendations, regulatory compliance analysis, and partnership opportunity briefs automatically. Every deliverable is professionally formatted and ready to share with stakeholders, investors, and leadership teams—no manual report writing required.
                  </Text>
                </HStack>
                
                {/* Feature 3 - Segment Arbitrage Detection */}
                <HStack spacing={20} align="start" py={10} w="full">
                  <HStack spacing={4} minW="400px">
                    <Icon as={FiBarChart} color="white" boxSize={8} />
                    <Heading size="lg" color="white" fontSize="28px" fontWeight="normal">Segment Arbitrage Detection</Heading>
                  </HStack>
                  <Text fontSize="xl" color="gray.300" lineHeight="1.9" flex={1}>
                    Discover hidden market opportunities and positioning gaps that competitors miss through advanced data analysis. Our AI identifies underserved segments, pricing advantages, and strategic entry points that maximize your market entry value and competitive positioning across US-Asia markets.
                  </Text>
                </HStack>
                
                {/* Feature 4 - Cross-Pacific Expertise */}
                <HStack spacing={20} align="start" py={10} w="full">
                  <HStack spacing={4} minW="400px">
                    <Icon as={FiUsers} color="white" boxSize={8} />
                    <Heading size="lg" color="white" fontSize="28px" fontWeight="normal">Cross-Pacific Expertise</Heading>
                  </HStack>
                  <Text fontSize="xl" color="gray.300" lineHeight="1.9" flex={1}>
                    Built specifically for US-Asia market dynamics with deep understanding of cultural nuances, regulatory requirements, business practices, and local market conditions. Our platform bridges the gap between Western and Asian business ecosystems, providing insights that generic market research tools cannot deliver.
                  </Text>
                </HStack>
                
                {/* Feature 5 - 24/7 AI Consultant */}
                <HStack spacing={20} align="start" py={10} w="full">
                  <HStack spacing={4} minW="400px">
                    <Icon as={FiMessageCircle} color="white" boxSize={8} />
                    <Heading size="lg" color="white" fontSize="28px" fontWeight="normal">24/7 AI Consultant</Heading>
                  </HStack>
                  <Text fontSize="xl" color="gray.300" lineHeight="1.9" flex={1}>
                    Get instant answers to market questions, strategic guidance, and real-time insights through our intelligent chatbot consultant. Ask questions anytime about market conditions, competitor movements, regulatory changes, or expansion strategies—like having an expert consultant available around the clock without the consulting fees.
                  </Text>
                </HStack>
                
                {/* Empty spacer for bottom divider */}
                <Box py={0} w="full" />
              </VStack>
            </VStack>

            {/* Call to Action */}
            <VStack spacing={8} align="center" textAlign="center" w="full" mt={16}>
              <Heading size="md" color="white" fontSize="54px" fontWeight="normal">Ready to Transform Your Market Entry Strategy?</Heading>
                  <Button
                size="xl"
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                    _hover={{
                      bg: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                    }}
                _active={{ transform: 'translateY(0)' }}
                px={12}
                    py={6}
                    fontSize="lg"
                    fontWeight="bold"
                    borderRadius="lg"
                    border="none"
                onClick={handleAnalysisClick}
                    rightIcon={<FiArrowDown />}
                  >
                Start Your Free Analysis
                  </Button>
                </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Form Section */}
      {showAnalysisForm && (
        <Fade in={showAnalysisForm} transition={{ enter: { duration: 0.6 } }}>
          <Box id="analysis-form">
            <AnalysisForm />
          </Box>
        </Fade>
      )}

      {/* Footer Section */}
      <Box bg="black" pt={28} pb={6}>
        <Container maxW="7xl">
          <VStack spacing={8}>
            {/* Main Footer Content */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
              {/* Company Info */}
              <VStack spacing={4} align="start">
                <HStack spacing={3} align="center">
                  <Image 
                    src={KairosAILogo} 
                    alt="KairosAI Logo" 
                    h="128px" 
                    w="auto"
                    objectFit="contain"
                    filter="brightness(0) invert(1)"
                  />
                  <Text
                    fontSize="52px"
                    color="white"
                  >
                    Gateway to global opportunities.
                </Text>
                </HStack>
              </VStack>

              {/* Contact & Social Info */}
              <VStack spacing={6} align="start" ml={16}>
                {/* Contact Info */}
                <VStack spacing={4} align="start">
                  <Heading size="xl" color="white">Contact Us</Heading>
                  <HStack spacing={2}>
                    <Icon as={FiMail} color="white" boxSize={7} />
                    <Text fontSize="md" color="white">support@kairosai.world</Text>
                  </HStack>
                </VStack>

                {/* Social Links */}
                <VStack spacing={4} align="start">
                  <Heading size="xl" color="white">Follow Us</Heading>
                  <HStack spacing={8}>
                    <Box
                      as="a"
                      href="#"
                      cursor="pointer"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        // Future: window.open('https://linkedin.com/company/kairosai', '_blank');
                      }}
                    >
                      <FaLinkedin size={28} color="#0077B5" />
              </Box>
                    <Box
                      as="a"
                      href="#"
                      cursor="pointer"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        // Future: window.open('https://youtube.com/@kairosai', '_blank');
                      }}
                    >
                      <FaYoutube size={28} color="#FF0000" />
                    </Box>
                  </HStack>
                </VStack>
              </VStack>
            </SimpleGrid>

             {/* Divider */}
             <Divider borderColor="gray.700" mt={24} />

             {/* Copyright */}
             <HStack spacing={4} justify="space-between" w="full" flexWrap="wrap" mt={-4}>
               <Text fontSize="sm" color="gray.400">
                 © {new Date().getFullYear()} KairosAI. All rights reserved.
               </Text>
               <HStack spacing={6}>
                 <Link fontSize="sm" color="gray.400" _hover={{ color: "white" }}>
                   Privacy & Data Policy
                 </Link>
               </HStack>
             </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Signup Modal */}
      <Modal isOpen={isSignupModalOpen} onClose={onSignupModalClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent bg="#140d28" color="white" borderRadius="xl" mx={4}>
          <ModalHeader>
            <VStack spacing={2} align="center" textAlign="center">
              <Icon as={FiTarget} boxSize={8} color="purple.400" />
              <Heading size="lg" color="white">Unlock Your Market Intelligence</Heading>
            </VStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="lg" color="gray.300" lineHeight="1.6">
                Get instant access to our AI-powered market analysis platform. 
                Create your free account to start exploring cross-Pacific expansion opportunities.
              </Text>
              <VStack spacing={2} align="start" w="full" bg="gray.800" p={4} borderRadius="lg">
                <HStack spacing={3}>
                  <Icon as={FiZap} color="green.400" boxSize={5} />
                  <Text fontSize="sm" color="gray.300">Free market analysis in minutes</Text>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={FiTrendingUp} color="blue.400" boxSize={5} />
                  <Text fontSize="sm" color="gray.300">Executive-ready insights and reports</Text>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={FiMessageCircle} color="purple.400" boxSize={5} />
                  <Text fontSize="sm" color="gray.300">24/7 AI consultant access</Text>
                </HStack>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3} w="full">
                  <Button
                variant="outline" 
                color="white" 
                borderColor="gray.600" 
                _hover={{ bg: "gray.700" }}
                onClick={onSignupModalClose}
                flex={1}
              >
                Maybe Later
              </Button>
              <Button 
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                    _hover={{
                      bg: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }}
                onClick={handleSignup}
                flex={2}
                    rightIcon={<FiArrowRight />}
                  >
                Create Free Account
                  </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LandingPage; 