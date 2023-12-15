import { IMarketPool } from "@/interfaces/reserve.interface";
import { MarketPool } from "./Market.pool";

export interface IAavePool extends IMarketPool { 
  readonly unborrowedLiquidity: string;
  readonly formattedEModeLiquidationThreshold: string;
  readonly reserveLiquidationThreshold: string;
  readonly formattedReserveLiquidationThreshold: string;
  readonly reserveLiquidationBonus: string;
  readonly reserveFactor: string;
  readonly usageAsCollateralEnabled: boolean;
  readonly borrowingEnabled: boolean;
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
    super(pool);

    this.unborrowedLiquidity = pool.unborrowedLiquidity;
    this.formattedReserveLiquidationThreshold = pool.formattedReserveLiquidationThreshold;
    this.formattedEModeLiquidationThreshold = pool.formattedEModeLiquidationThreshold;
    this.reserveLiquidationThreshold = pool.reserveLiquidationThreshold;
    this.reserveLiquidationBonus = pool.reserveLiquidationBonus;
    this.reserveFactor = pool.reserveFactor;
    this.usageAsCollateralEnabled = pool.usageAsCollateralEnabled;
    this.borrowingEnabled = pool.borrowingEnabled;

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

  public async deposit(amount: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async withdraw(amount: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async borrow(amount: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async repay(amount: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

}