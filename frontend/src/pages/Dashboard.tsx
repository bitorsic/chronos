import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errorHandler';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { jobService } from '../services/jobService';
import { adminService } from '../services/adminService';
import type { Job } from '../types/job';
import type { Execution } from '../types/execution';
import type { AdminJobStats, AdminEmailStats, AdminPriceStats } from '../types/api';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.username}! {isAdmin && '(Admin)'}
          </p>
        </div>

        {isAdmin ? <AdminDashboard /> : <ClientDashboard />}
      </div>
    </Layout>
  );
}

// CLIENT Dashboard - Shows their jobs and executions
function ClientDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [jobsData, executionsData] = await Promise.all([
        jobService.getJobs({ limit: 5, skip: 0 }),
        jobService.getExecutions({ limit: 5, skip: 0 }),
      ]);
      setJobs(jobsData.data || []);
      setExecutions(executionsData.data || []);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load dashboard data'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const recentSuccessful = executions.filter((e) => e.executionStatus === 'success').length;
  const recentFailed = executions.filter((e) => e.executionStatus === 'failed').length;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{jobs.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Scheduled jobs</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Executions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{executions.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{recentSuccessful} successful</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Executions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{recentFailed}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/jobs/create">
            <Button variant="primary" className="w-full">
              Create New Job
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="secondary" className="w-full">
              View All Jobs
            </Button>
          </Link>
          <Link to="/executions">
            <Button variant="secondary" className="w-full">
              View Executions
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Jobs */}
      <Card title="Recent Jobs">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No jobs yet. Create your first job!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Run</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{job.jobType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.schedule.scheduleType}</td>
                    <td className="px-4 py-3">
                      {job.lastRunStatus ? (
                        <Badge variant={job.lastRunStatus === 'success' ? 'success' : 'error'}>
                          {job.lastRunStatus}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-500">Never run</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {jobs.length > 0 && (
          <div className="mt-4 text-center">
            <Link to="/jobs" className="text-primary hover:text-primary-hover text-sm font-medium">
              View all jobs →
            </Link>
          </div>
        )}
      </Card>

      {/* Recent Executions */}
      <Card title="Recent Executions">
        {executions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No executions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Executed At</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {executions.map((execution) => (
                  <tr key={execution._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {execution.jobId.jobType.replace(/([A-Z])/g, ' $1').trim()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={execution.executionStatus === 'success' ? 'success' : 'error'}>
                        {execution.executionStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(execution.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/executions/${execution._id}`}
                        className="text-primary hover:text-primary-hover text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {executions.length > 0 && (
          <div className="mt-4 text-center">
            <Link to="/executions" className="text-primary hover:text-primary-hover text-sm font-medium">
              View all executions →
            </Link>
          </div>
        )}
      </Card>
    </>
  );
}

// ADMIN Dashboard - Shows system-wide statistics
function AdminDashboard() {
  const [jobStats, setJobStats] = useState<AdminJobStats | null>(null);
  const [emailStats, setEmailStats] = useState<AdminEmailStats | null>(null);
  const [priceStats, setPriceStats] = useState<AdminPriceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setIsLoading(true);
    try {
      const [jobs, emails, prices] = await Promise.all([
        adminService.getJobStats(),
        adminService.getEmailStats(),
        adminService.getPriceStats(),
      ]);
      setJobStats(jobs);
      setEmailStats(emails);
      setPriceStats(prices);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load admin statistics'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* System Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <p className="text-sm font-medium text-gray-600">Total Jobs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{jobStats?.totalJobs || 0}</p>
            <p className="text-xs text-gray-600 mt-3">All scheduled jobs</p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-600">Total Emails</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{emailStats?.totalEmails || 0}</p>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-600">Successful: {emailStats?.successful || 0}</p>
              <p className="text-xs text-gray-600">Failed: {emailStats?.failed || 0}</p>
              <p className="text-xs text-gray-600">Success Rate: {emailStats?.successRate || '0%'}</p>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-600">Price Fetches</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{priceStats?.totalFetches || 0}</p>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-600">Successful: {priceStats?.successful || 0}</p>
              <p className="text-xs text-gray-600">Failed: {priceStats?.failed || 0}</p>
              <p className="text-xs text-gray-600">Success Rate: {priceStats?.successRate || '0%'}</p>
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium text-gray-600">Unique Stocks</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{priceStats?.uniqueSymbols || 0}</p>
            <p className="text-xs text-gray-600 mt-3">Tracked symbols</p>
          </Card>
        </div>
      </div>

      {/* Jobs by Type */}
      <Card title="Jobs by Type">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Email Reminders</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {jobStats?.jobsByType.emailReminder || 0}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Email Prices</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {jobStats?.jobsByType.emailPrices || 0}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Store Prices</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {jobStats?.jobsByType.storePrices || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Admin Actions */}
      <Card title="Admin Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/admin/reports">
            <Button variant="primary" className="w-full">
              View Detailed Reports
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="secondary" className="w-full">
              View All Jobs
            </Button>
          </Link>
        </div>
      </Card>
    </>
  );
}
