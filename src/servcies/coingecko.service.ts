import { SeriesData } from "@/components/ui/LightChart";

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

export class CoingeckoAPI {

  static options?:RequestInit = process.env.NEXT_PUBLIC_APP_IS_PROD === 'true'
  ? {
    headers: new Headers({
      'x-cg-demo-api-key': process.env.NEXT_PUBLIC_APP_COINGECKO_APIKEY
    })
  }
  : undefined;

  /**
   * Method to get Coingecko token id from symbol
   * @param symbol 
   * @returns 
   */
  static async getTokenId(symbol: string) {
    // convert symbol to coingeeko id
    const responseList = localStorage.getItem('hexa-lite-coingeeko/coinList');
    let data;
    if (responseList) {
      data = JSON.parse(responseList);
    } else {
      const fetchResponse = await fetch(`https://api.coingecko.com/api/v3/coins/list`, this.options);
      data = await fetchResponse.json();
      localStorage.setItem('hexa-lite-coingeeko/coinList', JSON.stringify(data));
    }
    const coin: {id?: string} = data.find(
      (c: any) => 
        c.symbol.toLowerCase() === symbol.toLowerCase()
        && !c.name.toLowerCase().includes('bridged')
    );
    return coin?.id;
  }

  /**
   * Method to get coin market chart data
   * @param id 
   * @param interval 
   */
  static async getTokenHistoryPrice(
    symbol: string, 
    intervals: ('1D' | '1W' | '1M' | '1Y')[] = ['1D','1W','1M', '1Y']
  ): Promise<SeriesData>{
    // convert symbol to coingeeko id
    const coinId = await CoingeckoAPI.getTokenId(symbol);
    if (!coinId) return new Map() as SeriesData;
  
    const seriesData: SeriesData = new Map();
    for (let index = 0; index < intervals.length; index++) {
      const interval = intervals[index];
  
      const responseToken = localStorage.getItem(`hexa-lite-coingeeko/coin/${coinId}/market_chart?interval=${interval}`);
      const jsonData = JSON.parse(responseToken||'{}');
      const isDeadlineReach = (Date.now() - jsonData.timestamp) > (60 * 1000 * 30);
      if (responseToken && !isDeadlineReach && jsonData.data) {
        seriesData.set(interval, jsonData.data);
      } else {
        const days = interval === '1D' ? 1 : interval === '1W' ? 7 : interval === '1M' ? 30 : 365;
        const dataInterval = interval === '1D' ? '' : interval === '1W' ? '' : interval === '1M' ? '' : '&interval=daily';
        const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}${dataInterval}`;
        const result = await fetch(url, this.options)
        .then((res) => res.json())
        .catch((error) => ({prices: []}));
        const prices = (result?.prices as number[][]||[]);
        const data = prices
        .map(([time, value]: number[]) => {
          const dataItem = {
            time: time / 1000|| "",
            value: Number(value),
          };
          return dataItem;
        })
        // remove latest element
        .slice(0, -1)
        // remove duplicates
        .filter((item, index, self) => index === self.findIndex((t) => t.time === item.time));
        seriesData.set(interval, data);
        localStorage.setItem(`hexa-lite-coingeeko/coin/${coinId}/market_chart?interval=${interval}`, JSON.stringify({
          data,
          timestamp: Date.now()
        })); 
      }
    }
    return seriesData;
  }
  /**
   * Method to get token info: description, market data, community data
   * @param symbol 
   * @returns 
   */
  static async getTokenInfo(symbol: string) {
    const tokenId = await CoingeckoAPI.getTokenId(symbol);
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
      tokenInfo = await fetch(`https://api.coingecko.com/api/v3/coins/${tokenId}?market_data=true&community_data=true`, this.options)
        .then((res) => res.json());
      localStorage.setItem(`hexa-lite-coingeeko/coin/${tokenId}/info`, JSON.stringify({
        data: tokenInfo,
        timestamp: Date.now()
      }));
    }
    return tokenInfo as TokenInfo;
  }

  /**
   * Method to get simple price of a token
   * @param id 
   * @param vs_currencies 
   * @returns 
   */
  static async getSimplePrice(id: string, vs_currencies: string) {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs_currencies}`, this.options
    );
    const json = await response.json();
    return json[id]?.[vs_currencies];
  }
}