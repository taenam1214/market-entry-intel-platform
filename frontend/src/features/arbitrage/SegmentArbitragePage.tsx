import { Box, Container, Heading, Text } from '@chakra-ui/react';

const SegmentArbitragePage = () => (
  <Box p={6} w="100%">
    <Container maxW="100%" px={8}>
      <Heading size="xl" mb={2} color="gray.800">
        Segment Arbitrage Detection
      </Heading>
      <Text fontSize="lg" color="gray.600">
        Detects gaps between how a brand is currently positioned in its home market versus how similar brands are perceived in the target market. Recommends alternate positioning strategies where the brand can capture underserved or higher-value segments.
      </Text>
    </Container>
  </Box>
);

export default SegmentArbitragePage; 