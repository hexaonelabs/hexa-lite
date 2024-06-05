import { TxInterface } from "@/interfaces/tx.interface";

export const getTransactionsHistory = async (address: string): Promise<TxInterface[]> => {
  const KEY = `hexa-zerion-service-txs-${address}`;
  const cachedData = await getCachedData(KEY);
  // return fake_data for LOCAL mode
  if (process.env.NEXT_PUBLIC_APP_IS_LOCAL) {
    console.log("[INFO] LOCAL mode return fake data");
    return cachedData || [{
      attributes: {
        application_metadata: {
          name: "Ethereum",
          symbol: "ETH",
          decimals: 18,
          method: "transfer",
        },
        sent_from: '0x',
        sent_to: '0x',
        transfers: [
          {
            direction: 'outgoing',
            price: 1,
            quantity: 10,
          }
        ]
      }
    }];
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
