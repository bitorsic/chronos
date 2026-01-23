import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { historyService } from '../services/historyService';
import type { Email } from '../types/email';

export default function Emails() {
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get('jobId');

  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    loadEmails();
  }, [currentPage, jobIdParam]);

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
      };

      const response = jobIdParam
        ? await historyService.getJobEmails(jobIdParam, params)
        : await historyService.getEmails(params);

      setEmails(response.emails);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error: any) {
      toast.error('Failed to load emails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEmail = (email: Email) => {
    setSelectedEmail(email);
    setShowEmailModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email History</h1>
          <p className="text-gray-600 mt-1">
            {jobIdParam ? 'Emails sent by this job' : 'All sent emails'}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Page</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{emails.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Emails List */}
        <Card>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {emails.length} of {total} emails
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : emails.length === 0 ? (
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No emails found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Emails will appear here once EMAIL_REMINDER or EMAIL_PRICES jobs execute.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Recipient
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Sent At
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {emails.map((email) => (
                      <tr key={email._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {email.subject}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="info">{email.to}</Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {format(new Date(email.sentAt), 'MMM d, yyyy HH:mm:ss')}
                        </td>
                        <td className="px-4 py-4 text-right space-x-3">
                          <button
                            onClick={() => handleViewEmail(email)}
                            className="text-primary hover:text-primary-hover text-sm font-medium"
                          >
                            View
                          </button>
                          <Link
                            to={`/jobs/${email.jobId}`}
                            className="text-primary hover:text-primary-hover text-sm font-medium"
                          >
                            Job
                          </Link>
                          <Link
                            to={`/executions/${email.executionId}`}
                            className="text-primary hover:text-primary-hover text-sm font-medium"
                          >
                            Execution
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

      {/* Email Preview Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Email Details"
        size="lg"
      >
        {selectedEmail && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <p className="text-sm text-gray-900">{selectedEmail.subject}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
              <p className="text-sm text-gray-900">{selectedEmail.to}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sent At</label>
              <p className="text-sm text-gray-900">
                {format(new Date(selectedEmail.sentAt), 'MMMM d, yyyy HH:mm:ss')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
              <div
                className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-200"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
              />
            </div>

            <div className="flex space-x-3">
              <Link to={`/jobs/${selectedEmail.jobId}`} className="flex-1">
                <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                  View Related Job
                </button>
              </Link>
              <Link to={`/executions/${selectedEmail.executionId}`} className="flex-1">
                <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                  View Execution
                </button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
