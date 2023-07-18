import { IonButton, IonCard, IonCol, IonGrid, IonImg, IonInput, IonItem, IonLabel, IonRow, IonText, IonThumbnail, useIonModal, IonSkeletonText } from "@ionic/react";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { useEffect, useRef, useState } from "react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { ethers } from "ethers";
import { getMaxAmountAvailableToSupply } from "../utils/getMaxAmountAvailableToSupply";
import { borrow, supplyWithPermit } from "../servcies/aave.service";
import { useLoader } from "../context/LoaderContext";
import { useUser } from "../context/UserContext";
import { useAave } from "../context/AaveContext";
import { useEthersProvider } from "../context/Web3Context";
import { ChainId, InterestRate, ReserveDataHumanized } from "@aave/contract-helpers";
import { getMaxAmountAvailableToBorrow } from "../utils/getMaxAmountAvailableToBorrow";
import { FormatReserveUSDResponse, FormatUserSummaryAndIncentivesResponse, valueToBigNumber } from "@aave/math-utils";
import { getPercent } from "../utils/utils";
import { swapWithLiFi } from "../servcies/lifi.service";
import { getBaseAPRstETH } from "../servcies/lido.service";
import { connect } from "../servcies/magic";
import { StrategyModal } from "./StrategyModal";


export interface IStrategy {
  chainId: number;
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
}

// Function that calcule maximum borrow/supply multiplicator user can do based on 
// The Maximum LTV ratio represents the maximum borrowing power of a specific collateral. 
// For example, if a collateral has an LTV of 75%, the user can borrow up to 0.75 worth of ETH in the principal currency for every 1 ETH worth of collateral.
const getMaxLeverageFactor = (ltv: number) => {
  // The Maximum LTV ratio is calculated as follows:
  // Maximum LTV = 1 / (1 - LTV)
  // For example, if the LTV is 75%, the maximum LTV is 1 / (1 - 0.75) = 4.
  return 1 / (1 - ltv);
};

export function Earn() {

  const { user, assets } = useUser();
  const { 
    poolReserves, 
    markets, 
    refresh, 
    userSummaryAndIncentives 
  } = useAave();
  const [baseAPRstETH, setBaseAPRstETH] = useState(0);
  const { initializeWeb3 } = useEthersProvider()

  const poolReserveWSTETH = poolReserves?.find(p => p.symbol === 'wstETH');
  const poolReserveWETH = poolReserves?.find(p => p.symbol === 'WETH');
  // calcul apr using `baseAPRstETH` and `poolReserveWETH.variableBorrowAPR * 100`
  const diffAPR = baseAPRstETH - Number(poolReserveWETH?.variableBorrowAPR||0) * 100;
  const threshold = Number(userSummaryAndIncentives?.currentLiquidationThreshold||0);
  const userLiquidationThreshold = Number( threshold === 0 
    ? poolReserveWETH?.formattedReserveLiquidationThreshold
    : userSummaryAndIncentives?.currentLiquidationThreshold
  );
  
  const maxLeverageFactor = getMaxLeverageFactor(userLiquidationThreshold);
  const maxAPRstETH = (diffAPR * maxLeverageFactor) + baseAPRstETH;

  const strategies: IStrategy[] = [
    {
      chainId: markets?.CHAIN_ID as number,
      name: "ETH Optimized",
      icon: getAssetIconUrl({symbol: 'ETH'}),
      apys: [`${baseAPRstETH.toFixed(2)}%`, `${maxAPRstETH.toFixed(2)}%`],
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
    }
  ];

  const onDepositToAAVE = async (
    ops: {
    strategy: IStrategy,
    provider: ethers.providers.Web3Provider,
    amount: number},
  ) => {
    const { strategy, provider, amount } = ops;
    const reserve = strategy.step.find(s => s.type === 'deposit')?.reserve
    if (!reserve) {
      throw new Error(
        "Invalid reserve"
      );
    }
    // handle invalid amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error(
        "Invalid amount. Value must be greater than 0."
      );
    }
    // call method
    const params = {
      provider,
      reserve,
      amount: amount.toString(),
      onBehalfOf: undefined,
      poolAddress: strategy.poolAddress,
      gatewayAddress: strategy.gateway,
    };
    console.log("params: ", params);
    try {
      const txReceipts = await supplyWithPermit(params);
      console.log("TX result: ", txReceipts);
      return { txReceipts };
    } catch (error) {
      throw error;
    }
  }

  const onBorrowFromAAVE = async (
    ops: {
    strategy: IStrategy,
    provider: ethers.providers.Web3Provider,
    amount: number},
  ) => {
    const { strategy, provider, amount } = ops;
    const reserve = strategy.step.find(s => s.type === 'borrow')?.reserve
    if (!reserve) {
      throw new Error(
        "Invalid reserve"
      );
    }
    // handle invalid amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error(
        "Invalid amount. Value must be greater than 0."
      );
    }
    // call method
    const params = {
      provider,
      reserve,
      amount: amount.toString(),
      onBehalfOf: undefined,
      poolAddress: strategy.poolAddress,
      gatewayAddress: strategy.gateway,
    };
    console.log("params: ", params);
    try {
      const txReceipts = await borrow(params);
      console.log("TX result: ", txReceipts);
      return { txReceipts };
    } catch (error) {
      throw error;
    }
  }

  const onSwapWithLiFi = async (
    ops: {
    strategy: IStrategy,
    provider: ethers.providers.Web3Provider,
    amount: number},
  ) => {
    const { strategy, provider, amount } = ops;
    const stepDeposit = strategy.step.find(s => s.type === 'deposit');
    const stepBorrow = strategy.step.find(s => s.type === 'borrow');
    if (!stepDeposit||!stepBorrow) {
      throw new Error(
        "Invalid step"
      );
    }
    // handle invalid amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error(
        "Invalid amount. Value must be greater than 0."
      );
    }
    // call method
    const fromAddress = await provider?.getSigner().getAddress();
    const receipt = await swapWithLiFi({
      fromAddress,
      fromAmount: amount.toString(),
      fromChain: provider.network.chainId.toString(),
      fromToken: stepBorrow.reserve?.underlyingAsset as string, // WETH
      toChain: provider.network.chainId.toString(),
      toToken: stepDeposit.reserve?.underlyingAsset as string, // wstETH
    }, provider);
    console.log("TX result: ", receipt);
    return { txReceipts: [receipt] };
  }

  const [present, dismiss] = useIonModal(StrategyModal, {
    strategy: strategies[0], // TODO: replace with state that contain current selected strategy
    onSwap: async ({...args}) => await onSwapWithLiFi(args as any),
    onDeposit: async ({...args}) => await onDepositToAAVE(args as any),
    onBorrow: async ({...args}) => await onBorrowFromAAVE(args as any),
    onDismiss: (data: string, role: string) => dismiss(data, role),
  });

  console.log('poolReserveWETH: ',{poolReserveWSTETH, poolReserveWETH, markets});
  
  const supplyPoolRatioInPercent = !poolReserveWSTETH
    ? 100
    : getPercent(
      valueToBigNumber(poolReserveWSTETH.totalLiquidityUSD).toNumber(),
      valueToBigNumber(poolReserveWSTETH.supplyCapUSD).toNumber()
    );

  useEffect(() => {
    getBaseAPRstETH().then(({apr}) => setBaseAPRstETH(() => apr));
  }, []);

  return (
    <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
      <IonRow class="ion-justify-content-center" >
        <IonCol size="12" size-md="12" size-lg="10" size-xl="10" class="ion-text-center">
        <IonText>
            <h1>
              Earn interest
            </h1>
          </IonText>
          <IonText color="medium">
            <p
              style={{
                lineHeight: "1.3rem",
              }}
            >
              <span style={{ maxWidth: "800px", display: "inline-block" }}>
              Unlock the full potential of your assets by earning interest through optimized liquid staking while simultaneously contributing to the network's security. 
              </span>
            </p>
          </IonText>
        </IonCol>
      </IonRow>
      <IonRow class="ion-justify-content-center">
        <IonCol class="ion-padding ion-text-center" size-md="12" size-lg="10" size-xl="10">
          <IonGrid class="ion-no-padding">
            <IonRow class="ion-justify-content-center">
              {strategies.map((strategy, index) => {
                return (
                  <IonCol size="auto" key={index}>
                    <IonCard style={{ maxWidth: 350 }}>
                      <IonGrid>
                        <IonRow class="ion-text-center">
                          <IonCol size="12" class="ion-padding">
                            <IonImg
                              style={{
                                padding: "0 2rem",
                                maxWidth: 200,
                                maxHeight: 200,
                                margin: "1rem auto 0",
                              }}
                              src={strategy.icon}
                            />
                          </IonCol>
                          <IonCol size="12" class="ion-padding-top">
                              <h1 className="ion-no-margin">
                                <IonText color="primary">
                                    {strategy.name}
                                </IonText>
                                <br />
                                <small>Strategy</small>
                              </h1>
                          </IonCol>
                        </IonRow>
                        <IonRow class="ion-padding">
                          <IonCol class="ion-padding">
                            <IonItem
                              style={{
                                "--background": "transparent",
                                "--inner-padding-end": "none",
                                "--padding-start": "none",
                              }}
                            >
                              <IonLabel>
                                Assets{" "}
                                <small>
                                  {strategy.isStable ? "(stable)" : null}
                                </small>
                              </IonLabel>
                              <div slot="end" style={{ display: "flex" }}>
                                {strategy.assets.map((symbol, index) => (
                                  <IonImg
                                    key={index}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      transform:
                                        index === 0
                                          ? "translateX(5px)"
                                          : "none",
                                    }}
                                    src={getAssetIconUrl({ symbol })}
                                    alt={symbol}
                                  />
                                ))}
                              </div>
                            </IonItem>
                            <IonItem
                              lines="none"
                              style={{
                                "--background": "transparent",
                                "--inner-padding-end": "none",
                                "--padding-start": "none",
                              }}
                            >
                              <IonLabel>APY</IonLabel>
                              {maxAPRstETH > 0 
                              ? (
                              <IonText slot="end">
                                {strategy.apys.join(" - ")}
                              </IonText>
                              ):  (
                                <IonSkeletonText animated style={{width: '6rem'}} slot="end"></IonSkeletonText>
                              )}
                            </IonItem>
                          </IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol
                            size="12"
                            class="ion-padding-horizontal ion-padding-bottom"
                          >
                            <IonButton
                              disabled={supplyPoolRatioInPercent >= 99}
                              onClick={() =>
                                user 
                                  ? present({
                                      cssClass: "modalAlert ",
                                      onWillDismiss: async (
                                        ev: CustomEvent<OverlayEventDetail>
                                      ) => {
                                        console.log("will dismiss", ev.detail);
                                      },
                                    })
                                  : connect().then(()=> {initializeWeb3()})
                              }
                              expand="block"
                              color="primary"
                            >
                              {user ? 'Start Earning' : 'Connect Wallet'}
                            </IonButton>
                              {maxAPRstETH > 0 && supplyPoolRatioInPercent >= 99 && (
                                <div className="ion-margin-top">
                                  <IonText color="warning">
                                    Reserve liquidity pool is full on this network. Try again later or switch to another network.
                                  </IonText>
                                </div>
                              )}
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCard>
                  </IonCol>
                );
              })}
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  )
} 

