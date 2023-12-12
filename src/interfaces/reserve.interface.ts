import { ReserveDataHumanized } from "@aave/contract-helpers";
import { FormatReserveUSDResponse, FormatUserSummaryAndIncentivesResponse } from "@aave/math-utils";

export interface IMarketPool {
      readonly id: string;
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
      readonly logo?: string;
};

export interface IReserve extends ReserveDataHumanized, FormatReserveUSDResponse {
      chainId: number;
      logo?: string;
      walletBalance: number;
      supplyBalance: number;
      borrowBalance: number;
}

export interface IPoolGroup {
      symbol: string;
      name: string;
      topSupplyApy: number;
      topBorrowApy: number;
      pools: IMarketPool[];
      chainIds: number[];
      logo: string;
      borrowingEnabled: boolean;
      totalBorrowBalance: number;
      totalSupplyBalance: number;
      totalWalletBalance: number;
      priceInUSD: string;
}

export interface IProtocolSummary {
      chainId: number;
      provider: string;
      totalBorrowBalance: number;
      totalSupplyBalance: number;
      totalUserLiquidationThreshold: number;
      pools: IMarketPool[];
}

export interface IUserSummary extends FormatUserSummaryAndIncentivesResponse<ReserveDataHumanized & FormatReserveUSDResponse>{
      chainId: number;
}

export type ReserveDetailActionType =  "deposit" | "withdraw" | "borrow" | "repay" | "crosschain-collateral";