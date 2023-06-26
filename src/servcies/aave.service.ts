import { EthereumTransactionTypeExtended, InterestRate, Pool, PoolBaseCurrencyHumanized, ReserveDataHumanized, UiPoolDataProvider, UserReserveData, WalletBalanceProvider } from "@aave/contract-helpers";
import { ethers } from "ethers";
import { splitSignature } from 'ethers/lib/utils';
import lendingPoolABI from '../abi/aavePool.abi.json';
import * as MARKETS from "@bgd-labs/aave-address-book";
import { FormatReserveUSDResponse, formatReserves } from "@aave/math-utils";

export const supplyWithPermit = async(ops: {
  provider: ethers.providers.Web3Provider;
  reserve: ReserveDataHumanized;
  amount: string;
  onBehalfOf?: string;
  poolAddress: string;
  gatewayAddress: string;
}) => {
  const {
    provider,
    reserve,
    amount,
    onBehalfOf,
    poolAddress,
    gatewayAddress,
  } = ops;

  const pool = new Pool(provider, {
    POOL: poolAddress,
    WETH_GATEWAY: gatewayAddress,
  });

  const signer = provider.getSigner();
  const currentAccount = await signer?.getAddress();
  const tokenAdress = reserve.underlyingAsset;
  const deadline = `${Date.now() + 3600 * 50}`;
  let dataToSign = undefined;
  let signature = undefined;
  // const lendingPoolABI = await fetch('/assets/abi/aavePool.abi.json').then((res) => res.json());
  
  //Contracts
  const poolContract = new ethers.Contract(
    poolAddress,
    lendingPoolABI,
    signer
  );

  // request signature
  try {
    const param = {
      user: currentAccount,
      reserve: tokenAdress,
      amount, // use simple amount, withouth decimals formating
      deadline,
    }
    console.log('param: ', param);
    
    dataToSign = await pool.signERC20Approval(param);
  } catch (error) {
    throw new Error('unable to sign');
  }
  console.log('dataToSign: ', dataToSign);

  if (dataToSign.length > 0) {
    try {
      signature = await provider.send('eth_signTypedData_v4', [
        currentAccount,
        dataToSign,
      ]);
    } catch (error) {
      console.log('error: ', error);
      
    }
  }

  console.log('signature: ', signature);

  // formmating signature
  const sig = splitSignature(signature);
  console.log('sig: ', sig);

  // call supplyWithPermit
  const supplyTx = await poolContract.functions['supplyWithPermit'](
    tokenAdress,
    `${+amount * Math.pow(10, reserve.decimals)}`,
    onBehalfOf || currentAccount,
    '0',
    deadline,
    sig.v,
    sig.r,
    sig.s
  );
  console.log('supplyTx: ', supplyTx);
  try {
    console.log(`Transaction mined succesfully: ${supplyTx.hash}`);
    return await supplyTx.wait();
  } catch (error) {
    console.log(`Transaction failed with error: ${error}`);
    throw new Error('Transaction failed');
  }
}

export const borrow = async(ops: {
  provider: ethers.providers.Web3Provider;
  reserve: ReserveDataHumanized;
  amount: string;
  onBehalfOf?: string;
  poolAddress: string;
  gatewayAddress: string;
}) => {
  const {
    provider,
    reserve,
    amount,
    onBehalfOf,
    poolAddress,
    gatewayAddress,
  } = ops;

  const pool = new Pool(provider, {
    POOL: poolAddress,
    WETH_GATEWAY: gatewayAddress,
  });

  console.log('pool: ', pool);
  
  const signer = provider.getSigner();
  const currentAccount = await signer?.getAddress();

  const result = await pool.borrow({
    user: currentAccount,
    reserve: reserve.underlyingAsset,
    amount,
    onBehalfOf: onBehalfOf || currentAccount, 
    interestRateMode: InterestRate.Variable,

  });
  return result;
}

export const submitTransaction = async (ops: {
  provider: ethers.providers.Web3Provider,  // Signing transactions requires a wallet provider
  tx: EthereumTransactionTypeExtended
}) =>{
  const { provider, tx } = ops;
  const extendedTxData = await tx.tx();
  const { from, ...txData } = extendedTxData;
  const signer = provider.getSigner(from);
  const txResponse = await signer.sendTransaction({
    ...txData,
    value: txData.value || undefined,
    // value: txData.value ? BigNumber.from(txData.value) : undefined,
  });
  return txResponse;
}

export const getMarkets = (chainId: number) => {
  switch (true) {
    case chainId === 1:
      return MARKETS.AaveV3Ethereum;
    case chainId === 5:
      return MARKETS.AaveV3Goerli;
    case chainId === 137:
      return MARKETS.AaveV3Polygon;
    case chainId === 80001:
      return MARKETS.AaveV3Mumbai;
    case chainId === 43113:
      return MARKETS.AaveV3Fuji;
    case chainId === 42170:
      return MARKETS.AaveV3Arbitrum;
    case chainId === 421613:
      return MARKETS.AaveV3ArbitrumGoerli;
    default:
      throw new Error("ChainId not supported");
  }
};

export const getWalletBalance = async (ops: {
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider;
  market: MARKETTYPE;
  user: string|null;
})=> {
    const { provider, market, user } = ops;
    // get current network id from ethter provider
    const network = (await provider?.getNetwork()) || { chainId: 1 };
    // get id
    const networkId = network?.chainId;
    // View contract used to fetch all reserves data (including market base currency data), and user reserves
    // Using Aave V3 Eth Mainnet address for demo
    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: market.UI_POOL_DATA_PROVIDER,
      provider,
      chainId: networkId,
    });
    const reserves = await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider: market.POOL_ADDRESSES_PROVIDER,
    });
    const reservesArray = reserves.reservesData;
    const baseCurrencyData = reserves.baseCurrencyData;
    const currentTimestamp = Date.now();

    const formattedPoolReserves = formatReserves({
      reserves: reservesArray,
      currentTimestamp,
      marketReferenceCurrencyDecimals:
        baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd:
        baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    });

    // const userReserves = await poolDataProviderContract.getUserReservesHumanized({
    //   lendingPoolAddressProvider: market.POOL_ADDRESSES_PROVIDER,
    //   user,
    // });


    console.log(
      "[INFO] {{AAVEService}} formattedPoolReserves: ",
      formattedPoolReserves
    );
    // Get user wallet balances for all tokens in the lending pool
    const walletBallance = new WalletBalanceProvider({
      provider,
      walletBalanceProviderAddress: market.WALLET_BALANCE_PROVIDER,
    });
    const userWalletDatas = !user
      ? []
      : await walletBallance.getUserWalletBalancesForLendingPoolProvider(
          user,
          market.POOL_ADDRESSES_PROVIDER
        );
    // Humanize user wallet array data
    const tokenAddress = userWalletDatas[0] || [];
    const bigNumberValues = userWalletDatas[1];
    const walletbalancesByPools = tokenAddress?.map((address, i) => {
      const pool =
        formattedPoolReserves?.find((poolReserve) => {
          return (
            poolReserve.underlyingAsset?.toUpperCase() ===
            address?.toUpperCase()
          );
        }) || ({} as ReserveDataHumanized & FormatReserveUSDResponse);
      return {
        ...pool,
        tokenAddress: address,
        tokenBalance: bigNumberValues?.[i] || 0,
        // convert  bigNumberValues[i] to human readable format
        balance: bigNumberValues
          ? ethers.utils.formatUnits(bigNumberValues[i], pool.decimals)
          : 0,
      };
    });
    console.log(
      "[INFO] {{AAVEService}} formattedPoolReserves: ",
      formattedPoolReserves
    );
    // const userData = await formatUserSummaryAndIncentives({
    //   currentTimestamp,
    //   baseCurrencyData,
    //   reservesData: reservesArray,
    //   userReserves
    // })
    return formattedPoolReserves;
}

export const formatUserSummaryAndIncentives = async (ops: {
  reservesData: ReserveDataHumanized[];
  baseCurrencyData: PoolBaseCurrencyHumanized;
  userReserves: UserReserveData[];
  currentTimestamp: number;
}) => {

  const { reservesData, baseCurrencyData, userReserves, currentTimestamp } = ops;

  // const formattedPoolReserves = formatReserves({
  //   reserves: reservesData,
  //   currentTimestamp,
  //   marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
  //   marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  // });

  /*
  - @param `currentTimestamp` Current UNIX timestamp in seconds, Math.floor(Date.now() / 1000)
  - @param `marketReferencePriceInUsd` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferencePriceInUsd`
  - @param `marketReferenceCurrencyDecimals` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferenceCurrencyDecimals`
  - @param `userReserves` Input from [Fetching Protocol Data](#fetching-protocol-data), combination of `userReserves.userReserves` and `reserves.reservesArray`
  - @param `userEmodeCategoryId` Input from [Fetching Protocol Data](#fetching-protocol-data), `userReserves.userEmodeCategoryId`
  - @param `reserveIncentives` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserveIncentives`
  - @param `userIncentives` Input from [Fetching Protocol Data](#fetching-protocol-data), `userIncentives`
  */
  const formatedUserSummaryAndIncentives: any = formatUserSummaryAndIncentives({
    currentTimestamp,
    baseCurrencyData,
    userReserves,
    reservesData
  });

  return {formatedUserSummaryAndIncentives};
}


export type MARKETTYPE =
| typeof MARKETS.AaveV3Ethereum
| typeof MARKETS.AaveV3Goerli
| typeof MARKETS.AaveV3Polygon
| typeof MARKETS.AaveV3Mumbai
| typeof MARKETS.AaveV3Fuji
| typeof MARKETS.AaveV3Avalanche
| typeof MARKETS.AaveV3Arbitrum
| typeof MARKETS.AaveV3ArbitrumGoerli
| typeof MARKETS.AaveV3Optimism
| typeof MARKETS.AaveV3ArbitrumGoerli;