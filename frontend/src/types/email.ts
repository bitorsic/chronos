export interface Email {
  _id: string;
  emailType: 'reminder' | 'prices';
  to: string;
  subject: string;
  executionStatus: 'success' | 'failed';
  error?: string;
  attempt: number;
  metadata?: Array<{
    symbol: string;
    price?: number; // Optional for failed fetches
    currency?: string; // Optional for failed fetches
  }>;
  createdAt: string;
  updatedAt?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  jobId?: {
    _id: string;
    jobType: string;
    schedule: any;
  };
}

export interface EmailHistory {
  emails: Email[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}
