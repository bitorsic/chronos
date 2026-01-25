import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Chronos</span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Jobs
              </Link>
              <Link
                to="/executions"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Executions
              </Link>
              <Link
                to="/prices"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Prices
              </Link>
              <Link
                to="/emails"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Emails
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/reports"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Reports
                  </Link>
                  <Link
                    to="/admin/users"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Users
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-700">
                <p className="font-medium">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
