import type { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import NavigationBar from './NavigationBar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box minH="100vh" w="100%" bg="gray.50">
      {/* Navigation Bar */}
      <NavigationBar />
      
      {/* Main Content */}
      <Box as="main" w="100%">
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 