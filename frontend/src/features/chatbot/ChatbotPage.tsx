import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  IconButton,
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
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import { FiSend, FiMessageCircle, FiUser, FiRefreshCw, FiMessageSquare, FiArrowRight, FiTarget } from 'react-icons/fi';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { chatbotService } from '../../services/chatbotService';
import type { MarketReport, ChatConversation } from '../../services/chatbotService';
import { API_ENDPOINTS } from '../../config/api';

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
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { analysisData } = useData();
  const navigate = useNavigate();
  const toast = useToast();

  const isDataLoading = analysisData.isLoading;

  // Fetch reports from database API
  useEffect(() => {
    const fetchReports = async () => {
      if (!isAuthenticated || !user?.id) {
        setAvailableReports([]);
        setIsLoadingReports(false);
        return;
      }

      try {
        setIsLoadingReports(true);

        await new Promise(resolve => setTimeout(resolve, 100));

        const token = localStorage.getItem('authToken') || localStorage.getItem('token');

        if (!token) {
          setAvailableReports([]);
          setIsLoadingReports(false);
          return;
        }

        const response = await fetch(API_ENDPOINTS.REPORTS.SELECTOR, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAvailableReports(data.reports || []);

          if (data.reports && data.reports.length > 0) {
            setSelectedReportId(data.reports[0].id.toString());

            if (messages.length === 0) {
              setMessages([
                {
                  id: '1',
                  type: 'assistant',
                  content: `Hello ${user?.first_name || 'there'}! I'm your AI strategic business advisor. I have access to ${data.reports.length} market analysis report${data.reports.length > 1 ? 's' : ''} and can help you with comprehensive business strategy, expansion planning, competitive analysis, and much more.

Currently discussing: **${data.reports[0].company_name} → ${data.reports[0].target_market}**

I can answer questions about your reports, suggest new markets to explore, help with strategic positioning, assess risks, and provide strategic recommendations. What would you like to discuss?`,
                  timestamp: new Date(),
                },
              ]);
            }
          }
        } else {
          setAvailableReports([]);
        }
      } catch {
        setAvailableReports([]);
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAuthenticated]);

  // Update chat context when report selection changes
  useEffect(() => {
    if (!selectedReportId || availableReports.length === 0) return;

    const selectedReport = availableReports.find(r => r.id.toString() === selectedReportId);
    if (!selectedReport) return;

    if (messages.length <= 1) {
      setMessages([
        {
          id: '1',
          type: 'assistant',
          content: `Hello ${user?.first_name || 'there'}! I'm your AI strategic business advisor. I have access to ${availableReports.length} market analysis report${availableReports.length > 1 ? 's' : ''} and can help you with comprehensive business strategy, expansion planning, competitive analysis, and much more.

Currently discussing: **${selectedReport.company_name} → ${selectedReport.target_market}**

I can answer questions about your reports, suggest new markets to explore, help with strategic positioning, assess risks, and provide strategic recommendations. What would you like to discuss?`,
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const contextMessage: Message = {
      id: `context-${Date.now()}`,
      type: 'assistant',
      content: `**Context switched to:** ${selectedReport.company_name} → ${selectedReport.target_market}

I'm now ready to discuss this market analysis. What would you like to know?`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, contextMessage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReportId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 1 && !isLoadingReports) {
      scrollToBottom();
    }
  }, [messages.length, isLoadingReports]);

  // Loading state
  if (isDataLoading || isLoadingReports) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="6xl" py={8}>
          <VStack spacing={6} align="center" py={16}>
            <Spinner size="xl" color="gray.600" />
            <Text fontSize="lg" color="gray.600">
              Loading your market reports...
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Empty state - no reports
  if (availableReports.length === 0) {
    return (
      <Box p={6} bg="gray.50" minH="100vh" w="100%">
        <Container maxW="4xl" px={8}>
          <VStack spacing={8} py={16} textAlign="center">
            <VStack spacing={4}>
              <Icon as={FiMessageSquare} boxSize={16} color="gray.400" />
              <Heading size="xl" color="gray.900">
                AI Market Intelligence Assistant
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Chat with your AI strategic business advisor about your market analysis reports.
                Get comprehensive business strategy advice, explore new markets, assess risks,
                and receive strategic recommendations for your business expansion.
              </Text>
            </VStack>

            <Card
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              shadow="sm"
              maxW="md"
              w="full"
              borderRadius="xl"
            >
              <CardBody p={8}>
                <VStack spacing={4}>
                  <Icon as={FiTarget} boxSize={8} color="gray.500" />
                  <Heading size="md" color="gray.900">
                    Ready to Get Started?
                  </Heading>
                  <Text fontSize="md" color="gray.600" textAlign="center">
                    Start your first market analysis to unlock:
                  </Text>
                  <VStack spacing={2} align="start" w="full">
                    <HStack>
                      <Badge colorScheme="green" borderRadius="full">✓</Badge>
                      <Text fontSize="sm" color="gray.700">Strategic Business Advisory & Planning</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="blue" borderRadius="full">✓</Badge>
                      <Text fontSize="sm" color="gray.700">Market Expansion & Country Recommendations</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="purple" borderRadius="full">✓</Badge>
                      <Text fontSize="sm" color="gray.700">Competitive Analysis & Risk Assessment</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="orange" borderRadius="full">✓</Badge>
                      <Text fontSize="sm" color="gray.700">AI-Powered Strategic Intelligence</Text>
                    </HStack>
                  </VStack>
                  <Button
                    bg="gray.900"
                    color="white"
                    size="lg"
                    rightIcon={<FiArrowRight />}
                    onClick={() => navigate('/')}
                    w="full"
                    mt={4}
                    _hover={{ bg: 'gray.800' }}
                    _focus={{ boxShadow: 'none', outline: 'none' }}
                  >
                    Start Your Analysis
                  </Button>
                </VStack>
              </CardBody>
            </Card>

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
        selected_report_ids: selectedReportId ? [parseInt(selectedReportId)] : undefined,
      });

      if (!currentConversation && response.conversation_id) {
        setCurrentConversation({ id: response.conversation_id } as ChatConversation);
      }

      return {
        content: response.ai_message.content,
        sources: response.ai_message.sources || [],
      };
    } catch (error) {
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
    } catch {
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
    <Box p={6} bg="gray.50" minH="100vh" w="100%">
      <Container maxW="100%" px={8}>
        <VStack spacing={6} align="stretch" maxW="7xl" mx="auto">
          {/* Header */}
          <Box>
            <Heading size="xl" mb={2} color="gray.900">
              AI Market Intelligence Assistant
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Chat with your AI assistant about your market analysis reports
            </Text>
          </Box>

          <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
            {/* Reports Sidebar */}
            <Box w={{ base: '100%', lg: '320px' }}>
              <Card
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                shadow="sm"
                borderRadius="xl"
              >
                <CardHeader>
                  <VStack align="stretch" spacing={2}>
                    <Heading size="sm" color="gray.900">Select Report to Discuss</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Choose which report the AI should reference
                    </Text>
                  </VStack>
                </CardHeader>
                <CardBody>
                  <RadioGroup
                    value={selectedReportId}
                    onChange={setSelectedReportId}
                  >
                    <VStack spacing={3} align="stretch">
                      {availableReports.map((report) => (
                        <Box
                          key={report.id}
                          p={3}
                          border="1px solid"
                          borderColor={selectedReportId === report.id.toString() ? 'gray.900' : 'gray.200'}
                          borderRadius="md"
                          bg={selectedReportId === report.id.toString() ? 'gray.50' : 'white'}
                          _hover={{ bg: 'gray.50' }}
                          cursor="pointer"
                        >
                          <Radio
                            value={report.id.toString()}
                            colorScheme="gray"
                            size="sm"
                            mb={2}
                          >
                            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                              {report.company_name} → {report.target_market}
                            </Text>
                          </Radio>
                          <Text fontSize="xs" color="gray.600" ml={6}>
                            {report.industry}
                          </Text>
                          <Text fontSize="xs" color="gray.500" ml={6}>
                            {report.created_at ? new Date(report.created_at).toLocaleDateString() : ''}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </RadioGroup>
                  {selectedReportId && (
                    <Badge
                      mt={3}
                      bg="gray.900"
                      color="white"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                    >
                      1 report selected
                    </Badge>
                  )}
                </CardBody>
              </Card>
            </Box>

            {/* Chat Interface */}
            <Box flex={1}>
              <Card
                h="600px"
                display="flex"
                flexDirection="column"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                shadow="sm"
                borderRadius="xl"
              >
                <CardHeader borderBottom="1px solid" borderColor="gray.100">
                  <HStack justify="space-between">
                    <HStack>
                      <Avatar icon={<FiMessageCircle />} size="sm" bg="gray.900" />
                      <Text fontWeight="semibold" color="gray.900">Market Intelligence Assistant</Text>
                    </HStack>
                    <IconButton
                      icon={<FiRefreshCw />}
                      size="sm"
                      variant="ghost"
                      onClick={clearChat}
                      aria-label="Clear chat"
                      color="gray.500"
                      _hover={{ bg: 'gray.100', color: 'gray.700' }}
                      _focus={{ boxShadow: 'none', outline: 'none' }}
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
                              bg={message.type === 'user' ? 'blue.500' : 'gray.700'}
                            />
                            <Box flex={1}>
                              <Box
                                p={3}
                                borderRadius="lg"
                                bg={message.type === 'user' ? 'blue.50' : 'gray.50'}
                                border="1px solid"
                                borderColor={message.type === 'user' ? 'blue.100' : 'gray.100'}
                                maxW="80%"
                                ml={message.type === 'user' ? 'auto' : 0}
                                mr={message.type === 'user' ? 0 : 'auto'}
                              >
                                <Text
                                  fontSize="sm"
                                  whiteSpace="pre-wrap"
                                  color="gray.800"
                                >
                                  {message.content}
                                </Text>
                                {message.sources && message.sources.length > 0 && (
                                  <Box mt={2}>
                                    <Text fontSize="xs" color="gray.500" mb={1}>
                                      Sources:
                                    </Text>
                                    {message.sources.map((source, index) => (
                                      <Badge key={index} size="sm" colorScheme="blue" mr={1} mb={1} variant="subtle">
                                        {source}
                                      </Badge>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                              <Text fontSize="xs" color="gray.400" mt={1} ml={3}>
                                {message.timestamp.toLocaleTimeString()}
                              </Text>
                            </Box>
                          </HStack>
                        </Box>
                      ))}
                      {isLoading && (
                        <HStack align="flex-start" spacing={3}>
                          <Avatar size="sm" icon={<FiMessageCircle />} bg="gray.700" />
                          <Box p={3} borderRadius="lg" bg="gray.50" border="1px solid" borderColor="gray.100">
                            <HStack>
                              <Spinner size="sm" color="gray.500" />
                              <Text fontSize="sm" color="gray.600">Analyzing your question...</Text>
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
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        color="gray.900"
                        _placeholder={{ color: 'gray.400' }}
                        _focus={{
                          borderColor: 'gray.400',
                          boxShadow: 'none'
                        }}
                        _hover={{ borderColor: 'gray.300' }}
                      />
                      <IconButton
                        icon={<FiSend />}
                        bg="gray.900"
                        color="white"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        aria-label="Send message"
                        _hover={{ bg: 'gray.800' }}
                        _focus={{ boxShadow: 'none', outline: 'none' }}
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
