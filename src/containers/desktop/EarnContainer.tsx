import { IonCol, IonGrid, IonRow, IonText } from "@ionic/react";
import { ETHLiquidStakingstrategyCard } from "../../components/ETHLiquidStakingstrategy";
import { MATICLiquidStakingstrategyCard } from "../../components/MATICLiquidStakingstrategy";
import { ATOMLiquidStakingstrategyCard } from "@/components/ATOMLiquidStakingstrategy";
import { ETHsfrxLiquidStakingstrategyCard } from "@/components/ETHsfrxLiquidStakingstrategy";
import { MoreInfo } from "@/components/MoreInfo";

const LSTInfo = () => {
  return (
    <>
      <p>
        Staking is when you lock crypto assets for a set period of time to help support the operation of a blockchain. In return for staking your crypto, you earn more cryptocurrency.
      </p>
      <p>
        Many blockchains use a proof of stake consensus mechanism. Under this system, network participants who want to support the blockchain by validating new transactions and adding new blocks must “stake” set sums of cryptocurrency.
      </p>
      <p>
        Liquid Staking is a process that allows you to earn staking rewards while
        keeping your assets liquid. 
      </p>
      <p>  
        A liquid staking token is a tokenized representation of staked assets. 
      </p>
      <p>
        When a user stakes their assets, they receive an equivalent amount of Liquid Staking Tokens.
      </p>
      <p>
        These LSTs can then be traded, sold, or used in other DeFi protocols, providing liquidity to the staker even while their original assets remain staked.
      </p>
    </>
  );
}

export default function EarnContainer() {
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
                through <IonText>Liquid Staking<MoreInfo><LSTInfo /></MoreInfo> </IonText> while simultaneously
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

              {/* <IonCol size="auto" className="ion-padding">
                <ETHsfrxLiquidStakingstrategyCard />
              </IonCol> */}

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
