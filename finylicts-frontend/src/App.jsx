import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OAuthCallback from './pages/OAuthCallback';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';
import FeasibilityPage from './pages/FeasibilityPage';
import AdvisoryPage from './pages/AdvisoryPage';
import ScenariosPage from './pages/ScenariosPage';
import TaxHealthPage from './pages/TaxHealthPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import './App.css';

const AnalysisPage = () => <div className="content-area"><h1>Analysis Page</h1><p>Coming soon...</p></div>;
const ToolsPage    = () => <div className="content-area"><h1>Tools Page</h1><p>Coming soon...</p></div>;
const ReportsPage  = () => <div className="content-area"><h1>Reports Page</h1><p>Coming soon...</p></div>;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback"   element={<OAuthCallback />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"             element={<Dashboard />} />
              <Route path="profile"               element={<ProfilePage />} />
              <Route path="transactions"          element={<TransactionsPage />} />
              <Route path="budgets"               element={<BudgetsPage />} />
              <Route path="goals"                 element={<GoalsPage />} />
              <Route path="goals/:id/feasibility" element={<FeasibilityPage />} />
              <Route path="goals/:id/advisory"    element={<AdvisoryPage />} />
              <Route path="analysis"              element={<AnalysisPage />} />
              <Route path="tools"                 element={<ToolsPage />} />
              <Route path="reports"               element={<ReportsPage />} />
              <Route path="scenarios"             element={<ScenariosPage />} />
              <Route path="tax-health"            element={<TaxHealthPage />} />
              <Route path="settings"              element={<SettingsPage />} />
              <Route path="notifications"         element={<NotificationsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;