import type { JobType } from './job';

export const ExecutionStatus = {
  SUCCESS: 'success',
  FAILED: 'failed'
} as const;

export type ExecutionStatus = typeof ExecutionStatus[keyof typeof ExecutionStatus];

export interface Execution {
  _id: string;
  jobId: string;
  userId: string;
  jobType: JobType;
  executionStatus: ExecutionStatus;
  executedAt: string;
  error?: string;
  metadata?: Record<string, any>;
}
