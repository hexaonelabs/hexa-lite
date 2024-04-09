import { IAsset } from "@/interfaces/asset.interface";
import { IChain, CHAIN_AVAILABLES } from "../constants/chains";

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

const fake_data = [
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
