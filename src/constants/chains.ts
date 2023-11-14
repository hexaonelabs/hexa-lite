import { ChainId } from "@aave/contract-helpers";

export interface IChain {
  id: number;
  value: string;
  name: string;
  rpcUrl: string;
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
    logo: '/assets/cryptocurrency-icons/eth.svg',
    rpcUrl: [
      {primary: false, url: 'https://eth-mainnet-public.unifra.io'}, 
      {primary: true, url: "https://rpc.ankr.com/eth"}
    ]
    .find(
      (rpc) => rpc.primary
    )?.url||'',
  },
  {
    id: 56,
    value: 'bsc',
    name: 'Binance smart chain',
    nativeSymbol: 'BNB',
    logo: '/assets/cryptocurrency-icons/bnb.svg',
    rpcUrl: [
      {primary: false, url: 'https://rpc.ankr.com/bsc'}, 
      {primary: true, url: "https://binance.llamarpc.com"}
    ].find(
      (rpc) => rpc.primary
    )?.url||'',
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
    logo: '/assets/cryptocurrency-icons/matic.svg',
    rpcUrl: [
      {primary: false, url: 'https://polygon-rpc.com'}, 
      {primary: true, url: "https://rpc.ankr.com/polygon"}
    ]
    .find(
      (rpc) => rpc.primary
    )?.url||'',
  },
  {
    id: 42161,
    value: 'arbitrum',
    name: 'Arbitrum',
    nativeSymbol: 'ARB',
    logo: '/assets/icons/arb.svg',
    rpcUrl: [
      {primary: true, url: 'https://arbitrum.llamarpc.com'}, 
      {primary: false, url: "https://rpc.ankr.com/arbitrum_one"}
    ].find(
      (rpc) => rpc.primary
    )?.url||'',
  },
  {
    id: 10,
    value: 'optimism',
    name: 'Optimism',
    nativeSymbol: 'OP',
    logo: '/assets/icons/op.svg',
    rpcUrl: [
      {primary: false, url:'https://mainnet.optimism.io'}, 
      {primary: true, url: "https://rpc.ankr.com/optimism"}
    ]
    .find(
      (rpc) => rpc.primary
    )?.url||'',
  },
  // testnets
  // {
  //   id: 5,
  //   value: 'eth_goerli',
  //   name: 'Goerli',
  //   testnet: true,
  //   rpcUrl: "https://rpc.ankr.com/eth_goerli",
  // },
  // {
  //   id: 80001,
  //   value: 'polygon_mumbai',
  //   name: 'mumbai',
  //   testnet: true,
  //   rpcUrl: "https://rpc.ankr.com/polygon_mumbai",
  // },
  // {
  //   id: 43113,
  //   value: 'avalanche_fuji',
  //   name: 'Fuji',
  // },
];

export const CHAIN_DEFAULT = CHAIN_AVAILABLES.find(c => c.id === 10) || {id: 10};

export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: "0.0001",
  [ChainId.arbitrum_one]: "0.0001",
};