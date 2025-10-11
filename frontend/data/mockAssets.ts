export type Asset = {
  id: number;
  name: string;
  symbol: string;
  price: number;
  is_favorite: boolean;
  created_at: string;
};

export const mockAssets: Asset[] = [
  { id: 1, name: "Bitcoin", symbol: "BTC", price: 35000, is_favorite: true, created_at: new Date().toISOString() },
  { id: 2, name: "Apple", symbol: "AAPL", price: 175, is_favorite: false, created_at: new Date().toISOString() },
  { id: 3, name: "Ethereum", symbol: "ETH", price: 2200, is_favorite: false, created_at: new Date().toISOString() },
];
