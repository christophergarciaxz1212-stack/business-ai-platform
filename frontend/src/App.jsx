import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import Customers from './pages/Customers';
import AiAgent from './pages/AiAgent';
import AiModels from './pages/AiModels';
import WhatsApp from './pages/WhatsApp';
import Knowledge from './pages/Knowledge';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Help from './pages/Help';

function Protected({ children }) {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
      <Route path="/" element={<Protected><MainLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="customers" element={<Customers />} />
        <Route path="ai-agent" element={<AiAgent />} />
        <Route path="ai-models" element={<AiModels />} />
        <Route path="whatsapp" element={<WhatsApp />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}