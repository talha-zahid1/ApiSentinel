import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { ApiTester } from './pages/ApiTester';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <ApiKeyProvider>
            <Routes>
              {/* Public Authentications */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Application Workspace */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="tester" element={<ApiTester />} />
              </Route>

              {/* Catch-all Routing Redirection */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ApiKeyProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
