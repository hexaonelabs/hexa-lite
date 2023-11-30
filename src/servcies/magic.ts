import {
  InstanceWithExtensions,
  MagicSDKExtensionsOption,
  SDKBase,
} from "@magic-sdk/provider";
import { Magic } from "magic-sdk";
import { CHAIN_DEFAULT, CHAIN_AVAILABLES } from "../constants/chains";

export const RPC_NODE_OPTIONS = CHAIN_AVAILABLES.map(c => (
  {
    chainId: c.id,
    rpcUrl: c.rpcUrl,
  }
));

export const getRPCNodeOptions = async () => {
  let t;
  await new Promise((resolve) => {
    t = setTimeout(resolve, 1000);
  });
  clearTimeout(t);

  const defaultChainId = CHAIN_DEFAULT.id;
  const { chainId = defaultChainId } = (window as any)?.ethereum || {};
  console.log(
    `[INFO] {getRPCNodeOptions} - chainId: `,
    chainId || defaultChainId
  );
  // check exist chainId from LocalStorage
  const chainIdFromLocalStorage = Number(localStorage.getItem("default-chainId"))|| undefined;
  // get chainId as decimal
  const chainIdAsDecimal = chainIdFromLocalStorage || Number(BigInt( chainId || defaultChainId).toString());
  const nodeOps = RPC_NODE_OPTIONS.find((n) => n.chainId === chainIdAsDecimal);
  if (!nodeOps) {    
    throw new Error("RPC Node config fail. Incorect params, ");
  }
  return nodeOps;
};

let _magic:
| InstanceWithExtensions<SDKBase, MagicSDKExtensionsOption<string>>
| undefined = undefined;

export const getMagic = async (forceInit?: boolean) => {
  // if (!_magic || forceInit) {
  //   const network = await getRPCNodeOptions(); // 'mainnet', // or your own custom node url in the format of { rpcUrl: string chainId: number }
  //   // clear localstorage
  //   localStorage.removeItem("default-chainId");
  //   const magic = new Magic(`${process.env?.REACT_APP_ONBOARD_APIKEY}`, {
  //     network,
  //     // extensions: [new WebAuthnExtension()],
  //   });
  //   _magic = magic;
  //   return magic;
  // }
  // return _magic;
  throw new Error("Deprecated");
};

export const connect = async (ops?: { email: string }) => {
  // const magic = await getMagic();
  // if (ops?.email) {
  //   const { email } = ops;
  //   await magic.auth.loginWithEmailOTP({ email, showUI: true });
  //   const user = await magic.user.getInfo();
  //   return user.publicAddress;
  // } else {
  //   const magic = await getMagic();
  //   // Try to connect to the wallet using Magic's user interface
  //   const address = await magic.wallet.connectWithUI();
  //   return address[0];
  // }
  throw new Error("Deprecated");
};

export const disconnect = async () => {
  // // Try to disconnect the user's wallet using Magic's logout method
  // const magic = await getMagic();
  // return await magic.user.logout();
  throw new Error("Deprecated");
};
