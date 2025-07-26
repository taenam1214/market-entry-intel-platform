import { Box, Container, Heading, Text } from '@chakra-ui/react';
import SectionHeader from '../../components/SectionHeader';
import Card from '../../components/Card';
import DataTable from '../../components/DataTable';

const competitors = [
  { name: 'Competitor A', priceTier: 'Premium', value: 'High-touch service' },
  { name: 'Competitor B', priceTier: 'Mid', value: 'Best value for SMBs' },
  { name: 'Competitor C', priceTier: 'Budget', value: 'Lowest price, basic features' },
];

type Competitor = typeof competitors[number];

const columns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Price Tier', accessor: 'priceTier' },
  { header: 'Value Proposition', accessor: 'value' },
] as const satisfies { header: string; accessor: keyof Competitor }[];

const CompetitiveLandscapePage = () => (
  <Box p={6} w="100%">
    <Container maxW="100%" px={8}>
      <Box mb={6}>
        <Heading size="xl" mb={2} color="gray.800">
          Competitive Landscape Mapping
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Automatically identifies and analyzes 3–5 key competitors in the selected target market. Extracts data such as pricing tiers, product positioning, branding, and consumer sentiment from public digital sources.
        </Text>
      </Box>
      <Card title="Primary Competitors">
        <DataTable columns={columns} data={competitors} />
      </Card>
    </Container>
  </Box>
);

export default CompetitiveLandscapePage; 