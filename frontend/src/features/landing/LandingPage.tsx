import { useState } from 'react';
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
} from '@chakra-ui/react';
import { FiTarget, FiTrendingUp, FiBarChart, FiArrowRight } from 'react-icons/fi';

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
  const toast = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Analysis Started!',
      description: 'We\'re analyzing your market entry opportunities. You\'ll be redirected to your dashboard shortly.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    // Here you would typically send data to backend and redirect
  };

  return (
    <Box minH="100vh" bg="gray.50" w="100%">
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
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          backgroundImage="radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)"
          backgroundSize="50px 50px"
        />

        <Container maxW="100%" px={8} position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <VStack spacing={4}>
              <Heading size="xl" fontWeight="bold" lineHeight="1.2">
                Market Entry Intelligence
              </Heading>
              <Text fontSize="lg" maxW="2xl" opacity="0.9">
                Unlock your competitive advantage with AI-powered market analysis.
                Discover opportunities, analyze competitors, and position your brand for success.
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
                  bg="rgba(255,255,255,0.1)"
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                >
                  <Icon as={FiTarget} boxSize={6} />
                </Box>
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="md">Competitive Analysis</Text>
                  <Text fontSize="sm" opacity="0.8">Identify key competitors</Text>
                </VStack>
              </VStack>

              <VStack spacing={3}>
                <Box
                  w="60px"
                  h="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(255,255,255,0.1)"
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                >
                  <Icon as={FiTrendingUp} boxSize={6} />
                </Box>
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="md">Market Opportunities</Text>
                  <Text fontSize="sm" opacity="0.8">Find growth potential</Text>
                </VStack>
              </VStack>

              <VStack spacing={3}>
                <Box
                  w="60px"
                  h="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(255,255,255,0.1)"
                  borderRadius="full"
                  backdropFilter="blur(10px)"
                >
                  <Icon as={FiBarChart} boxSize={6} />
                </Box>
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="md">Strategic Insights</Text>
                  <Text fontSize="sm" opacity="0.8">Data-driven decisions</Text>
                </VStack>
              </VStack>
            </HStack>

            <Button
              size="md"
              bg="white"
              color="purple.600"
              _hover={{ bg: 'gray.100' }}
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
                  Get Your Market Entry Analysis
                </Heading>
                <Text fontSize="md" opacity="0.9">
                  Tell us about your business and target market to receive personalized insights
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
                    Start Market Analysis
                  </Button>
                </VStack>
              </form>

              {/* Features Preview */}
              <Box mt={4} p={3} bg="gray.50" borderRadius="lg">
                <Text fontSize="sm" color="gray.600" textAlign="center" mb={2}>
                  You'll receive:
                </Text>
                <Flex justify="center" wrap="wrap" gap={2}>
                  <Badge colorScheme="green" px={2} py={1} borderRadius="full" fontSize="sm">
                    Competitive Landscape Analysis
                  </Badge>
                  <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="sm">
                    Segment Arbitrage Opportunities
                  </Badge>
                  <Badge colorScheme="purple" px={2} py={1} borderRadius="full" fontSize="sm">
                    Executive Summary Dashboard
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