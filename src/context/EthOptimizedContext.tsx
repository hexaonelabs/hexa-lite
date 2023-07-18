import { ReserveDataHumanized } from "@aave/contract-helpers";
import { FormatReserveUSDResponse, FormatUserSummaryAndIncentivesResponse } from "@aave/math-utils";
import { useContext, createContext, useState, useEffect } from "react";
import { useAave } from "./AaveContext";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { getBaseAPRstETH } from "../servcies/lido.service";

export type EthOptimizedContextType = {
  maxLeverageFactor: number;
  userLiquidationThreshold: number;
  name: string;
  icon: string;
  apys: string[];
  locktime: number,
  providers: string[],
  assets: string[],
  isStable: boolean,
  details: {
    description: string;
  },
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
 * The Maximum LTV ratio represents the maximum borrowing power of a specific collateral. 
 * For example, if a collateral has an LTV of 75%, the user can borrow up to 0.75 worth of ETH in the principal currency for every 1 ETH worth of collateral.
 * @param ltv 
 * @returns 
 */
export const getMaxLeverageFactor = (ltv: number) => {
  // The Maximum LTV ratio is calculated as follows:
  // Maximum LTV = 1 / (1 - LTV)
  // For example, if the LTV is 75%, the maximum LTV is 1 / (1 - 0.75) = 4.
  return 1 / (1 - ltv);
};

// Create a context for user data.
const EthOptimizedContext = createContext<EthOptimizedContextType|undefined>(undefined);

// Custom hook for accessing user context data.
export const useEthOptimizedStrategy = () => useContext(EthOptimizedContext);

// Provider component that wraps parts of the app that need user context.
export const EthOptimizedStrategyProvider = ({ children }: { children: React.ReactNode }) => {

  const [baseAPRstETH, setBaseAPRstETH] = useState(-1);
  const [state, setState] = useState<EthOptimizedContextType|undefined>(undefined);   
  const { 
    poolReserves, 
    markets, 
    refresh, 
    userSummaryAndIncentives 
  } = useAave();
  // find `wstETH` and `WETH` reserves from AAVE `poolReserves`
  const poolReserveWSTETH = poolReserves?.find(p => p.symbol === 'wstETH');
  const poolReserveWETH = poolReserves?.find(p => p.symbol === 'WETH');
  // calcul apr using `baseAPRstETH` and `poolReserveWETH.variableBorrowAPR * 100`
  const diffAPR = baseAPRstETH - Number(poolReserveWETH?.variableBorrowAPR||0) * 100;
  const userLiquidationThreshold =  Number(userSummaryAndIncentives?.currentLiquidationThreshold||0) === 0 
    ? Number(poolReserveWETH?.formattedReserveLiquidationThreshold)
    : Number(userSummaryAndIncentives?.currentLiquidationThreshold);
  const maxLeverageFactor = getMaxLeverageFactor(userLiquidationThreshold);
  const maxAPRstETH = (diffAPR * maxLeverageFactor) + baseAPRstETH;

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      maxLeverageFactor,
      userLiquidationThreshold,
      name: "ETH Optimized",
      icon: getAssetIconUrl({symbol: 'ETH'}),
      apys: [baseAPRstETH.toFixed(2), maxAPRstETH.toFixed(2)],
      locktime: 0,
      providers: ['aave', 'lido'],
      assets: ['WETH', 'wstETH'],
      isStable: true,
      details:{
        description: `This strategy will swap your ETH for wstETH and stake it in Aave to create collateral for the protocol that allow you to borrow ETH to leveraged against standard ETH to gain an increased amount of ETH POS staking reward.`
      },
      poolAddress: markets?.POOL as string,
      gateway: markets?.WETH_GATEWAY as string,
      userSummaryAndIncentives: userSummaryAndIncentives as FormatUserSummaryAndIncentivesResponse<ReserveDataHumanized & FormatReserveUSDResponse>,
      step: [
        {
          type: 'swap',
          from: 'WETH',
          to: 'wstETH',
          title: `Swap WETH to wstETH`,
          description: 'By swapping WETH to wstETH you will incrase your WETH holdings by 5% APY revard from staking WETH on Lido.',
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
          description: 'By borrowing WETH on AAVE you will be able to increase your WETH holdings and use it for laverage stacking with wstETH.',
          protocol: 'aave',
          reserve: poolReserveWETH as (ReserveDataHumanized & FormatReserveUSDResponse),
        }
      ]
    }));
  }, [
    poolReserves, 
    markets,
    userSummaryAndIncentives,
    baseAPRstETH,
    maxAPRstETH,
    poolReserveWETH,
    poolReserveWSTETH,
    userLiquidationThreshold,
    maxLeverageFactor
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