import { IAsset } from "@/interfaces/asset.interface";
import { IChain, CHAIN_AVAILABLES } from "../constants/chains";
import { TxInterface } from "@/interfaces/tx.interface";

interface IAnkrTokenReponse {
  blockchain: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenType: string;
  holderAddress: string;
  balance: string;
  balanceRawInteger: string;
  balanceUsd: string;
  tokenPrice: string;
  thumbnail: string;
  contractAddress?: string;
}

interface AnkrTransactionResponseInterface {
  v: string;
  r: string;
  s: string;
  nonce: string;
  blockNumber: string;
  from: string;
  to: string;
  gas: string;
  gasPrice: string;
  input: string;
  transactionIndex: string;
  blockHash: string;
  value: string;
  type: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  hash: string;
  status: string;
  blockchain: string;
  timestamp: string;
}

const fake_data = [
  {
    blockchain: "sepolia",
    tokenName: "Link",
    tokenSymbol: "LINK",
    tokenDecimals: 18,
    tokenType: "ERC20",
    holderAddress: "0x475ef9fb4f8d43b63ac9b22fa41fd4db8a103550",
    contractAddress: "0xf8fb3713d459d7c1018bd0a49d19b4c44290ebe5",
    balance: "100",
    balanceRawInteger: "100000000000000000000",
    balanceUsd: "2000",
    tokenPrice: "20",
    thumbnail: "",
  },
  {
    blockchain: "optimism",
    tokenName: "Ether",
    tokenSymbol: "ETH",
    tokenDecimals: 18,
    tokenType: "NATIVE",
    holderAddress: "0x475ef9fb4f8d43b63ac9b22fa41fd4db8a103550",
    balance: "0.001942681537656218",
    balanceRawInteger: "1942681537656218",
    balanceUsd: "7.097286526117426483",
    tokenPrice: "3.282317948340073075",
    thumbnail: "https://ankrscan.io/assets/blockchains/eth.svg",
  },
  {
    blockchain: "optimism",
    tokenName: "Aave Optimism wstETH",
    tokenSymbol: "aOptwstETH",
    tokenDecimals: 18,
    tokenType: "ERC20",
    contractAddress: "0xc45a479877e1e9dfe9fcd4056c699575a1045daa",
    holderAddress: "0x475ef9fb4f8d43b63ac9b22fa41fd4db8a103550",
    balance: "0.000408917159923751",
    balanceRawInteger: "408917159923751",
    balanceUsd: "0",
    tokenPrice: "0",
    thumbnail: "",
  },
];

const formatingTokensBalances = (
  assets: IAnkrTokenReponse[],
  chainsList: IChain[]
): IAsset[] => {
  return assets.map((asset) => {
    return {
      chain: chainsList.find((c) => c.value === asset.blockchain),
      name: asset.tokenName,
      symbol: asset.tokenSymbol,
      decimals: asset.tokenDecimals,
      type: asset.tokenType,
      balance: parseFloat(
        (Number(asset.balanceRawInteger) / 10 ** asset.tokenDecimals).toString()
      ),
      balanceRawInteger: asset.balanceRawInteger,
      balanceUsd: Number(asset.balanceUsd),
      priceUsd: Number(asset.tokenPrice),
      thumbnail: asset.thumbnail,
      contractAddress:
        asset.tokenType === "NATIVE"
          ? "0x0000000000000000000000000000000000000000"
          : asset.contractAddress,
    };
  });
};

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

/**
 * Doc url: https://www.ankr.com/docs/app-chains/components/advanced-api/token-methods/#ankr_getaccountbalance
 * @param chainIds array of chain ids
 * @param address wallet address to get balances
 * @returns object with balances property that contains an array of TokenInterface
 */
export const getTokensBalances = async (
  chainIds: number[],
  address: string,
  force?: boolean
): Promise<IAsset[]> => {
  const chainsList =
    chainIds.length <= 0
      ? CHAIN_AVAILABLES
      : CHAIN_AVAILABLES.filter((availableChain) =>
          chainIds.find((c) => c === availableChain.id)
        );
  // return fake_data for DEV mode
  if (process.env.NEXT_PUBLIC_APP_IS_PROD === "false") {
    console.log("[INFO] DEV mode return fake data");
    const balances = formatingTokensBalances(fake_data, chainsList);
    return balances;
  }
  const KEY = `hexa-ankr-service-${address}`;
  const cachedData = await getCachedData(KEY, force);
  console.log("cachedData:", cachedData);
  if (cachedData) {
    return cachedData;
  }
  const APP_ANKR_APIKEY = process.env.NEXT_PUBLIC_APP_ANKR_APIKEY;
  const blockchain = chainsList
    .filter(({ type }) => type === "evm")
    .map(({ value }) => value);
  const url = `https://rpc.ankr.com/multichain/${APP_ANKR_APIKEY}`;
  const options: RequestInit = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "ankr_getAccountBalance",
      params: {
        blockchain,
        walletAddress: address,
        onlyWhitelisted: true,
      },
      id: 1,
    }),
  };
  const res = await fetch(url, options);
  const assets = (await res.json())?.result?.assets;
  const balances = formatingTokensBalances(assets, chainsList);
  console.log("[INFO] {ankrFactory} getTokensBalances(): ", balances);
  await setCachedData(KEY, balances);
  return balances;
};

// export const getTransactionsHistory = async (
//   chainIds: number[],
//   address: string
// ) => {
//   const KEY = `hexa-ankr-service-txs-${address}`;
//   const cachedData = await getCachedData(KEY);
//   console.log("cachedData:", cachedData);
//   if (cachedData) {
//     return cachedData;
//   }
//   const url = `https://rpc.ankr.com/multichain/${process.env.NEXT_PUBLIC_APP_ANKR_APIKEY}/?ankr_getTransactionsByAddress=`;
//   const blockchain = CHAIN_AVAILABLES
//     .filter(({testnet}) => !testnet)
//     .filter(({ type }) => type === "evm")
//     .map(({ value }) => value);
//   // fromTimestamp = Beginning of a time period starting 30 days ago. UNIX timestamp.
//   const fromTimestamp = Math.floor(Date.now() / 10000) - 30 * 24 * 60 * 60;
//   const toTimestamp = Math.floor(Date.now() / 1000);
//   const options: RequestInit = {
//     method: "POST",
//     headers: {
//       accept: "application/json",
//       "content-type": "application/json",
//     },
//     body: JSON.stringify({
//       jsonrpc: "2.0",
//       method: "ankr_getTransactionsByAddress",
//       params: {
//         blockchain,
//         address: [address],
//         fromTimestamp,
//         toTimestamp,
//         descOrder: true,
//       },
//       id: 1,
//     }),
//   };
//   const res = await fetch(url, options);
//   const transactions: AnkrTransactionResponseInterface[] =
//     (await res.json())?.result?.transactions || [];
//   // convert transaction.timestamp to Date
//   const txs: TxInterface[] = transactions.map((tx) => {
//     return {
//       ...tx,
//       blockNumber: parseInt(tx.blockNumber),
//       cumulativeGasUsed: parseInt(tx.cumulativeGasUsed),
//       gas: parseInt(tx.gas),
//       gasPrice: parseInt(tx.gasPrice),
//       gasUsed: parseInt(tx.gasUsed),
//       nonce: parseInt(tx.nonce),
//       status: parseInt(tx.status),
//       timestamp: new Date(parseInt(tx.timestamp) * 1000)
//     };
//   });
//   await setCachedData(KEY, txs);
//   console.log("[INFO] {ankrFactory} getTransactionsHistory(): ", txs);
//   return txs;
// };
