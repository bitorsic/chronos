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
    price: number;
    currency: string;
  }>;
  createdAt: string;
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
