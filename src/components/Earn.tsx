import { IonCol, IonGrid,  IonRow, IonText } from "@ionic/react";
import { EthOptimizedStrategyProvider } from "../context/EthOptimizedContext";
import { EthOptimizedStrategyCard } from "./ETHOptimizedStrategy";

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

              {/* ETH Staking Strategy */}
              {/* <EthStakingStrategyProvider>
                <EthStakingStrategyCard></EthStakingStrategyCard>
              </EthStakingStrategyProvider> */}

              {/* ETH Optimized Strategy */}
              <EthOptimizedStrategyProvider>
                <EthOptimizedStrategyCard></EthOptimizedStrategyCard>
              </EthOptimizedStrategyProvider>
              
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  )
} 

