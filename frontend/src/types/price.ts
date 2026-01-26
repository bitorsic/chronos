export interface Price {
  _id: string;
  symbol: string;
  price?: number; // Optional for failed executions
  currency?: string; // Optional for failed executions
  fetchedAt: string;
  executionStatus?: 'success' | 'failed';
  error?: string;
  attempt?: number;
  createdAt?: string;
  updatedAt?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface PriceHistory {
  prices: Price[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}
