import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Link,
  Icon,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  FiMail,
  FiMessageCircle,
  FiHelpCircle,
  FiBook,
  FiVideo,
  FiDownload,
  FiCheckCircle,
  FiArrowRight,
} from 'react-icons/fi';

const HelpSupportPage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission (you can integrate with your backend later)
    setTimeout(() => {
      toast({
        title: 'Message Sent',
        description: 'We\'ll get back to you within 24 hours.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const faqItems = [
    {
      question: "How does KairosAI's market analysis work?",
      answer: "KairosAI uses autonomous AI agents to analyze market data, competitor strategies, and regulatory requirements. Our agents work 24/7 to research and synthesize information from thousands of sources, delivering comprehensive market intelligence in minutes rather than months."
    },
    {
      question: "What markets does KairosAI cover?",
      answer: "We specialize in cross-Pacific expansion, covering US-Asia markets including China, South Korea, Japan, Singapore, Hong Kong, and Taiwan. Our platform understands the unique dynamics and cultural nuances of these markets."
    },
    {
      question: "How accurate is the market analysis?",
      answer: "Our AI agents use real-time data from thousands of sources including financial reports, regulatory filings, news, and market research. Our platform delivers executive-ready, board-approved analysis with comprehensive insights that are accurate and actionable. All reports are professionally formatted and ready for immediate use in strategic decision-making."
    },
    {
      question: "Can I export the analysis reports?",
      answer: "Yes! All analysis results can be exported as editable text files, allowing you to customize and refine the content if needed."
    },
    {
      question: "Is my company data secure?",
      answer: "Absolutely. We use enterprise-grade security with end-to-end encryption. Your data is never shared with third parties, and we comply with GDPR and other international data protection regulations."
    },
    {
      question: "How much does KairosAI cost?",
      answer: "We offer flexible pricing plans based on your needs. Contact our sales team at support@kairosai.world for a customized quote based on your market entry requirements."
    },
    {
      question: "Do you offer custom analysis for specific industries?",
      answer: "Yes! Our AI agents can be customized for specific industries including SaaS/Tech, Manufacturing, Healthcare, Financial Services, and Consumer Goods. We understand the unique challenges of each sector."
    },
    {
      question: "What's the difference between KairosAI and traditional consulting?",
      answer: "Traditional consulting takes 3-6 months and costs $50K-$200K, and even millions for some projects. KairosAI delivers results in minutes at a fraction of the cost, with continuous monitoring and updates. Our AI agents work 24/7 and never sleep."
    }
  ];

  const supportChannels = [
    {
      title: "Email Support",
      description: "Get detailed responses within 24 hours",
      icon: FiMail,
      contact: "support@kairosai.world",
      responseTime: "24 hours",
      color: "blue"
    },
    {
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      icon: FiMessageCircle,
      contact: "Available 9 AM - 6 PM PST",
      responseTime: "Immediate",
      color: "green"
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Step-by-step guide to your first analysis",
      icon: FiBook,
      type: "Coming Soon"
    },
    {
      title: "Video Tutorials",
      description: "Watch how to maximize KairosAI features",
      icon: FiVideo,
      type: "Coming Soon"
    },
    {
      title: "API Documentation",
      description: "Integrate KairosAI with your systems",
      icon: FiDownload,
      type: "Coming Soon"
    },
    {
      title: "Best Practices",
      description: "Tips for successful market entry",
      icon: FiCheckCircle,
      type: "Coming Soon"
    }
  ];

  return (
    <Box p={6} bg="#fafafa" minH="100vh" w="100%">
      <Container maxW="100%" px={8}>
        <VStack spacing={10} align="stretch" maxW="7xl" mx="auto">
          {/* Support Channels */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <HStack spacing={3}>
                <FiHelpCircle color="#4A5568" size={20} />
                <Heading size="md" color="gray.900">Get Support</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {supportChannels.map((channel, index) => (
                  <Card
                    key={index}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    shadow="sm"
                    _hover={{ shadow: 'md', borderColor: 'gray.300' }}
                    transition="all 0.2s"
                  >
                    <CardBody textAlign="center">
                      <VStack spacing={3}>
                        <Icon as={channel.icon} boxSize={7} color={`${channel.color}.500`} />
                        <VStack spacing={1}>
                          <Heading size="sm" color="gray.900">{channel.title}</Heading>
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            {channel.description}
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold" color={`${channel.color}.600`}>
                            {channel.contact}
                          </Text>
                          <Badge colorScheme={channel.color} variant="subtle" size="sm">
                            {channel.responseTime}
                          </Badge>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Contact Form */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <HStack spacing={3}>
                <FiMail color="#4A5568" size={20} />
                <Heading size="md" color="gray.900">Contact Us</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Name</FormLabel>
                      <Input
                        placeholder="Your full name"
                        value={contactForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        size="md"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Email</FormLabel>
                      <Input
                        type="email"
                        placeholder="your.email@company.com"
                        value={contactForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        size="md"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Subject</FormLabel>
                    <Input
                      placeholder="Brief description of your inquiry"
                      value={contactForm.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      size="md"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Message</FormLabel>
                    <Textarea
                      placeholder="Please provide details about your question or issue..."
                      value={contactForm.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      size="md"
                      rows={5}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    leftIcon={<FiMail />}
                    bg="gray.900"
                    color="white"
                    _hover={{ bg: 'gray.800' }}
                    _active={{ bg: 'gray.700' }}
                    isLoading={loading}
                    loadingText="Sending..."
                    size="md"
                    alignSelf="start"
                  >
                    Send Message
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* FAQ Section */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <HStack spacing={3}>
                <FiHelpCircle color="#4A5568" size={20} />
                <Heading size="md" color="gray.900">Frequently Asked Questions</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <Accordion allowToggle>
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={index}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    mb={2}
                    bg="white"
                  >
                    <AccordionButton
                      _hover={{ bg: 'gray.50' }}
                      _expanded={{ bg: 'gray.50' }}
                      py={4}
                      borderRadius="md"
                    >
                      <Box flex="1" textAlign="left" fontWeight="semibold" color="gray.800">
                        {item.question}
                      </Box>
                      <AccordionIcon color="gray.500" />
                    </AccordionButton>
                    <AccordionPanel pb={4} color="gray.600" lineHeight="1.7">
                      {item.answer}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Card>

          {/* Resources Section */}
          <Card bg="white" border="1px solid" borderColor="gray.200" shadow="sm">
            <CardHeader>
              <HStack spacing={3}>
                <FiBook color="#4A5568" size={20} />
                <Heading size="md" color="gray.900">Resources & Documentation</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {resources.map((resource, index) => (
                  <Card
                    key={index}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    shadow="sm"
                    _hover={{ shadow: 'md', borderColor: 'gray.300' }}
                    transition="all 0.2s"
                  >
                    <CardBody>
                      <HStack spacing={4} align="start">
                        <Icon as={resource.icon} boxSize={5} color="gray.500" mt={1} />
                        <VStack spacing={1} align="start" flex={1}>
                          <Heading size="sm" color="gray.900">{resource.title}</Heading>
                          <Text fontSize="sm" color="gray.500">
                            {resource.description}
                          </Text>
                          <Button
                            size="sm"
                            variant="ghost"
                            rightIcon={<FiArrowRight />}
                            color="gray.400"
                            _hover={{ bg: 'gray.50', color: 'gray.600' }}
                            isDisabled
                            mt={1}
                          >
                            Coming Soon
                          </Button>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Quick Contact */}
          <Alert status="info" borderRadius="md" bg="blue.50" border="1px solid" borderColor="blue.100">
            <AlertIcon color="blue.500" />
            <Box>
              <AlertTitle fontSize="md" color="gray.900">Need Immediate Help?</AlertTitle>
              <AlertDescription fontSize="sm" color="gray.600">
                For urgent issues, email us directly at{' '}
                <Link href="mailto:support@kairosai.world" color="blue.600" fontWeight="semibold">
                  support@kairosai.world
                </Link>
                {' '}or use our live chat during business hours.
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </Container>
    </Box>
  );
};

export default HelpSupportPage;
