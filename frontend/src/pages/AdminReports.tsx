import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { adminService } from '../services/adminService';
import type { AdminJobStats, AdminEmailStats, AdminPriceStats } from '../types/api';

export default function AdminReports() {
  const [jobStats, setJobStats] = useState<AdminJobStats | null>(null);
  const [emailStats, setEmailStats] = useState<AdminEmailStats | null>(null);
  const [priceStats, setPriceStats] = useState<AdminPriceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
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
      toast.error('Failed to load admin reports');
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

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Reports</h1>
            <p className="text-gray-600 mt-1">System-wide statistics and insights</p>
          </div>
          <Button variant="secondary" onClick={loadReports}>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </span>
          </Button>
        </div>

        {/* Job Statistics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">
                    {jobStats?.totalJobs || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-4 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">All scheduled jobs across all users</p>
            </Card>
          </div>
        </div>

        {/* Jobs by Type */}
        <Card title="Jobs by Type">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-blue-900">Email Reminder</h3>
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {jobStats?.jobsByType.emailReminder || 0}
              </p>
              <p className="text-sm text-blue-700 mt-2">Custom reminders</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-green-900">Email Prices</h3>
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-green-900">
                {jobStats?.jobsByType.emailPrices || 0}
              </p>
              <p className="text-sm text-green-700 mt-2">Stock alerts via email</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-purple-900">Store Prices</h3>
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {jobStats?.jobsByType.storePrices || 0}
              </p>
              <p className="text-sm text-purple-700 mt-2">Historical data collection</p>
            </div>
          </div>
        </Card>

        {/* Email Statistics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {emailStats?.totalEmails || 0}
                </p>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {emailStats?.successful || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Delivered successfully</p>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-4xl font-bold text-red-600 mt-2">
                  {emailStats?.failed || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Delivery failures</p>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {emailStats?.successRate || '0%'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Overall rate</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Price Statistics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Price Fetch Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fetches</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {priceStats?.totalFetches || 0}
                </p>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {priceStats?.successful || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Fetched successfully</p>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-4xl font-bold text-red-600 mt-2">
                  {priceStats?.failed || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Fetch failures</p>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {priceStats?.successRate || '0%'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Overall rate</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Unique Stocks */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Unique Stock Symbols Tracked</h3>
              <p className="text-sm text-gray-600 mt-1">Different stocks being monitored</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-indigo-600">
                {priceStats?.uniqueSymbols || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Symbols</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/jobs">
              <Button variant="primary" className="w-full">
                View All Jobs
              </Button>
            </Link>
            <Link to="/executions">
              <Button variant="secondary" className="w-full">
                View All Executions
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
