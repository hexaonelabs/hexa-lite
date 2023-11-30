import {
  SDKBase,
  InstanceWithExtensions,
  MagicSDKExtensionsOption,
} from "@magic-sdk/provider";
import { SolanaExtension } from "@magic-ext/solana";
import { CosmosExtension } from "@magic-ext/cosmos";
import { SolanaConfig } from "@magic-ext/solana/dist/types/type";
// import { AvalancheExtension } from '@magic-ext/avalanche';
import { Magic } from "magic-sdk";
import { NETWORK } from "../constants/chains";
import { RPC_NODE_OPTIONS } from "../servcies/magic";
import { Web3ProviderType } from "../context/Web3Context";
import { IAsset } from "../interfaces/asset.interface";


// Abstract class to handle magic network-specific operations
export abstract class MagicWallet {
  private _magic: Magic | null = null;
  protected _magicExtention: CosmosExtension|undefined;
  protected _defaultRCP!: { chainId: number; rpcUrl: string };
  protected abstract _fetchUserAssets(): Promise<IAsset[]>;
  
  public walletAddress: string|undefined;
  public abstract network: NETWORK;
  public abstract web3Provider: Web3ProviderType | null;
  public abstract assets: IAsset[];
  public abstract initializeWeb3(): Promise<void>;
  public abstract sendTx(ops: any): Promise<any>;

  /**
   * Method to initialize Magic instance based on network type
   */
  protected initialize(): void {
    const RPC_NODE = RPC_NODE_OPTIONS.find(
      (n: any) => n.chainId === this.network
    );
    if (!RPC_NODE) {
      throw new Error(
        "RPC Node config fail. Incorect params or unavailable network. "
      );
    }
    this._defaultRCP = RPC_NODE;
    let magic;
    switch (this.network) {
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
      case NETWORK.cosmos:
        magic = new Magic(`${process.env?.REACT_APP_ONBOARD_APIKEY}`, {
          extensions: [
            new CosmosExtension({
              rpcUrl: RPC_NODE?.rpcUrl,
            }) as any,
          ],
          // network: {
          //   rpcUrl: RPC_NODE?.rpcUrl,
          // },
        });
        this._magicExtention = magic.cosmos as CosmosExtension;
        break;
      default:
        magic = new Magic(`${process.env?.REACT_APP_ONBOARD_APIKEY}`, {
          network: RPC_NODE,
        });
    }
    if (!magic) {
      throw new Error("Magic init fail. Incorect params. ");
    }
    this._magic = magic;
  }

  protected async _getMagicProvider() {
    return await this._magic?.wallet?.getProvider();
  }

  /**
   * Static method to create MagicWallet instance based on network type
   * @param network Chain ID as number
   * @returns
   */
  public static create(network: NETWORK): MagicWallet {
    switch (network) {
      // case NETWORK.avalanche: {
      //   const { Avalanche } = require("./Avalanche");
      //   return new Avalanche(network);
      // }
      // case NETWORK.cosmos: {
      //   const { Cosmos } = require("./Cosmos");
      //   return new Cosmos(network);
      // }
      default: {
        const { EVM } = require("./EVM");
        return new EVM(network);
      }
    }
  }

  public async connect() {
    console.log("connect", this._magic);
    try {
      await this._magic?.wallet.connectWithUI();
      const infos = await this.getInfo();
      console.log("connect infos", infos);
      this.walletAddress = infos?.publicAddress;
      this.assets = await this._fetchUserAssets();
    } catch (error) {
      console.log("connect error", error);
    }
  }

  // Method to login with OTP using Magic SDK
  public async loginWithOTP(email: string): Promise<void> {
    await this._magic?.auth.loginWithEmailOTP({ email });
    this.assets = await this._fetchUserAssets();
  }

  // Method to logout using Magic SDK
  public async logout() {
    await this._magic?.user.logout();
  }

  // Method to check if user is logged in using Magic SDK
  public async isLoggedIn() {
    return await this._magic?.user.isLoggedIn();
  }

  // Method to get user information using Magic SDK
  public async getInfo(): Promise<
    | {
        publicAddress: string | undefined;
        walletType: string;
      }
    | undefined
  > {
    const isLogedIn = await this.isLoggedIn();
    // console.log("[INFO] getInfo...", isLogedIn);
    if (!Boolean(isLogedIn)) {
      return undefined;
    }
    const info = await this._magic?.user.getInfo();
    // console.log("[INFO] getInfo: ", info);
    return {
      walletType: (info as any)?.walletType || "default",
      publicAddress: info?.publicAddress || undefined,
    };
  }

  public async showWalletUI() {
    return await this._magic?.wallet.showUI();
  }

  public getNetwork() {
    return this.network;
  }
}
