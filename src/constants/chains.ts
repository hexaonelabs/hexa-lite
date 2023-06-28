
export interface IChain {
  id: number;
  value: string;
  name: string;
  nativeSymbol?: string;
};

export const CHAIN_AVAILABLES: IChain[] = [
  {
    id: 1,
    value: 'eth',
    name: 'Ethereum',
    nativeSymbol: 'ETH'
  },
  {
    id: 56,
    value: 'bsc',
    name: 'Binance smart chain',
    nativeSymbol: 'BNB'
  },
  {
    id: 250,
    value: 'fantom',
    name: 'Fantom',
    nativeSymbol: 'FTM'
  },
  {
    id: 43114,
    value: 'avalanche',
    name: 'Avalanche',
    nativeSymbol: 'AVAX'
  },
  {
    id: 137,
    value: 'polygon',
    name: 'Polygon',
    nativeSymbol: 'MATIC'
  },
  {
    id: 42161,
    value: 'arbitrum',
    name: 'Arbitrum',
    nativeSymbol: 'ARB'
  },
  {
    id: 10,
    value: 'optimism',
    name: 'Optimism',
    nativeSymbol: 'ETH'
  },
  {
    id: 5,
    value: 'eth_goerli',
    name: 'Goerli',
  },
  {
    id: 80001,
    value: 'polygon_mumbai',
    name: 'mumbai',
  },
  {
    id: 43113,
    value: 'avalanche_fuji',
    name: 'Fuji',
  },
];