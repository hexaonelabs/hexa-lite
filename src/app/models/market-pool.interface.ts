import { ReserveDataHumanized } from "@aave/contract-helpers";
import { FormatReserveUSDResponse } from "@aave/math-utils";

export type MarketPool = ReserveDataHumanized &
  FormatReserveUSDResponse & { 
    supplyAPYpercent: number;
    borrowAPYpercent: number;
    imageURL?: string;
   };

export interface MarketPoolGroup {
  chainIds: number[];
  pools: MarketPool[];
  symbol: string;
  imageURL?: string;
  topSupplyAPY: string;
  topBorrowAPY: string;
}