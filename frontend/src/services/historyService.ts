import api from '../utils/api';
import type { PriceHistory } from '../types/price';
import type { EmailHistory } from '../types/email';

export const historyService = {
  // Get all prices for user
  getPrices: async (params?: {
    page?: number;
    limit?: number;
    stockSymbol?: string;
  }): Promise<PriceHistory> => {
    const response = await api.get<PriceHistory>('/prices', { params });
    return response.data;
  },

  // Get prices for specific job
  getJobPrices: async (
    jobId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PriceHistory> => {
    const response = await api.get<PriceHistory>(`/jobs/${jobId}/prices`, { params });
    return response.data;
  },

  // Get all emails for user
  getEmails: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<EmailHistory> => {
    const response = await api.get<EmailHistory>('/emails', { params });
    return response.data;
  },

  // Get emails for specific job
  getJobEmails: async (
    jobId: string,
    params?: { page?: number; limit?: number }
  ): Promise<EmailHistory> => {
    const response = await api.get<EmailHistory>(`/jobs/${jobId}/emails`, { params });
    return response.data;
  },
};
