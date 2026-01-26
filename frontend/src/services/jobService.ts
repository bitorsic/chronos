import api from '../utils/api';
import type { Job, CreateJobDto, UpdateJobDto } from '../types/job';
import type { Execution } from '../types/execution';
import type { PaginatedResponse, Pagination } from '../types/api';

// Backend response types (what the API actually returns)
interface JobsResponse {
  jobs: Job[];
  pagination: Pagination;
}

interface ExecutionsResponse {
  executions: Execution[];
  pagination: Pagination;
}

// Backend request structures
interface EmailReminderPayload {
  // Backend expects a single recipient (string). If the frontend provides an array,
  // we'll take the first element.
  to: string;
  subject: string;
  body: string;
  schedule: {
    type: 'immediate' | 'once' | 'cron';
    timestamp?: string;
    cronExpression?: string;
  };
}

interface EmailPricesPayload {
  // Single recipient supported by backend
  to: string;
  symbols: string[];
  schedule: {
    type: 'immediate' | 'once' | 'cron';
    timestamp?: string;
    cronExpression?: string;
  };
}

interface StorePricesPayload {
  symbol: string;
  schedule: {
    type: 'immediate' | 'once' | 'cron';
    timestamp?: string;
    cronExpression?: string;
  };
}

export const jobService = {
  // Get all jobs for the user (with pagination and filters)
  getJobs: async (params?: {
    limit?: number;
    skip?: number;
    jobType?: string;
  }): Promise<PaginatedResponse<Job>> => {
    const response = await api.get<JobsResponse>('/jobs', { params });
    // Transform backend response to match PaginatedResponse type
    return {
      data: response.data.jobs,
      pagination: response.data.pagination,
    };
  },

  // Get single job by ID
  getJob: async (jobId: string): Promise<Job> => {
    // Backend returns { job } so return the nested job object
    const response = await api.get<{ job: Job }>(`/jobs/${jobId}`);
    return response.data.job;
  },

  // Create new job - route to correct endpoint based on type
  createJob: async (data: CreateJobDto): Promise<Job> => {
    let endpoint = '';
    let payload: EmailReminderPayload | EmailPricesPayload | StorePricesPayload;

    // Map to correct endpoint and transform payload based on job type
    if (data.jobType === 'emailReminder') {
      endpoint = '/jobs/email-reminder';
      // Backend supports only one recipient; prefer first element if array provided
      const recipient = typeof data.data.to === 'string' ? data.data.to : Array.isArray(data.data.to) ? data.data.to[0] || '' : '';
      payload = {
        to: recipient,
        subject: data.data.subject || '',
        body: data.data.body || '',
        schedule: {
          type: data.schedule.scheduleType,
          timestamp: data.schedule.scheduledAt,
          cronExpression: data.schedule.cronExpression,
        },
      };
    } else if (data.jobType === 'emailPrices') {
      endpoint = '/jobs/email-prices';
      const recipient = typeof data.data.to === 'string' ? data.data.to : Array.isArray(data.data.to) ? data.data.to[0] || '' : '';
      payload = {
        to: recipient,
        symbols: data.data.symbols || [],
        schedule: {
          type: data.schedule.scheduleType,
          timestamp: data.schedule.scheduledAt,
          cronExpression: data.schedule.cronExpression,
        },
      };
    } else {
      // STORE_PRICES
      endpoint = '/jobs/store-prices';
      payload = {
        symbol: data.data.symbol || '',
        schedule: {
          type: data.schedule.scheduleType,
          timestamp: data.schedule.scheduledAt,
          cronExpression: data.schedule.cronExpression,
        },
      };
    }

    // Backend returns { message, job }
    const response = await api.post<{ message: string; job: Job }>(endpoint, payload);
    return response.data.job;
  },

  // Update job
  updateJob: async (jobId: string, data: UpdateJobDto): Promise<Job> => {
    const response = await api.put<Job>(`/jobs/${jobId}`, data);
    return response.data;
  },

  // Delete job
  deleteJob: async (jobId: string): Promise<void> => {
    await api.delete(`/jobs/${jobId}`);
  },

  // Get job executions
  getJobExecutions: async (
    jobId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Execution>> => {
    const response = await api.get<ExecutionsResponse>('/jobs/executions/all', {
      params: { ...params, jobId },
    });
    // Transform backend response to match PaginatedResponse type
    return {
      data: response.data.executions,
      pagination: response.data.pagination,
    };
  },

  // Get recent executions for all jobs
  getExecutions: async (params?: {
    limit?: number;
    skip?: number;
    jobId?: string;
    executionStatus?: string;
    type?: string;
  }): Promise<PaginatedResponse<Execution>> => {
    const response = await api.get<ExecutionsResponse>('/jobs/executions/all', {
      params,
    });
    // Transform backend response to match PaginatedResponse type
    return {
      data: response.data.executions,
      pagination: response.data.pagination,
    };
  },
};
