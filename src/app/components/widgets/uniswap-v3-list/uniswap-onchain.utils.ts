import { createPublicClient, getContract, http, parseAbi } from "viem";
import { arbitrum, base, mainnet, optimism } from "viem/chains";
// import nonfungiblePositionManagerAbi from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { Pool, TickMath, Position as UniswapPosition } from "@uniswap/v3-sdk";
import { Token as UniswapToken } from "@uniswap/sdk-core";

// import JSBI from "jsbi";
import { getToken, Token } from "@lifi/sdk";
import { AVAILABLE_CHAINS } from "@app/app.utils";
import { PoolColumnDataType } from "./uniswap-thegraph.utils";

interface PositionRaw {
  token0: any;
  token1: any;
  fee: any;
  feeGrowthInside1LastX128: bigint;
  feeGrowthInside0LastX128: bigint;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  tokensOwed0: any;
  tokensOwed1: any;
}

interface Position {
  tokenId: string;
  token0Symbol: string;
  token1Symbol: string;
  feeTier: number;
  liquidity: bigint;
  tickLower: number;
  tickUpper: number;
  amount0: bigint;
  amount1: bigint;
  unclaimedFees?: string;
  totalValue?: string;
  pnl?: number;
}

export interface PositionData
  extends Pick<
    Position,
    | "liquidity"
    | "tickLower"
    | "tickUpper"
    | "token0Symbol"
    | "token1Symbol"
    | "feeTier"
  > {
  // decimal readable amount
  token0Amount: string;
  token1Amount: string;
  // readable tick
  tokenUSDTickLower: string;
  tokenUSDTickUpper: string;

  unclaimedFees?: string;
  liquidityUSD: string; // Nouvelle propriété normalisée
  rawLiquidity: string; // Conservation de la valeur brute

  feeGrowthInside1LastX128: bigint;
  feeGrowthInside0LastX128: bigint;

  token0: Token;
  token1: Token;
  chainId: number;
  address: string; // Pool Address
  tickCurrent: number; // Current tick
}

export interface PoolData {
  tvl: number;
  address: string;
  token0: Token;
  token1: Token;
  chainId: number;
  fee: number;
}

interface PoolDataRaw {
  slot0: readonly [bigint, number, number, number, number, number, boolean];
  poolLiquidity: bigint;
  poolAddress: `0x${string}`;
  feeGrowthGlobal0X128: bigint;
  feeGrowthGlobal1X128: bigint;
}

interface TokenData {
  address: string;
  symbol: string;
  decimals: number;
}

// See https://docs.uniswap.org/contracts/v3/reference/deployments/
export const UNISWAP_MARKETS = [
  {
    chain: mainnet,
    name: "mainnet",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    nftManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  },
  {
    chain: arbitrum,
    name: "arbitrum",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    nftManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  },
  {
    chain: optimism,
    name: "optimism",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    nftManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  },
  {
    chain: base,
    name: "base",
    factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
    nftManager: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
  },
];
const nftPositionManagerAbi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
]);
const poolAbi = parseAbi([
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function fee() view returns (uint24)",
  "function liquidity() view returns (uint128)",
  "function feeGrowthGlobal0X128() view returns (uint256)",
  "function feeGrowthGlobal1X128() view returns (uint256)",
]);
const factoryAbi = parseAbi([
  "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)",
]);
const tokenAbi = parseAbi([
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
]);

export const getUniswapPositions = async (
  walletAddress: `0x${string}`,
): Promise<PositionData[]> => {
  const positions = [];
  // Loop through all markets to fetch positions
  for (let index = 0; index < UNISWAP_MARKETS.length; index++) {
    const market = UNISWAP_MARKETS[index];
    try {
      const client = createPublicClient({
        chain: market.chain,
        transport: http(),
      });
      const nftContract = getContract({
        address: market.nftManager as `0x${string}`,
        abi: nftPositionManagerAbi,
        client,
      });
  
      const balance = await nftContract.read.balanceOf([walletAddress]);
      const marketPositions = await processAllPositions(
        walletAddress,
        nftContract,
        balance,
        market.chain.id
      );
      positions.push(...marketPositions);
    } catch (error) {
      console.error("Error fetching positions form market " + market.name + ":", error);
      throw error;
    }
  }
  return positions;
};

export const getUniswapPools = async (): Promise<PoolData[]> => {
  const poolsRequest = Promise.all(
    [
      // ETH/USDC Arbitrum
      {
        address: "0xC6962004f452bE9203591991D15f6b388e09E8D0",
        token0: await getToken(arbitrum.id, "ETH"),
        token1: await getToken(
          arbitrum.id,
          "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
        ),
        chainId: arbitrum.id,
        fee: 500,
      },
      // WBTC/ETH Arbitrum
      {
        address: "0x2f5e87C9312fa29aed5c179E456625D79015299c",
        token0: await getToken(
          arbitrum.id,
          "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"
        ),
        token1: await getToken(arbitrum.id, "ETH"),
        chainId: arbitrum.id,
        fee: 500,
      },
      // // ETH/USDC Base
      // {
      //   address: "0xd0b53D9277642d899DF5C87A3966A349A798F224",
      //   token0: await getToken(base.id, "ETH"),
      //   token1: await getToken(
      //     base.id,
      //     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
      //   ),
      //   chainId: base.id,
      //   fee: 500,
      // },
      // // USDC/WBTC Optimism
      // {
      //   address: '0xaDAb76dD2dcA7aE080A796F0ce86170e482AfB4a',
      //   token0: await getToken(optimism.id, '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'),
      //   token1: await getToken(optimism.id, '0x68f180fcCe6836688e9084f035309E29Bf0A2095'),
      //   chainId: optimism.id,
      //   fee: 300,
      // },
      // // USDC/ETH Optimism
      // {
      //   address: '0x1fb3cf6e48F1E7B10213E7b6d87D4c073C7Fdb7b',
      //   token0: await getToken(optimism.id, '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'),
      //   token1: await getToken(optimism.id, 'ETH'),
      //   chainId: optimism.id,
      //   fee: 500,
      // }
    ].map(async (pool) => ({
      ...pool,
      tvl: await getPoolTVL(pool.address as `0x${string}`, pool.chainId),
      // metaData: await getPoolAPY(
      //   pool.address as `0x${string}`,
      //   7,
      //   pool.chainId)
    }))
  );
  const pools = await poolsRequest;
  return pools;
};

const getPoolTVL = async (poolAddress: `0x${string}`, chainId: number) => {
  const market = UNISWAP_MARKETS.find((market) => market.chain.id === chainId);
  if (!market) {
    throw new Error(`No market found for chain ID ${chainId}`);
  }
  const client = createPublicClient({
    chain: market.chain,
    transport: http(),
  });

  const poolContract = getContract({
    address: poolAddress,
    abi: poolAbi,
    client,
  });

  const [token0, token1] = await Promise.all([
    poolContract.read.token0(),
    poolContract.read.token1(),
  ]);

  const token0Contract = getContract({
    address: token0,
    abi: tokenAbi,
    client,
  });
  const token1Contract = getContract({
    address: token1,
    abi: tokenAbi,
    client,
  });
  const [balance0, balance1, decimals0, decimals1, price0, price1] =
    await Promise.all([
      token0Contract.read.balanceOf([poolAddress]),
      token1Contract.read.balanceOf([poolAddress]),
      token0Contract.read.decimals(),
      token1Contract.read.decimals(),
      (await getToken(chainId, token0)).priceUSD,
      (await getToken(chainId, token1)).priceUSD,
    ]);

  const tvlUSD =
    (Number(balance0) / 10 ** decimals0) * Number(price0) +
    (Number(balance1) / 10 ** decimals1) * Number(price1);

  return tvlUSD;
};

const getPoolAddress = async (
  token0: `0x${string}`,
  token1: `0x${string}`,
  fee: number,
  chainId: number
) => {
  const market = UNISWAP_MARKETS.find((market) => market.chain.id === chainId);
  if (!market) {
    throw new Error(`No market found for chain ID ${chainId}`);
  }
  const client = createPublicClient({
    chain: market.chain,
    transport: http(),
  });

  const factoryContract = getContract({
    address: market.factory as `0x${string}`,
    abi: factoryAbi,
    client,
  });

  return factoryContract.read.getPool([token0, token1, fee]);
};

const calculateUnclaimedFees = async (
  position: {
    tokensOwed0: bigint;
    tokensOwed1: bigint;
  },
  token0Data: TokenData,
  token1Data: TokenData
): Promise<string> => {
  const fees0 = position.tokensOwed0 / BigInt(10 ** token0Data.decimals);
  const fees1 = position.tokensOwed1 / BigInt(10 ** token1Data.decimals);

  return `${fees0.toString()} ${token0Data.symbol} + ${fees1.toString()} ${
    token1Data.symbol
  }`;
};

const getTokenData = async (
  address: `0x${string}`,
  chainId: number
): Promise<TokenData> => {
  const market = UNISWAP_MARKETS.find((market) => market.chain.id === chainId);
  if (!market) {
    throw new Error(`No market found for chain ID ${chainId}`);
  }
  const client = createPublicClient({
    chain: market.chain,
    transport: http(),
  });
  const tokenContract = getContract({
    address: address,
    abi: tokenAbi,
    client,
  });

  const [symbol, decimals] = await Promise.all([
    tokenContract.read.symbol(),
    tokenContract.read.decimals(),
  ]);

  return {
    address,
    symbol,
    decimals: Number(decimals),
  };
};

const processAllPositions = async (
  walletAddress: `0x${string}`,
  nftContract: any,
  balance: bigint,
  chainId: number
): Promise<PositionData[]> => {
  const positions: PositionData[] = [];

  for (let i = 0n; i < balance; i++) {
    const tokenId = await nftContract.read.tokenOfOwnerByIndex([
      walletAddress,
      i,
    ]);
    const position = await getPositionDetails(nftContract, tokenId);

    if (position.liquidity === 0n) continue;

    const poolData = await fetchPoolData(position, chainId);
    if (!poolData) continue;

    const positionData = await buildPositionData(position, poolData, chainId);
    positions.push(positionData);
  }

  return positions;
};

const getPositionDetails = async (
  nftContract: any,
  tokenId: bigint
): Promise<PositionRaw> => {
  const [
    ,
    ,
    // nonce et operator non utilisés
    token0Address,
    token1Address,
    fee,
    tickLower,
    tickUpper,
    liquidity,
    feeGrowthInside1LastX128,
    feeGrowthInside0LastX128,
    tokensOwed0,
    tokensOwed1,
  ] = await nftContract.read.positions([tokenId]);

  return {
    token0: token0Address,
    token1: token1Address,
    fee,
    feeGrowthInside1LastX128,
    feeGrowthInside0LastX128,
    tickLower,
    tickUpper,
    liquidity,
    tokensOwed0,
    tokensOwed1,
  };
};

const fetchPoolData = async (
  position: PositionRaw,
  chainId: number
): Promise<PoolDataRaw | null> => {
  const market = UNISWAP_MARKETS.find((market) => market.chain.id === chainId);
  if (!market) {
    throw new Error(`No market found for chain ID ${chainId}`);
  }
  const client = createPublicClient({
    chain: market.chain,
    transport: http(),
  });

  const poolAddress = await getPoolAddress(
    position.token0,
    position.token1,
    position.fee,
    chainId
  );
  if (poolAddress === "0x0000000000000000000000000000000000000000") return null;
  const poolContract = getContract({
    address: poolAddress,
    abi: poolAbi,
    client,
  });
  const [slot0, poolLiquidity, feeGrowthGlobal0X128, feeGrowthGlobal1X128] =
    await Promise.all([
      poolContract.read.slot0(),
      poolContract.read.liquidity(),
      poolContract.read.feeGrowthGlobal0X128(),
      poolContract.read.feeGrowthGlobal1X128(),
    ]);

  return {
    slot0,
    poolLiquidity,
    poolAddress,
    feeGrowthGlobal0X128,
    feeGrowthGlobal1X128,
  };
};

const buildPositionData = async (
  position: PositionRaw,
  poolData: PoolDataRaw,
  chainId: number
) => {
  const [token0Data, token1Data] = await Promise.all([
    getTokenData(position.token0, chainId),
    getTokenData(position.token1, chainId),
  ]);
  const pool = createPoolInstance(
    token0Data,
    token1Data,
    position.fee,
    poolData
  );
  const uniPosition = new UniswapPosition({
    pool,
    liquidity: position.liquidity.toString(),
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
  });
  console.log({ uniPosition, poolData });

  return formatPositionData(
    { ...position, poolAddress: poolData.poolAddress },
    uniPosition,
    token0Data,
    token1Data,
    chainId
  );
};

const createPoolInstance = (
  token0Data: TokenData,
  token1Data: TokenData,
  fee: number,
  poolData: { slot0: any; poolLiquidity: bigint }
) => {
  const token0 = new UniswapToken(
    base.id,
    token0Data.address,
    token0Data.decimals,
    token0Data.symbol
  );
  const token1 = new UniswapToken(
    base.id,
    token1Data.address,
    token1Data.decimals,
    token1Data.symbol
  );

  return new Pool(
    token0,
    token1,
    Number(fee),
    poolData.slot0[0].toString(), // sqrtPriceX96
    poolData.poolLiquidity.toString(),
    poolData.slot0[1] // tick
  );
};

const formatPositionData = async (
  position: PositionRaw & { poolAddress: string },
  uniPosition: UniswapPosition,
  token0Data: TokenData,
  token1Data: TokenData,
  chainId: number
): Promise<PositionData> => {
  const unclaimedFees = await calculateUnclaimedFees(
    {
      tokensOwed0: position.tokensOwed0,
      tokensOwed1: position.tokensOwed1,
    },
    token0Data,
    token1Data
  );
  // const calculateFees = (
  //   feeGrowthGlobalX128: bigint,
  //   feeGrowthInsideX128: bigint,
  //   liquidity: bigint,
  //   decimals: number
  // ): string => {
  //   const Q128 = 2n ** 128n;
  //   const delta = feeGrowthGlobalX128 - feeGrowthInsideX128;
  //   const rawFees = (delta * liquidity) / Q128;
  //   return (Number(rawFees) / 10 ** decimals).toFixed(6);
  // };
  // const unclaimedFees0 = calculateFees(
  //   position.feeGrowthGlobal0X128,
  //   position.feeGrowthInside0LastX128,
  //   position.liquidity,
  //   token0Data.decimals,
  // );
  // console.log({
  //   fees0: unclaimedFees0,
  //   // fees1: fees1.toString(),
  // });
  const chain = AVAILABLE_CHAINS.find((chain) => chain.id === chainId);
  if (!chain) {
    throw new Error(`No chain found for ID ${chainId}`);
  }
  const token0 = await getToken(chain.id, token0Data.address);
  const token1 = await getToken(chain.id, token1Data.address);
  return {
    token0Symbol: token0Data.symbol,
    token1Symbol: token1Data.symbol,
    feeTier: Number(position.fee),
    liquidity: position.liquidity,
    tickLower: Number(position.tickLower),
    tickUpper: Number(position.tickUpper),
    tickCurrent: uniPosition.pool.tickCurrent,
    token0Amount: uniPosition.amount0.toSignificant(4),
    token1Amount: uniPosition.amount1.toSignificant(4),
    tokenUSDTickLower: uniPosition.token0PriceLower.toFixed(2),
    tokenUSDTickUpper: uniPosition.token0PriceUpper.toFixed(2),
    unclaimedFees,
    liquidityUSD: formatLiquidity(position.liquidity, token0Data.decimals),
    rawLiquidity: uniPosition.liquidity.toString(),
    feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
    feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
    token0,
    token1,
    chainId,
    address: position.poolAddress,
  };
};

const formatLiquidity = (liquidity: bigint, decimals: number): string => {
  const divisor = BigInt(10 ** decimals);
  console.log({ liquidity, divisor });

  const whole = liquidity / divisor;
  const fractional = (liquidity % divisor).toString().padStart(decimals, "0");

  return `${whole.toString()}.${fractional}`;
};

const tickToUsd = (tick: number) => {
  const price = TickMath.getSqrtRatioAtTick(tick);
  return Number(price.toString());
};
