import type { Job } from './job';
import type { Execution } from './execution';
import type { PriceHistory } from './price';
import type { EmailHistory } from './email';

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Backend pagination info
export interface Pagination {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

// Paginated response (matches backend structure)
// Backend returns { jobs: [...], pagination: {...} } or { executions: [...], pagination: {...} }
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Job API responses
export interface JobListResponse extends PaginatedResponse<Job> {}

export interface JobExecutionsResponse extends PaginatedResponse<Execution> {}

export interface JobPricesResponse extends PriceHistory {}

export interface JobEmailsResponse extends EmailHistory {}

// Admin Reports
export interface AdminJobStats {
  totalJobs: number;
  jobsByType: {
    emailReminder: number;
    emailPrices: number;
    storePrices: number;
  };
}

export interface AdminEmailStats {
  totalEmails: number;
  successful: number;
  failed: number;
  successRate: string;
}

export interface AdminPriceStats {
  totalFetches: number;
  successful: number;
  failed: number;
  successRate: string;
  uniqueSymbols: number;
}
