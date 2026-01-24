import api from '../utils/api';
import type { Job, CreateJobDto, UpdateJobDto } from '../types/job';
import type { Execution } from '../types/execution';
import type { PaginatedResponse } from '../types/api';

// Backend request structures
interface EmailReminderPayload {
  to: string[];
  subject: string;
  body: string;
  schedule: {
    type: 'IMMEDIATE' | 'ONCE' | 'CRON';
    scheduledTime?: string;
    cronExpression?: string;
  };
}

interface EmailPricesPayload {
  to: string[];
  symbols: string[];
  schedule: {
    type: 'IMMEDIATE' | 'ONCE' | 'CRON';
    scheduledTime?: string;
    cronExpression?: string;
  };
}

interface StorePricesPayload {
  symbol: string;
  schedule: {
    type: 'IMMEDIATE' | 'ONCE' | 'CRON';
    scheduledTime?: string;
    cronExpression?: string;
  };
}

export const jobService = {
  // Get all jobs for the user (with pagination and filters)
  getJobs: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    jobType?: string;
  }): Promise<PaginatedResponse<Job>> => {
    const response = await api.get<PaginatedResponse<Job>>('/jobs', { params });
    return response.data;
  },

  // Get single job by ID
  getJob: async (jobId: string): Promise<Job> => {
    const response = await api.get<Job>(`/jobs/${jobId}`);
    return response.data;
  },

  // Create new job - route to correct endpoint based on type
  createJob: async (data: CreateJobDto): Promise<Job> => {
    let endpoint = '';
    let payload: EmailReminderPayload | EmailPricesPayload | StorePricesPayload;

    // Map to correct endpoint and transform payload based on job type
    if (data.jobType === 'EMAIL_REMINDER') {
      endpoint = '/jobs/email-reminder';
      payload = {
        to: data.data.to || [],
        subject: data.data.subject || '',
        body: data.data.body || '',
        schedule: {
          type: data.schedule.scheduleType,
          scheduledTime: data.schedule.scheduledAt,
          cronExpression: data.schedule.cronExpression,
        },
      };
    } else if (data.jobType === 'EMAIL_PRICES') {
      endpoint = '/jobs/email-prices';
      payload = {
        to: data.data.to || [],
        symbols: data.data.symbols || [],
        schedule: {
          type: data.schedule.scheduleType,
          scheduledTime: data.schedule.scheduledAt,
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
          scheduledTime: data.schedule.scheduledAt,
          cronExpression: data.schedule.cronExpression,
        },
      };
    }

    const response = await api.post<Job>(endpoint, payload);
    return response.data;
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
    const response = await api.get<PaginatedResponse<Execution>>(
      `/jobs/${jobId}/executions`,
      { params }
    );
    return response.data;
  },

  // Get recent executions for all jobs
  getExecutions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Execution>> => {
    const response = await api.get<PaginatedResponse<Execution>>('/jobs/executions/all', {
      params,
    });
    return response.data;
  },
};
