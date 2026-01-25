import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// Pages
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Jobs from './pages/Jobs.tsx';
import CreateJob from './pages/CreateJob.tsx';
import JobDetails from './pages/JobDetails.tsx';
import Executions from './pages/Executions.tsx';
import ExecutionDetails from './pages/ExecutionDetails.tsx';
import Prices from './pages/Prices.tsx';
import Emails from './pages/Emails.tsx';
import AdminReports from './pages/AdminReports.tsx';
import Users from './pages/Users.tsx';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/create"
        element={
          <ProtectedRoute>
            <CreateJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:jobId"
        element={
          <ProtectedRoute>
            <JobDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/executions"
        element={
          <ProtectedRoute>
            <Executions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/executions/:executionId"
        element={
          <ProtectedRoute>
            <ExecutionDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prices"
        element={
          <ProtectedRoute>
            <Prices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emails"
        element={
          <ProtectedRoute>
            <Emails />
          </ProtectedRoute>
        }
      />

      {/* Admin only route */}
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requireAdmin>
            <AdminReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard or login */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />

      {/* 404 - Not found */}
      <Route 
        path="*" 
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600">Page not found</p>
            </div>
          </div>
        } 
      />
    </Routes>
  );
}

export default App;

