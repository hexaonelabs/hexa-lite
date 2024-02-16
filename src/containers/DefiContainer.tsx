import {
  IonAccordion,
  IonAccordionGroup,
  IonAvatar,
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonProgressBar,
  IonRow,
  IonSkeletonText,
  IonText,
} from "@ionic/react";
import { chevronDownOutline } from "ionicons/icons";
import { ChainId } from "@aave/contract-helpers";

import { getPercent } from "../utils/utils";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { useEffect, useState } from "react";
import { MarketList } from "../components/MarketsList";
import { currencyFormat } from "../utils/currency-format";
import { valueToBigNumber } from "@aave/math-utils";
import { getReadableValue } from "@/utils/getReadableValue";
import Store from "@/store";
import { getPoolGroupsState, getProtocolSummaryState, getUserSummaryAndIncentivesGroupState, getWeb3State } from "@/store/selectors";
import { initializePools, initializeUserSummary } from "@/store/effects/pools.effect";
import { patchPoolsState } from "@/store/actions";

export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: "0.0001",
  [ChainId.arbitrum_one]: "0.0001",
};

export const DefiContainer = ({
  handleSegmentChange,
}: {
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}) => {
  const { walletAddress } = Store.useState(getWeb3State);
  const userSummaryAndIncentivesGroup = Store.useState(getUserSummaryAndIncentivesGroupState);
  const poolGroups = Store.useState(getPoolGroupsState);
  const protocolSummary = Store.useState(getProtocolSummaryState);
  const [filterBy, setFilterBy] = useState<{ [key: string]: string } | null>(
    null
  );

  const totalBorrowsUsd = protocolSummary.reduce((prev, current)=> {
    return prev + current.totalBorrowsUSD;
  }, 0);
  const totalSupplyUsd = protocolSummary.reduce((prev, current)=> {
    return prev + current.totalSupplyUSD;
  }, 0);
  const totalCollateralUsd = protocolSummary.reduce((prev, current)=> {
    return prev + current.totalCollateralUSD;
  }, 0);
  
  // The % of your total borrowing power used.
  // This is based on the amount of your collateral supplied (totalCollateralUSD) and the total amount that you can borrow (totalCollateralUSD - totalBorrowsUsd)
  // remove `currentLiquidationThreshold` present in the `userSummaryAndIncentivesGroup` response
  const totalLiquidationThreshold = protocolSummary.reduce((prev, current)=> {
    return prev + current.currentLiquidationThreshold;
  }, 0);

  const totalBorrowableUsd = protocolSummary.reduce((prev, current)=> {
    // summary.totalCollateralUSD *
    //                                   summary.currentLiquidationThreshold
    return prev + valueToBigNumber(current.totalCollateralUSD).multipliedBy(current.currentLiquidationThreshold).toNumber();
  }, 0);
  const percentBorrowingCapacity = 100 - getPercent(totalBorrowsUsd, totalBorrowableUsd);
  // const progressBarFormatedValue = percentBorrowingCapacity / 100;
  const totalAbailableToBorrow = totalBorrowableUsd - totalBorrowsUsd;
  const totalTVL = poolGroups
    .flatMap(g => g.pools)
    .reduce((prev, current) => prev + Number(current.totalLiquidityUSD||0), 0);

  console.log("[INFO] {{DefiContainer}} poolGroups > ", {
    poolGroups,
    userSummaryAndIncentivesGroup,
    totalLiquidationThreshold,
    totalCollateralUsd,
    totalBorrowableUsd,
    protocolSummary,
  });

  useEffect(() => {
    if (poolGroups.length > 0 && totalTVL > 0) {
      return;
    }
    initializePools();
  }, []);

  useEffect(() => {
    if (!walletAddress ) {
      patchPoolsState({ userSummaryAndIncentivesGroup: null });
      return;
    }
    if (!userSummaryAndIncentivesGroup && walletAddress) {
      initializeUserSummary(walletAddress);
    }
  }, [walletAddress, userSummaryAndIncentivesGroup]);

  return (
    <IonGrid class="ion-no-padding" style={{ marginBottom: "8rem" }}>
      <IonRow class="ion-justify-content-center ion-padding">
        <IonCol size="12" class="ion-text-center">
          <IonText>
            <h1>Lending & Borrowing Markets</h1>
          </IonText>
          <IonText color="medium">
            <p
              style={{
                lineHeight: "1.5rem",
              }}
            >
              <span style={{ maxWidth: "800px", display: "inline-block" }}>
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
                  CHAIN_AVAILABLES.filter((chain) => chain.type === "evm" || chain.type === 'solana')
                    .length
                }{" "}
                networks, borrow assets using your crypto as collateral and earn
                interest without any restrictions or censorship by providing
                liquidity over a
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
                {
                  
                }
                {(totalTVL || 0) > 0 ? (
                  '$' + getReadableValue(totalTVL || 0)
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

      {walletAddress && poolGroups && poolGroups.length > 0 && (
        <IonRow class="ion-justify-content-center ion-padding">
          <IonCol class="widgetWrapper" size-md="12" size-lg="10" size-xl="10">
            <IonAccordionGroup>
              <IonAccordion className="dashboardItem">
                <IonItem slot="header">
                  <IonGrid class="ion-no-padding">
                    <IonRow class="ion-text-center">
                      <IonCol
                        size="12"
                        size-md="4"
                        class=" ion-padding-vertical"
                      >
                        <h3>{currencyFormat(totalSupplyUsd)}</h3>
                        <p>
                          DEPOSIT BALANCE
                          <IonText color="medium">
                            <br />
                            <small>
                              Total funds deposited across all protocols
                            </small>
                          </IonText>
                        </p>
                      </IonCol>
                      <IonCol
                        size="12"
                        size-md="4"
                        class=" ion-padding-vertical"
                      >
                        <h3>{Number(percentBorrowingCapacity.toFixed(2))}%</h3>
                        <p>
                          BORROWING CAPACITY
                          <IonText color="medium">
                            <br />
                            <small>
                              {currencyFormat(+totalBorrowsUsd)} of{" "}
                              {currencyFormat(totalBorrowableUsd)}
                            </small>
                          </IonText>
                        </p>
                      </IonCol>
                      <IonCol
                        size="12"
                        size-md="4"
                        class=" ion-padding-vertical"
                      >
                        <h3>{currencyFormat(totalAbailableToBorrow)}</h3>
                        <p>
                          AVAILABLE TO BORROW
                          <IonText color="medium">
                            <br />
                            <small>Amount that you can borrow</small>
                          </IonText>
                        </p>
                      </IonCol>
                      <IonCol
                        size="12"
                        style={{
                          marginTop: " -2rem",
                        }}
                      >
                        <IonButton
                          expand="block"
                          fill="clear"
                          size="small"
                          className="ion-margin-horizontal"
                        >
                          <IonIcon
                            color="gradient"
                            icon={chevronDownOutline}
                          ></IonIcon>
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonItem>

                <div slot="content">
                  {walletAddress && totalCollateralUsd > 0 && (
                    <>
                      <IonGrid className="ion-no-padding">
                        <IonRow class="ion-no-padding ion-padding-start ion-align-items-center ion-justify-content-between">
                          <IonCol
                            size-md="3"
                            class="ion-text-start ion-padding-horizontal"
                          >
                            <IonLabel color="medium">
                              <h3>Protocols</h3>
                            </IonLabel>
                          </IonCol>
                          <IonCol
                            size="auto"
                            size-md="2"
                            class="ion-padding-horizontal ion-text-end ion-hide-md-down"
                          >
                            <IonLabel color="medium">
                              <h3>Deposit balance</h3>
                            </IonLabel>
                          </IonCol>
                          <IonCol
                            size="auto"
                            size-md="2"
                            class="ion-padding-horizontal ion-text-end ion-hide-md-down"
                          >
                            <IonLabel color="medium">
                              <h3>Borrow balance</h3>
                            </IonLabel>
                          </IonCol>
                          <IonCol
                            size="auto"
                            size-md="2"
                            class="ion-padding-horizontal ion-text-end ion-hide-md-down"
                          >
                            <IonLabel color="medium">
                              <h3>Available to Borrow</h3>
                            </IonLabel>
                          </IonCol>
                          <IonCol
                            size="6"
                            size-md="3"
                            class="ion-padding-horizontal ion-text-end"
                          >
                            <IonLabel color="medium">
                              <h3>Borrowing Capacity</h3>
                            </IonLabel>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                      {/* Pools grouped by Protocol and Chain */}
                      {protocolSummary.map((summary, i) => (
                        <IonItem
                          key={i}
                          lines="none"
                          style={{ cursor: "default" }}
                          onClick={() => {
                            setFilterBy((s) => ({
                              ...s,
                              chainId: summary.chainId.toString(),
                              protocol: summary.provider,
                            }));
                          }}
                        >
                          <IonGrid
                            className={"ion-no-padding "}
                            style={{
                              paddingBottom:
                                i !== protocolSummary.length - 1 ? "0" : "1rem",
                            }}
                          >
                            <IonRow className="poolItemList ion-align-items-center ion-justify-content-between ion-no-padding ion-padding-start ion-padding-vertical">
                              <IonCol
                                size-md="3"
                                class="ion-padding-horizontal ion-text-start"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  alignContent: "center",
                                }}
                              >
                                <div>
                                  <IonAvatar
                                    style={{
                                      height: "38px",
                                      width: "38px",
                                      minHeight: "38px",
                                      minWidth: "38px",
                                    }}
                                  >
                                    <IonImg src="./assets/icons/aave.svg"></IonImg>
                                  </IonAvatar>
                                  <IonIcon
                                    style={{
                                      fontSize: "0.8rem",
                                      transform: "translateX(-0.2rem)",
                                      position: "absolute",
                                      bottom: "0.15rem",
                                    }}
                                    src={
                                      CHAIN_AVAILABLES.find(
                                        (c) => c.id === summary.chainId
                                      )?.logo
                                    }
                                  ></IonIcon>
                                </div>
                                <IonLabel class="ion-padding-start">
                                  AAVE V3
                                  <p>
                                    <small>
                                      {
                                        CHAIN_AVAILABLES.find(
                                          (c) => c.id === summary.chainId
                                        )?.name
                                      }{" "}
                                      network
                                    </small>
                                  </p>
                                </IonLabel>
                              </IonCol>
                              <IonCol
                                size="auto"
                                size-md="2"
                                class="ion-padding-horizontal ion-text-end ion-hide-md-down"
                              >
                                <IonText color="dark">
                                  {currencyFormat(+summary.totalSupplyUSD)}
                                  <br />
                                  <IonText color="medium">
                                    <small>
                                      {currencyFormat(
                                        summary.totalSupplyUSD *
                                          summary.currentLiquidationThreshold
                                      )}{" "}
                                      as Collatreral
                                    </small>
                                  </IonText>
                                </IonText>
                              </IonCol>
                              <IonCol
                                size="auto"
                                size-md="2"
                                class="ion-padding-horizontal ion-text-end ion-hide-md-down"
                              >
                                <IonText color="dark">
                                  {currencyFormat(+summary.totalBorrowsUSD)}
                                </IonText>
                              </IonCol>
                              <IonCol
                                size="auto"
                                size-md="2"
                                class="ion-padding-horizontal ion-text-end ion-hide-md-down"
                              >
                                <IonText color="dark">
                                  {currencyFormat(
                                    (summary.totalCollateralUSD *
                                      summary.currentLiquidationThreshold) -
                                      summary.totalBorrowsUSD
                                  )}
                                </IonText>
                              </IonCol>
                              <IonCol
                                size="6"
                                size-md="3"
                                class="ion-padding-horizontal ion-text-end"
                              >
                                <IonText color="dark">
                                  {currencyFormat(+summary.totalBorrowsUSD)} of{" "}
                                  {currencyFormat(
                                    summary.totalCollateralUSD *
                                      summary.currentLiquidationThreshold
                                  )}{" "}
                                  <small>
                                    (
                                    {(
                                      100 -
                                      getPercent(
                                        +summary.totalBorrowsUSD,
                                        summary.totalCollateralUSD *
                                          summary.currentLiquidationThreshold
                                      )
                                    ).toFixed(2)}
                                    %)
                                  </small>
                                </IonText>
                                <IonProgressBar
                                  color="success"
                                  value={
                                    (100 -
                                      getPercent(
                                        +summary.totalBorrowsUSD,
                                        summary.totalCollateralUSD *
                                          summary.currentLiquidationThreshold
                                      )) /
                                    100
                                  }
                                  style={{
                                    background: "var(--ion-color-danger)",
                                    height: "0.2rem",
                                    marginTop: "0.25rem",
                                    maxWidth: "250px",
                                    display: "inline-block",
                                  }}
                                ></IonProgressBar>
                              </IonCol>
                            </IonRow>
                          </IonGrid>
                        </IonItem>
                      ))}
                    </>
                  )}
                  {(!walletAddress || totalCollateralUsd === 0) && (
                    <IonGrid class="ion-no-padding">
                      <IonRow class="ion-text-center">
                        <IonCol
                          size="12"
                          class="ion-text-center ion-padding-horizontal"
                        >
                          <IonText>
                            <p>
                              {!walletAddress
                                ? "Connect wallet and deposit"
                                : "Deposit"}{" "}
                              assets as collateral to start earning interest and
                              enable borrowing
                            </p>
                          </IonText>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  )}
                </div>
              </IonAccordion>
            </IonAccordionGroup>
          </IonCol>
        </IonRow>
      )}

      <IonRow class="ion-justify-content-center ion-padding">
        <IonCol
          class="widgetWrapper"
          size-xs="12"
          size-sm="12"
          size-md="12"
          size-lg="10"
          size-xl="10"
        >
          <div>
            <h3
              style={{
                textAlign: "center",
                margin: "3rem auto 1rem",
              }}
            >
              Available Markets
            </h3>
            <MarketList
              totalTVL={totalTVL}
              handleSegmentChange={handleSegmentChange}
              filterBy={filterBy ? undefined : undefined}
            />
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
