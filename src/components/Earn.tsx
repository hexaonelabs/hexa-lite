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
import { EthOptimizedStrategyProvider } from "../context/EthOptimizedContext";
import { EthOptimizedStrategyCard } from "./ETHOptimizedStrategy";


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
              <EthOptimizedStrategyProvider>
                <EthOptimizedStrategyCard></EthOptimizedStrategyCard>
              </EthOptimizedStrategyProvider>
              {/* {strategies.map((strategy, index) => {
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
              })} */}
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  )
} 

