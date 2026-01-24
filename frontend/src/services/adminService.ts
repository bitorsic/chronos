import api from '../utils/api';
import type {
  AdminJobStats,
  AdminEmailStats,
  AdminPriceStats,
} from '../types/api';

export const adminService = {
  // Get job statistics
  getJobStats: async (): Promise<AdminJobStats> => {
    const response = await api.get<{
      totalJobs: number;
      byType: Array<{ _id: string; count: number }>;
      byUser: Array<any>;
    }>('/admin/reports/jobs');
    
    // Transform byType array to object with jobType keys
    const jobsByType = {
      emailReminder: 0,
      emailPrices: 0,
      storePrices: 0
    };
    
    response.data.byType.forEach((item: { _id: string; count: number }) => {
      if (item._id === 'emailReminder') jobsByType.emailReminder = item.count;
      if (item._id === 'emailPrices') jobsByType.emailPrices = item.count;
      if (item._id === 'storePrices') jobsByType.storePrices = item.count;
    });
    
    return {
      totalJobs: response.data.totalJobs,
      jobsByType
    };
  },

  // Get email statistics
  getEmailStats: async (): Promise<AdminEmailStats> => {
    const response = await api.get<AdminEmailStats>('/admin/reports/emails');
    return response.data;
  },

  // Get price statistics
  getPriceStats: async (): Promise<AdminPriceStats> => {
    const response = await api.get<{
      totalFetches: number;
      successful: number;
      failed: number;
      successRate: string;
      uniqueSymbols: number;
      byUser: Array<any>;
    }>('/admin/reports/prices');
    
    return {
      totalFetches: response.data.totalFetches,
      successful: response.data.successful,
      failed: response.data.failed,
      successRate: response.data.successRate,
      uniqueSymbols: response.data.uniqueSymbols
    };
  },
};
