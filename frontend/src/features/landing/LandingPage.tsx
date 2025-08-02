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
  Center,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiTarget, FiTrendingUp, FiBarChart, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
`;

const FloatingParticle = ({ delay, size, color, left, top }: {
  delay: number;
  size: number;
  color: string;
  left: string;
  top: string;
}) => (
  <Box
    position="absolute"
    left={left}
    top={top}
    w={`${size}px`}
    h={`${size}px`}
    bg={color}
    borderRadius="full"
    opacity="0.3"
    animation={`${float} 6s ease-in-out infinite`}
    style={{ animationDelay: `${delay}s` }}
  />
);

const LandingPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    targetMarket: '',
    currentPositioning: '',
    brandDescription: '',
    website: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [timerExpired, setTimerExpired] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
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
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        display="flex"
        alignItems="center"
        position="relative"
        overflow="hidden"
        w="100%"
        sx={{
          background: 'linear-gradient(-45deg, #667eea, #764ba2, #4facfe, #00f2fe)',
          backgroundSize: '400% 400%',
          animation: `${gradientShift} 15s ease infinite`,
        }}
      >
        {/* Animated Background Pattern */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          backgroundImage="radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)"
          backgroundSize="50px 50px"
          animation={`${pulse} 4s ease-in-out infinite`}
        />

        {/* Floating Particles */}
        <FloatingParticle delay={0} size={8} color="rgba(255,255,255,0.4)" left="10%" top="20%" />
        <FloatingParticle delay={1} size={12} color="rgba(255,255,255,0.3)" left="85%" top="15%" />
        <FloatingParticle delay={2} size={6} color="rgba(255,255,255,0.5)" left="20%" top="80%" />
        <FloatingParticle delay={3} size={10} color="rgba(255,255,255,0.2)" left="75%" top="70%" />
        <FloatingParticle delay={4} size={14} color="rgba(255,255,255,0.3)" left="50%" top="10%" />
        <FloatingParticle delay={5} size={8} color="rgba(255,255,255,0.4)" left="15%" top="60%" />

        {/* Animated Geometric Shapes */}
        <Box
          position="absolute"
          top="5%"
          right="10%"
          w="100px"
          h="100px"
          border="2px solid rgba(255,255,255,0.1)"
          borderRadius="50%"
          animation={`${float} 8s ease-in-out infinite`}
          style={{ animationDelay: '2s' }}
        />
        <Box
          position="absolute"
          bottom="15%"
          left="5%"
          w="80px"
          h="80px"
          border="2px solid rgba(255,255,255,0.1)"
          transform="rotate(45deg)"
          animation={`${float} 10s ease-in-out infinite`}
          style={{ animationDelay: '1s' }}
        />

        {/* Animated Lines */}
        <Box
          position="absolute"
          top="30%"
          left="0"
          w="100px"
          h="2px"
          bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)"
          animation={`${pulse} 4s ease-in-out infinite`}
          style={{ animationDelay: '0.5s' }}
        />
        <Box
          position="absolute"
          bottom="40%"
          right="0"
          w="150px"
          h="2px"
          bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)"
          animation={`${pulse} 4s ease-in-out infinite`}
          style={{ animationDelay: '2.5s' }}
        />

        <Container maxW="100%" px={8} position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <VStack spacing={4}>
              <Heading 
                size="xl" 
                fontWeight="bold" 
                lineHeight="1.2"
              >
                KairosAI
              </Heading>
              <Text 
                fontSize="md" 
                opacity="0.8"
              >
                Seizing the Perfect Moment for Market Success
              </Text>
              <Text 
                fontSize="lg" 
                maxW="2xl" 
                opacity="0.9"
              >
                Agentic AI that autonomously analyzes market entry opportunities, 
                competitive landscapes, and strategic positioning to help you identify 
                and seize the perfect moment for market expansion.
              </Text>
            </VStack>

            <HStack spacing={8} mt={6}>
              <VStack spacing={3}>
                <Box
                  w="60px"
                  h="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(255,255,255,0.5)"
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                  _hover={{
                    transform: 'scale(1.1)',
                    transition: 'transform 0.3s ease',
                    bg: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Icon as={FiTarget} boxSize={6} opacity="0.8" />
                </Box>
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="md">Autonomous Intelligence</Text>
                  <Text fontSize="sm" opacity="0.8">AI-driven market research</Text>
                </VStack>
              </VStack>

              <VStack spacing={3}>
                <Box
                  w="60px"
                  h="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(255,255,255,0.5)"
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                  _hover={{
                    transform: 'scale(1.1)',
                    transition: 'transform 0.3s ease',
                    bg: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Icon as={FiTrendingUp} boxSize={6} opacity="0.8" />
                </Box>
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="md">Perfect Timing</Text>
                  <Text fontSize="sm" opacity="0.8">Seize market opportunities</Text>
                </VStack>
              </VStack>

              <VStack spacing={3}>
                <Box
                  w="60px"
                  h="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(255,255,255,0.5)"
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                  _hover={{
                    transform: 'scale(1.1)',
                    transition: 'transform 0.3s ease',
                    bg: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Icon as={FiBarChart} boxSize={6} opacity="0.8" />
                </Box>
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="md">Strategic Positioning</Text>
                  <Text fontSize="sm" opacity="0.8">Data-driven market entry</Text>
                </VStack>
              </VStack>
            </HStack>

            <Button
              size="md"
              bg="white"
              color="purple.600"
              _hover={{ 
                bg: 'gray.100',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
                transition: 'all 0.3s ease',
              }}
              px={6}
              py={4}
              fontSize="md"
              fontWeight="bold"
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

      {/* Form Section */}
      <Box id="analysis-form" py={8} bg="white" w="100%">
        <Container maxW="100%" px={4}>
          <Card shadow="lg" borderRadius="lg" overflow="hidden" maxW="800px" mx="auto">
            <Box bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" p={4} color="white">
              <VStack spacing={2} textAlign="center">
                <Heading size="lg">
                  Start Your Autonomous Market Analysis
                </Heading>
                <Text fontSize="md" opacity="0.9">
                  Let KairosAI autonomously research and analyze your market entry opportunities
                </Text>
              </VStack>
            </Box>

            <CardBody p={4}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
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
                        <Select
                          placeholder="Select your industry"
                          value={formData.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          size="sm"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                        >
                          <option value="technology">Technology</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="finance">Finance</option>
                          <option value="retail">Retail</option>
                          <option value="manufacturing">Manufacturing</option>
                          <option value="education">Education</option>
                          <option value="other">Other</option>
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold" fontSize="sm">Target Market</FormLabel>
                        <Input
                          placeholder="e.g., US, Europe, Asia-Pacific"
                          value={formData.targetMarket}
                          onChange={(e) => handleInputChange('targetMarket', e.target.value)}
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
                    Launch KairosAI Analysis
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
                    Autonomous Competitive Intelligence
                  </Badge>
                  <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="sm">
                    Market Opportunity Detection
                  </Badge>
                  <Badge colorScheme="purple" px={2} py={1} borderRadius="full" fontSize="sm">
                    Strategic Positioning Insights
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