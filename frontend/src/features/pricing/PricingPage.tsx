import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  List,
  ListItem,
  ListIcon,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  buttonText: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Get started with basic market intelligence.',
    features: [
      '1 analysis per month',
      'Basic dashboard',
      'Chat support',
    ],
    highlighted: false,
    buttonText: 'Get Started',
  },
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'For growing teams exploring new markets.',
    features: [
      '3 analyses per month',
      'PDF exports',
      'Email support',
    ],
    highlighted: true,
    buttonText: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: '$149',
    period: '/month',
    description: 'Full-featured intelligence for serious expansion.',
    features: [
      'Unlimited analyses',
      'PDF + PPTX exports',
      'Multi-market comparison',
      'Deep dive research',
      'Priority support',
    ],
    highlighted: false,
    buttonText: 'Start Free Trial',
  },
];

const TierCard = ({ tier }: { tier: PricingTier }) => (
  <Box
    bg="white"
    borderRadius="xl"
    border="1px solid"
    borderColor={tier.highlighted ? 'blue.400' : 'gray.200'}
    boxShadow={tier.highlighted ? 'lg' : 'sm'}
    p={8}
    position="relative"
    transform={tier.highlighted ? 'scale(1.03)' : 'none'}
    transition="all 0.2s"
  >
    {tier.highlighted && (
      <Badge
        colorScheme="blue"
        position="absolute"
        top={-3}
        left="50%"
        transform="translateX(-50%)"
        px={3}
        py={1}
        borderRadius="full"
        fontSize="xs"
        textTransform="uppercase"
        letterSpacing="wide"
      >
        Most Popular
      </Badge>
    )}
    <VStack spacing={4} align="stretch">
      <Text fontWeight="600" fontSize="lg" color="gray.700">
        {tier.name}
      </Text>
      <HStack align="baseline" spacing={1}>
        <Heading size="2xl" color="gray.900">
          {tier.price}
        </Heading>
        <Text color="gray.500" fontSize="md">
          {tier.period}
        </Text>
      </HStack>
      <Text color="gray.500" fontSize="sm">
        {tier.description}
      </Text>
      <Divider />
      <List spacing={3} py={2}>
        {tier.features.map((feature) => (
          <ListItem key={feature} fontSize="sm" color="gray.600">
            <ListIcon as={FiCheck} color="blue.400" />
            {feature}
          </ListItem>
        ))}
      </List>
      <Button
        colorScheme={tier.highlighted ? 'blue' : 'gray'}
        variant={tier.highlighted ? 'solid' : 'outline'}
        size="lg"
        w="full"
        mt={2}
      >
        {tier.buttonText}
      </Button>
    </VStack>
  </Box>
);

const PricingPage = () => (
  <Box minH="100vh" bg="#fafafa" py={8}>
    <Container maxW="5xl">
      <VStack spacing={4} textAlign="center" py={12}>
        <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
          Pricing
        </Badge>
        <Heading size="lg" color="gray.900">
          Simple, transparent pricing
        </Heading>
        <Text color="gray.500" maxW="lg">
          Choose the plan that fits your market expansion needs. Upgrade or
          downgrade anytime.
        </Text>
      </VStack>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} pb={16}>
        {tiers.map((tier) => (
          <TierCard key={tier.name} tier={tier} />
        ))}
      </SimpleGrid>
    </Container>
  </Box>
);

export default PricingPage;
