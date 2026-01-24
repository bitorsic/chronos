import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Select from '../components/Select';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import { jobService } from '../services/jobService';
import type { Job } from '../types/job';
import { JobType } from '../types/job';

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadJobs();
  }, [currentPage, typeFilter]);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const response = await jobService.getJobs({
        page: currentPage,
        limit: 10,
        jobType: typeFilter || undefined,
      });
      setJobs(response.data);
      const { pagination } = response;
      setTotal(pagination.total);
      setTotalPages(Math.ceil(pagination.total / pagination.limit));
    } catch (error: any) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 mt-1">Manage your scheduled jobs</p>
          </div>
          <Link to="/jobs/create">
            <Button variant="primary">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Job
              </span>
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Job Type"
              options={[
                { value: '', label: 'All Types' },
                { value: JobType.EMAIL_REMINDER, label: 'Email Reminder' },
                { value: JobType.EMAIL_PRICES, label: 'Email Prices' },
                { value: JobType.STORE_PRICES, label: 'Store Prices' },
              ]}
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                handleFilterChange();
              }}
            />
            <div className="flex items-end">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setTypeFilter('');
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Jobs List */}
        <Card>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {jobs.length} of {total} jobs
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : jobs.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new job.
              </p>
              <div className="mt-6">
                <Link to="/jobs/create">
                  <Button variant="primary">Create Job</Button>
                </Link>
              </div>
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
                        Schedule
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Run
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Next Run
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {jobs.map((job) => (
                      <tr key={job._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {job.jobType.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            {job.data.subject && (
                              <p className="text-xs text-gray-500 mt-1">{job.data.subject}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {job.schedule.scheduleType}
                          {job.schedule.cronExpression && (
                            <p className="text-xs text-gray-500 mt-1">
                              {job.schedule.cronExpression}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {job.lastRunAt ? (
                            <div>
                              <p>{format(new Date(job.lastRunAt), 'MMM d, HH:mm')}</p>
                              {job.lastRunStatus && (
                                <Badge
                                  variant={job.lastRunStatus === 'success' ? 'success' : 'error'}
                                  className="mt-1"
                                >
                                  {job.lastRunStatus}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {job.nextRunAt
                            ? format(new Date(job.nextRunAt), 'MMM d, yyyy HH:mm')
                            : '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {format(new Date(job.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
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
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
