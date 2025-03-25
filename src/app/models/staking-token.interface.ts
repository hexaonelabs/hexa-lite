import { Token } from "@lifi/sdk";

export interface StakingToken {
  imageURL: string;
  symbol: string;
  apy: number;
  provider: string;
  from: Token[];
  to: Token[];
}