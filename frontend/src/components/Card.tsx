import { ReactNode } from 'react';
import { Box, Heading } from '@chakra-ui/react';

interface CardProps {
  title?: string;
  children: ReactNode;
  p?: number | string;
}

const Card = ({ title, children, p = 4 }: CardProps) => (
  <Box bg="white" boxShadow="md" borderRadius="lg" p={p} mb={4}>
    {title && <Heading size="md" mb={3} color="gray.800">{title}</Heading>}
    {children}
  </Box>
);

export default Card; 