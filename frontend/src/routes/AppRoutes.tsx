import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import LandingPage from '../features/landing/LandingPage';
import SegmentArbitragePage from '../features/arbitrage/SegmentArbitragePage';
import ExecutiveDashboardPage from '../features/dashboard/ExecutiveDashboardPage';
import ChatbotPage from '../features/chatbot/ChatbotPage';
import SettingsPage from '../features/settings/SettingsPage';
import HelpSupportPage from '../features/support/HelpSupportPage';
import LoginPage from '../auth/LoginPage';
import RegisterPage from '../auth/RegisterPage';

// Placeholder components for new routes
const AboutPage = () => (
  <Box py={16} bg="white" minH="100vh">
    <Container maxW="4xl">
      <VStack spacing={8} textAlign="center">
        <Heading size="xl">About KairosAI</Heading>
        <Text fontSize="lg" color="gray.600">
          We're building the future of market intelligence with autonomous AI agents.
        </Text>
      </VStack>
    </Container>
  </Box>
);

const PricingPage = () => (
  <Box py={16} bg="white" minH="100vh">
    <Container maxW="4xl">
      <VStack spacing={8} textAlign="center">
        <Heading size="xl">Pricing Plans</Heading>
        <Text fontSize="lg" color="gray.600">
          Choose the plan that fits your market entry needs.
        </Text>
      </VStack>
    </Container>
  </Box>
);

const ContactPage = () => (
  <Box py={16} bg="white" minH="100vh">
    <Container maxW="4xl">
      <VStack spacing={8} textAlign="center">
        <Heading size="xl">Contact Us</Heading>
        <Text fontSize="lg" color="gray.600">
          Get in touch with our team for support and inquiries.
        </Text>
      </VStack>
    </Container>
  </Box>
);

const ProfilePage = () => (
  <Box py={16} bg="white" minH="100vh">
    <Container maxW="4xl">
      <VStack spacing={8} textAlign="center">
        <Heading size="xl">User Profile</Heading>
        <Text fontSize="lg" color="gray.600">
          Manage your account settings and preferences.
        </Text>
      </VStack>
    </Container>
  </Box>
);



const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/contact" element={<ContactPage />} />
    
    {/* Authentication Routes */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    
    {/* Protected Routes */}
    <Route path="/dashboard" element={<ExecutiveDashboardPage />} />
    <Route path="/arbitrage" element={<SegmentArbitragePage />} />
    <Route path="/chatbot" element={<ChatbotPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/help" element={<HelpSupportPage />} />
    
    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes; 