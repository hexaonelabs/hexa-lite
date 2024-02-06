import { IMarketPool } from "@/interfaces/reserve.interface";
import { IAavePool } from "./Aave.pool";
import { Web3ProviderType } from "@/interfaces/web3.interface";

export abstract class MarketPool implements IMarketPool {
  readonly id: string;
  readonly aTokenAddress: string;
  readonly underlyingAsset: string;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;

  readonly supplyAPY: number;
  readonly borrowAPY: number;

  readonly isActive: boolean;
  readonly isFrozen: boolean;
  readonly isPaused: boolean;
  readonly usageAsCollateralEnabled: boolean;
  readonly borrowingEnabled: boolean;

  readonly totalLiquidity: string;
  readonly totalLiquidityUSD: string;
  readonly availableLiquidityUSD: string;
  readonly totalDebtUSD: string;
  readonly borrowCapUSD: string;
  readonly supplyCapUSD: string;
  readonly priceInMarketReferenceCurrency: string;
  readonly formattedPriceInMarketReferenceCurrency: string;
  readonly priceInUSD: string;

  readonly provider: string;
  readonly chainId: number;
  readonly walletBalance: number;
  readonly supplyBalance: number;
  readonly borrowBalance: number;
  readonly userLiquidationThreshold: number;
  readonly poolLiquidationThreshold: number;
  readonly logo?: string;


  public abstract deposit(amount: number, provider: Web3ProviderType): Promise<void>;
  public abstract withdraw(amount: number, provider: Web3ProviderType): Promise<void>;
  public abstract borrow(amount: number, provider: Web3ProviderType): Promise<void>;
  public abstract repay(amount: number, provider: Web3ProviderType): Promise<void>;

  constructor(pool: IMarketPool) {
    this.id = pool.id;
    this.aTokenAddress = pool.aTokenAddress;
    this.underlyingAsset = pool.underlyingAsset;
    this.name = pool.name;
    this.symbol = pool.symbol;
    this.decimals = pool.decimals;

    this.supplyAPY = pool.supplyAPY;
    this.borrowAPY = pool.borrowAPY;

    this.isActive = pool.isActive;
    this.isFrozen = pool.isFrozen;
    this.isPaused = pool.isPaused;
    this.usageAsCollateralEnabled = pool.usageAsCollateralEnabled || false;
    this.borrowingEnabled = pool.borrowingEnabled || false;

    this.totalLiquidity = pool.totalLiquidity;
    this.totalLiquidityUSD = pool.totalLiquidityUSD;
    this.availableLiquidityUSD = pool.availableLiquidityUSD;
    this.totalDebtUSD = pool.totalDebtUSD;
    this.borrowCapUSD = pool.borrowCapUSD;
    this.supplyCapUSD = pool.supplyCapUSD;
    this.priceInMarketReferenceCurrency = pool.priceInMarketReferenceCurrency;
    this.formattedPriceInMarketReferenceCurrency = pool.formattedPriceInMarketReferenceCurrency;
    this.priceInUSD = pool.priceInUSD;

    this.provider = pool.provider;
    this.chainId = pool.chainId;
    this.walletBalance = pool.walletBalance;
    this.supplyBalance = pool.supplyBalance;
    this.borrowBalance = pool.borrowBalance;
    this.userLiquidationThreshold = pool.userLiquidationThreshold;
    this.poolLiquidationThreshold = pool.poolLiquidationThreshold;
    this.logo = pool.logo;
  }

  static create<T>(pool: IMarketPool): T {
    let poolInstance;
    switch (pool.provider) {
      case "aave-v3":
        const { AavePool } = require("./Aave.pool");
        poolInstance = new AavePool(pool as IAavePool) ;
        break;
      case "solend":
        const { SolendPool } = require("./solend.pool");
        poolInstance = new SolendPool( pool ) ;
        break;
      default:
        throw new Error("Invalid pool provider");
    }
    return poolInstance as T;
  }

  // toUSD(amount: number): string {
  //   return valueToBigNumber(amount).multipliedBy(this.priceInUSD).toFixed(2);
  // }

}