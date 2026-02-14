import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../features/landing/LandingPage';
import SegmentArbitragePage from '../features/arbitrage/SegmentArbitragePage';
import ExecutiveDashboardPage from '../features/dashboard/ExecutiveDashboardPage';
import ChatbotPage from '../features/chatbot/ChatbotPage';
import SettingsPage from '../features/settings/SettingsPage';
import HelpSupportPage from '../features/support/HelpSupportPage';
import LoginPage from '../auth/LoginPage';
import RegisterPage from '../auth/RegisterPage';
import EmailVerificationPage from '../auth/EmailVerificationPage';
import AdminDashboardPage from '../features/admin/AdminDashboardPage';
import PricingPage from '../features/pricing/PricingPage';
import MultiMarketComparisonPage from '../features/comparison/MultiMarketComparisonPage';
import ScenarioModelingPage from '../features/scenarios/ScenarioModelingPage';
import DeepDivePage from '../features/deep-dives/DeepDivePage';
import PlaybookPage from '../features/playbook/PlaybookPage';
import ExecutionTrackerPage from '../features/execution/ExecutionTrackerPage';
import MonitoringPage from '../features/monitoring/MonitoringPage';
import CompetitorTrackingPage from '../features/competitors/CompetitorTrackingPage';
import NewsFeedPage from '../features/news/NewsFeedPage';
import SharedReportPage from '../features/shared/SharedReportPage';
import TeamPage from '../features/team/TeamPage';

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/pricing" element={<PricingPage />} />

    {/* Authentication Routes */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/verify-email" element={<EmailVerificationPage />} />

    {/* Protected Routes */}
    <Route path="/dashboard" element={<ExecutiveDashboardPage />} />
    <Route path="/arbitrage" element={<SegmentArbitragePage />} />
    <Route path="/chatbot" element={<ChatbotPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/help" element={<HelpSupportPage />} />

    {/* Advanced Analysis */}
    <Route path="/comparison" element={<MultiMarketComparisonPage />} />
    <Route path="/scenarios" element={<ScenarioModelingPage />} />
    <Route path="/deep-dives" element={<DeepDivePage />} />

    {/* Execution & Monitoring */}
    <Route path="/playbook" element={<PlaybookPage />} />
    <Route path="/execution" element={<ExecutionTrackerPage />} />
    <Route path="/monitoring" element={<MonitoringPage />} />
    <Route path="/competitors" element={<CompetitorTrackingPage />} />
    <Route path="/news" element={<NewsFeedPage />} />

    {/* Admin */}
    <Route path="/admin" element={<AdminDashboardPage />} />

    {/* Shared/Public */}
    <Route path="/shared/:token" element={<SharedReportPage />} />

    {/* Team */}
    <Route path="/team" element={<TeamPage />} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
