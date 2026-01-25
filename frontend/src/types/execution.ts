export const ExecutionStatus = {
  SUCCESS: 'success',
  FAILED: 'failed'
} as const;

export type ExecutionStatus = typeof ExecutionStatus[keyof typeof ExecutionStatus];

export interface BaseExecution {
  _id: string;
  userId: string;
  jobId: {
    _id: string;
    jobType: string;
    payload: any;
    schedule: any;
  };
  executionStatus: ExecutionStatus;
  error?: string;
  attempt: number;
  type: 'storage' | 'email';
  createdAt: string;
  updatedAt: string;
}

export interface StorageExecution extends BaseExecution {
  type: 'storage';
  symbol: string;
  price: number;
  currency: string;
  fetchedAt: string;
}

export interface EmailExecution extends BaseExecution {
  type: 'email';
  emailType: 'reminder' | 'prices';
  to: string;
  subject: string;
  metadata?: Array<{
    symbol: string;
    price: number;
    currency: string;
  }>;
}

export type Execution = StorageExecution | EmailExecution;
