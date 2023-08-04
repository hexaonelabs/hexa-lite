import { ChainId } from "@aave/contract-helpers";

export interface IChain {
  id: number;
  value: string;
  name: string;
  nativeSymbol?: string;
  logo?: string;
  testnet?: boolean;
};

export const CHAIN_AVAILABLES: IChain[] = [
  {
    id: 1,
    value: 'eth',
    name: 'Ethereum',
    nativeSymbol: 'ETH',
    logo: '/assets/cryptocurrency-icons/eth.svg'
  },
  {
    id: 56,
    value: 'bsc',
    name: 'Binance smart chain',
    nativeSymbol: 'BNB',
    logo: '/assets/cryptocurrency-icons/bnb.svg'    
  },
  // {
  //   id: 250,
  //   value: 'fantom',
  //   name: 'Fantom',
  //   nativeSymbol: 'FTM',
  //   logo: '/assets/cryptocurrency-icons/eth.svg'
  // },
  // {
  //   id: 43114,
  //   value: 'avalanche',
  //   name: 'Avalanche',
  //   nativeSymbol: 'AVAX'
  // },
  {
    id: 137,
    value: 'polygon',
    name: 'Polygon',
    nativeSymbol: 'MATIC',
    logo: '/assets/cryptocurrency-icons/matic.svg'
  },
  // {
  //   id: 42161,
  //   value: 'arbitrum',
  //   name: 'Arbitrum',
  //   nativeSymbol: 'ARB'
  // },
  {
    id: 10,
    value: 'optimism',
    name: 'Optimism',
    nativeSymbol: 'ETH',
    logo: '/assets/icons/op.svg'
  },
  // testnets
  {
    id: 5,
    value: 'eth_goerli',
    name: 'Goerli',
    testnet: true,
  },
  {
    id: 80001,
    value: 'polygon_mumbai',
    name: 'mumbai',
    testnet: true,
  },
  {
    id: 43113,
    value: 'avalanche_fuji',
    name: 'Fuji',
  },
];

export const CHAIN_DEFAULT = CHAIN_AVAILABLES.find(c => c.id === 10) || {id: 10};

export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: "0.0001",
  [ChainId.arbitrum_one]: "0.0001",
};