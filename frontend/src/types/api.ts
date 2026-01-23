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

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Job API responses
export interface JobListResponse extends PaginatedResponse<Job> {}

export interface JobExecutionsResponse extends PaginatedResponse<Execution> {}

export interface JobPricesResponse extends PriceHistory {}

export interface JobEmailsResponse extends EmailHistory {}

// Admin Reports
export interface AdminJobStats {
  totalJobs: number;
  activeJobs: number;
  pausedJobs: number;
  completedJobs: number;
  failedJobs: number;
  jobsByType: {
    EMAIL_REMINDER: number;
    EMAIL_PRICES: number;
    STORE_PRICES: number;
  };
}

export interface AdminEmailStats {
  totalEmails: number;
  emailsSentToday: number;
  emailsSentThisWeek: number;
  emailsSentThisMonth: number;
}

export interface AdminPriceStats {
  totalPrices: number;
  pricesStoredToday: number;
  pricesStoredThisWeek: number;
  pricesStoredThisMonth: number;
  uniqueStockSymbols: number;
}
