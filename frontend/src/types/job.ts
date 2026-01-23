export const JobType = {
  EMAIL_REMINDER: 'EMAIL_REMINDER',
  EMAIL_PRICES: 'EMAIL_PRICES',
  STORE_PRICES: 'STORE_PRICES'
} as const;

export type JobType = typeof JobType[keyof typeof JobType];

export const ScheduleType = {
  IMMEDIATE: 'IMMEDIATE',
  ONCE: 'ONCE',
  CRON: 'CRON'
} as const;

export type ScheduleType = typeof ScheduleType[keyof typeof ScheduleType];

export const JobStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const;

export type JobStatus = typeof JobStatus[keyof typeof JobStatus];

export interface Schedule {
  scheduleType: ScheduleType;
  scheduledAt?: string; // ISO date string for ONCE
  cronExpression?: string; // For CRON
}

export interface JobData {
  subject?: string; // For EMAIL_REMINDER and EMAIL_PRICES
  message?: string; // For EMAIL_REMINDER
  stockSymbols?: string[]; // For EMAIL_PRICES and STORE_PRICES
}

export interface Job {
  _id: string;
  userId: string;
  jobType: JobType;
  schedule: Schedule;
  data: JobData;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  nextRunAt?: string;
  lastRunAt?: string;
}

export interface CreateJobDto {
  jobType: JobType;
  schedule: Schedule;
  data: JobData;
}

export interface UpdateJobDto {
  schedule?: Schedule;
  data?: JobData;
  status?: JobStatus;
}
