import { getCoingeekoTokenId } from "./getCoingeekoTokenId";

export type TokenInfo = {
  description: {en: string};
  categories: string[];
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_data: {
    ath: {usd: number};
    ath_change_percentage: {usd: number};
    ath_date: { usd: string };
    atl: {usd: number};
    atl_change_percentage: {usd: number};
    atl_date: { usd: string };
    circulating_supply: number;
    current_price: { usd: number };
    fully_diluted_valuation: { usd: number };
    high_24h: { usd: number };
    last_updated: string;
    low_24h: { usd: number };
    market_cap: { usd: number };
    market_cap_change_24h: number;
    market_cap_change_24h_in_currency: { usd: number };
    market_cap_change_percentage_24h: number;
    market_cap_change_percentage_24h_in_currency: { usd: number };
    market_cap_fdv_ratio: number;
    market_cap_rank: number;
    max_supply: number;
    price_change_24h: number;
    price_change_24h_in_currency: { usd: number };
    price_change_percentage_1h_in_currency: { usd: number };
    price_change_percentage_1y_in_currency: { usd: number };
    price_change_percentage_7d_in_currency: { usd: number };
    price_change_percentage_14d_in_currency: { usd: number };
    price_change_percentage_24h_in_currency: { usd: number };
    price_change_percentage_30d_in_currency: { usd: number };
    price_change_percentage_60d_in_currency: { usd: number };
    price_change_percentage_200d_in_currency: { usd: number };
    total_supply: number;
    total_value_locked: number|null;
    total_volume: { usd: number };
  };
  sentiment_votes_down_percentage: number;
  sentiment_votes_up_percentage: number;
  
};

export const getTokenInfo = async (symbol: string) => {
  const tokenId = await getCoingeekoTokenId(symbol);
  if (!tokenId) return undefined;
  // check localstorage if data is stored from less than 1 day
  const response = localStorage.getItem(`hexa-lite-coingeeko/coin/${tokenId}/info`);
  const jsonData = JSON.parse(response||'{}');
  const isDeadlineReach = (Date.now() - jsonData.timestamp) > (60 * 1000 * 60 * 24);
  let tokenInfo;
  if (response && !isDeadlineReach && jsonData.data) {
    tokenInfo = jsonData.data;
  } else {
    // fetch data from coingecko
    tokenInfo = await fetch(`https://api.coingecko.com/api/v3/coins/${tokenId}?market_data=true&community_data=true`)
      .then((res) => res.json());
    localStorage.setItem(`hexa-lite-coingeeko/coin/${tokenId}/info`, JSON.stringify({
      data: tokenInfo,
      timestamp: Date.now()
    }));
  }
  return tokenInfo as TokenInfo;
}