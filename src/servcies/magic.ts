import { Magic } from "magic-sdk";

const getRPCNodeOptions = () => {
  const MAINNET_RPC_URL = 'https://rpc.ankr.com/eth';
  const RPC_NODE_OPTIONS = [
    {
      rpcUrl: MAINNET_RPC_URL, // your ethereum, polygon, or optimism mainnet/testnet rpc URL
      chainId: 1 // corresponding chainId for your rpc url
    },
    {
      rpcUrl: 'https://rpc.ankr.com/eth_goerli', // your ethereum, polygon, or optimism mainnet/testnet rpc URL
      chainId: 5 // corresponding chainId for your rpc url
    },
    {
      rpcUrl: 'https://rpc.ankr.com/polygon', // or https://matic-mumbai.chainstacklabs.com for testnet
      chainId: 137 // or 80001 for polygon testnet
    },
    {
      rpcUrl: 'https://rpc.ankr.com/polygon_mumbai',
      chainId: 80001
    },
    {
      rpcUrl: 'https://rpc.ankr.com/optimism',
      chainId: 10
    }
  ];
  const defaultChainId = 137;
  const {chainId = defaultChainId} = (window as any)?.ethereum||{};
  console.log(`[INFO] {getRPCNodeOptions} - chainId: `, chainId||defaultChainId);
  const chainIdAsDecimal = Number(BigInt(chainId||defaultChainId).toString());
  const nodeOps =  RPC_NODE_OPTIONS.find(n => n.chainId === chainIdAsDecimal);
  if (!nodeOps) {
    throw new Error('RPC Node config fail. Incorect params, ');
  }
  return nodeOps;
}

export const magic = new Magic(
  `${process.env?.REACT_APP_ONBOARD_APIKEY}`, 
  {
  network: getRPCNodeOptions(), // 'mainnet', // or your own custom node url in the format of { rpcUrl: string chainId: number }
  // extensions: [new WebAuthnExtension()],
  }
);