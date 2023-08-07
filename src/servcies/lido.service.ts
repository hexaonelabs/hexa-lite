export const getBaseAPRstETH = async (signal?: AbortSignal) => {
  const response = await fetch(
    "https://eth-api.lido.fi/v1/protocol/steth/apr/sma",
    { signal }
  );
  const { data } = await response.json();
  const { smaApr: apr } = data as { smaApr: number };
  return { apr };
};

export const getETHByWstETH = async (
  wstAmount: number,
  signal?: AbortSignal
) => {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=wrapped-steth&vs_currencies=eth",
    { signal }
  );
  const json = await response.json();
  const ethAmount = json["wrapped-steth"].eth * wstAmount;
  return ethAmount;
};
