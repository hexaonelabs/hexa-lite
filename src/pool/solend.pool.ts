import { IMarketPool } from "@/interfaces/reserve.interface";
import { MarketPool } from "./Market.pool";


interface LiquidityToken {
  coingeckoID: string;
  decimals: number;
  logo: string;
  mint: string;
  name: string;
  symbol: string;
  volume24h: string;
}

interface Reserve {
  liquidityToken: LiquidityToken;
  pythOracle: string;
  switchboardOracle: string;
  address: string;
  collateralMintAddress: string;
  collateralSupplyAddress: string;
  liquidityAddress: string;
  liquidityFeeReceiverAddress: string;
  userBorrowCap: string;
  userSupplyCap: string;
}

export interface IMarketConfig {
  name: string;
  isPrimary: boolean;
  description: string;
  creator: string;
  address: string;
  hidden: boolean;
  isPermissionless: boolean;
  authorityAddress: string;
  owner: string;
  reserves: Reserve[];
}

export class SolendPool extends MarketPool  {
  constructor(pool: IMarketPool) {
    super(pool);
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