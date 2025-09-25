import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  VStack,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  useColorModeValue,
  Container,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Image,
} from '@chakra-ui/react';
import { FiMenu, FiUser, FiLogOut, FiSettings, FiHelpCircle, FiChevronDown } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import KairosAILogo from '../assets/KairosAI_logo.png';

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isLogoutModalOpen, onOpen: onLogoutModalOpen, onClose: onLogoutModalClose } = useDisclosure();
  const { isAuthenticated, user, logout } = useAuth();

  // Transform user data to match NavigationBar interface
  const navigationUser = user ? {
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    avatar: undefined, // You can add avatar support later
  } : undefined;
  
  // Color mode values
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Navigation items
  const publicNavItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
  ];

  const authenticatedNavItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Arbitrage', path: '/arbitrage' },
    { label: 'Contact', path: '/contact' },
    { label: 'Support', path: '/help' },
  ];

  const isActiveRoute = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Close mobile menu
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogout = () => {
    onLogoutModalOpen();
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    onLogoutModalClose();
  };

  return (
    <Box
      as="nav"
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Container maxW="100%" px={4}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <Flex alignItems="center" cursor="pointer" onClick={() => handleNavigation('/')}>
            <HStack spacing={3} align="center">
              <Image 
                src={KairosAILogo} 
                alt="KairosAI Logo" 
                h="40px" 
                w="auto"
                objectFit="contain"
              />
              <Text
                fontSize="xl"
                fontWeight="bold"
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                bgClip="text"
                color="transparent"
              >
                KairosAI
              </Text>
            </HStack>
          </Flex>

          {/* Desktop Navigation */}
          <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
            {/* Navigation Items - Different for authenticated vs public */}
            {(isAuthenticated ? authenticatedNavItems : publicNavItems).map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                color={isActiveRoute(item.path) ? 'purple.600' : textColor}
                fontWeight={isActiveRoute(item.path) ? 'semibold' : 'normal'}
                _hover={{ bg: hoverBg }}
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </HStack>

          {/* Desktop Auth Section */}
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            {isAuthenticated ? (
              // User Menu
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  rightIcon={<FiChevronDown />}
                  leftIcon={<Avatar size="sm" name={navigationUser?.name} src={navigationUser?.avatar} />}
                  _hover={{ bg: hoverBg }}
                >
                  <VStack spacing={0} align="start">
                    <Text fontSize="sm" fontWeight="semibold">{navigationUser?.name}</Text>
                    <Text fontSize="xs" color="gray.500">{navigationUser?.email}</Text>
                  </VStack>
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FiUser />} onClick={() => handleNavigation('/profile')}>
                    Profile
                  </MenuItem>
                  <MenuItem icon={<FiSettings />} onClick={() => handleNavigation('/settings')}>
                    Settings
                  </MenuItem>
                  <MenuItem icon={<FiHelpCircle />} onClick={() => handleNavigation('/help')}>
                    Help & Support
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<FiLogOut />} onClick={handleLogout} color="red.500">
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              // Auth Buttons
              <>
                <Button
                  variant="ghost"
                  color={textColor}
                  _hover={{ bg: hoverBg }}
                  onClick={handleLogin}
                >
                  Login
                </Button>
                <Button
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  _hover={{
                    bg: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: 'md',
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  onClick={handleRegister}
                >
                  Get Started
                </Button>
              </>
            )}
          </HStack>

          {/* Mobile menu button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            variant="ghost"
            aria-label="Open menu"
            icon={<FiMenu />}
          />
        </Flex>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <HStack spacing={3} align="center">
              <Image 
                src={KairosAILogo} 
                alt="KairosAI Logo" 
                h="32px" 
                w="auto"
                objectFit="contain"
              />
              <Text
                fontSize="xl"
                fontWeight="bold"
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                bgClip="text"
                color="transparent"
              >
                KairosAI
              </Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {/* Navigation Items - Different for authenticated vs public */}
              {(isAuthenticated ? authenticatedNavItems : publicNavItems).map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  justifyContent="flex-start"
                  color={isActiveRoute(item.path) ? 'purple.600' : textColor}
                  fontWeight={isActiveRoute(item.path) ? 'semibold' : 'normal'}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </Button>
              ))}

              {/* Mobile Auth Section */}
              <Box borderTop="1px" borderColor={borderColor} pt={4}>
                {isAuthenticated ? (
                  <VStack spacing={3} align="stretch">
                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="md">
                      <Avatar name={navigationUser?.name} src={navigationUser?.avatar} />
                      <Text fontSize="sm" fontWeight="semibold">{navigationUser?.name}</Text>
                      <Text fontSize="xs" color="gray.500">{navigationUser?.email}</Text>
                    </VStack>
                    
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<FiUser />}
                      onClick={() => handleNavigation('/profile')}
                    >
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<FiSettings />}
                      onClick={() => handleNavigation('/settings')}
                    >
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<FiHelpCircle />}
                      onClick={() => handleNavigation('/help')}
                    >
                      Help & Support
                    </Button>
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={<FiLogOut />}
                      color="red.500"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={3} align="stretch">
                    <Button
                      variant="outline"
                      onClick={handleLogin}
                    >
                      Login
                    </Button>
                    <Button
                      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      color="white"
                      _hover={{
                        bg: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      }}
                      onClick={handleRegister}
                    >
                      Get Started
                    </Button>
                  </VStack>
                )}
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isLogoutModalOpen} onClose={onLogoutModalClose} isCentered>
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>Confirm Logout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="gray.600">
              Are you sure you want to log out? You'll need to sign in again to access your dashboard and analysis reports.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onLogoutModalClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmLogout}>
              Log Out
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default NavigationBar;
