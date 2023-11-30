import { ChainId } from "@aave/contract-helpers";

// Define Network enum that represents supported networks
export enum NETWORK {
  mainnet = 1,
  polygon = 137,
  avalanche = 43114,
  binancesmartchain = 56,
  arbitrum = 42161,
  optimism = 10,
  cosmos = 118,
}

export interface IChain {
  id: number;
  value: string;
  name: string;
  rpcUrl: string;
  nativeSymbol?: string;
  logo?: string;
  testnet?: boolean;
  type: 'evm'|'cosmos';
};

export const CHAIN_AVAILABLES: IChain[] = [
  {
    id: NETWORK.mainnet,
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
    type: 'evm',
  },
  {
    id: NETWORK.binancesmartchain,
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
    type: 'evm',
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
    id: NETWORK.polygon,
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
    type: 'evm',
  },
  {
    id: NETWORK.arbitrum,
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
    type: 'evm',
  },
  {
    id: NETWORK.optimism,
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
    type: 'evm',
  },
  {
    id: NETWORK.cosmos,
    value: 'cosmos',
    name: 'Cosmos',
    nativeSymbol: 'ATOM',
    logo: '/assets/cryptocurrency-icons/atom.svg',
    rpcUrl: [
      {primary: true, url:'https://rpc.cosmos.network:26657'}, 
      {primary: false, url: "https://cosmos-rpc.publicnode.com:443"},
    ]
    .find(
      (rpc) => rpc.primary
    )?.url||'',
    type: 'cosmos',
  },
  // {
  //   id: NETWORK.avalanche,
  //   value: 'avalanche',
  //   name: 'Avalanche',
  //   nativeSymbol: 'AVAX',
  //   logo: '/assets/cryptocurrency-icons/avax.svg',
  //   rpcUrl: [
  //     {primary: false, url:'https://avalanche-c-chain.publicnode.com'}, 
  //     {primary: true, url: "https://rpc.ankr.com/avalanche"}
  //   ]
  //   .find(
  //     (rpc) => rpc.primary
  //   )?.url||'',
  // },
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

const NETWORK_DEFAULT = NETWORK.optimism;
export const CHAIN_DEFAULT = CHAIN_AVAILABLES.find(c => c.id === NETWORK_DEFAULT) || {id: NETWORK_DEFAULT};

export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: "0.0001",
  [ChainId.arbitrum_one]: "0.0001",
};