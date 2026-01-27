import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { jobService } from '../services/jobService';
import type { Execution } from '../types/execution';
import type { Job } from '../types/job';

export default function ExecutionDetails() {
  const { executionId } = useParams<{ executionId: string }>();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<Execution | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (executionId) {
      loadExecutionDetails();
    }
  }, [executionId]);

  const loadExecutionDetails = async () => {
    if (!executionId) return;

    setIsLoading(true);
    try {
      // Note: You'll need to add a getExecution endpoint to jobService
      // For now, we'll fetch executions and find the one we need
      const executionsData = await jobService.getExecutions({ limit: 100, skip: 0 });
      const foundExecution = executionsData.data.find((e) => e._id === executionId);
      
      if (!foundExecution) {
        toast.error('Execution not found');
        navigate('/executions');
        return;
      }

      setExecution(foundExecution);

      // Load job details
      const jobData = await jobService.getJob(foundExecution.jobId._id);
      setJob(jobData);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load execution details'));
      navigate('/executions');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!execution) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Execution not found</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">Execution Details</h1>
              <Badge variant={execution.executionStatus === 'success' ? 'success' : 'error'}>
                {execution.executionStatus}
              </Badge>
            </div>
            <p className="text-gray-600 mt-2">
              {execution.jobId.jobType.replace(/([A-Z])/g, ' $1').trim()}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/executions')}>
            Back to Executions
          </Button>
        </div>

        {/* Execution Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Execution Information">
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Execution ID</dt>
                <dd className="text-sm text-gray-900 mt-1 font-mono">{execution._id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Job Type</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {execution.jobId.jobType.replace(/([A-Z])/g, ' $1').trim()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900 mt-1">{execution.executionStatus}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Executed At</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {format(new Date(execution.createdAt), 'MMMM d, yyyy HH:mm:ss')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Job ID</dt>
                <dd className="text-sm mt-1">
                  <Link
                    to={`/jobs/${execution.jobId._id}`}
                    className="text-primary hover:text-primary-hover font-mono"
                  >
                    {execution.jobId._id}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {typeof execution.userId === 'string' 
                    ? execution.userId 
                    : `${execution.userId.name} (${execution.userId.email})`}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Job Information */}
          {job && (
            <Card title="Related Job">
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Job Type</dt>
                  <dd className="text-sm text-gray-900 mt-1">{job.jobType?.replace(/_/g, ' ') || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Schedule Type</dt>
                  <dd className="text-sm text-gray-900 mt-1">{job.schedule?.scheduleType || 'N/A'}</dd>
                </div>
                {job.schedule?.cronExpression && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Cron Expression</dt>
                    <dd className="text-sm text-gray-900 mt-1 font-mono bg-gray-100 px-2 py-1 rounded">
                      {job.schedule.cronExpression}
                    </dd>
                  </div>
                )}
                {job.lastRunStatus && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Run Status</dt>
                    <dd className="mt-1">
                      <Badge variant={job.lastRunStatus === 'success' ? 'success' : 'error'}>
                        {job.lastRunStatus}
                      </Badge>
                    </dd>
                  </div>
                )}
                {job.payload?.subject && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Subject</dt>
                    <dd className="text-sm text-gray-900 mt-1">{job.payload.subject}</dd>
                  </div>
                )}
                {job.payload?.symbols && job.payload.symbols.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-2">Stock Symbols</dt>
                    <dd className="flex flex-wrap gap-2">
                      {job.payload.symbols.map((symbol: string) => (
                        <Badge key={symbol} variant="info">
                          {symbol}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                )}
                {job.payload?.symbol && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Stock Symbol</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      <Badge variant="info">{job.payload.symbol}</Badge>
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-4">
                <Link to={`/jobs/${job._id}`}>
                  <Button variant="secondary" className="w-full">
                    View Full Job Details
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Error Details (if failed) */}
        {execution.executionStatus === 'failed' && execution.error && (
          <Card title="Error Details">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Execution Failed</h4>
                  <p className="text-sm text-red-700 whitespace-pre-wrap">{execution.error}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Storage Execution Details */}
        {execution.type === 'storage' && (
          <Card title="Price Data">
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Symbol</dt>
                <dd className="mt-1">
                  <Badge variant="info">{execution.symbol}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {execution.price != null ? `$${execution.price.toFixed(2)}` : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Currency</dt>
                <dd className="text-sm text-gray-900 mt-1">{execution.currency || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fetched At</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {format(new Date(execution.fetchedAt), 'MMMM d, yyyy HH:mm:ss')}
                </dd>
              </div>
            </dl>
          </Card>
        )}

        {/* Metadata */}
        {execution.type === 'email' && execution.metadata && execution.metadata.length > 0 && (
          <Card title="Price Metadata">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {execution.metadata.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{item.symbol}</td>
                      <td className="px-4 py-2 text-sm">
                        {item.price != null ? item.price.toFixed(2) : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm">{item.currency || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to={`/jobs/${execution.jobId._id}`}>
              <Button variant="secondary" className="w-full">
                View Related Job
              </Button>
            </Link>
            <Link to="/executions">
              <Button variant="secondary" className="w-full">
                View All Executions
              </Button>
            </Link>
            {execution.jobId.jobType === 'emailPrices' && (
              <Link to={`/jobs/${execution.jobId._id}/emails`}>
                <Button variant="secondary" className="w-full">
                  View Sent Emails
                </Button>
              </Link>
            )}
            {execution.jobId.jobType === 'storePrices' && (
              <Link to={`/jobs/${execution.jobId._id}/prices`}>
                <Button variant="secondary" className="w-full">
                  View Stored Prices
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
