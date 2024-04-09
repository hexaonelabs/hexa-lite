export const isStableAsset = (symbol: string) => {
  const stableAssets = [
    "USDC",
    "USDT",
    "DAI",
    "BUSD",
    "TUSD",
    "sUSD",
    "USDbC",
    "FRAX",
    "LUSD",
    "PYUSD",
    "crvUSD",
    "FDUSD",
    "GHO",
  ];
  return stableAssets
    .map((a) => a.toLocaleLowerCase())
    .includes(symbol.toLocaleLowerCase());
};
