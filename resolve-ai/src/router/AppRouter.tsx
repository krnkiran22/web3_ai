import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DisputePage from '../components/DisputePage';
import ResolutionPage from '../pages/ResolutionPage';
import { ChatPage } from '../pages/ChatPage';
import DashboardPage from '../pages/DashboardPage';
import HelpPage from '../pages/HelpPage';

const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/disputes" replace />} />
      <Route path="/disputes" element={<DisputePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/resolution/:id" element={<ResolutionPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/help" element={<HelpPage />} />
    </Routes>
  </Router>
);

export default AppRouter;
