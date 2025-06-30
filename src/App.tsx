import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthRoute } from './components/auth/AuthRoute';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { RentersPage } from './pages/RentersPage';
import { LeasesPage } from './pages/LeasesPage';
import { IssuesPage } from './pages/IssuesPage';
import { SettingsPage } from './pages/SettingsPage';
import { Dashboard } from './components/dashboard/Dashboard';

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          {/* Auth Route */}
          <Route 
            path="/auth" 
            element={
              <AuthRoute>
                <AuthPage />
              </AuthRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard user={null}>
                  <DashboardPage />
                </Dashboard>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/properties" 
            element={
              <ProtectedRoute>
                <Dashboard user={null}>
                  <PropertiesPage />
                </Dashboard>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/renters" 
            element={
              <ProtectedRoute>
                <Dashboard user={null}>
                  <RentersPage />
                </Dashboard>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/leases" 
            element={
              <ProtectedRoute>
                <Dashboard user={null}>
                  <LeasesPage />
                </Dashboard>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/issues" 
            element={
              <ProtectedRoute>
                <Dashboard user={null}>
                  <IssuesPage />
                </Dashboard>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Dashboard user={null}>
                  <SettingsPage />
                </Dashboard>
              </ProtectedRoute>
            } 
          />

          {/* Legacy route redirects */}
          <Route 
            path="/assets" 
            element={<Navigate to="/properties" replace />}
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/assets" replace />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;