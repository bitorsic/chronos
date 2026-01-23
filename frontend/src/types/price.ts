export interface Price {
  _id: string;
  jobId: string;
  userId: string;
  executionId: string;
  stockSymbol: string;
  price: number;
  currency: string;
  timestamp: string;
  createdAt: string;
}

export interface PriceHistory {
  prices: Price[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
