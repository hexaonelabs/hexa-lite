import { TxInterface } from "@/interfaces/tx.interface";

export const getTransactionsHistory = async (address: string) => {
  const KEY = `hexa-zerion-service-txs-${address}`;
  const cachedData = await getCachedData(KEY);
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
  
  const {data} = await fetch(`https://nicolasfazio.ch/api/txs/txs.php?walletAddress=${address}`, options)
    .then(response => response.json());
  if (!data) {
    throw new Error('No data found');
  }
  await setCachedData(KEY, data);
  return data as TxInterface[];
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
