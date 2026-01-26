import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Select from '../components/Select';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import { jobService } from '../services/jobService';
import type { Execution } from '../types/execution';
import { ExecutionStatus } from '../types/execution';

export default function Executions() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadExecutions();
  }, [currentPage, statusFilter]);

  const loadExecutions = async () => {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * limit;
      const response = await jobService.getExecutions({
        limit,
        skip,
        executionStatus: statusFilter || undefined,
      });
      setExecutions(response.data);
      const { pagination } = response;
      setTotal(pagination.total);
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to load executions'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Execution History</h1>
          <p className="text-gray-600 mt-1">View all job execution logs</p>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Status"
              options={[
                { value: '', label: 'All Statuses' },
                { value: ExecutionStatus.SUCCESS, label: 'Success' },
                { value: ExecutionStatus.FAILED, label: 'Failed' },
              ]}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
            />
            <div className="sm:col-span-2 flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </Card>

        {/* Executions List */}
        <Card>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {executions.length} of {total} executions
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No executions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Executions will appear here once your jobs start running.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Job Type
                      </th>
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
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {executions.map((execution) => (
                      <tr key={execution._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {typeof execution.jobId === 'object' && execution.jobId && 'jobType' in execution.jobId
                                  ? (execution.jobId.jobType as string).replace(/([A-Z])/g, ' $1').trim()
                                  : 'N/A'}
                              </p>
                              <Link
                                to={`/jobs/${typeof execution.jobId === 'string' ? execution.jobId : (execution.jobId && (execution.jobId as any)._id) || ''}`}
                                className="text-xs text-primary hover:text-primary-hover"
                              >
                                View Job
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={execution.executionStatus === 'success' ? 'success' : 'error'}>
                            {execution.executionStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {format(new Date(execution.createdAt), 'MMM d, yyyy HH:mm:ss')}
                        </td>
                        <td className="px-4 py-4">
                          {execution.error ? (
                            <p className="text-sm text-error truncate max-w-xs" title={execution.error}>
                              {execution.error}
                            </p>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            to={`/executions/${execution._id}`}
                            className="text-primary hover:text-primary-hover text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > limit && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(total / limit)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {total > 0
                    ? Math.round(
                        (executions.filter((e) => e.executionStatus === 'success').length / executions.length) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
