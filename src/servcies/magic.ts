'use client';

import {
  InstanceWithExtensions,
  SDKBase,
} from "@magic-sdk/provider";
import { Magic } from "magic-sdk";
import { CHAIN_DEFAULT, CHAIN_AVAILABLES, NETWORK } from "../constants/chains";
import { CosmosExtension } from "@magic-ext/cosmos";
import { BitcoinExtension } from "@magic-ext/bitcoin";
import { SolanaExtension } from '@magic-ext/solana';

export const RPC_NODE_OPTIONS = CHAIN_AVAILABLES.map(c => (
  {
    chainId: c.id,
    rpcUrl: c.rpcUrl,
  }
));

export const getRPCNodeOptions = async (nodeRpcChainId?: number) => {
  let t;
  await new Promise((resolve) => {
    t = setTimeout(resolve, 1000);
  });
  clearTimeout(t);
  const defaultChainId = CHAIN_DEFAULT.id;
  const chainId  = nodeRpcChainId || (window as any)?.ethereum?.chainId as number || defaultChainId
  // check exist chainId from LocalStorage
  const chainIdFromLocalStorage = Number(localStorage.getItem("default-chainId"))|| undefined;
  // get chainId as decimal
  const chainIdAsDecimal = chainIdFromLocalStorage || Number(BigInt( chainId ).toString());
  const nodeOps = RPC_NODE_OPTIONS.find((n) => n.chainId === chainIdAsDecimal);
  if (!nodeOps) {    
    throw new Error("RPC Node config fail. Incorect params, ");
  }
  return nodeOps;
};

let _magic: InstanceWithExtensions<SDKBase, any[]>;

export const getMagic = async (forceInit?: {
  chainId: number;
}) => {
  if (!_magic || forceInit) {
    const RPC_NODE = await getRPCNodeOptions(forceInit?.chainId); // 'mainnet', // or your own custom node url in the format of { rpcUrl: string chainId: number }
    // clear localstorage
    localStorage.removeItem("default-chainId");
    const APP_ONBOARD_APIKEY = process.env.NEXT_PUBLIC_APP_ONBOARD_APIKEY;
    switch (RPC_NODE.chainId) {
      // case NETWORK.avalanche:
      //   magic = new Magic(`${process.env?.REACT_APP_ONBOARD_APIKEY}`, {
      //     extensions: [
      //       new AvalancheExtension({
      //         rpcUrl: RPC_NODE?.rpcUrl,
      //         chainId: RPC_NODE?.chainId?.toString(),
      //         networkId: 4, // Avalanche networkId
      //       }),
      //     ],
      //   })
      //   break
      case NETWORK.bitcoin:
        console.log("[INFO] {getMagic} - NETWORK.bitcoin: ", NETWORK.bitcoin);
        _magic = new Magic(APP_ONBOARD_APIKEY, {
          extensions: [
            new BitcoinExtension({
              rpcUrl:  RPC_NODE?.rpcUrl,
              network: 'mainnet' // testnet or mainnet
            }) as any,
          ],
        }) as any;
        break;
      case NETWORK.cosmos:
        _magic = new Magic(APP_ONBOARD_APIKEY, {
          extensions: [
            new CosmosExtension({
              rpcUrl: RPC_NODE?.rpcUrl,
            }) as any,
          ],
        }) as any;
        // this._magicExtention = magic.cosmos as CosmosExtension;
        break;
      case NETWORK.solana:
        _magic = new Magic(APP_ONBOARD_APIKEY, {
          extensions: [
            new SolanaExtension({
              rpcUrl: RPC_NODE?.rpcUrl,
            }) as any,
          ],
        }) as any;
        break;
      default:
        _magic = new Magic(APP_ONBOARD_APIKEY, {
          network: RPC_NODE,
        }) as any;
    }
    return _magic;
  }
  return _magic;
};

export const connect = async (ops?: { email: string; chainId?: number }) => {
  console.log(`[INFO] {connect} - ops: `, ops);
  try {
    const magic = await getMagic(ops?.chainId ? {chainId: ops?.chainId} : undefined);
    if (ops?.email) {
      const { email } = ops;
      await magic.auth.loginWithEmailOTP({ email, showUI: true });
      const user = await magic.user.getInfo();
      return user.publicAddress;
    } else {
      console.log("[INFO] {connect} - magic with UI... ");
      // Try to connect to the wallet using Magic's user interface
      const address = await magic.wallet.connectWithUI();
      console.log("[INFO] {connect} - address: ", address);
      return address[0];
    }
  } catch (error: any) {
    throw error?.message|| 'Connect wallet fail';
  }
};

export const disconnect = async () => {
  // Try to disconnect the user's wallet using Magic's logout method
  const magic = await getMagic();
  return await magic.user.logout();
};

