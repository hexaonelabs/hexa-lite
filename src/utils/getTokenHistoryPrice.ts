import { SeriesData } from "@/components/ui/LightChart";
import { getCoingeekoTokenId } from "./getCoingeekoTokenId";

export const getTokenHistoryPrice = async (
  symbol: string, 
  intervals: ('1D' | '1W' | '1M' | '1Y')[] = ['1D','1W','1M', '1Y']
) => {
  // convert symbol to coingeeko id
  const coinId = await getCoingeekoTokenId(symbol);
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
      const result = await fetch(url)
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