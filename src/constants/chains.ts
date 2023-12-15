import { ChainId } from "@aave/contract-helpers";

// Define Network enum that represents supported networks
export enum NETWORK {
  bitcoin = 1000,
  mainnet = 1,
  polygon = 137,
  avalanche = 43114,
  binancesmartchain = 56,
  arbitrum = 42161,
  optimism = 10,
  cosmos = 118,
  polkadot = 111,
  solana = 1399811149,
}

export interface IChain {
  id: number;
  value: string;
  name: string;
  rpcUrl: string;
  nativeSymbol?: string;
  logo?: string;
  testnet?: boolean;
  type: 'evm'|'cosmos'|'bitcoin'|'solana'|'polkadot';
};

const CHAINS_DISABLED = [
  NETWORK.cosmos,
  NETWORK.avalanche,
  NETWORK.polkadot,
]

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
      {primary: false, url: 'https://arbitrum.llamarpc.com'}, 
      {primary: true, url: "https://rpc.ankr.com/arbitrum_one"}
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
  {
    id: NETWORK.bitcoin,
    name: 'Bitcoin',
    value: 'bitcoin',
    nativeSymbol: 'BTC',
    rpcUrl: [
      {url: '84-30-190-204.cable.dynamic.v4.ziggo.nl', primary: false},
      {url: 'https://rpc.coinsdo.net/btc', primary: true}
    ].find(
      (rpc) => rpc.primary
    )?.url||'',
    type: 'bitcoin',
    logo: '/assets/cryptocurrency-icons/btc.svg',
  },
  {
    id: NETWORK.solana,
    value: 'solana',
    name: 'Solana',
    nativeSymbol: 'SOL',
    logo: '/assets/cryptocurrency-icons/sol.svg',
    rpcUrl: [
      {primary: true, url: "https://api.devnet.solana.com"}
    ]
    .find(
      (rpc) => rpc.primary
    )?.url||'',
    type: 'solana',
  },
]
.filter(c => !CHAINS_DISABLED.includes(c.id)) as IChain[];

const NETWORK_DEFAULT = NETWORK.optimism;
export const CHAIN_DEFAULT = CHAIN_AVAILABLES.find(c => c.id === NETWORK_DEFAULT) || {
  id: NETWORK_DEFAULT, name: 'default', value: 'default', rpcUrl: '', type: 'evm'
};

export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: "0.0001",
  [ChainId.arbitrum_one]: "0.0001",
};