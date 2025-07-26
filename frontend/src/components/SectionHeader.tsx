import { Heading, Text, VStack } from '@chakra-ui/react';

interface SectionHeaderProps {
  title: string;
  description?: string;
}

const SectionHeader = ({ title, description }: SectionHeaderProps) => (
  <VStack align="start" mb={6} spacing={2}>
    <Heading size="xl" color="gray.800">{title}</Heading>
    {description && <Text color="gray.600" fontSize="lg">{description}</Text>}
  </VStack>
);

export default SectionHeader; 