import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  IconButton,
  useColorModeValue,
  Flex,
  Avatar,
  Badge,
  Spinner,
  useToast,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Button,
  Icon,
} from '@chakra-ui/react';
import { FiSend, FiMessageCircle, FiUser, FiRefreshCw, FiMessageSquare, FiArrowRight, FiTarget } from 'react-icons/fi';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { chatbotService } from '../../services/chatbotService';
import type { MarketReport, ChatConversation } from '../../services/chatbotService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableReports, setAvailableReports] = useState<MarketReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MarketReport | null>(null);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { analysisData } = useData();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Use data from centralized context
  const isDataLoading = analysisData.isLoading;

  // Color mode values
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const userBg = useColorModeValue('blue.50', 'blue.900');
  const assistantBg = useColorModeValue('gray.50', 'gray.700');

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      // Don't try to load data if user is not authenticated
      if (!user || !isAuthenticated) {
        setAvailableReports([]);
        setIsLoadingReports(false);
        return;
      }

      try {
        // Load market reports
        const reportsResponse = await chatbotService.getMarketReports();
        setAvailableReports(reportsResponse.reports);
        
        // Only add welcome message if there are reports and no existing messages
        if (reportsResponse.reports.length > 0 && messages.length === 0) {
          setMessages([
            {
              id: '1',
              type: 'assistant',
              content: `Hello ${user?.first_name || 'there'}! I'm your AI strategic business advisor. I have access to your market analysis reports and can help you with comprehensive business strategy, expansion planning, competitive analysis, and much more. 

I can answer questions about your reports, suggest new markets to explore, help with strategic positioning, assess risks, and provide strategic recommendations. What would you like to discuss?`,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Set empty reports array to show empty state
        setAvailableReports([]);
        
        // Only show error toast for actual server errors, not for authentication or empty results
        if (error instanceof Error && 
            !error.message.includes('401') && 
            !error.message.includes('403') && 
            !error.message.includes('404') &&
            !error.message.includes('Failed to fetch') &&
            !error.message.includes('HTTP error! status: 401') &&
            !error.message.includes('HTTP error! status: 403') &&
            !error.message.includes('Invalid token')) {
          toast({
            title: 'Error',
            description: 'Failed to load market reports. Please try again.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        setIsLoadingReports(false);
      }
    };

    loadData();
  }, [user, isAuthenticated, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show loading state while data is being loaded
  if (isDataLoading || isLoadingReports) {
    return (
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="6xl" py={8}>
          <VStack spacing={6} align="center" py={16}>
            <Spinner size="xl" color="purple.500" />
            <Text fontSize="lg" color="gray.600">
              Loading your market reports...
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Show empty state if no reports available
  if (availableReports.length === 0) {
    return (
      <Box p={6} bg="gray.50" minH="100vh" w="100%">
        <Container maxW="4xl" px={8}>
          <VStack spacing={8} py={16} textAlign="center">
            <VStack spacing={4}>
              <Icon as={FiMessageSquare} boxSize={16} color="purple.400" />
              <Heading size="xl" color="gray.700">
                AI Market Intelligence Assistant
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Chat with your AI strategic business advisor about your market analysis reports. 
                Get comprehensive business strategy advice, explore new markets, assess risks, 
                and receive strategic recommendations for your business expansion.
              </Text>
            </VStack>

            <VStack spacing={4} bg="white" p={8} borderRadius="xl" shadow="md" maxW="md" w="full">
              <Icon as={FiTarget} boxSize={8} color="purple.500" />
              <Heading size="md" color="gray.800">
                Ready to Get Started?
              </Heading>
              <Text fontSize="md" color="gray.600" textAlign="center">
                Start your first market analysis to unlock:
              </Text>
              <VStack spacing={2} align="start" w="full">
                <HStack>
                  <Badge colorScheme="green" borderRadius="full">✓</Badge>
                  <Text fontSize="sm">Strategic Business Advisory & Planning</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="blue" borderRadius="full">✓</Badge>
                  <Text fontSize="sm">Market Expansion & Country Recommendations</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="purple" borderRadius="full">✓</Badge>
                  <Text fontSize="sm">Competitive Analysis & Risk Assessment</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="orange" borderRadius="full">✓</Badge>
                  <Text fontSize="sm">AI-Powered Strategic Intelligence</Text>
                </HStack>
              </VStack>
              <Button 
                colorScheme="purple" 
                size="lg" 
                rightIcon={<FiArrowRight />}
                onClick={() => navigate('/')}
                w="full"
                mt={4}
              >
                Start Your Analysis
              </Button>
            </VStack>

            <Text fontSize="sm" color="gray.500" maxW="lg">
              Once you generate your first market analysis report, you'll be able to chat with our AI assistant 
              to get deeper insights and ask questions about your market opportunities.
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  const sendMessageToAPI = async (query: string): Promise<{ content: string; sources: string[] }> => {
    try {
      const response = await chatbotService.sendMessage({
        content: query,
        conversation_id: currentConversation?.id,
      });
      
      // Update current conversation if it's new
      if (!currentConversation && response.conversation_id) {
        setCurrentConversation({ id: response.conversation_id } as ChatConversation);
      }
      
      return {
        content: response.ai_message.content,
        sources: response.ai_message.sources || [],
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;


    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendMessageToAPI(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: `Hello ${user?.first_name || 'there'}! I'm your AI assistant for market intelligence. I can help you analyze your generated reports and answer questions about market opportunities, competitive landscapes, and strategic insights. 

What would you like to know about your reports?`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="6xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>
              AI Market Intelligence Assistant
            </Heading>
            <Text color="gray.600">
              Chat with your AI assistant about your market analysis reports
            </Text>
          </Box>

          <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
            {/* Available Reports Sidebar */}
            <Box w={{ base: '100%', lg: '300px' }}>
              <Card>
                <CardHeader>
                  <Heading size="sm">Available Reports</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {availableReports.map((report) => (
                      <Box
                        key={report.id}
                        p={3}
                        border="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        cursor="pointer"
                        bg={selectedReport?.id === report.id ? 'blue.50' : 'transparent'}
                        _hover={{ bg: 'gray.50' }}
                        onClick={() => setSelectedReport(report)}
                      >
                        <Text fontSize="sm" fontWeight="semibold" mb={1}>
                          {report.company_name} - {report.target_market}
                        </Text>
                        <Text fontSize="xs" color="gray.600" mb={2}>
                          {report.executive_summary ? 
                            `${report.executive_summary.substring(0, 100)}...` : 
                            'No summary available'
                          }
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Date not available'}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </Box>

            {/* Chat Interface */}
            <Box flex={1}>
              <Card h="600px" display="flex" flexDirection="column">
                <CardHeader>
                  <HStack justify="space-between">
                    <HStack>
                      <Avatar icon={<FiMessageCircle />} size="sm" />
                      <Text fontWeight="semibold">Market Intelligence Assistant</Text>
                    </HStack>
                    <IconButton
                      icon={<FiRefreshCw />}
                      size="sm"
                      variant="ghost"
                      onClick={clearChat}
                      aria-label="Clear chat"
                    />
                  </HStack>
                </CardHeader>
                
                <CardBody flex={1} overflow="hidden" display="flex" flexDirection="column">
                  {/* Messages */}
                  <Box flex={1} overflowY="auto" mb={4}>
                    <VStack spacing={4} align="stretch">
                      {messages.map((message) => (
                        <Box key={message.id}>
                          <HStack align="flex-start" spacing={3}>
                            <Avatar
                              size="sm"
                              icon={message.type === 'user' ? <FiUser /> : <FiMessageCircle />}
                              bg={message.type === 'user' ? 'blue.500' : 'purple.500'}
                            />
                            <Box flex={1}>
                              <Box
                                p={3}
                                borderRadius="lg"
                                bg={message.type === 'user' ? userBg : assistantBg}
                                maxW="80%"
                                ml={message.type === 'user' ? 'auto' : 0}
                                mr={message.type === 'user' ? 0 : 'auto'}
                              >
                                <Text fontSize="sm" whiteSpace="pre-wrap">
                                  {message.content}
                                </Text>
                                {message.sources && message.sources.length > 0 && (
                                  <Box mt={2}>
                                    <Text fontSize="xs" color="gray.600" mb={1}>
                                      Sources:
                                    </Text>
                                    {message.sources.map((source, index) => (
                                      <Badge key={index} size="sm" colorScheme="blue" mr={1} mb={1}>
                                        {source}
                                      </Badge>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                              <Text fontSize="xs" color="gray.500" mt={1} ml={3}>
                                {message.timestamp.toLocaleTimeString()}
                              </Text>
                            </Box>
                          </HStack>
                        </Box>
                      ))}
                      {isLoading && (
                        <HStack align="flex-start" spacing={3}>
                          <Avatar size="sm" icon={<FiMessageCircle />} bg="purple.500" />
                          <Box p={3} borderRadius="lg" bg={assistantBg}>
                            <HStack>
                              <Spinner size="sm" />
                              <Text fontSize="sm">Analyzing your question...</Text>
                            </HStack>
                          </Box>
                        </HStack>
                      )}
                      <div ref={messagesEndRef} />
                    </VStack>
                  </Box>

                  {/* Input */}
                  <Box>
                    <HStack spacing={2}>
                      <Textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about your market analysis reports..."
                        resize="none"
                        rows={2}
                        disabled={isLoading}
                      />
                      <IconButton
                        icon={<FiSend />}
                        colorScheme="blue"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        aria-label="Send message"
                      />
                    </HStack>
                  </Box>
                </CardBody>
              </Card>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default ChatbotPage;
