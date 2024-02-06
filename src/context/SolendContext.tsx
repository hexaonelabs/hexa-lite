'use client'

import React, { createContext, useContext, useEffect, useState } from "react";  
import { MarketPool } from "@/pool/Market.pool";
import { SolendPool } from "@/pool/solend.pool";
// import { fetchPools, fetchPoolMetadata,  getReservesOfPool,   SOLEND_PRODUCTION_PROGRAM_ID } from "@solendprotocol/solend-sdk";
import { PublicKey, Connection as SolanaClient } from '@solana/web3.js';
// import SwitchboardProgram from '@switchboard-xyz/sbv2-lite';
import { NETWORK } from "@/constants/chains";

interface LiquidityToken {
  coingeckoID: string;
  decimals: number;
  logo: string;
  mint: string;
  name: string;
  symbol: string;
  volume24h: string;
}

interface Reserve {
  liquidityToken: LiquidityToken;
  pythOracle: string;
  switchboardOracle: string;
  address: string;
  collateralMintAddress: string;
  collateralSupplyAddress: string;
  liquidityAddress: string;
  liquidityFeeReceiverAddress: string;
  userBorrowCap: string;
  userSupplyCap: string;
}

interface IMarketConfig {
  name: string;
  isPrimary: boolean;
  description: string;
  creator: string;
  address: string;
  hidden: boolean;
  isPermissionless: boolean;
  authorityAddress: string;
  owner: string;
  reserves: Reserve[];
}

const stub = (): never => {
  throw new Error("You forgot to wrap your component in <SolendProvider>.");
};

// Define the type for the AAVE context.
type SolendContextType = {
  pools: SolendPool[];
  totalTVL: number | null;
  refresh: (type?: 'init'|'userSummary') => Promise<void>;
};

const SolendContextDefault: SolendContextType = {
  pools: [],
  totalTVL: null, 
  refresh: stub,
};

// Create a context for user data.
const SolendContext = createContext<SolendContextType>(SolendContextDefault);

// Custom hook for accessing user context data.
export const useSolend = () => useContext(SolendContext);

// Provider component that wraps parts of the app that need user context.
export const SolendProvider = ({ children }: { children: React.ReactNode }) => { 
  const [ state, setState ] = useState<SolendContextType>(SolendContextDefault);

  const init = async () => {
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
    console.log('[INFO] {{SolendProvider}} ', { marketsConfig, reserveData, poolsFormated});
    // update state
    setState((prev) => ({
      ...prev, 
       pools: poolsFormated,
    }));
  }; 
 
  useEffect(() => {
    init();
  }, []);

  return (
    <SolendContext.Provider
      value={{
        ...state,
        refresh: async (type: 'init'|'userSummary' = 'init') => {
          console.log("[INFO] {{SolendProvider}} refresh... ");
          let t = undefined;
          await new Promise((resolve) => {
            t = setTimeout(resolve, 10000);
          });
          clearTimeout(t);
          if (type === 'init') {
            await init();
          }
          // if (type === 'userSummary') {
          //   await loadUserSummary();
          // }
          console.log("[INFO] {{SolendProvider}} refresh done with methods: ", type);
        },
      }}
    >
      {children}
    </SolendContext.Provider>
  );
};
