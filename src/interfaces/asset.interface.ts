export interface IAsset {
  chain:
    | {
        id: number;
        value: string;
        name: string;
        nativeSymbol?: string;
      }
    | undefined;
  name: string;
  symbol: string;
  decimals: number;
  type: string;
  balance: number;
  balanceRawInteger: string;
  balanceUsd: number;
  priceUsd: number;
  thumbnail: string;
  contractAddress: string | undefined;
}