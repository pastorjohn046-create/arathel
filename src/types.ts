export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  type: 'stock' | 'commodity' | 'etf' | 'bond';
  category: string;
}

export interface UserPortfolio {
  totalBalance: number;
  pnl24h: number;
  allocations: {
    assetId: string;
    symbol: string;
    amount: number;
    value: number;
    color: string;
  }[];
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  timestamp: string;
  category: string;
  isTrending?: boolean;
}

export interface Trade {
  id: string;
  userId: string;
  assetId: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'crypto' | 'card';
  details: string;
  isGlobal: boolean;
  userId?: string;
  status: 'active' | 'inactive';
}

export interface SmartContract {
  id: string;
  name: string;
  address: string;
  network: string;
  status: 'deployed' | 'pending' | 'failed';
  createdAt: string;
}
