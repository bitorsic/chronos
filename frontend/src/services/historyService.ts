import api from '../utils/api';
import type { PriceHistory } from '../types/price';
import type { EmailHistory } from '../types/email';

export const historyService = {
  // Get all prices for user
  getPrices: async (params?: {
    limit?: number;
    skip?: number;
    symbol?: string;
  }): Promise<PriceHistory> => {
    const response = await api.get<PriceHistory>('/prices', { params });
    return response.data;
  },

  // Get prices for specific job
  getJobPrices: async (
    jobId: string,
    params?: { limit?: number; skip?: number }
  ): Promise<PriceHistory> => {
    const response = await api.get<PriceHistory>(`/jobs/${jobId}/prices`, { params });
    return response.data;
  },

  // Get all emails for user
  getEmails: async (params?: {
    limit?: number;
    skip?: number;
    emailType?: string;
    executionStatus?: string;
  }): Promise<EmailHistory> => {
    const response = await api.get<EmailHistory>('/emails', { params });
    return response.data;
  },

  // Get emails for specific job
  getJobEmails: async (
    jobId: string,
    params?: { limit?: number; skip?: number }
  ): Promise<EmailHistory> => {
    const response = await api.get<EmailHistory>(`/jobs/${jobId}/emails`, { params });
    return response.data;
  },
};
