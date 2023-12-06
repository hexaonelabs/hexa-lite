import {
  EthereumTransactionTypeExtended,
  InterestRate,
  Pool,
  ReserveDataHumanized,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
  WalletBalanceProvider,
} from "@aave/contract-helpers";
import { ethers } from "ethers";
import { splitSignature } from "ethers/lib/utils";
import lendingPoolABI from "../abi/aavePool.abi.json";
import * as MARKETS from "@bgd-labs/aave-address-book";
import {
  FormatReserveUSDResponse,
  formatReserves,
  formatUserSummary,
  formatUserSummaryAndIncentives,
} from "@aave/math-utils";
import { ChainId } from "@aave/contract-helpers";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { IReserve, IUserSummary } from "../interfaces/reserve.interface";

const submitTransaction = async (ops: {
  provider: ethers.providers.Web3Provider; // Signing transactions requires a wallet provider
  tx: EthereumTransactionTypeExtended;
}) => {
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
};

/**
 * Loop through txs and submit each one by one waiting for confirmation befor looping to the next
 * @param ops 
 * @returns 
 */
const submitMultiplesTransaction = async (ops: {
  provider: ethers.providers.Web3Provider; // Signing transactions requires a wallet provider
  txs: EthereumTransactionTypeExtended[];
}) => {
  const { provider, txs } = ops;
  let txResponses: ethers.providers.TransactionResponse[] = [];
  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    console.log("submit tx: ", i, tx);
    const txResponse = await submitTransaction({
      provider,
      tx,
    });
    txResponses.push(txResponse);
  }
  return txResponses;
};

export const fetchTVL = async () => {
  const response = await fetch("https://api.llama.fi/tvl/aave");
  const data = await response.json();
  console.log("[INFO] {{AAVEService}} fetchTVL: ", data);
  return data;
};

export const supply = async (ops: {
  provider: ethers.providers.Web3Provider;
  reserve: IReserve;
  amount: string;
  onBehalfOf?: string;
  poolAddress: string;
  gatewayAddress: string;
}) => {
  const { provider, reserve, amount, onBehalfOf, poolAddress, gatewayAddress } =
    ops;
  const pool = new Pool(provider, {
    POOL: poolAddress,
    WETH_GATEWAY: gatewayAddress,
  });
  const signer = provider.getSigner();
  const user = await signer?.getAddress();
  const tokenAdress = reserve.underlyingAsset;
  let txs: EthereumTransactionTypeExtended[];
  try {
    txs = await pool.supply({
      user,
      reserve: tokenAdress,
      amount,
      onBehalfOf,
    });
  } catch (error) {
    console.log('aprouval suit..........');
    throw error;
  }
  console.log("txs: ", txs);
  const txResponses: ethers.providers.TransactionResponse[] = await submitMultiplesTransaction({
    provider,
    txs,
  });
  console.log("result: ", txResponses);
  const txReceipts = await Promise.all(txResponses.map((tx) => tx.wait()));
  console.log("txReceipts: ", txReceipts);
  return txReceipts;
};

export const supplyWithPermit = async (ops: {
  provider: ethers.providers.Web3Provider;
  reserve: IReserve;
  amount: string;
  onBehalfOf?: string;
  poolAddress: string;
  gatewayAddress: string;
}) => {
  const { provider, reserve, amount, onBehalfOf, poolAddress, gatewayAddress } =
    ops;
  const pool = new Pool(provider, {
    POOL: poolAddress,
    WETH_GATEWAY: gatewayAddress,
  });
  // handle incorrect network
  const network = await provider.getNetwork();
  if (network.chainId !== reserve.chainId) {
    throw new Error(
      `Incorrect network, please switch to ${CHAIN_AVAILABLES.find(
        (c) => c.id === reserve.chainId
      )?.name}`
    );
  }
  const signer = provider.getSigner();
  const user = await signer?.getAddress();
  const tokenAdress = reserve.underlyingAsset;
  // create timestamp of 10 minutes from now
  const deadline = `${new Date().setMinutes(new Date().getMinutes() + 10)}`;

  const isTestnet = provider.network?.chainId === 5 || provider.network?.chainId === 80001 || false;
  const havePermitConfig =
    permitByChainAndToken[network.chainId]?.[tokenAdress] || false;
  if (!havePermitConfig || isTestnet) {
    console.log("no permit config: ", { havePermitConfig, isTestnet });
    const txReceipts = await supply(ops);
    return txReceipts;
  }
  const dataToSign: string = await pool.signERC20Approval({
    user,
    reserve: tokenAdress,
    amount,
    deadline,
  });
  console.log("dataToSign: ", dataToSign);

  const signature = await provider.send("eth_signTypedData_v4", [
    user,
    dataToSign,
  ]);
  console.log("signature: ", signature);

  const txs: EthereumTransactionTypeExtended[] = await pool.supplyWithPermit({
    user,
    reserve: tokenAdress,
    amount,
    signature,
    onBehalfOf,
    deadline,
  });
  console.log("txs: ", txs);

  const txResponses: ethers.providers.TransactionResponse[] = await submitMultiplesTransaction({
    provider,
    txs,
  });
  console.log("result: ", txResponses);
  const txReceipts = await Promise.all(txResponses.map((tx) => tx.wait()));
  return txReceipts;
};

export const withdraw = async (ops: {
  provider: ethers.providers.Web3Provider;
  reserve: ReserveDataHumanized;
  amount: string;
  onBehalfOf?: string;
  poolAddress: string;
  gatewayAddress: string;
}) => {
  const { provider, reserve, amount, onBehalfOf, poolAddress, gatewayAddress } =
    ops;

  const pool = new Pool(provider, {
    POOL: poolAddress,
    WETH_GATEWAY: gatewayAddress,
  });

  const signer = provider.getSigner();
  const user = await signer?.getAddress();

  /*
  - @param `user` The ethereum address that will make the deposit 
  - @param `reserve` The ethereum address of the reserve 
  - @param `amount` The amount to be deposited 
  - @param `aTokenAddress` The aToken to redeem for underlying asset
  - @param @optional `onBehalfOf` The ethereum address for which user is depositing. It will default to the user address
  */
  const txs: EthereumTransactionTypeExtended[] = await pool.withdraw({
    user,
    reserve: reserve.underlyingAsset,
    amount,
    aTokenAddress: reserve.aTokenAddress,
    onBehalfOf,
  });

  const txResponses: ethers.providers.TransactionResponse[] = await submitMultiplesTransaction({
    provider,
    txs,
  });
  console.log("result: ", txResponses);
  return await Promise.all(txResponses.map((tx) => tx.wait()));
};

export const borrow = async (ops: {
  provider: ethers.providers.Web3Provider;
  reserve: {underlyingAsset: string;};
  amount: string;
  onBehalfOf?: string;
  poolAddress: string;
  gatewayAddress: string;
}) => {
  const { provider, reserve, amount, onBehalfOf, poolAddress, gatewayAddress } =
    ops;

  const pool = new Pool(provider, {
    POOL: poolAddress,
    WETH_GATEWAY: gatewayAddress,
  });

  console.log("pool: ", pool);

  const signer = provider.getSigner();
  const currentAccount = await signer?.getAddress();

  const txs = await pool.borrow({
    user: currentAccount,
    reserve: reserve.underlyingAsset,
    amount,
    onBehalfOf: onBehalfOf || currentAccount,
    interestRateMode: InterestRate.Variable,
  });
  console.log("txs: ", txs);

  const txResponses: ethers.providers.TransactionResponse[] = await submitMultiplesTransaction({
    provider,
    txs,
  });
  console.log("result: ", txResponses);

  const txReceipts = await Promise.all(txResponses.map(async(tx) => (await tx.wait())));
  return txReceipts;
};

export const repay = async (ops: {
  provider: ethers.providers.Web3Provider;
  reserve: ReserveDataHumanized;
  amount: string;
  onBehalfOf?: string;
  poolAddress: string;
  gatewayAddress: string;
}) => {
  const { provider, reserve, amount, onBehalfOf, poolAddress, gatewayAddress } =
    ops;

  const pool = new Pool(provider, {
    POOL: poolAddress,
    WETH_GATEWAY: gatewayAddress,
  });

  console.log("pool: ", pool);

  const signer = provider.getSigner();
  const currentAccount = await signer?.getAddress();

  const txs = await pool.repay({
    user: currentAccount,
    reserve: reserve.underlyingAsset,
    amount,
    interestRateMode: InterestRate.Variable,
    onBehalfOf,
  });
  console.log("txs: ", txs);

  const txResponses: ethers.providers.TransactionResponse[] = await submitMultiplesTransaction({
    provider,
    txs,
  });
  console.log("result: ", txResponses);

  const txReceipts = await Promise.all(txResponses.map((tx) => tx.wait()));
  return txReceipts;
};

export const getMarkets = (chainId: number) => {
  switch (true) {
    case chainId === MARKETS.AaveV3Ethereum.CHAIN_ID:
      return MARKETS.AaveV3Ethereum;
    case chainId === MARKETS.AaveV3Polygon.CHAIN_ID:
      return MARKETS.AaveV3Polygon;
    case chainId === MARKETS.AaveV3Mumbai.CHAIN_ID:
      return MARKETS.AaveV3Mumbai;
    case chainId === MARKETS.AaveV3Fuji.CHAIN_ID:
      return MARKETS.AaveV3Fuji;
    case chainId === MARKETS.AaveV3Arbitrum.CHAIN_ID:
      return MARKETS.AaveV3Arbitrum;
    case chainId === MARKETS.AaveV3ArbitrumGoerli.CHAIN_ID:
      return MARKETS.AaveV3ArbitrumGoerli;
    case chainId === MARKETS.AaveV3Optimism.CHAIN_ID:
      return MARKETS.AaveV3Optimism;
    case chainId === MARKETS.AaveV3Avalanche.CHAIN_ID:
      return MARKETS.AaveV3Avalanche;
    default:
      throw new Error(`ChainId ${chainId} not supported`);
  }
};

export const getPools = async (ops: {
  // provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider;
  market: MARKETTYPE;
  currentTimestamp: number;
}) => {
  const { market, currentTimestamp } = ops;
  const chainId = market.CHAIN_ID;
  const provider = new ethers.providers.JsonRpcProvider(
    CHAIN_AVAILABLES.find((c) => c.id === chainId)?.rpcUrl||''
  );
  // View contract used to fetch all reserves data (including market base currency data), and user reserves
  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: market.UI_POOL_DATA_PROVIDER,
    provider,
    chainId,
  });
  const { reservesData: reserves, baseCurrencyData } =
    await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider: market.POOL_ADDRESSES_PROVIDER,
    });
  const {
    marketReferenceCurrencyDecimals,
    marketReferenceCurrencyPriceInUsd: marketReferencePriceInUsd,
  } = baseCurrencyData;

  const formattedPoolReserves = formatReserves({
    reserves,
    currentTimestamp,
    marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd,
  });
  return formattedPoolReserves.filter((pool) => pool.isActive && !pool.isFrozen);
};

export const getUserSummary = async (ops: {
  market: MARKETTYPE;
  user: string;
  currentTimestamp: number;
}) => {
  const { market, user, currentTimestamp } = ops;
  const chainId = market.CHAIN_ID;
  const provider = new ethers.providers.JsonRpcProvider(
    CHAIN_AVAILABLES.find((c) => c.id === chainId)?.rpcUrl||''
  );
  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: market.UI_POOL_DATA_PROVIDER,
    provider,
    chainId,
  });
  const { baseCurrencyData, reservesData: reserves } =
    await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider: market.POOL_ADDRESSES_PROVIDER,
    });
  const { userReserves, userEmodeCategoryId } =
    await poolDataProviderContract.getUserReservesHumanized({
      lendingPoolAddressProvider: market.POOL_ADDRESSES_PROVIDER,
      user,
    });

  const formattedPoolReserves = formatReserves({
    reserves,
    currentTimestamp,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd:
      baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  });

  /*
  - @param `currentTimestamp` Current UNIX timestamp in seconds, Math.floor(Date.now() / 1000)
  - @param `marketReferencePriceInUsd` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferencePriceInUsd`
  - @param `marketReferenceCurrencyDecimals` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferenceCurrencyDecimals`
  - @param `userReserves` Input from [Fetching Protocol Data](#fetching-protocol-data), combination of `userReserves.userReserves` and `reserves.reservesArray`
  - @param `userEmodeCategoryId` Input from [Fetching Protocol Data](#fetching-protocol-data), `userReserves.userEmodeCategoryId`
  */
  const userSummary = formatUserSummary({
    currentTimestamp,
    marketReferencePriceInUsd:
      baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves,
    formattedReserves: formattedPoolReserves,
    userEmodeCategoryId: userEmodeCategoryId,
  });
  console.log(`[INFO] {{AAVEService}} userSummary: `, {userSummary});
  return userSummary;
};

export const getContractData = async (ops: {
  market: MARKETTYPE;
  user: string;
}) => {
  const { market, user } = ops;
  const chainId = market.CHAIN_ID;
  const provider = new ethers.providers.JsonRpcProvider(
    CHAIN_AVAILABLES.find((c) => c.id === chainId)?.rpcUrl||''
  );
  // View contract used to fetch all reserves data (including market base currency data), and user reserves
  // Using Aave V3 Eth Mainnet address for demo
  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: market.UI_POOL_DATA_PROVIDER,
    provider,
    chainId: market.CHAIN_ID,
  });

  // View contract used to fetch all reserve incentives (APRs), and user incentives
  // Using Aave V3 Eth Mainnet address for demo
  const incentiveDataProviderContract = new UiIncentiveDataProvider({
    uiIncentiveDataProviderAddress: market.UI_INCENTIVE_DATA_PROVIDER,
    provider,
    chainId: ChainId.mainnet,
  });

  // Object containing array of pool reserves and market base currency data
  // { reservesArray, baseCurrencyData }
  const reserves = await poolDataProviderContract.getReservesHumanized({
    lendingPoolAddressProvider: market.POOL_ADDRESSES_PROVIDER,
  });

  // Array of incentive tokens with price feed and emission APR
  const reserveIncentives =
    await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
      lendingPoolAddressProvider: market.POOL_ADDRESSES_PROVIDER,
    });

  let userReserves = null;
  let userIncentives = null;
  if (user) {
    // Object containing array or users aave positions and active eMode category
    // { userReserves, userEmodeCategoryId }
    userReserves = await poolDataProviderContract.getUserReservesHumanized({
      lendingPoolAddressProvider: market.POOL_ADDRESSES_PROVIDER,
      user,
    });
    // Dictionary of claimable user incentives
    userIncentives =
      await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized(
        {
          lendingPoolAddressProvider: market.POOL_ADDRESSES_PROVIDER,
          user,
        }
      );
  }
  console.log({ reserves, userReserves, reserveIncentives, userIncentives });
  return { reserves, userReserves, reserveIncentives, userIncentives };
};

const getWalletBalance = async (ops: {
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider;
  market: MARKETTYPE;
  user: string | null;
  currentTimestamp: number;
}) => {
  const { provider, market, user, currentTimestamp } = ops;
  const networkId = market.CHAIN_ID;
  // View contract used to fetch all reserves data (including market base currency data), and user reserves
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

  const formattedPoolReserves = formatReserves({
    reserves: reservesArray,
    currentTimestamp,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd:
      baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  });

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
          poolReserve.underlyingAsset?.toUpperCase() === address?.toUpperCase()
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
};

export const getUserSummaryAndIncentives = async (ops: {
  market: MARKETTYPE;
  currentTimestamp: number;
  user: string;
}): Promise<IUserSummary|null> => {
  const { currentTimestamp } = ops;
  const { reserveIncentives, reserves, userIncentives, userReserves } =
    await getContractData(ops);
  if (!userReserves || !userIncentives) {
    throw new Error("userReserves or userIncentives not found");
  }
  const reservesArray = reserves.reservesData;
  const baseCurrencyData = reserves.baseCurrencyData;
  const userReservesArray = userReserves.userReserves;

  const formattedPoolReserves = formatReserves({
    reserves: reservesArray,
    currentTimestamp,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd:
      baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  });

  const formatedUserSummaryAndIncentives = formatUserSummaryAndIncentives({
    currentTimestamp,
    marketReferencePriceInUsd:
      baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves: userReservesArray,
    formattedReserves: formattedPoolReserves,
    reserveIncentives,
    userIncentives,
    userEmodeCategoryId: userReserves.userEmodeCategoryId,
  });

  return {
    ...formatedUserSummaryAndIncentives,
    userReservesData: formatedUserSummaryAndIncentives.userReservesData.filter(
      ({reserve}) => reserve.isActive && !reserve.isFrozen
    ),
    chainId: ops.market.CHAIN_ID,
  };
};

// deprecated
export const supplyWithPermitAndContract = async (ops: {
  provider: ethers.providers.Web3Provider;
  reserve: ReserveDataHumanized;
  amount: string;
  onBehalfOf?: string;
  poolAddress: string;
  gatewayAddress: string;
}) => {
  // display deprecated warning
  console.warn(
    "supplyWithPermitAndContract is deprecated, use supplyWithPermit instead"
  );
  const { provider, reserve, amount, onBehalfOf, poolAddress, gatewayAddress } =
    ops;

  const pool = new Pool(provider, {
    POOL: poolAddress,
    WETH_GATEWAY: gatewayAddress,
  });

  const signer = provider.getSigner();
  const currentAccount = await signer?.getAddress();
  const tokenAdress = reserve.underlyingAsset;
  const deadline = `${Date.now() + 3600}`;
  let dataToSign = undefined;
  let signature = undefined;
  console.log(`sign: `, {
    currentAccount,
    tokenAdress,
    deadline,
  });

  // const lendingPoolABI = await fetch('/assets/abi/aavePool.abi.json').then((res) => res.json());

  //Contracts
  const poolContract = new ethers.Contract(poolAddress, lendingPoolABI, signer);

  // request signature
  try {
    const param = {
      user: currentAccount,
      reserve: tokenAdress,
      amount, // use simple amount, withouth decimals formating
      deadline,
    };
    console.log("param: ", param);

    dataToSign = await pool.signERC20Approval(param);
  } catch (error) {
    throw new Error("unable to sign");
  }
  console.log("dataToSign: ", { dataToSign, pool });

  if (dataToSign.length > 0) {
    try {
      signature = await provider.send("eth_signTypedData_v4", [
        currentAccount,
        dataToSign,
      ]);
    } catch (error) {
      console.log("error: ", error);
    }
  }

  console.log("signature: ", signature);

  // formmating signature
  const sig = splitSignature(signature);
  console.log("sig: ", sig);

  // call supplyWithPermit
  const supplyTx = await poolContract.functions["supplyWithPermit"](
    tokenAdress,
    `${+amount * Math.pow(10, reserve.decimals)}`,
    onBehalfOf || currentAccount,
    "0",
    deadline,
    sig.v,
    sig.r,
    sig.s
  );
  console.log("supplyTx: ", supplyTx);
  try {
    console.log(`Transaction mined succesfully: ${supplyTx.hash}`);
    return await supplyTx.wait();
  } catch (error) {
    console.log(`Transaction failed with error: ${error}`);
    throw new Error("Transaction failed");
  }
};

export type MARKETTYPE =
  | typeof MARKETS.AaveV3Ethereum
  | typeof MARKETS.AaveV3Polygon
  | typeof MARKETS.AaveV3Mumbai
  | typeof MARKETS.AaveV3Fuji
  | typeof MARKETS.AaveV3Avalanche
  | typeof MARKETS.AaveV3Arbitrum
  | typeof MARKETS.AaveV3ArbitrumGoerli
  | typeof MARKETS.AaveV3Optimism
  | typeof MARKETS.AaveV3ArbitrumGoerli;

export const permitByChainAndToken: {
  [chainId: number]: Record<string, boolean>;
} = {
  [ChainId.mainnet]: {
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": false,
    "0x6b175474e89094c44da98b954eedeac495271d0f": false,
    "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": true,
    "0x514910771af9ca656af840dff83e8264ecf986ca": false,
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": false,
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": false,
    "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0": true,
  },
  [ChainId.arbitrum_one]: {
    "0xf97f4df75117a78c1a5a0dbb814af92458539fb4": true,
    "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8": true,
    "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f": true,
    "0x82af49447d8a07e3bd95bd0d56f35241523fbab1": true,
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9": true,
    "0xba5ddd1f9d7f570dc94a51479a000e3bce967196": true,
    "0xd22a58f79e9481d1a88e00c343885a588b34b68b": false, // eurs
  },
  [ChainId.fantom]: {
    "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e": true,
    "0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8": true,
    "0x04068da6c83afcfa0e13ba15a6696662335d5b75": true,
    "0x321162cd933e2be498cd2267a90534a804051b11": true,
    "0x74b23882a30290451a17c44f4f05243b6b58c76d": true,
    "0x049d68029688eabf473097a2fc38ef61633a3c7a": true,
    "0x6a07a792ab2965c72a5b8088d3a069a7ac3a993b": true,
    "0xae75a438b2e0cb8bb01ec1e1e376de11d44477cc": false, // sushi
    "0x1e4f97b9f9f913c46f1632781732927b9019c68b": true,
  },
  [ChainId.polygon]: {
    "0x4e3decbb3645551b8a19f0ea1678079fcb33fb4c": true,
  },
  [ChainId.harmony]: {},
  [ChainId.avalanche]: {
    "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7": true,
  },
  [ChainId.optimism]: {
    "0x76fb31fb4af56892a25e32cfc43de717950c9278": false, // aave
  },
  [ChainId.mumbai]: {},
};
