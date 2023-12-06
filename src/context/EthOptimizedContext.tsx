'use client'

import { ReserveDataHumanized } from "@aave/contract-helpers";
import { FormatReserveUSDResponse, FormatUserSummaryAndIncentivesResponse } from "@aave/math-utils";
import { useContext, createContext, useState, useEffect } from "react";
import { useAave } from "./AaveContext";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { getBaseAPRstETH } from "../servcies/lido.service";
import { IReserve } from "../interfaces/reserve.interface";
import { NETWORK } from "../constants/chains";

export type EthOptimizedContextType = {
  maxLeverageFactor: number;
  userLiquidationThreshold: number;
  name: string;
  type: string;
  icon: string;
  apys: string[];
  locktime: number,
  providers: string[],
  assets: string[],
  isStable: boolean,
  details: {
    description: string;
  },
  chainId: number;
  poolAddress: string;
  gateway: string;
  userSummaryAndIncentives: FormatUserSummaryAndIncentivesResponse<ReserveDataHumanized & FormatReserveUSDResponse>;
  step: {
    type: string;
    from: string;
    to: string;
    title:string;
    description: string;
    protocol: string
    reserve?: (ReserveDataHumanized & FormatReserveUSDResponse);
    }[]
};

/**
 * Function that calcule maximum borrow/supply multiplicator user can do based on
 * The Maximum Threshold ratio represents the maximum borrowing power of a specific collateral.
 * For example, if a collateral has an Threshold of 75%, the user can borrow up to 0.75 worth of ETH in the principal currency for every 1 ETH worth of collateral.
 * Example: 
 * 10 ETH => 7.5 ETH
 * 7.5 ETH => 5.625 ETH
 * 5.625 ETH => 4.21875 ETH
 * 4.21875 ETH => 3.1640625 ETH
 * 3.1640625 ETH => 2.373046875 ETH
 * 2.373046875 ETH => 1.77978515625 ETH
 * 1.77978515625 ETH => 1.3348388671875 ETH
 * 1.3348388671875 ETH => 1 ETH
 * 1 ETH => 0.75 ETH
 * 0.75 ETH => 0.5625 ETH
 * 0.5625 ETH => 0.421875 ETH
 * 0.421875 ETH => 0.31640625 ETH
 * 0.31640625 ETH => 0.2373046875 ETH
 * 0.2373046875 ETH => 0.177978515625 ETH
 * 0.177978515625 ETH => 0.13348388671875 ETH
 * 0.13348388671875 ETH => 0.1 ETH
 * For a total of ~39.5 ETH, so the multiplier is ~3.95
 * Formula: 
 * (1 - (1 - liquidationThreshold) ^ 8) / (1 - liquidationThreshold) / 10
 * With condition that total result is less than 1 will return 1
 */
export const getMaxLeverageFactor = (liquidationThreshold: number) => {
  const result = (1 - (1 - liquidationThreshold) ^ 8) / (1 - liquidationThreshold) / 10;
  return result < 1 ? 1 : result;
}

// Create a context for user data.
const EthOptimizedContext = createContext<EthOptimizedContextType|undefined>(undefined);

// Custom hook for accessing user context data.
export const useEthOptimizedStrategy = () => useContext(EthOptimizedContext);

// Provider component that wraps parts of the app that need user context.
export const EthOptimizedStrategyProvider = ({ children }: { children: React.ReactNode }) => {

  const [baseAPRstETH, setBaseAPRstETH] = useState(-1);
  const [state, setState] = useState<EthOptimizedContextType|undefined>(undefined);   
  const { 
    markets, 
    refresh, 
    poolGroups,
    userSummaryAndIncentivesGroup
  } = useAave();
  const market = markets?.find(m => m.CHAIN_ID === NETWORK.optimism);
  const userSummaryAndIncentives = userSummaryAndIncentivesGroup?.find(p => p.chainId === NETWORK.optimism);
  // find `wstETH` and `WETH` reserves from AAVE `poolReserves`
  const poolReserveWSTETH = poolGroups
    ?.find(p => p.symbol === 'wstETH')?.reserves
    ?.find((r: IReserve) => r.chainId === NETWORK.optimism);
  const poolReserveWETH =  poolGroups
    ?.find(p => p.symbol === 'WETH')?.reserves
    ?.find((r: IReserve) => r.chainId === NETWORK.optimism);
  // calcul apr using `baseAPRstETH` and `poolReserveWETH.variableBorrowAPR * 100`
  const diffAPR = baseAPRstETH - Number(poolReserveWETH?.variableBorrowAPR||0) * 100;
  
  const userLiquidationThreshold =  Number(userSummaryAndIncentives?.currentLiquidationThreshold||0) > 0 
  ? Number(userSummaryAndIncentives?.currentLiquidationThreshold||0)
  : Number(poolReserveWETH?.formattedReserveLiquidationThreshold);
  
  const maxLeverageFactor = getMaxLeverageFactor(userLiquidationThreshold);
  const DEFAULT_MAX_APY = 14.02;
  const superMaxAPRstETH = ((baseAPRstETH * (maxLeverageFactor)) - (Number(poolReserveWETH?.variableBorrowAPR||0) * 100)) || DEFAULT_MAX_APY;
  
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      maxLeverageFactor,
      userLiquidationThreshold,
      name: "ETH Optimized",
      type: 'staking',
      icon: getAssetIconUrl({symbol: 'ETH'}),
      apys: [baseAPRstETH.toFixed(2), superMaxAPRstETH.toFixed(2)],
      locktime: 0,
      providers: ['aave', 'lido'],
      assets: ['WETH', 'wstETH'],
      isStable: true,
      details:{
        description: `This strategy will swap your ETH for wstETH and stake it in Aave to create collateral for the protocol that allow you to borrow ETH to leveraged against standard ETH to gain an increased amount of ETH POS staking reward.`
      },
      chainId: market?.CHAIN_ID as number,
      poolAddress: market?.POOL as string,
      gateway: market?.WETH_GATEWAY as string,
      userSummaryAndIncentives: userSummaryAndIncentives as FormatUserSummaryAndIncentivesResponse<ReserveDataHumanized & FormatReserveUSDResponse>,
      step: [
        {
          type: 'swap',
          from: 'WETH',
          to: 'wstETH',
          title: `Swap WETH to wstETH`,
          description: `By swapping WETH to wstETH you will incrase your WETH holdings by ${baseAPRstETH.toFixed(2)}% APY revard from staking WETH on Lido.`,
          protocol: 'lido',
        },
        {
          type: 'deposit',
          from: 'wstETH',
          to: 'WETH',
          title: 'Deposit wstETH as collateral',
          description: `By deposit wstETH as collateral on AAVE you will be able to borrow up to ${userLiquidationThreshold*100}% of your wstETH value in WETH`,
          protocol: 'aave',
          reserve: poolReserveWSTETH as (ReserveDataHumanized & FormatReserveUSDResponse),
        }, {
          type: 'borrow',
          from: 'WETH',
          to: 'WETH',
          title: 'Borrow WETH',
          description: `By borrowing WETH on AAVE you will be able to increase your WETH holdings and use it for laverage stacking with wstETH APY reward.`,
          protocol: 'aave',
          reserve: poolReserveWETH as (ReserveDataHumanized & FormatReserveUSDResponse),
        }
      ]
    }));
  }, [
    poolGroups, 
    markets,
    userSummaryAndIncentives,
    baseAPRstETH,
    superMaxAPRstETH,
    poolReserveWETH,
    poolReserveWSTETH,
    userLiquidationThreshold,
    maxLeverageFactor,
    diffAPR
  ]);

  useEffect(() => {
    const {signal, abort} = new AbortController()
    getBaseAPRstETH()
      .then(({apr}) => setBaseAPRstETH(() => apr));
    // return () => abort();
  }, []); 

  return (
    <EthOptimizedContext.Provider value={state}>
      {children}
    </EthOptimizedContext.Provider>
  );
};