import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import { historyService } from '../services/historyService';
import type { Price } from '../types/price';

export default function Prices() {
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get('jobId');
  
  const [prices, setPrices] = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [stockSymbolFilter, setStockSymbolFilter] = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');

  useEffect(() => {
    loadPrices();
  }, [currentPage, appliedFilter, jobIdParam]);

  const loadPrices = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(appliedFilter && { stockSymbol: appliedFilter }),
      };

      const response = jobIdParam
        ? await historyService.getJobPrices(jobIdParam, params)
        : await historyService.getPrices(params);

      setPrices(response.prices);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error: any) {
      toast.error('Failed to load prices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setAppliedFilter(stockSymbolFilter);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setStockSymbolFilter('');
    setAppliedFilter('');
    setCurrentPage(1);
  };

  // Get unique stock symbols from current page
  const uniqueSymbols = [...new Set(prices.map((p) => p.stockSymbol))];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Price History</h1>
          <p className="text-gray-600 mt-1">
            {jobIdParam ? 'Prices stored by this job' : 'All stored stock prices'}
          </p>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Filter by Stock Symbol"
              placeholder="e.g., AAPL"
              value={stockSymbolFilter}
              onChange={(e) => setStockSymbolFilter(e.target.value.toUpperCase())}
            />
            <div className="sm:col-span-2 flex items-end space-x-2">
              <Button variant="primary" onClick={handleApplyFilter}>
                Apply Filter
              </Button>
              <Button variant="secondary" onClick={handleClearFilter}>
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prices</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Symbols</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{uniqueSymbols.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Page</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {prices.length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Prices List */}
        <Card>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {prices.length} of {total} prices
            </p>
            {appliedFilter && (
              <Badge variant="info">Filtered by: {appliedFilter}</Badge>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : prices.length === 0 ? (
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No prices found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Prices will appear here once STORE_PRICES jobs execute.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Stock Symbol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Currency
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Stored At
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {prices.map((price) => (
                      <tr key={price._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <Badge variant="info">{price.stockSymbol}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {price.price.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{price.currency}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {format(new Date(price.timestamp), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {format(new Date(price.createdAt), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-4 text-right space-x-3">
                          <Link
                            to={`/jobs/${price.jobId}`}
                            className="text-primary hover:text-primary-hover text-sm font-medium"
                          >
                            View Job
                          </Link>
                          <Link
                            to={`/executions/${price.executionId}`}
                            className="text-primary hover:text-primary-hover text-sm font-medium"
                          >
                            View Execution
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

        {/* Stock Symbols Overview */}
        {uniqueSymbols.length > 0 && (
          <Card title="Stock Symbols on This Page">
            <div className="flex flex-wrap gap-2">
              {uniqueSymbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => {
                    setStockSymbolFilter(symbol);
                    setAppliedFilter(symbol);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
