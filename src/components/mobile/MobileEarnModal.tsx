import {
  IonAvatar,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { MarketList } from "../MarketsList";
import {
  initializePools,
  initializeUserSummary,
} from "@/store/effects/pools.effect";
import Store from "@/store";
import {
  getPoolGroupsState,
  getUserSummaryAndIncentivesGroupState,
  getWeb3State,
} from "@/store/selectors";
import { patchPoolsState } from "@/store/actions";
import { CHAIN_AVAILABLES } from "@/constants/chains";
import { getReadableValue } from "@/utils/getReadableValue";
import { ETHLiquidStakingstrategyCard } from "../ETHLiquidStakingstrategy";
import { MATICLiquidStakingstrategyCard } from "../MATICLiquidStakingstrategy";

export const MobileEarnModal = () => {
  const [segment, setSegment] = useState("loan");
  const { walletAddress } = Store.useState(getWeb3State);
  const userSummaryAndIncentivesGroup = Store.useState(
    getUserSummaryAndIncentivesGroupState
  );
  const poolGroups = Store.useState(getPoolGroupsState);

  const totalTVL = useMemo(() => {
    return poolGroups
      .flatMap((g) => g.pools)
      .reduce(
        (prev, current) => prev + Number(current.totalLiquidityUSD || 0),
        0
      );
  }, [poolGroups]);

  useEffect(() => {
    if (poolGroups.length > 0 && totalTVL > 0) {
      return;
    }
    initializePools();
  }, []);

  useEffect(() => {
    if (!walletAddress) {
      patchPoolsState({ userSummaryAndIncentivesGroup: null });
      return;
    }
    if (!userSummaryAndIncentivesGroup && walletAddress) {
      initializeUserSummary(walletAddress);
    }
  }, [walletAddress, userSummaryAndIncentivesGroup]);

  return (
    <>
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar
          style={{ "--background": "transparent" }}
          className="ion-padding-vertical"
        >
          <IonSegment value={segment}>
            <IonSegmentButton
              value="loan"
              onClick={() => setSegment(() => "loan")}
            >
              <IonText>Loan market</IonText>
            </IonSegmentButton>
            <IonSegmentButton
              value="earn"
              onClick={() => setSegment(() => "earn")}
            >
              <IonText>Earn</IonText>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-no-padding mobileConentModal">
        {segment === "loan" && (
          <IonGrid className="ion-no-padding">
            <IonRow className="ion-text-center">
              <IonCol
                size="12"
                class="ion-text-center ion-margin-top ion-padding"
              >
                <IonText>
                  <h1>Available Markets</h1>
                </IonText>
                <IonText color="medium">
                  <p
                    style={{
                      lineHeight: "1.2rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span
                      style={{ maxWidth: "800px", display: "inline-block" }}
                    >
                      Connect to DeFi liquidity protocols and access to{" "}
                      {poolGroups.length > 0 ? (
                        poolGroups.length
                      ) : (
                        <IonSkeletonText
                          animated={true}
                          style={{ width: "20px", display: "inline-block" }}
                        />
                      )}{" "}
                      open markets across{" "}
                      {
                        CHAIN_AVAILABLES.filter(
                          (chain) =>
                            chain.type === "evm" || chain.type === "solana"
                        ).length
                      }{" "}
                      networks, borrow assets using your crypto as collateral
                      and earn interest without any restrictions or censorship
                      by providing liquidity over a
                    </span>
                    <span
                      className="ion-color-gradient-text"
                      style={{
                        fontSize: "2rem",
                        display: "block",
                        margin: "1rem 1rem 3rem",
                        fontWeight: 600,
                        lineHeight: "1.8rem",
                      }}
                    >
                      {}
                      {(totalTVL || 0) > 0 ? (
                        "$" + getReadableValue(totalTVL || 0)
                      ) : (
                        <IonSkeletonText
                          animated={true}
                          style={{
                            width: "80px",
                            display: "inline-block",
                            height: "30px",
                            marginLeft: "0.25rem",
                            verticalAlign: "top",
                          }}
                        />
                      )}{" "}
                      TVL
                    </span>
                  </p>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow className="ion-no-padding">
              <IonCol className="ion-no-padding">
                <MarketList
                  totalTVL={totalTVL}
                  handleSegmentChange={() => {}}
                />
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        {segment === "earn" && (
          <IonGrid className="ion-no-padding">
            <IonRow className="ion-text-center">
              <IonCol
                size="12"
                class="ion-text-center ion-margin-top ion-padding"
              >
                <IonText>
                  <h1>Earn interest</h1>
                </IonText>
                <IonText color="medium">
                  <p
                    style={{
                      lineHeight: "1.2rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span
                      style={{ maxWidth: "800px", display: "inline-block" }}
                    >
                      Unlock the full potential of your assets by earning
                      intrest through Liquid Staking or Providing Liquidity to
                      the markets
                    </span>
                  </p>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="12" className="ion-margin-top ion-padding-top">
                <IonList style={{'background': 'transparent'}}>
                  <ETHLiquidStakingstrategyCard asItem={true} />
                  <MATICLiquidStakingstrategyCard asItem={true} />
                </IonList>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </IonContent>
    </>
  );
};
