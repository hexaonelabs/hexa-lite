import { ReserveDataHumanized } from "@aave/contract-helpers";
import { FormatReserveUSDResponse, FormatUserSummaryAndIncentivesResponse } from "@aave/math-utils";

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
      reserves: IReserve[];
      chainIds: number[];
      logo: string;
      borrowingEnabled: boolean;
      totalBorrowBalance: number;
      totalSupplyBalance: number;
      totalWalletBalance: number;
}

export interface IUserSummary extends FormatUserSummaryAndIncentivesResponse<ReserveDataHumanized & FormatReserveUSDResponse>{
      chainId: number;
}

export type ReserveDetailActionType =  "deposit" | "withdraw" | "borrow" | "repay" | "crosschain-collateral";