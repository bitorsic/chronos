export interface Email {
  _id: string;
  jobId: string;
  userId: string;
  executionId: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  createdAt: string;
}

export interface EmailHistory {
  emails: Email[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
