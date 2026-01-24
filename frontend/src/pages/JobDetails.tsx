import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { jobService } from '../services/jobService';
import type { Job } from '../types/job';
import type { Execution } from '../types/execution';

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
    }
  }, [jobId]);

  const loadJobDetails = async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    try {
      const [jobData, executionsData] = await Promise.all([
        jobService.getJob(jobId),
        jobService.getJobExecutions(jobId, { page: 1, limit: 10 }),
      ]);
      setJob(jobData);
      setExecutions(executionsData.data);
    } catch (error: any) {
      toast.error('Failed to load job details');
      navigate('/jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!jobId) return;
    
    setIsDeleting(true);
    try {
      await jobService.deleteJob(jobId);
      toast.success('Job deleted successfully');
      navigate('/jobs');
    } catch (error: any) {
      toast.error('Failed to delete job');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
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

  if (!job) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Job not found</h2>
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
              <h1 className="text-3xl font-bold text-gray-900">
                {job.jobType.replace(/_/g, ' ')}
              </h1>
              <Badge
                variant={
                  job.status === 'ACTIVE'
                    ? 'success'
                    : job.status === 'FAILED'
                    ? 'error'
                    : 'default'
                }
              >
                {job.status}
              </Badge>
            </div>
            {job.data.subject && (
              <p className="text-gray-600 mt-2">{job.data.subject}</p>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => navigate('/jobs')}>
              Back to Jobs
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete Job
            </Button>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Job Information">
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Job Type</dt>
                <dd className="text-sm text-gray-900 mt-1">{job.jobType.replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Schedule Type</dt>
                <dd className="text-sm text-gray-900 mt-1">{job.schedule.scheduleType}</dd>
              </div>
              {job.schedule.cronExpression && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cron Expression</dt>
                  <dd className="text-sm text-gray-900 mt-1 font-mono bg-gray-100 px-2 py-1 rounded">
                    {job.schedule.cronExpression}
                  </dd>
                </div>
              )}
              {job.schedule.scheduledAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Scheduled At</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {format(new Date(job.schedule.scheduledAt), 'MMM d, yyyy HH:mm')}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900 mt-1">{job.status}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {format(new Date(job.createdAt), 'MMM d, yyyy HH:mm')}
                </dd>
              </div>
              {job.nextRunAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Next Run At</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {format(new Date(job.nextRunAt), 'MMM d, yyyy HH:mm')}
                  </dd>
                </div>
              )}
              {job.lastRunAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Run At</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {format(new Date(job.lastRunAt), 'MMM d, yyyy HH:mm')}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Job Data">
            {job.data.body && (
              <div className="mb-4">
                <dt className="text-sm font-medium text-gray-500">Message</dt>
                <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                  {job.data.body}
                </dd>
              </div>
            )}
            {job.data.symbols && job.data.symbols.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-2">Stock Symbols</dt>
                <div className="flex flex-wrap gap-2">
                  {job.data.symbols.map((symbol: string) => (
                    <Badge key={symbol} variant="info">
                      {symbol}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {job.data.symbol && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Stock Symbol</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  <Badge variant="info">{job.data.symbol}</Badge>
                </dd>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Executions */}
        <Card title="Recent Executions">
          {executions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No executions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Executed At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Error
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {executions.map((execution) => (
                    <tr key={execution._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Badge variant={execution.status === 'SUCCESS' ? 'success' : 'error'}>
                          {execution.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(execution.executedAt), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3 text-sm text-error">
                        {execution.error || '-'}
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
              <Link
                to={`/executions?jobId=${jobId}`}
                className="text-primary hover:text-primary-hover text-sm font-medium"
              >
                View all executions →
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to={`/jobs/${jobId}/prices`}>
              <Button variant="secondary" className="w-full">
                View Price History
              </Button>
            </Link>
            <Link to={`/jobs/${jobId}/emails`}>
              <Button variant="secondary" className="w-full">
                View Email History
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Job"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this job? This action cannot be undone and will
            also remove all associated executions, emails, and price data.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
