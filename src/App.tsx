import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Oficina/DashboardPage';
import { CrearViajePage } from './pages/Oficina/CrearViajePage';
import { MontajeDiarioPage } from './pages/Oficina/MontajeDiarioPage';
import { SeguimientoPage } from './pages/Oficina/SeguimientoPage';
import { FacturacionPage } from './pages/Oficina/FacturacionPage';
import { HistorialPage } from './pages/Oficina/HistorialPage';
import { ConductorDashboardPage } from './pages/Conductor/ConductorDashboardPage';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFound/NotFoundPage';

// Office Layout Wrapper with Header and Sidebar
const OfficeLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter basename="/gruas-app">
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Driver Route (Mobile First Interface) */}
          <Route
            path="/conductor"
            element={
              <ProtectedRoute allowedRoles={['CONDUCTOR', 'ADMIN', 'OFICINA']}>
                <ConductorDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Office Routes */}
          <Route
            path="/oficina"
            element={
              <ProtectedRoute allowedRoles={['OFICINA', 'ADMIN']}>
                <OfficeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="crear-viaje" element={<CrearViajePage />} />
            <Route path="montaje" element={<MontajeDiarioPage />} />
            <Route path="seguimiento" element={<SeguimientoPage />} />
            <Route path="facturacion" element={<FacturacionPage />} />
            <Route path="historial" element={<HistorialPage />} />
          </Route>

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <OfficeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/oficina" replace />} />

          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
