import { ReactNode, useState } from 'react';
import { Box, Flex, VStack, Link, Heading, Icon, Text, Button, IconButton } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBarChart, FiTarget, FiTrendingUp, FiMenu, FiX } from 'react-icons/fi';

const navLinks = [
  { to: '/', label: 'Home', icon: FiHome },
  { to: '/dashboard', label: 'Executive Dashboard', icon: FiBarChart },
  { to: '/competitive', label: 'Competitive Landscape', icon: FiTarget },
  { to: '/arbitrage', label: 'Segment Arbitrage', icon: FiTrendingUp },
];

const Layout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Flex minH="100vh" w="100%" m={0} p={0}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex={20}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <Box
        as="nav"
        bg="linear-gradient(180deg, #1a202c 0%, #2d3748 100%)"
        color="white"
        w="280px"
        h="100vh"
        position="fixed"
        left={isSidebarOpen ? '0' : '-280px'}
        top="0"
        zIndex={30}
        transition="all 0.3s ease"
        overflow="hidden"
        boxShadow="xl"
        opacity={isSidebarOpen ? 1 : 0}
      >
        <VStack spacing={6} align="stretch" p={5} h="full">
          {/* Header with close button */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading as="h2" size="md" mb={1} letterSpacing="tight" fontWeight="bold">
                Market Entry Intel
              </Heading>
              <Text fontSize="xs" color="gray.400" fontWeight="medium">
                AI-Powered Market Analysis
              </Text>
            </Box>
            <IconButton
              aria-label="Close sidebar"
              icon={<FiX />}
              variant="ghost"
              color="white"
              size="sm"
              onClick={toggleSidebar}
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
            />
          </Flex>
          
          <VStack align="stretch" spacing={1}>
            {navLinks.map(link => (
              <Link
                as={NavLink}
                to={link.to}
                key={link.to}
                display="flex"
                alignItems="center"
                px={3}
                py={2}
                borderRadius="lg"
                transition="all 0.2s"
                _hover={{ 
                  bg: 'rgba(255,255,255,0.1)', 
                  transform: 'translateX(4px)',
                  textDecoration: 'none'
                }}
                _activeLink={{ 
                  bg: 'rgba(255,255,255,0.15)', 
                  fontWeight: 'bold',
                  color: 'white',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.2)'
                }}
                color="gray.300"
                fontWeight="medium"
                fontSize="sm"
                onClick={() => {
                  // Close sidebar when clicking a link
                  setIsSidebarOpen(false);
                }}
              >
                <Icon as={link.icon} mr={2} boxSize={4} />
                {link.label}
              </Link>
            ))}
          </VStack>
        </VStack>
      </Box>
      
      {/* Main Content */}
      <Box flex={1} bg="gray.50" overflow="auto" position="relative" w="100%" m={0} p={0}>
        {/* Toggle Button */}
        <IconButton
          aria-label="Toggle sidebar"
          icon={<FiMenu />}
          position="fixed"
          top={4}
          left={4}
          zIndex={40}
          bg="white"
          color="gray.800"
          boxShadow="lg"
          borderRadius="lg"
          size="sm"
          onClick={toggleSidebar}
          _hover={{ bg: 'gray.100' }}
        />
        
        {children}
      </Box>
    </Flex>
  );
};

export default Layout; 