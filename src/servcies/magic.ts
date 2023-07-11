import { InstanceWithExtensions, MagicSDKExtensionsOption, SDKBase } from "@magic-sdk/provider";
import { Magic } from "magic-sdk";

const getRPCNodeOptions = async () => {
  let t;
  await new Promise((resolve) => {
    t = setTimeout(resolve, 1000);
  });
  clearTimeout(t);
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

let _magic: InstanceWithExtensions<SDKBase, MagicSDKExtensionsOption<string>>|undefined = undefined;
export const getMagic = async (forceInit?: boolean) => {
  if (!_magic || forceInit) {
    const network = await getRPCNodeOptions();// 'mainnet', // or your own custom node url in the format of { rpcUrl: string chainId: number }
    const magic = new Magic(
      `${process.env?.REACT_APP_ONBOARD_APIKEY}`, 
      {
        network, 
      // extensions: [new WebAuthnExtension()],
      }
    );
    _magic = magic;
    return magic;
  }
  return _magic;
}

export const connect = async (ops?: {email: string}) => {
  const magic = await getMagic();
  if (ops?.email) {
    const {email} = ops;
    await magic.auth.loginWithEmailOTP({email, showUI: true});
    const user = await magic.user.getInfo();
    return user.publicAddress;
  } else {
    const magic = await getMagic();
    // Try to connect to the wallet using Magic's user interface
    const address = await magic.wallet.connectWithUI();
    return address[0];
  }
}

export const disconnect = async () => { 
  // Try to disconnect the user's wallet using Magic's logout method
  const magic = await getMagic();
  return await magic.user.logout();
}