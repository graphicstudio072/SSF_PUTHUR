import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <Routes>
          {/* Public Candidate Registration Route - No admin links */}
          <Route path="/" element={<RegisterPage />} />

          {/* Dedicated Protected Admin Route */}
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Fallback to Public Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;
