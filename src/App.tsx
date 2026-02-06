import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginForm from './features/auth/components/loginForm';
import './App.css';
import { ColiList, ColiCreate } from './features/coli';
import { useAuthContext } from './context';
import { DashboardLayout } from './components/layout';
import type { ReactNode } from 'react';

// Protected Route wrapper - redirects to login if not authenticated
function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

// Public Route wrapper - redirects to dashboard if already authenticated
function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Dashboard Home Page
function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome to Smart Delivery management system</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Colis</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-box text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">En Transit</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-truck-fast text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Livrés</p>
              <p className="text-2xl font-bold text-green-600 mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-circle-check text-green-600 text-xl"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">En Attente</p>
              <p className="text-2xl font-bold text-red-600 mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-triangle-exclamation text-red-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder pages for different sections
function PlaceholderPage({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <i className={`${icon} text-blue-600`}></i>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500">Cette page sera bientôt disponible</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <i className={`${icon} text-6xl text-slate-300 mb-4`}></i>
        <p className="text-slate-500">Contenu de la page {title} en cours de développement</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } />

        {/* Protected Routes with Sidebar Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          
          {/* GESTIONNAIRE routes */}
          <Route path="colis" element={<ColiList />} />
          <Route path="colis/new" element={<ColiCreate />} />
          <Route path="clients" element={<PlaceholderPage title="Clients" icon="fa-solid fa-users" />} />
          <Route path="livreurs" element={<PlaceholderPage title="Livreurs" icon="fa-solid fa-truck" />} />
          <Route path="zones" element={<PlaceholderPage title="Zones" icon="fa-solid fa-map-location-dot" />} />
          <Route path="produits" element={<PlaceholderPage title="Produits" icon="fa-solid fa-cubes" />} />
          <Route path="parametres" element={<PlaceholderPage title="Paramètres" icon="fa-solid fa-gear" />} />
          
          {/* LIVREUR routes */}
          <Route path="mes-livraisons" element={<PlaceholderPage title="Mes Livraisons" icon="fa-solid fa-truck-fast" />} />
          <Route path="colis-assignes" element={<PlaceholderPage title="Colis Assignés" icon="fa-solid fa-box" />} />
          <Route path="historique" element={<PlaceholderPage title="Historique" icon="fa-solid fa-clock-rotate-left" />} />
          
          {/* EXPEDITEUR / CLIENT routes */}
          <Route path="mes-colis" element={<ColiList />} />
          <Route path="nouveau-colis" element={<ColiCreate />} />
          <Route path="suivi" element={<PlaceholderPage title="Suivi" icon="fa-solid fa-location-dot" />} />
          
          {/* Legacy routes - redirect to new paths */}
          <Route path="packages" element={<ColiList />} />
          <Route path="packages/new" element={<ColiCreate />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
