import { IMarketPool } from "@/interfaces/reserve.interface";
import { MarketPool } from "./Market.pool";
import { ethers } from "ethers";
import {
  borrow,
  getMarkets,
  repay,
  supplyWithPermit,
  withdraw,
} from "@/servcies/aave.service";
import { Web3ProviderType } from "@/interfaces/web3.interface";

export interface IAavePool extends IMarketPool {
  readonly unborrowedLiquidity: string;
  readonly formattedEModeLiquidationThreshold: string;
  readonly reserveLiquidationThreshold: string;
  readonly formattedReserveLiquidationThreshold: string;
  readonly reserveLiquidationBonus: string;
  readonly reserveFactor: string;
  readonly usageAsCollateralEnabled: boolean;
  readonly borrowingEnabled: boolean;
  readonly isIsolated: boolean;
  readonly availableLiquidity: string;
  readonly formattedAvailableLiquidity: string;
  readonly debtCeiling: string;
  readonly debtCeilingDecimals: number;
  readonly borrowCap: string;
  readonly supplyCap: string;
  readonly borrowableInIsolation: boolean;
  readonly isolationModeTotalDebt: string;
  readonly totalDebt: string;
  readonly userLiquidationThreshold: number;
}

export class AavePool extends MarketPool implements IAavePool {
  public readonly unborrowedLiquidity: string;
  public readonly formattedReserveLiquidationThreshold: string;
  public readonly formattedEModeLiquidationThreshold: string;
  public readonly reserveLiquidationThreshold: string;
  public readonly reserveLiquidationBonus: string;
  public readonly reserveFactor: string;
  public readonly usageAsCollateralEnabled: boolean;
  public readonly borrowingEnabled: boolean;
  public readonly isIsolated: boolean;
  public readonly availableLiquidity: string;
  public readonly formattedAvailableLiquidity: string;
  public readonly debtCeiling: string;
  public readonly debtCeilingDecimals: number;
  public readonly borrowCap: string;
  public readonly supplyCap: string;
  public readonly borrowableInIsolation: boolean;
  public readonly isolationModeTotalDebt: string;
  public readonly totalDebt: string;
  public readonly userLiquidationThreshold: number;

  constructor(pool: IAavePool) {
    super({
      ...pool,
      poolLiquidationThreshold: Number(
        pool.formattedReserveLiquidationThreshold
      ),
    });

    this.unborrowedLiquidity = pool.unborrowedLiquidity;
    this.formattedReserveLiquidationThreshold =
      pool.formattedReserveLiquidationThreshold;
    this.formattedEModeLiquidationThreshold =
      pool.formattedEModeLiquidationThreshold;
    this.reserveLiquidationThreshold = pool.reserveLiquidationThreshold;
    this.reserveLiquidationBonus = pool.reserveLiquidationBonus;
    this.reserveFactor = pool.reserveFactor;
    this.usageAsCollateralEnabled = pool.usageAsCollateralEnabled;
    this.borrowingEnabled = pool.borrowingEnabled;
    this.isIsolated = pool.isIsolated || false;

    this.availableLiquidity = pool.availableLiquidity;
    this.formattedAvailableLiquidity = pool.formattedAvailableLiquidity;
    this.debtCeiling = pool.debtCeiling;
    this.debtCeilingDecimals = pool.debtCeilingDecimals;
    this.borrowCap = pool.borrowCap;
    this.supplyCap = pool.supplyCap;
    this.borrowableInIsolation = pool.borrowableInIsolation;
    this.isolationModeTotalDebt = pool.isolationModeTotalDebt;
    this.totalDebt = pool.totalDebt;
    this.userLiquidationThreshold = pool.userLiquidationThreshold;
  }

  public async deposit(
    amount: number,
    provider: Web3ProviderType
  ): Promise<void> {
    // handle invalid amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount. Value must be greater than 0.");
    }
    if (!(provider instanceof ethers.providers.Web3Provider)) {
      throw new Error("No EVM web3Provider");
    }
    const markets = getMarkets(this.chainId);
    // call method
    const { chainId, aTokenAddress, underlyingAsset } = this;
    const params = {
      provider: provider as ethers.providers.Web3Provider,
      reserve: { chainId, aTokenAddress, underlyingAsset },
      amount: amount.toString(),
      onBehalfOf: undefined,
      poolAddress: `${markets.POOL}`,
      gatewayAddress: `${markets.WETH_GATEWAY}`,
    };
    console.log("[INFO] AavePool.deposit() params: ", params);
    try {
      const txReceipts = await supplyWithPermit(params);
      console.log("[INFO] AavePool.deposit() TX result: ", txReceipts);
    } catch (error) {
      throw error;
    }
  }

  public async withdraw(
    amount: number,
    provider: Web3ProviderType
  ): Promise<void> {
    // handle invalid amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error(
        "[INFO] AavePool.withdraw() Invalid amount. Value must be greater than 0."
      );
    }
    if (!(provider instanceof ethers.providers.Web3Provider)) {
      throw new Error("[INFO] AavePool.withdraw() No EVM web3Provider");
    }
    const markets = getMarkets(this.chainId);
    const { underlyingAsset, aTokenAddress } = this;
    // call method
    const params = {
      provider: provider as ethers.providers.Web3Provider,
      reserve: { underlyingAsset, aTokenAddress },
      amount: amount.toString(),
      onBehalfOf: undefined,
      poolAddress: `${markets?.POOL}`,
      gatewayAddress: `${markets?.WETH_GATEWAY}`,
    };
    console.log("[INFO] AavePool.withdraw() params: ", params);
    try {
      const txReceipts = await withdraw(params);
      console.log("[INFO] AavePool.withdraw() TX result: ", txReceipts);
    } catch (error) {
      throw error;
    }
  }

  public async borrow(
    amount: number,
    provider: Web3ProviderType
  ): Promise<void> {
    // handle invalid amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error(
        "[INFO] AavePool.borrow() Invalid amount. Value must be greater than 0."
      );
    }
    if (!(provider instanceof ethers.providers.Web3Provider)) {
      throw new Error("[INFO] AavePool.borrow() No EVM web3Provider");
    }
    const markets = getMarkets(this.chainId);
    // call method
    const { underlyingAsset } = this;
    // call method
    const params = {
      provider,
      reserve: { underlyingAsset },
      amount: amount.toString(),
      onBehalfOf: undefined,
      poolAddress: `${markets?.POOL}`,
      gatewayAddress: `${markets?.WETH_GATEWAY}`,
    };
    console.log("[INFO] AavePool.borrow() params: ", params);
    try {
      const txReceipts = await borrow(params);
      console.log("[INFO] AavePool.borrow() TX result: ", txReceipts);
    } catch (error) {
      throw error;
    }
  }

  public async repay(
    amount: number,
    provider: Web3ProviderType
  ): Promise<void> {
    // handle invalid amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount. Value must be greater than 0.");
    }
    if (!(provider instanceof ethers.providers.Web3Provider)) {
      throw new Error("[INFO] AavePool.borrow() No EVM web3Provider");
    }
    const markets = getMarkets(this.chainId);
    // call method
    const { underlyingAsset } = this;
    // call method
    const params = {
      provider: provider as ethers.providers.Web3Provider,
      reserve: { underlyingAsset },
      amount: amount.toString(),
      onBehalfOf: undefined,
      poolAddress: `${markets?.POOL}`,
      gatewayAddress: `${markets?.WETH_GATEWAY}`,
    };
    console.log("params: ", params);
    try {
      const txReceipts = await repay(params);
      console.log("TX result: ", txReceipts);
    } catch (error) {
      console.log("[ERROR]: ", error);
      throw error;
    }
  }
}
