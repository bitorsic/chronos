import api from '../utils/api';
import type { Job, CreateJobDto, UpdateJobDto } from '../types/job';
import type { Execution } from '../types/execution';
import type { PaginatedResponse } from '../types/api';

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

  // Create new job
  createJob: async (data: CreateJobDto): Promise<Job> => {
    const response = await api.post<Job>('/jobs', data);
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
    const response = await api.get<PaginatedResponse<Execution>>('/executions', {
      params,
    });
    return response.data;
  },
};
