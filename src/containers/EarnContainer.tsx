import { IonCol, IonGrid, IonRow, IonText } from "@ionic/react";
import { ETHLiquidStakingstrategyCard } from "../components/ETHLiquidStakingstrategy";
import { MATICLiquidStakingstrategyCard } from "../components/MATICLiquidStakingstrategy";
import { ATOMLiquidStakingstrategyCard } from "@/components/ATOMLiquidStakingstrategy";

export function EarnContainer() {
  return (
    <IonGrid class="ion-no-padding" style={{ marginBottom: "8rem" }}>
      <IonRow class="ion-justify-content-center ion-padding">
        <IonCol
          size="12"
          size-md="12"
          size-lg="10"
          size-xl="10"
          class="ion-text-center"
        >
          <IonText>
            <h1>Earn interest</h1>
          </IonText>
          <IonText color="medium">
            <p
              style={{
                lineHeight: "1.5rem",
              }}
            >
              <span style={{ maxWidth: "800px", display: "inline-block" }}>
                Unlock the full potential of your assets by earning interest
                through liquid staking while simultaneously
                contributing to the networks security.
              </span>
            </p>
          </IonText>
        </IonCol>
      </IonRow>
      <IonRow class="ion-justify-content-center">
        <IonCol
          class="ion-padding ion-text-center"
          size-md="12"
          size-lg="10"
          size-xl="10"
        >
          <IonGrid class="ion-no-padding" style={{ height: "100%" }}>
            <IonRow
              class="ion-justify-content-center"
              style={{ height: "100%" }}
            >
              {/* ETH Staking Strategy */}
              <IonCol size="auto" className="ion-padding">
                <ETHLiquidStakingstrategyCard />
              </IonCol>

              {/* ETH Optimized Strategy */}
              {/* <IonCol size="auto" className="ion-padding-bottom">
                <EthOptimizedStrategyProvider>
                  <EthOptimizedStrategyCard />
                </EthOptimizedStrategyProvider>
              </IonCol> */}
              <IonCol size="auto" className="ion-padding">
                <MATICLiquidStakingstrategyCard />
              </IonCol>
              {/* <IonCol size="auto" className="ion-padding-bottom">
                <ATOMLiquidStakingstrategyCard />
              </IonCol> */}
            </IonRow>
          </IonGrid>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}
