import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; 
import Dashboard from './components/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';
import FeasibilityPage from './pages/FeasibilityPage';
import AdvisoryPage from './pages/AdvisoryPage';
import ScenariosPage from './pages/ScenariosPage';
import TaxHealthPage from './pages/TaxHealthPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="feasibility" element={<FeasibilityPage />} />
          <Route path="advisory" element={<AdvisoryPage />} />
          <Route path="scenarios" element={<ScenariosPage />} />
          <Route path="tax-health" element={<TaxHealthPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;