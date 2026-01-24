export const JobType = {
  EMAIL_REMINDER: 'emailReminder',
  EMAIL_PRICES: 'emailPrices',
  STORE_PRICES: 'storePrices'
} as const;

export type JobType = typeof JobType[keyof typeof JobType];

export const ScheduleType = {
  IMMEDIATE: 'immediate',
  ONCE: 'once',
  CRON: 'cron'
} as const;

export type ScheduleType = typeof ScheduleType[keyof typeof ScheduleType];

export interface Schedule {
  scheduleType: ScheduleType;
  scheduledAt?: string; // ISO date string for ONCE
  cronExpression?: string; // For CRON
}

export interface JobData {
  // For EMAIL_REMINDER
  to?: string[]; // Recipients
  subject?: string;
  body?: string;
  
  // For EMAIL_PRICES
  symbols?: string[]; // Stock symbols
  
  // For STORE_PRICES
  symbol?: string; // Single stock symbol
}

export interface Job {
  _id: string;
  userId: string;
  jobType: JobType;
  schedule: Schedule;
  data: JobData;
  createdAt: string;
  updatedAt: string;
  nextRunAt?: string;
  lastRunAt?: string;
  lastRunStatus?: 'success' | 'failed';
}

export interface CreateJobDto {
  jobType: JobType;
  schedule: Schedule;
  data: JobData;
}

export interface UpdateJobDto {
  schedule?: Schedule;
  data?: JobData;
}
