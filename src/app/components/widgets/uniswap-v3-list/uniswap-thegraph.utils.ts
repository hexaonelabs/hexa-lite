import { getNetworkConfigByChainId } from "./network";
import lscache from "./lscache";
// import { averageArray } from "../utils/math";
import { Tick } from "@uniswap/v3-sdk";
import {
  estimateFee,
  getFeeTierPercentage,
  getLiquidityDelta,
  getPriceFromTick,
  getTokenLogoURL,
  getTokensAmountFromDepositAmountUSD,
  getUniqueItems,
  sortTokens,
  Token,
} from "./utils";

import BigNumber from "bignumber.js";
import { environment } from "@env/environment";

export interface PoolDayData {
  date: number;
  volumeUSD: string;
  open: string;
  high: string;
  low: string;
  close: string;
}
export interface Pool {
  id: string;
  feeTier: string;
  liquidity: string;
  tick: string;
  sqrtPrice: string;
  token0Price: string;
  token1Price: string;
  feeGrowthGlobal0X128: string;
  feeGrowthGlobal1X128: string;

  // For pool overview
  token0: Token;
  token1: Token;
  totalValueLockedUSD: string;
  poolDayData: PoolDayData[];
}

export interface Position {
  id: string;
  tickLower: {
    tickIdx: string;
    feeGrowthOutside0X128: string;
    feeGrowthOutside1X128: string;
  };
  tickUpper: {
    tickIdx: string;
    feeGrowthOutside0X128: string;
    feeGrowthOutside1X128: string;
  };
  depositedToken0: string;
  depositedToken1: string;
  liquidity: string;
  transaction: {
    timestamp: string;
  };
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
}

export enum Risk {
  SAFE = "SAFE",
  LOW_RISK = "LOW RISK",
  HIGH_RISK = "HIGH RISK",
}
export interface RiskChecklist {
  lowPoolTVL: boolean;
  lowPoolVolume: boolean;
  highPriceVolatility: boolean;
  lowToken0TVL: boolean;
  lowToken1TVL: boolean;
  lowToken0PoolCount: boolean;
  lowToken1PoolCount: boolean;
}
export interface PoolColumnDataType {
  key: string;
  poolId: string;
  feeTier: string;
  token0: Token;
  token1: Token;
  totalValueLockedUSD: number;
  volume24h: number;
  volume7d: number;
  dailyVolumePerTVL: number;
  fee24h: number;
  priceVolatility24HPercentage: number;
  poolDayDatas: PoolDayData[];
  dailyFeesPerTVL: number;
  risk: Risk;
  riskChecklist: RiskChecklist;
  estimatedFee24h: number;
  estimatedFeeToken0: number;
  estimatedFeeToken1: number;
  apy: number;
}

export const getPools = async (
  totalValueLockedUSD_gte: number,
  volumeUSD_gte: number,
  chainId: number,
  first = 10
): Promise<{
  pools: PoolColumnDataType[];
  tokens: Token[];
}> => {
  const cacheKey = `${chainId}_getPools`;
  const cacheData = lscache.get(cacheKey);
  if (cacheData) {
    return cacheData;
  }
  try {
    const res = await _queryUniswap(
      `{
      pools (first: ${first}, orderBy: totalValueLockedUSD, orderDirection: desc, where: {liquidity_gt: 0, totalValueLockedUSD_gte: ${totalValueLockedUSD_gte}, volumeUSD_gte: ${volumeUSD_gte}}) {
        id
        token0 {
          id
        }
        token1 {
          id
        }
        feeTier
        liquidity
        tick
        totalValueLockedUSD
        poolDayData(first: 15, skip: 1, orderBy: date, orderDirection: desc) {
          date
          volumeUSD
          open 
          high
          low
          close
        }
      }
    }`,
      chainId
    );

    if (res === undefined || res.pools.length === 0) {
      return { pools: [], tokens: [] };
    }

    const tokenIds = getUniqueItems(
      res.pools.reduce(
        (acc: string[], p: Pool) => [...acc, p.token0.id, p.token1.id],
        []
      )
    );
    const queryPage = Math.ceil(tokenIds.length / 100);
    // batch query getBulkTokens function by page using Promise.all
    const tokens = await Promise.all(
      Array.from({ length: queryPage }, (_, i) => {
        const start = i * 100;
        const end = start + 100;
        return getBulkTokens(tokenIds.slice(start, end), chainId);
      })
    ).then((res) => res.flat());
    // sort token by volume
    tokens.sort((a, b) => Number(b.volumeUSD) - Number(a.volumeUSD));
    // map poolCount
    const poolCountByTokenHash = res.pools.reduce((acc: any, p: Pool) => {
      acc[p.token0.id] = (acc[p.token0.id] || 0) + 1;
      acc[p.token1.id] = (acc[p.token1.id] || 0) + 1;
      return acc;
    }, {});
    const _tokens = tokens.map((t: Token) => {
      return {
        ...t,
        poolCount: poolCountByTokenHash[t.id],
      };
    });
    // create hash of tokens id
    const tokenHash = _tokens.reduce((acc: any, t: Token) => {
      acc[t.id] = t;
      return acc;
    }, {});
    // map token0 and token1 to pool
    const pools = res.pools
      .map((p: Pool) => {
        return {
          ...p,
          token0: tokenHash[p.token0.id],
          token1: tokenHash[p.token1.id],
        };
      })
      // fix poolDayData incorrect data
      .map((p: Pool) => {
        const poolDayData = [];
        for (let i = 0; i < p.poolDayData.length - 1; ++i) {
          p.poolDayData[i].open = p.poolDayData[i + 1].close;
          poolDayData.push(p.poolDayData[i]);
        }
        p.poolDayData = poolDayData;
        return p;
      })
      // filter out if poolDayData < 14
      .filter((p: Pool) => p.poolDayData.length === 14);
    // formating pools data
    const result = { pools: _processPools(pools), tokens };
    // cache the result
    lscache.set(cacheKey, result, 10); // 10 mins
    return result;
  } catch (e) {
    return { pools: [], tokens: [] };
  }
};

export const getAvgTradingVolume = async (
  poolAddress: string,
  chainId: number,
  numberOfDays: number = 7
): Promise<number> => {
  const { poolDayDatas } = await _queryUniswap(
    `{
    poolDayDatas(skip: 1, first: ${numberOfDays}, orderBy: date, orderDirection: desc, where:{pool: "${poolAddress}"}) {
      volumeUSD
    }
  }`,
    chainId
  );

  const volumes = poolDayDatas.map((d: { volumeUSD: string }) =>
    Number(d.volumeUSD)
  );
  return (
    volumes.reduce((result: number, val: number) => result + val, 0) /
    volumes.length
  );
};

export const getPoolTicks = async (
  poolAddress: string,
  chainId: number
): Promise<Tick[]> => {
  const PAGE_SIZE = 3;
  let result: Tick[] = [];
  let page = 0;
  while (true) {
    const [pool1, pool2, pool3] = await Promise.all([
      _getPoolTicksByPage(poolAddress, page, chainId),
      _getPoolTicksByPage(poolAddress, page + 1, chainId),
      _getPoolTicksByPage(poolAddress, page + 2, chainId),
    ]);

    result = [...result, ...pool1, ...pool2, ...pool3];
    if (pool1.length === 0 || pool2.length === 0 || pool3.length === 0) {
      break;
    }
    page += PAGE_SIZE;
  }
  return result;
};

export const getTopTokenList = async (chainId: number): Promise<Token[]> => {
  const cacheKey = `${chainId}_getTopTokenList`;
  const cacheData = lscache.get(cacheKey);
  const searchTokenPageItems = localStorage.getItem(
    `SearchTokenPage_${chainId}_tokens`
  );
  if (cacheData) {
    if (searchTokenPageItems !== null) {
      return [...cacheData, ...JSON.parse(searchTokenPageItems)];
    }
    return cacheData;
  }

  const res = await _queryUniswap(
    `{
    tokens(skip: 0, first: 500, orderBy: volumeUSD, orderDirection: desc) {
      id
      name
      symbol
      volumeUSD
      decimals
    }
  }`,
    chainId
  );

  if (res === undefined || res.tokens.length === 0) {
    return [];
  }

  const tokens = res.tokens as Token[];
  let result = await Promise.all(
    tokens.map((token) => _processTokenInfo(token, chainId))
  ).then((tokens) => tokens.filter((token) => token.symbol.length < 30));
  lscache.set(cacheKey, result, 10); // 10 mins
  if (searchTokenPageItems !== null) {
    result = [...result, ...JSON.parse(searchTokenPageItems)];
  }

  return result;
};

export const getTopPoolList = async (
  chainId: number
): Promise<PoolColumnDataType[]> => {
  const cacheKey = `${chainId}_getTopPoolList`;
  const cacheData = lscache.get(cacheKey);
  if (cacheData) {
    return cacheData;
  }
  const res = await _queryUniswap(
    `{
    pools(skip: 0, first: 100, orderBy: volumeUSD, orderDirection: desc) {
      id
      volumeUSD
  		token0 {
        id
        name
        symbol
        volumeUSD
        decimals
        tokenDayData { 
        	priceUSD
        }
        totalValueLockedUSD
        poolCount
      }
  		token1 {
        id
        name
        symbol
        volumeUSD
        decimals
        tokenDayData { 
        	priceUSD
        }
        totalValueLockedUSD
        poolCount
      }
  		feesUSD
  		feeTier
  		liquidity
  		tick
  		sqrtPrice
  		token0Price
  		token1Price
  		totalValueLockedUSD
			poolDayData(first: 15, skip: 1, orderBy: date, orderDirection: desc) { 
        date
        volumeUSD
        open
        high
        low
        close
        feesUSD
      }
    }
  }`,
    chainId
  );

  if (res === undefined || res.pools.length === 0) {
    return [];
  }

  const pools = res.pools as Pool[];
  let result = _processPools(pools).filter(
    (pool) => pool.totalValueLockedUSD > 1000000
  );

  lscache.set(cacheKey, result, 10); // 10 mins
  return result;
};

export const getToken = async (
  tokenAddress: string,
  chainId: number
): Promise<Token> => {
  const res = await _queryUniswap(
    `{
    token(id: "${tokenAddress.toLowerCase()}") {
      id
      name
      symbol
      volumeUSD
      decimals
    }
  }`,
    chainId
  );

  if (res.token !== null) {
    res.token = await _processTokenInfo(res.token, chainId);
  }

  return res.token;
};

export const getPoolFromPair = async (
  token0: Token,
  token1: Token,
  chainId: number
): Promise<Pool[]> => {
  const sortedTokens = sortTokens(token0, token1);

  let feeGrowthGlobal = `feeGrowthGlobal0X128\nfeeGrowthGlobal1X128`;
  const network = getNetworkConfigByChainId(chainId);
  if (network.disabledTopPositions) {
    feeGrowthGlobal = "";
  }

  const { pools } = await _queryUniswap(
    `{
    pools(orderBy: feeTier, where: {
        token0: "${sortedTokens[0].id}",
        token1: "${sortedTokens[1].id}"}) {
      id
      tick
      sqrtPrice
      feeTier
      liquidity
      token0Price
      token1Price
      ${feeGrowthGlobal}
    }
  }`,
    chainId
  );

  return pools as Pool[];
};

export const getCurrentTick = async (
  poolId: string,
  chainId: number
): Promise<string> => {
  const { pool } = await _queryUniswap(
    `{
    pool(id: "${poolId}") {
      tick
    }
  }`,
    chainId
  );
  return pool.tick;
};

export const calculateEstimatedFees = (
  depositAmountUSD: number,
  pool: Pool,
) => {
  // Basic Stats
  const poolDayData7d = pool.poolDayData.slice(0, 7);
  const volume24h = Number(poolDayData7d[0].volumeUSD);
  // Price Volatility
  const poolDayData14d = pool.poolDayData;
  const priceVolatility24HPercentage: number =
    poolDayData14d
      .map((d: PoolDayData) => {
        return (100 * (Number(d.high) - Number(d.low))) / Number(d.high);
      })
      .reduce((a, b) => a + b, 0) / 14;
  const P = getPriceFromTick(
    Number(pool.tick),
    pool.token0.decimals,
    pool.token1.decimals
  );
  let Pl = P - (P * priceVolatility24HPercentage) / 100;
  let Pu = P + (P * priceVolatility24HPercentage) / 100;
  const priceUSDX = Number(pool.token1.tokenDayData[0].priceUSD);
  const priceUSDY = Number(pool.token0.tokenDayData[0].priceUSD);
  const { amount0, amount1 } = getTokensAmountFromDepositAmountUSD(
    P,
    Pl,
    Pu,
    priceUSDX,
    priceUSDY,
    depositAmountUSD
  );
  const deltaL = getLiquidityDelta(
    P,
    Pl,
    Pu,
    amount0,
    amount1,
    Number(pool.token0?.decimals || 18),
    Number(pool.token1?.decimals || 18)
  );
  const L = new BigNumber(pool.liquidity);
  const volume24H = volume24h;
  const feeTier = pool.feeTier;
  const estimatedFee24h =
    P >= Pl && P <= Pu ? estimateFee(deltaL, L, volume24H, feeTier) : 0;
  return {
    estimatedFee24h,
    amount0,
    amount1,
  };
};

export const getPool = async (poolColData: PoolColumnDataType & {chainId: number}): Promise<Pool> => {
  const {pool} = await _queryUniswap(
    `{
    pool(id: "${poolColData.poolId}") {
        id
        token0 {
          id
          name
          symbol
          volumeUSD
          decimals
          totalValueLockedUSD
          tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
            priceUSD
          }
        }
        token1 {
          id
          name
          symbol
          volumeUSD
          decimals
          totalValueLockedUSD
          tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
            priceUSD
          }
        }
        feeTier
        liquidity
        tick
        totalValueLockedUSD
        poolDayData(first: 15, skip: 1, orderBy: date, orderDirection: desc) {
          date
          volumeUSD
          open 
          high
          low
          close
        }
    }
  }`,
    poolColData.chainId
  );
  return pool;
};

// private helper functions
const _getPoolTicksByPage = async (
  poolAddress: string,
  page: number,
  chainId: number
): Promise<Tick[]> => {
  const res = await _queryUniswap(
    `{
    ticks(first: 1000, skip: ${
      page * 1000
    }, where: { poolAddress: "${poolAddress}" }, orderBy: tickIdx) {
      tickIdx
      liquidityNet
      price0
      price1
    }
  }`,
    chainId
  );

  return res.ticks;
};

const _processTokenInfo = async (token: Token, chainId: number) => {
  token.logoURI = await getTokenLogoURL(chainId, token.id);
  // TODO: check the network id before replace the token name
  if (token.name === "Wrapped Ether" || token.name === "Wrapped Ethereum") {
    token.name = "Ethereum";
    token.symbol = "ETH";
    token.logoURI =
      "https://cdn.iconscout.com/icon/free/png-128/ethereum-2752194-2285011.png";
  }
  if (token.name === "Wrapped Matic") {
    token.name = "Polygon Native Token";
    token.symbol = "MATIC";
  }
  if (token.name === "Wrapped BNB") {
    token.name = "BSC Native Token";
    token.symbol = "BNB";
  }
  return token;
};

const _processPools = (allPools: Pool[]): PoolColumnDataType[] => {
  const topPools = allPools.map((pool, index) => {
    // Basic Stats
    const poolDayData7d = pool.poolDayData.slice(0, 7);
    const totalValueLockedUSD = Number(pool.totalValueLockedUSD);
    const volume24h = Number(poolDayData7d[0].volumeUSD);
    const volume7d = poolDayData7d.reduce((acc, cur) => {
      return acc + Number(cur.volumeUSD);
    }, 0);
    const dailyVolumePerTVL = volume7d / 7 / totalValueLockedUSD;
    const fee24h = (volume7d / 7) * getFeeTierPercentage(pool.feeTier);
    const dailyFeesPerTVL = fee24h / totalValueLockedUSD;

    // Price Volatility
    const poolDayData14d = pool.poolDayData;
    const priceVolatility24HPercentage: number =
      poolDayData14d
        .map((d: PoolDayData) => {
          return (100 * (Number(d.high) - Number(d.low))) / Number(d.high);
        })
        .reduce((a, b) => a + b, 0) / 14;
    const poolDayDatas = pool.poolDayData;

    // Risk
    const riskChecklist: RiskChecklist = {
      lowPoolTVL: totalValueLockedUSD < 10000000,
      lowPoolVolume: dailyVolumePerTVL < 0.1,
      highPriceVolatility: priceVolatility24HPercentage > 10,
      lowToken0TVL: Number(pool.token0.totalValueLockedUSD) < 10000000,
      lowToken0PoolCount: pool.token0.poolCount < 5,
      lowToken1TVL: Number(pool.token1.totalValueLockedUSD) < 10000000,
      lowToken1PoolCount: pool.token1.poolCount < 5,
    };
    const riskChecklistCount = Object.values(riskChecklist).filter(
      (v) => v === true
    ).length;
    let risk = Risk.SAFE;
    if (riskChecklistCount >= 1) risk = Risk.LOW_RISK;
    if (riskChecklistCount >= 4) risk = Risk.HIGH_RISK;

    const { estimatedFee24h, amount0, amount1 } = calculateEstimatedFees(
      1000,
      pool
    );
    const fee1y = calculateEstimatedFees(1000, pool).estimatedFee24h * 365;
    return <PoolColumnDataType>{
      key: index.toString(),
      poolId: pool.id,
      feeTier: pool.feeTier,
      token0: pool.token0,
      token1: pool.token1,
      totalValueLockedUSD,
      volume24h,
      volume7d,
      dailyVolumePerTVL,
      fee24h,
      priceVolatility24HPercentage,
      poolDayDatas,
      dailyFeesPerTVL,
      risk,
      riskChecklist,
      estimatedFee24h,
      estimatedFeeToken0: amount1,
      estimatedFeeToken1: amount0,
      apy: 100 * (fee1y / 1000)
    };
  });

  return topPools;
};

const _queryUniswap = async (query: string, chainId: number): Promise<any> => {
  const network = getNetworkConfigByChainId(chainId);
  const req = await fetch(network.subgraphEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${environment.thegraph_apikey}`,
    },
    body: JSON.stringify({
      query,
    }),
  });
  const res = await req.json();
  return res.data;
};

const getBulkTokens = async (
  tokenAddresses: string[],
  chainId: number
): Promise<Token[]> => {
  const res = await _queryUniswap(
    `{
    tokens(where: {id_in: [${tokenAddresses
      .map((id) => `"${id}"`)
      .join(",")}]}) {
      id
      name
      symbol
      volumeUSD
      decimals
      totalValueLockedUSD
      tokenDayData(first: 1, orderBy: date, orderDirection: desc) {
        priceUSD
      }
    }
  }`,
    chainId
  );

  if (res.tokens !== null) {
    res.tokens = Promise.all(
      res.tokens.map((token: Token) => _processTokenInfo(token, chainId))
    );
  }

  return res.tokens;
};

// const _getPoolPositionsByPage = async (
//   poolAddress: string,
//   page: number
// ): Promise<Position[]> => {
//   try {
//     const res = await _queryUniswap(`{
//     positions(where: {
//       pool: "${poolAddress}",
//       liquidity_gt: 0,
//     }, first: 1000, skip: ${page * 1000}) {
//       id
//       tickLower {
//         tickIdx
//         feeGrowthOutside0X128
//         feeGrowthOutside1X128
//       }
//       tickUpper {
//         tickIdx
//         feeGrowthOutside0X128
//         feeGrowthOutside1X128
//       }
//       depositedToken0
//       depositedToken1
//       liquidity
//       collectedFeesToken0
//       collectedFeesToken1
//       feeGrowthInside0LastX128
//       feeGrowthInside1LastX128
//       transaction {
//         timestamp
//       }
//     }
//   }`);

//     return res.positions;
//   } catch (e) {
//     return [];
//   }
// };

// export const getPoolPositions = async (
//   poolAddress: string
// ): Promise<Position[]> => {
//   const PAGE_SIZE = 3;
//   let result: Position[] = [];
//   let page = 0;
//   while (true) {
//     const [p1, p2, p3] = await Promise.all([
//       _getPoolPositionsByPage(poolAddress, page),
//       _getPoolPositionsByPage(poolAddress, page + 1),
//       _getPoolPositionsByPage(poolAddress, page + 2),
//     ]);

//     result = [...result, ...p1, ...p2, ...p3];
//     if (p1.length === 0 || p2.length === 0 || p3.length === 0) {
//       break;
//     }
//     page += PAGE_SIZE;
//   }
//   return result;
// };
