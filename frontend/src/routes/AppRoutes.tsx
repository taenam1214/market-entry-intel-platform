import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../features/landing/LandingPage';
import CompetitiveLandscapePage from '../features/competitive/CompetitiveLandscapePage';
import SegmentArbitragePage from '../features/arbitrage/SegmentArbitragePage';
import ExecutiveDashboardPage from '../features/dashboard/ExecutiveDashboardPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/dashboard" element={<ExecutiveDashboardPage />} />
    <Route path="/competitive" element={<CompetitiveLandscapePage />} />
    <Route path="/arbitrage" element={<SegmentArbitragePage />} />
  </Routes>
);

export default AppRoutes; 