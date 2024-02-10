import { IPoolGroup, IUserSummary } from "@/interfaces/reserve.interface";
import { AavePool, IAavePool } from "@/pool/Aave.pool";
import { IMarketConfig, SolendPool } from "@/pool/solend.pool";
import { patchPoolsState, setPoolsState } from "../actions";
import { CHAIN_AVAILABLES, NETWORK } from "@/constants/chains";
import {
  MARKETTYPE,
  fetchTVL,
  getMarkets,
  getPools,
  getUserSummaryAndIncentives,
} from "@/servcies/aave.service";
import dayjs from "dayjs";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import { MarketPool } from "@/pool/Market.pool";
import { PublicKey, Connection as SolanaClient } from '@solana/web3.js';

const loadAavePools = async () => {
  console.log("[INFO] {{loadAavePools}} init context... ");
  const currentTimestamp = dayjs().unix();
  // load markets from all available chains
  const markets = CHAIN_AVAILABLES.filter((chain) => !chain.testnet)
    .map((chain) => {
      let market: MARKETTYPE | null = null;
      try {
        market = getMarkets(chain.id);
      } catch (error: any) {
        console.log(error?.message);
      }
      return market;
    })
    .filter(Boolean) as MARKETTYPE[];
  // load pools from all available chains
  if (!markets || markets.length === 0) {
    return {};
  }
  // console.log("[INFO] {{loadAavePools}} fetchPools... ");
  const reserves = [];
  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    const pools = await getPools({ market, currentTimestamp })
      .then((r) => r.flat())
      .catch((error) => {
        console.error("[ERROR] {{loadAavePools}} fetchPools: ", error);
        return [];
      });
    reserves.push(...pools);
  }
  // console.log("[INFO] {{loadAavePools}} fetchPools done: ", { reserves });
  // groups poolReserves by symbol (e.g. DAI, USDC, USDT, ...)
  const pools: AavePool[] = reserves
    .filter(
      (reserve) =>
        reserve.isFrozen === false &&
        reserve.isActive === true &&
        reserve.isPaused === false
    )
    .map((reserve) => {
      const provider = "aave-v3";
      const symbol = reserve.symbol;
      const chainId = +reserve.id.split("-")[0];
      const logo = getAssetIconUrl({ symbol });
      const borrowAPY = reserve ? Number(reserve.variableBorrowAPY) : 0;
      const supplyAPY = Number(reserve.supplyAPY || 0);
      const walletBalance = 0;
      const supplyBalance = 0;
      const borrowBalance = 0;
      const userLiquidationThreshold = -1;
      const poolLiquidationThreshold = Number(
        reserve.formattedEModeLiquidationThreshold
      );
      return MarketPool.create<AavePool>({
        ...reserve,
        symbol,
        provider,
        supplyBalance,
        borrowBalance,
        walletBalance,
        borrowAPY,
        supplyAPY,
        chainId,
        userLiquidationThreshold,
        poolLiquidationThreshold,
        logo,
      });
    });
  // update state
  return {
    pools,
  };
};

const loadAaveTVL = async (pools: AavePool[]) => {
  if (!pools || pools.length === 0) {
    return -1;
  }
  return fetchTVL(pools)
    .then((totalTVL) => {
      return totalTVL;
    })
    .catch((error) => {
      console.error("[ERROR] {{loadAavePools}} fetchTVL: ", error);
      return -1;
    });
};

const loadAaveUserSummary = async (walletAddress: string) => {
  console.log("[INFO] {{loadAaveUserSummary}} load... ");
  const currentTimestamp = dayjs().unix();
  // load data from all available networks
  if (!walletAddress) {
    return {
      userSummaryAndIncentivesGroup: null,
    };
  }
  // load markets from all available chains
  const markets = CHAIN_AVAILABLES.filter((chain) => !chain.testnet)
    .map((chain) => {
      let market: MARKETTYPE | null = null;
      try {
        market = getMarkets(chain.id);
      } catch (error: any) {
        console.log(error?.message);
      }
      return market;
    })
    .filter(Boolean) as MARKETTYPE[];
  if (!markets || (markets && markets.length <= 0)) {
    return {
      userSummaryAndIncentivesGroup: null,
    };
  }
  const userSummaryAndIncentivesGroup = await Promise.all(
    markets.map((market) =>
      getUserSummaryAndIncentives({
        market,
        currentTimestamp,
        user: walletAddress,
      })
    )
  )
    .then((r) => r as IUserSummary[])
    .catch((error) => {
      console.error(
        "[ERROR] {{loadAaveUserSummary}} fetchUserSummaryAndIncentives: ",
        error
      );
      return null;
    });
  console.log(`[INFO] {{loadAaveUserSummary}} done: `, {
    userSummaryAndIncentivesGroup,
  });
  return {
    userSummaryAndIncentivesGroup,
  };
};

const loadSolendPools = async () => {
  const connection = new SolanaClient('https://api.devnet.solana.com', 'confirmed');
  // const poolsMetaData  = await fetchPoolMetadata(connection, 'production', true, true);  
  console.log("[INFO] {{SolendProvider}} init context... ");
  const marketsConfig: IMarketConfig[] = await fetch('https://api.solend.fi/v1/markets/configs?ids=4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY&scope=solend&deployment=production')
    .then((response) => response.json());
  const ids = marketsConfig[0].reserves.map(r => r.address);
  // // load markets from all available chains
  const reserveData = await fetch( `https://api.solend.fi/reserves?scope=production&ids=${ids.join('%2C')}` )
    .then((response) => response.json());
  // const programId =  SOLEND_PRODUCTION_PROGRAM_ID;
  // const slot  = await (connection)?.getSlot();  
  // const switchboardProgram = await SwitchboardProgram.loadMainnet(connection); 
  // const publicKey  = new PublicKey("4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY");
  // const reservesOfPool  = await getReservesOfPool(publicKey, connection, switchboardProgram, programId.toString(), slot, true);
  // console.log(' XXX xx>>>>', {reservesOfPool}); 

  // const pools = await fetchPools(
  //   Object.values([]), 
  //   connection,
  //   switchboardProgram,
  //   getProgramId('production').toBase58(),
  //   slot
  // );
  // const xxx = Object.fromEntries(
  //   Object.values(pools).map((p) => [
  //     p.address,
  //     {
  //       ...p,
  //       totalSupplyUsd: p.reserves.reduce(
  //         (acc, r) => r.totalSupplyUsd.plus(acc),
  //         BigNumber(0),
  //       ),
  //       reserves: p.reserves.map((r) => ({
  //         ...r,
  //         symbol: poolsMetaData[r.mintAddress]?.symbol,
  //         logo: poolsMetaData[r.mintAddress]?.logoUri,
  //       })),
  //     },
  //   ]),
  // );
  const poolsFormated: SolendPool[]  = reserveData.results
  ?.filter((reserve: any)  => reserve?.reserve?.config?.depositLimit !== '0'  )
  ?.map((reserve: any) => {
    // const metadata = mainPools.reserves.find(r => r.address === reserve?.reserve?.address);

    const marketPool = MarketPool.create<SolendPool>({ 
      ...reserve,
      ...marketsConfig[0].reserves.find(r => r.address === reserve?.reserve?.address)?.liquidityToken,
      id: reserve?.reserve?.address,
      aTokenAddress: reserve?.reserve?.collateral?.mintPubkey,
      availableLiquidityUSD: '',  
      usageAsCollateralEnabled: true, 
      provider: 'solend',
      chainId: NETWORK.solana,
      borrowAPY: Number(reserve?.rates?.borrowInterest)/100,
      supplyAPY: Number(reserve?.rates?.supplyInterest)/100,
      walletBalance: 0,
      supplyBalance: 0,
      borrowBalance: 0,
      userLiquidationThreshold: 0,
      poolLiquidationThreshold: reserve?.reserve?.config?.liquidationThreshold, 
      underlyingAsset: reserve?.reserve?.liquidity?.mintPubkey,
      priceInUSD: `${Number(reserve?.reserve?.liquidity?.marketPrice )/ ( 1000000000000000000)}`,
      isActive: true,
      isFrozen: false,
      isPaused: false,
      borrowingEnabled: true,
      borrowPoolRatioInPercent: 0
    });
    return marketPool; 
  });
  console.log('[INFO] {{loadSolendPools}} ', { marketsConfig, reserveData, poolsFormated});
  return {
    pools:poolsFormated
  };
}; 

export const initializeUserSummary = async (walletAddress: string) => {
  console.log(`[INFO] {{initializeUserSummary}}...`);
  if (!walletAddress) {
    patchPoolsState({ userSummaryAndIncentivesGroup: null });
    return;
  }
  const { userSummaryAndIncentivesGroup } = await loadAaveUserSummary(
    walletAddress
  );
  if (userSummaryAndIncentivesGroup) {
    patchPoolsState({ userSummaryAndIncentivesGroup });
  } else {
    patchPoolsState({ userSummaryAndIncentivesGroup: null });
  }
};

export const initializePools = async () => {
  console.log(`[INFO] {{initializePools}}...`);
  // set initial state
  setPoolsState({
    marketPools: [],
    userSummaryAndIncentivesGroup: null,
    refresh: async () => {
      throw new Error("Not initialized yet");
    },
    totalTVL: null,
  });
  // get pools data from providers
  // run code without manage async / await
  // to enable progressive loading with patchPoolsState();
  const [
    aavePools = [],
    solendPools = [],
  ] = await Promise.all([
    loadAavePools().then(({ pools = [] }) => {
      loadAaveTVL(pools).then((totalTVL) => patchPoolsState({ totalTVL }));
      return pools;
    }),
    loadSolendPools().then(({ pools = [] }) => {
      // TODO: add solend tvl
      return pools;
    }), 
  ]);
  const marketPools = [...aavePools, ...solendPools];
  const refresh = async (type: "init" | "userSummary" = "init") => {
    type === "init" ? await initializePools() : null;
    // await solendRefresh(type);
  };
  patchPoolsState({
    marketPools,
    userSummaryAndIncentivesGroup: null,
    refresh,
  });
};
