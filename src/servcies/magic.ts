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
import { OAuthExtension } from '@magic-ext/oauth';

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
    let ops;
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
        ops = {
          extensions: [
            new BitcoinExtension({
              rpcUrl:  RPC_NODE?.rpcUrl,
              network: 'mainnet' // testnet or mainnet
            }),
          ],
        };
        break;
      case NETWORK.cosmos:
       ops = {
          extensions: [
            new CosmosExtension({
              rpcUrl: RPC_NODE?.rpcUrl,
            }),
          ],
        };
        // this._magicExtention = magic.cosmos as CosmosExtension;
        break;
      case NETWORK.solana:
        ops = {
          extensions: [
            new SolanaExtension({
              rpcUrl: RPC_NODE?.rpcUrl,
            }) as any,
          ],
        };
        break;
      default:
       ops = {
          network: RPC_NODE,
        };
    }
    // update magic instance with options and add OAuthExtension
    _magic = new Magic(APP_ONBOARD_APIKEY, {
      ...ops,
      extensions: [
        ...ops?.extensions|| [],
        new OAuthExtension()
      ]
    });
    return _magic;
  }
  return _magic;
};

export const connect = async (ops?: { email?: string; chainId?: number, oAuth?: 'google' }) => {
  console.log(`[INFO] {connect} - ops: `, ops);
  try {
    const magic = await getMagic(ops?.chainId ? {chainId: ops?.chainId} : undefined);
    if (ops?.email) {
      // const { email } = ops;
      // await magic.auth.loginWithEmailOTP({ email, showUI: true });
      await magic.wallet.connectWithUI();
      const user = await magic.user.getInfo();
      return user.publicAddress;
    } 
    if (ops?.oAuth) {
      console.log("[INFO] {connect} - magic with oAuth... ");
      await (magic as any)?.oauth?.loginWithRedirect({
        provider: ops?.oAuth,
        redirectURI: new URL('/', window.location.origin).href,
      });
      // connection will be finish on the redirect page after handle url params from oAuth provider
      // using `getRedirectResult()` method
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

export const connectWithOAuth = async (provider: 'google') => {
  const magic = getMagic();
  let publicAddress, infos;
  try {
    await (magic as any)?.oauth?.loginWithRedirect({
      provider,
      redirectURI: new URL('/', window.location.origin).href,
    });
  } catch (err) {
    console.log('oauth error: ', { err });
  }
  return {
    publicAddress,
    infos,
  };
};
