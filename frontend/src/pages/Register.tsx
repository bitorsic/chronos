import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Chronos</h1>
          <p className="text-gray-600">Job Scheduling Platform</p>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Registration</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <svg
                className="h-6 w-6 text-blue-600 mr-3 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Admin Registration Required
                </h3>
                <p className="text-sm text-blue-700">
                  User accounts must be created by system administrators. Please
                  contact your administrator to get access to the platform.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                Sign in here
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
