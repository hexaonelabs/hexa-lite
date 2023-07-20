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

/**
 * Doc url: https://www.ankr.com/docs/app-chains/components/advanced-api/token-methods/#ankr_getaccountbalance
 * @param chainIds array of chain ids
 * @param address wallet address to get balances
 * @returns object with balances property that contains an array of TokenInterface
 */
export const getTokensBalances = async (chainIds: number[], address: string) => {
  const chainsList =
    chainIds.length <= 0
      ? CHAIN_AVAILABLES
      : CHAIN_AVAILABLES.filter((availableChain) =>
          chainIds.find((c) => c === availableChain.id)
        );
  const blockchain = chainsList.map((c) => c.value);
  const url = `https://rpc.ankr.com/multichain/${process.env?.REACT_APP_ANKR_APIKEY}`;
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
        onlyWhitelisted: false,
      },
      id: 1,
    }),
  };
  const res = await fetch(url, options);
  const assets = (await res.json())?.result?.assets;
  const balances = formatingTokensBalances(assets, address, chainsList);
  console.log('[INFO] {ankrFactory} getTokensBalances(): ', balances);
  return balances;
};