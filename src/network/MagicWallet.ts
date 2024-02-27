import { CHAIN_DEFAULT, NETWORK } from "../constants/chains";
import { connect as connectWithMagic, disconnect } from "../servcies/magic";
import { IAsset } from "../interfaces/asset.interface";
import { Web3ProviderType } from "@/interfaces/web3.interface";
import { connectWithExternalWallet } from "@/servcies/evm.service";


// Abstract class to handle magic network-specific operations
export abstract class MagicWalletUtils {

  public get walletAddress():string|undefined {
    return this._walletAddress;
  };
  public set walletAddress(walletAddress: string | undefined) {
    this._walletAddress = walletAddress;
  }
  public get network(): NETWORK {
    return this._network;
  };
  public set network(network: NETWORK) {
    this._network = network;
  }
  public get assets(): IAsset[] {
    return this._assets;
  };
  public set assets(assets: IAsset[]) {
    this._assets = assets;
  }
  private _walletAddress: string | undefined;
  private _network!: NETWORK;
  private _assets: IAsset[] = [];
  protected _withExternalWallet: boolean = false;

  public abstract web3Provider: Web3ProviderType | null;
  public abstract isMagicWallet: boolean;
  public abstract loadBalances(): Promise<void>;

  /**
   * This method will initialize web3 provider based on network type
   * and check if user is already connected by checking wallet address and set it to `this.walletAddress`
   */
  protected abstract _initializeWeb3(): Promise<void>;

  /**
   * Static method to create MagicWallet instance based on network type
   * @param network Chain ID as number
   * @returns
   */
  public static async create(network: NETWORK = CHAIN_DEFAULT.id, withExternalWallet: boolean = false): Promise<MagicWalletUtils> {
    let walletUtil: MagicWalletUtils;
    switch (network) {
      // case NETWORK.avalanche: {
      //   const { Avalanche } = require("./Avalanche");
      //   return new Avalanche(network);
      // break;
      // }
      case NETWORK.bitcoin: {
        const { BitcoinWalletUtils } = require("./Bitcoin");
        walletUtil = new BitcoinWalletUtils(network);
        break;
      }
      case NETWORK.cosmos: {
        const { CosmosWalletUtils } = require("./Cosmos");
        walletUtil = new CosmosWalletUtils(network);
        break;
      }
      case NETWORK.solana: {
        const { SolanaWalletUtils } = require("./Solana");
        walletUtil = new SolanaWalletUtils(network);
        break;
      }
      default: {
        const { EVMWalletUtils } = require("./EVM");
        walletUtil = new EVMWalletUtils(network);
        break;
      }
    }
    // set external wallet flag
    walletUtil._withExternalWallet = withExternalWallet;
    // initialize web3 provider
    await walletUtil._initializeWeb3();
    return walletUtil;
  }

  async connect(ops?: {
    email?: string;
    oAuth?: "google";
  }) {
    if (!ops) {
      await connectWithExternalWallet();
      this._withExternalWallet = true;
    } else {
      await connectWithMagic(ops);
    }
    if (ops?.email) {
      await this._initializeWeb3();
      if (!this.walletAddress) {
        throw new Error("Connect wallet fail");
      }
    }
    return this.walletAddress;
  }

  async disconnect() {
    this.walletAddress = undefined;
    this.assets = [];
    return disconnect();
  }

}