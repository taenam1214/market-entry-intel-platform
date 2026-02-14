import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Heading, Text, Button, VStack, HStack,
  Select, Spinner, useToast, Card, CardBody,
  Badge, SimpleGrid, FormControl, FormLabel, Link,
  Skeleton, SkeletonText, Input,
} from '@chakra-ui/react';
import { FiRefreshCw, FiExternalLink, FiRss } from 'react-icons/fi';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  published_at: string;
  category: string;
  relevance: string;
}

const relevanceColorMap: Record<string, string> = {
  high: 'green',
  medium: 'yellow',
  low: 'gray',
  critical: 'red',
};

const categoryColorMap: Record<string, string> = {
  regulatory: 'blue',
  economic: 'purple',
  competitive: 'orange',
  technology: 'teal',
  political: 'red',
  social: 'pink',
  market: 'green',
  trade: 'cyan',
};

const NewsFeedPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [market, setMarket] = useState('');
  const [industry, setIndustry] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const toast = useToast();

  const fetchNews = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const params = new URLSearchParams();
      if (market) params.append('market', market);
      if (industry) params.append('industry', industry);
      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.MONITORING.NEWS_FEED}?${queryString}`
        : API_ENDPOINTS.MONITORING.NEWS_FEED;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setArticles(data.articles || (Array.isArray(data) ? data : data.results || []));
      if (isRefresh) {
        toast({ title: 'News feed refreshed', status: 'success', duration: 2000 });
      }
    } catch {
      toast({ title: 'Failed to load news feed', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [market, industry, toast]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const formatCategory = (cat: string) => {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const filteredArticles = categoryFilter
    ? articles.filter(a => a.category === categoryFilter)
    : articles;

  const uniqueCategories = Array.from(new Set(articles.map(a => a.category).filter(Boolean)));

  return (
    <Box minH="100vh" bg="#fafafa" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" color="gray.900" mb={1}>News Feed</Heading>
              <Text color="gray.600">
                Curated market news and signals relevant to your expansion strategy.
              </Text>
            </Box>
            <Button
              leftIcon={<FiRefreshCw />}
              colorScheme="blue"
              variant="outline"
              onClick={() => fetchNews(true)}
              isLoading={refreshing}
              loadingText="Refreshing..."
            >
              Refresh
            </Button>
          </HStack>

          {/* Filters */}
          <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
            <CardBody>
              <HStack spacing={4} wrap="wrap" gap={4}>
                <FormControl flex={1} minW="180px">
                  <FormLabel color="gray.700" fontSize="sm">Market</FormLabel>
                  <Input
                    placeholder="e.g., Japan, Germany..."
                    value={market}
                    onChange={(e) => setMarket(e.target.value)}
                    borderColor="gray.300"
                    size="sm"
                  />
                </FormControl>
                <FormControl flex={1} minW="180px">
                  <FormLabel color="gray.700" fontSize="sm">Industry</FormLabel>
                  <Input
                    placeholder="e.g., Fintech, Healthcare..."
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    borderColor="gray.300"
                    size="sm"
                  />
                </FormControl>
                <FormControl flex={1} minW="180px">
                  <FormLabel color="gray.700" fontSize="sm">Category</FormLabel>
                  <Select
                    placeholder="All categories"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    borderColor="gray.300"
                    size="sm"
                  >
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{formatCategory(cat)}</option>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  colorScheme="blue"
                  size="sm"
                  mt="auto"
                  onClick={() => fetchNews()}
                  isLoading={loading}
                  minW="100px"
                  alignSelf="flex-end"
                >
                  Search
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Loading Skeleton */}
          {loading && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <Skeleton height="16px" width="60%" />
                      <SkeletonText noOfLines={3} spacing={2} width="100%" />
                      <Skeleton height="12px" width="40%" />
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}

          {/* No Results */}
          {!loading && filteredArticles.length === 0 && (
            <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
              <CardBody>
                <VStack spacing={4} py={8}>
                  <FiRss size={40} color="#A0AEC0" />
                  <Text color="gray.500" textAlign="center" maxW="md">
                    {articles.length === 0
                      ? 'No news articles found. Try adjusting your market or industry filters.'
                      : 'No articles match the selected category filter.'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* News Grid */}
          {!loading && filteredArticles.length > 0 && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {filteredArticles.map((article, idx) => (
                <Card
                  key={idx}
                  bg="white"
                  shadow="sm"
                  borderWidth="1px"
                  borderColor="gray.200"
                  _hover={{ shadow: 'md', borderColor: 'gray.300' }}
                  transition="all 0.2s"
                >
                  <CardBody>
                    <VStack align="start" spacing={3} h="full">
                      <HStack spacing={2} wrap="wrap" gap={1}>
                        {article.category && (
                          <Badge
                            colorScheme={categoryColorMap[article.category] || 'gray'}
                            fontSize="xs"
                          >
                            {formatCategory(article.category)}
                          </Badge>
                        )}
                        {article.relevance && (
                          <Badge
                            colorScheme={relevanceColorMap[article.relevance] || 'gray'}
                            fontSize="xs"
                            variant="subtle"
                          >
                            {article.relevance} relevance
                          </Badge>
                        )}
                      </HStack>

                      <Text fontWeight="600" color="gray.900" fontSize="sm" noOfLines={2}>
                        {article.title}
                      </Text>

                      <Text fontSize="sm" color="gray.600" noOfLines={3} flex={1}>
                        {article.description}
                      </Text>

                      <HStack justify="space-between" w="full" mt="auto">
                        <HStack spacing={2}>
                          <Badge colorScheme="gray" variant="outline" fontSize="xs">
                            {article.source}
                          </Badge>
                          <Text fontSize="xs" color="gray.400">
                            {new Date(article.published_at).toLocaleDateString()}
                          </Text>
                        </HStack>
                        {article.url && (
                          <Link href={article.url} isExternal>
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="blue"
                              rightIcon={<FiExternalLink />}
                            >
                              Read
                            </Button>
                          </Link>
                        )}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default NewsFeedPage;
