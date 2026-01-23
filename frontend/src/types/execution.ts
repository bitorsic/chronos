import type { JobType } from './job';

export const ExecutionStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
} as const;

export type ExecutionStatus = typeof ExecutionStatus[keyof typeof ExecutionStatus];

export interface Execution {
  _id: string;
  jobId: string;
  userId: string;
  jobType: JobType;
  status: ExecutionStatus;
  executedAt: string;
  error?: string;
  metadata?: Record<string, any>;
}
