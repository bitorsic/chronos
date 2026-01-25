export interface Price {
  _id: string;
  symbol: string;
  price: number;
  currency: string;
  fetchedAt: string;
  executionStatus?: 'success' | 'failed';
  error?: string;
  attempt?: number;
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
