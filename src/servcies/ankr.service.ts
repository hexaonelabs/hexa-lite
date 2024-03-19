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

const formatingTokensBalances = (assets: IAnkrTokenReponse[], address: string, chainsList: IChain[]) => {
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
      contractAddress: asset.tokenType === 'NATIVE' 
      ? '0x0000000000000000000000000000000000000000' 
      : asset.contractAddress,
    }
  });
}

const getCachedData = async (key: string, force?: boolean) => {
  const data = localStorage.getItem(key);
  if (!data) {
    return null;
  }
  // check expiration cache using timestamp 10 minutes
  const parsedData = JSON.parse(data);
  if (Date.now() - parsedData.timestamp > 1000 * 10 && !force) {
    return null;
  }
  if (Date.now() - parsedData.timestamp > 1000 * 0.5 && force) {
    return null;
  }
  console.log('[INFO] {ankrFactory} data from cache: ', parsedData.data);
  return parsedData.data;
}

const setCachedData = async (key: string, data: any) => {
  localStorage
    .setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    
}

/**
 * Doc url: https://www.ankr.com/docs/app-chains/components/advanced-api/token-methods/#ankr_getaccountbalance
 * @param chainIds array of chain ids
 * @param address wallet address to get balances
 * @returns object with balances property that contains an array of TokenInterface
 */
export const getTokensBalances = async (chainIds: number[], address: string, force?: boolean) => {
  const KEY = `hexa-ankr-service-${address}`;
  if (!force) {
    const cachedData = await getCachedData(KEY);
    if (cachedData) {
      return cachedData;
    }
  }
  const APP_ANKR_APIKEY = process.env.NEXT_PUBLIC_APP_ANKR_APIKEY;
  const chainsList =
    chainIds.length <= 0
      ? CHAIN_AVAILABLES
      : CHAIN_AVAILABLES.filter((availableChain) =>
          chainIds.find((c) => c === availableChain.id)
        );
  const blockchain = chainsList
    .filter(({type})=> type === 'evm')
    .map(({value}) => value);
  const url = `https://rpc.ankr.com/multichain/${APP_ANKR_APIKEY}`;
  const options: RequestInit = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'ankr_getAccountBalance',
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
  const balances = formatingTokensBalances(assets, address, chainsList);
  console.log('[INFO] {ankrFactory} getTokensBalances(): ', balances);
  await setCachedData(KEY, balances);
  return balances;
};