import { getChains } from "@lifi/sdk";
import { arbitrum, base, Chain, mainnet, optimism, polygon, scroll } from "viem/chains";

export const DEFAULT_CHAIN = {
  ...optimism,
  imgURL: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/optimism.svg'
};
export const AVAILABLE_CHAINS: (Chain & {imgURL: string | undefined})[] = [
  DEFAULT_CHAIN, 
  {...arbitrum, imgURL: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg'}, 
  {...base, imgURL: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/base.svg'}, 
  {...mainnet, imgURL:'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg'}, 
  {...polygon, imgURL: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/polygon.svg'}, 
  {...scroll, imgURL: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/scroll.png'},
];

export const calculateAmountOfFormToken = (
  fromToken: { priceUSD: string },
  finalAmountUSD: number
) => {
  const fromTokenPriceUSD = Number(fromToken.priceUSD);
  // Calculate the amount of fromToken needed to pay finalAmountUSD
  const fromTokenAmount = finalAmountUSD / fromTokenPriceUSD;
  return fromTokenAmount;
}

// Add or remove the "ion-palette-dark" class on the html element
export const toggleDarkPalette = (shouldAdd: boolean) => {
  document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  localStorage.setItem('theme', shouldAdd ? 'dark' : 'light');
}

export const getBaseAPRstETH = async (signal?: AbortSignal) => {
  const response = await fetch(
    "https://eth-api.lido.fi/v1/protocol/steth/apr/sma",
    { signal }
  );
  const { data } = await response.json();
  const { smaApr: apr } = data as { smaApr: number };
  return { apr };
};

export const getBaseAPRstMATIC = async (signal?: AbortSignal) => {
  const response = await fetch(
    "https://pol-api-pub.lido.fi/stats",
    { signal }
  );
  const { apr } = await response.json();
  return { apr };
};