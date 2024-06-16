import { SeriesData, SeriesMarkerData } from "@/components/ui/LightChart";
import { TxInterface } from "@/interfaces/tx.interface";
import { SeriesMarker, Time } from "lightweight-charts";

export const formatTxsAsSeriemarker = (txs: TxInterface[], token: {symbol: string}): SeriesMarkerData => {
  // only `in` and `out` transfers form `symbol` token
  const filteredTxs = txs.filter((tx) => {
    return tx.attributes.transfers.some((transfer) => {
      return transfer.fungible_info.symbol === token.symbol;
    });
  });
  const serieData:SeriesMarkerData = new Map();
  serieData.set("1D", []);
  serieData.set("1W", []);
  serieData.set("1M", []);
  serieData.set("1Y", []);
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;
  const oneYear = 365 * oneDay;
  const today = now.getTime();
  const oneDayAgo = today - oneDay;
  const oneWeekAgo = today - oneWeek;
  const oneMonthAgo = today - oneMonth;
  const oneYearAgo = today - oneYear;
  filteredTxs
  
  .forEach((tx) => {
    // `tx.attributes.mined_at` as `2024-06-20`
    const txDate = new Date(tx.attributes.mined_at).getTime();
    const time = new Date(tx.attributes.mined_at).toISOString().split('T').shift()||``;
    // SeriesMarker<Time>
    const txData = {
      time,
      position: "inBar",
      // `in` as green, `out` as red
      color: tx.attributes.transfers[0].direction === "in" ? "rgb(61,214,140)" : "rgb(229,84,84)",
      shape: "circle",
      text: tx.attributes.transfers[0].direction === "in" ? "+" : "-",
      
    } as any;
    if (txDate >= oneDayAgo) {
      serieData.get("1D")?.push(txData);
    }
    if (txDate >= oneWeekAgo) {
      serieData.get("1W")?.push(txData);
    }
    if (txDate >= oneMonthAgo) {
      serieData.get("1M")?.push(txData);
    }
    if (txDate >= oneYearAgo) {
      serieData.get("1Y")?.push(txData);
    }
  });
  return serieData;
};

export const getTransactionsHistory = async (address: string): Promise<TxInterface[]> => {
  const KEY = `hexa-zerion-service-txs-${address}`;
  const cachedData = await getCachedData(KEY);
  // return fake_data for LOCAL mode
  if (process.env.NEXT_PUBLIC_APP_IS_LOCAL === 'true') {
    console.log("[INFO] LOCAL mode return fake data");
    return cachedData || [ ] as unknown as TxInterface[];
  }
  console.log("cachedData:", cachedData);
  if (cachedData) {
    return cachedData;
  }
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
    }
  };
  
  try {
    const {data} = await fetch(`https://nicolasfazio.ch/api/txs/txs.php?walletAddress=${address}`, options)
      .then(response => response.json());
    if (!data) {
      throw new Error('No data found');
    }
    await setCachedData(KEY, data);
    return data as TxInterface[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

const getCachedData = async (key: string, force?: boolean) => {
  const data = localStorage.getItem(key);
  if (!data) {
    console.log("No data in cache.");
    return null;
  }
  // check expiration cache using timestamp 10 minutes
  const parsedData = JSON.parse(data);
  if (Date.now() - parsedData.timestamp > 10 * 60 * 1000 && !force) {
    console.log("Expire cache 10 minute");
    return null;
  }
  if (Date.now() - parsedData.timestamp > 1 * 60 * 1000 && force) {
    console.log("Expire cache 1 minute");
    return null;
  }
  console.log("[INFO] {ankrFactory} data from cache: ", parsedData.data);
  return parsedData.data;
};

const setCachedData = async (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};
