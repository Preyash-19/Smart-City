import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ActivateAccount from './pages/auth/ActivateAccount';
import ProtectedRoute from './components/ProtectedRoute';
import PwaUpdatePrompt from './components/PwaUpdatePrompt';

// Public Pages
import IntroductionPage from './pages/IntroductionPage';

// Role Portal Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportPage from './pages/citizen/ReportPage';
import HistoryPage from './pages/citizen/HistoryPage';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full flex flex-col items-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-0 sm:p-4 transition-colors duration-200">
        <PwaUpdatePrompt />
        <Routes>
          {/* Public Introduction / Landing Route */}
          <Route path="/" element={<IntroductionPage />} />
          
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/citizen" element={<Login />} />
          <Route path="/login/officer" element={<Login />} />
          <Route path="/login/city-admin" element={<Login />} />
          <Route path="/activate" element={<ActivateAccount />} />
          
          {/* Citizen Portal Routes (Protected) */}
          <Route 
            path="/citizen" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <CitizenDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/report" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <ReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/history" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <HistoryPage />
              </ProtectedRoute>
            } 
          />

          {/* Dedicated Officer Route (Protected) */}
          <Route 
            path="/officer" 
            element={
              <ProtectedRoute allowedRoles={['OFFICER']}>
                <OfficerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Dedicated Admin Route (Protected) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Legacy Fallback Routes */}
          <Route path="/report" element={<Navigate to="/citizen/report" replace />} />
          <Route path="/history" element={<Navigate to="/citizen/history" replace />} />
          <Route path="/dashboard" element={<Navigate to="/officer" replace />} />

          {/* Catch-all Wildcard */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;