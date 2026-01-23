import api from '../utils/api';
import type {
  AdminJobStats,
  AdminEmailStats,
  AdminPriceStats,
} from '../types/api';

export const adminService = {
  // Get job statistics
  getJobStats: async (): Promise<AdminJobStats> => {
    const response = await api.get<AdminJobStats>('/admin/reports/jobs');
    return response.data;
  },

  // Get email statistics
  getEmailStats: async (): Promise<AdminEmailStats> => {
    const response = await api.get<AdminEmailStats>('/admin/reports/emails');
    return response.data;
  },

  // Get price statistics
  getPriceStats: async (): Promise<AdminPriceStats> => {
    const response = await api.get<AdminPriceStats>('/admin/reports/prices');
    return response.data;
  },
};
