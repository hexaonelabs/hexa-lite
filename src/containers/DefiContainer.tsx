import {
  IonAccordion,
  IonAccordionGroup,
  IonAvatar,
  IonButton,
  IonButtons,
  IonCol,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonListHeader,
  IonPage,
  IonProgressBar,
  IonRange,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import {
  informationCircleOutline,
  closeSharp,
  openOutline,
  warningOutline,
} from "ionicons/icons";
import { useAave } from "../context/AaveContext";
import {
  ChainId,
  InterestRate,
  Pool,
  ReserveDataHumanized,
} from "@aave/contract-helpers";
import {
  ComputedUserReserve,
  FormatReserveUSDResponse,
  FormatUserSummaryAndIncentivesResponse,
  calculateHealthFactorFromBalancesBigUnits,
  valueToBigNumber,
} from "@aave/math-utils";
import { useEffect, useRef, useState } from "react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useUser, IAsset } from "../context/UserContext";
import ConnectButton from "../components/ConnectButton";
import { ethers } from "ethers";
import {
  borrow,
  repay,
  supplyWithPermit,
  withdraw,
} from "../servcies/aave.service";
import { useEthersProvider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";
import { FormattedNumber } from "../components/FormattedNumber";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { getPercent } from "../utils/utils";
import { getMaxAmountAvailableToSupply } from "../utils/getMaxAmountAvailableToSupply";
import { getMaxAmountAvailableToBorrow } from "../utils/getMaxAmountAvailableToBorrow";
import { getMaxAmountAvailableToWithdraw } from "../utils/getMaxAmountAvailableToWithdraw";
import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "../constants/chains";
import { PoolAccordionGroup } from "../components/PoolAccordionGroup";
import { IReserve } from "../interfaces/reserve.interface";
import { PoolHeaderList } from "../components/PoolHeaderList";

export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: "0.0001",
  [ChainId.arbitrum_one]: "0.0001",
};

const formatCurrencyValue = (
  balance: number,
  priceInUSD?: number,
  msg?: string
) => {
  const result = Number(balance) * Number(priceInUSD || 1);
  if (result > 1000000000000) {
    return "$" + (result / 1000000000000).toFixed(2) + "T";
  }
  if (result > 1000000000) {
    return "$" + (result / 1000000000).toFixed(2) + "B";
  }
  if (result > 1000000) {
    return "$" + (result / 1000000).toFixed(2) + "M";
  }
  if (result > 1000) {
    return "$" + (result / 1000).toFixed(2) + "K";
  }
  if (result <= 0) {
    return msg || "0";
  }
  return "$" + result.toFixed(2);
};

export const DefiContainer = ({
  handleSegmentChange,
}: {
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}) => {
  console.log("[INFO] {{DefiContainer}} rendering...");
  const { user, assets } = useUser();
  const { poolGroups, totalTVL, refresh, userSummaryAndIncentivesGroup } =
    useAave();

  function currencyFormat(
    num: number,
    ops?: { currency?: string; language?: string }
  ) {
    const currency = ops?.currency || "USD";
    const language = ops?.language || "en-US";
    return num.toLocaleString(language, {
      style: "currency",
      currency,
    });
  }

  const totalBorrowsUsd =
    userSummaryAndIncentivesGroup
      ?.map((summary) => Number(summary?.totalBorrowsUSD || 0))
      .reduce((a, b) => a + b, 0) || 0;
  const totalCollateralUsd =
    userSummaryAndIncentivesGroup
      ?.map((summary) => Number(summary?.totalCollateralUSD || 0))
      .reduce((a, b) => a + b, 0) || 0;

  // The % of your total borrowing power used.
  // This is based on the amount of your collateral supplied (totalCollateralUSD) and the total amount that you can borrow (totalCollateralUSD - totalBorrowsUsd).
  const percentBorrowingCapacity =
    100 - getPercent(totalBorrowsUsd, totalCollateralUsd);
  const progressBarFormatedValue = percentBorrowingCapacity / 100;

  return !poolGroups || poolGroups.length === 0 ? (
    <IonGrid class="ion-padding">
      <IonRow class="ion-padding">
        <IonCol size="12" class="ion-text-center ion-padding">
          <IonSpinner></IonSpinner>
        </IonCol>
      </IonRow>
    </IonGrid>
  ) : (
    <IonGrid class="ion-no-padding" style={{ marginBottom: "8rem" }}>
      <IonRow class="ion-justify-content-center ion-padding">
        <IonCol size="12" class="ion-text-center">
          <IonText>
            <h1>DeFi liquidity protocol</h1>
          </IonText>
          <IonText color="medium">
            <p
              style={{
                lineHeight: "1.5rem",
              }}
            >
              <span style={{ maxWidth: "800px", display: "inline-block" }}>
                Connect to the best DeFi liquidity protocols, borrow assets
                using your crypto as collateral and earn interest by providing
                liquidity over
              </span>
              <span
                style={{
                  fontSize: "2rem",
                  display: "block",
                  color: "var(--ion-color-primary)",
                  margin: "1rem 1rem 3rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  lineHeight: "1.8rem",
                }}
              >
                {currencyFormat(totalTVL || 0)} TVL
              </span>
            </p>
          </IonText>
        </IonCol>
      </IonRow>

      <IonRow class="ion-justify-content-center ion-padding">
        <IonCol class="widgetWrapper" size-md="12" size-lg="10" size-xl="10">
          {user && percentBorrowingCapacity > 0 ? (
            <IonAccordionGroup>
              <IonAccordion className="dashboardItem">
                <IonItem slot="header">
                  <IonGrid class="ion-no-padding">
                    <IonRow class="ion-text-center">
                      <IonCol
                        size="12"
                        size-md="4"
                        class=" ion-padding-vertical ion-margin-vertical"
                      >
                        <h3>{currencyFormat(+totalCollateralUsd)}</h3>
                        <IonText color="medium">
                          <p>
                            DEPOSIT BALANCE
                            <br />
                            <small>
                              Total of all collaterals used to borrow assets
                            </small>
                          </p>
                        </IonText>
                      </IonCol>
                      <IonCol
                        size="12"
                        size-md="4"
                        class=" ion-padding-vertical ion-margin-vertical"
                      >
                        <h3>{Number(percentBorrowingCapacity.toFixed(2))}%</h3>
                        <div className="ion-margin-horizontal">
                          <IonProgressBar
                            color="success"
                            value={progressBarFormatedValue}
                            style={{
                              background: "var(--ion-color-danger)",
                              height: "0.5rem",
                            }}
                          ></IonProgressBar>
                        </div>
                        <IonText color="medium">
                          <p>
                            BORROWING CAPACITY
                            <IonIcon
                              icon={informationCircleOutline}
                              style={{
                                transform: "scale(0.8)",
                                marginLeft: "0.2rem",
                                cursor: "pointer",
                              }}
                            />
                            <br />
                            <small>
                              {currencyFormat(+totalBorrowsUsd)} of{" "}
                              {currencyFormat(totalCollateralUsd)}
                            </small>
                          </p>
                        </IonText>
                      </IonCol>
                      <IonCol
                        size="12"
                        size-md="4"
                        class=" ion-padding-vertical ion-margin-vertical"
                      >
                        <h3>{currencyFormat(totalBorrowsUsd)}</h3>
                        <IonText color="medium">
                          <p>
                            BORROW BALANCE
                            <br />
                            <small>
                              Total amount borrowed accross networks
                            </small>
                          </p>
                        </IonText>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonItem>

                <div slot="content">
                  <IonGrid className="ion-no-padding">
                    <IonRow
                      style={{ paddingRight: "70px" }}
                      class="ion-no-padding ion-padding-start ion-align-items-center ion-justify-content-between"
                    >
                      <IonCol
                        size-md="2"
                        class="ion-text-start ion-padding-start"
                      >
                        <IonLabel color="medium">
                          <h3>Protocol</h3>
                        </IonLabel>
                      </IonCol>
                      <IonCol
                        size="auto"
                        size-md="2"
                        class="ion-text-end ion-hide-md-down"
                      >
                        <IonLabel color="medium">
                          <h3>Deposit balance</h3>
                        </IonLabel>
                      </IonCol>
                      <IonCol
                        size="auto"
                        size-md="2"
                        class="ion-text-end ion-hide-md-down"
                      >
                        <IonLabel color="medium">
                          <h3>Borrow balance</h3>
                        </IonLabel>
                      </IonCol>
                      <IonCol
                        size="auto"
                        size-md="2"
                        class="ion-text-end ion-hide-md-down"
                      >
                        <IonLabel color="medium">
                          <h3>Borrowing Capacity</h3>
                        </IonLabel>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                  {/* AAVE Protocol */}
                  {userSummaryAndIncentivesGroup
                    ?.filter((summary) => Number(summary.healthFactor) > 0)
                    ?.map((summary, index) => (
                      <IonItem key={index} lines="none">
                        <IonGrid className="ion-no-padding">
                          <IonRow className="poolItemList ion-align-items-center ion-justify-content-between ion-no-padding ion-padding-start">
                            <IonCol
                              size-md="2"
                              class="ion-text-start ion-padding-start"
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
                              class="ion-text-end ion-hide-md-down"
                            >
                              <IonText color="dark">
                                {currencyFormat(+summary.totalCollateralUSD)}
                              </IonText>
                            </IonCol>
                            <IonCol
                              size="auto"
                              size-md="2"
                              class="ion-text-end ion-hide-md-down"
                            >
                              <IonText color="dark">
                                {currencyFormat(+summary.totalBorrowsUSD)}
                              </IonText>
                            </IonCol>
                            <IonCol
                              size="auto"
                              size-md="2"
                              class="ion-text-end ion-hide-md-down"
                              style={{ marginRight: "74px" }}
                            >
                              <IonText color="dark">
                                {currencyFormat(+summary.totalBorrowsUSD)} of{" "}
                                {currencyFormat(+summary.totalCollateralUSD)}{" "}
                                <small>
                                  ({percentBorrowingCapacity.toFixed(2)}%)
                                </small>
                              </IonText>
                              <IonProgressBar
                                color="success"
                                value={
                                  (100 -
                                    getPercent(
                                      +summary.totalBorrowsUSD,
                                      +summary.totalCollateralUSD
                                    )) /
                                  100
                                }
                                style={{
                                  background: "var(--ion-color-danger)",
                                  height: "0.2rem",
                                  marginTop: "0.25rem",
                                }}
                              ></IonProgressBar>
                            </IonCol>
                          </IonRow>
                        </IonGrid>
                      </IonItem>
                    ))}
                </div>
              </IonAccordion>
            </IonAccordionGroup>
          ) : (
            <IonGrid class="ion-no-padding">
              <IonRow class="ion-text-center">
                <IonCol
                  size="12"
                  class=" ion-padding ion-margin-vertical ion-text-center"
                >
                  <IonText>
                    <p>
                      {!user ? "Connect wallet, deposit" : "Deposit"}, assets as
                      collateral to borrow assets and start earning interest
                    </p>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          )}
        </IonCol>
      </IonRow>

      <IonRow class="ion-justify-content-center ion-padding">
        <IonCol
          class="widgetWrapper"
          size-xs="12"
          size-sm="12"
          size-md="12"
          size-lg="10"
          size-xl="10"
        >
          <div className="">
            <h3
              style={{
                textAlign: "center",
                margin: "3rem auto",
              }}
            >
              Available Markets
            </h3>
            {/* list header */}
            <PoolHeaderList
              titles={[
                "Assets",
                "Networks",
                "Total deposits",
                " Total borrows",
                "Best deposit APY",
                "Best borrow APY",
              ]}
            />
            <IonAccordionGroup>
              {poolGroups.map((poolGroup, index) => (
                <PoolAccordionGroup
                  key={index}
                  handleSegmentChange={handleSegmentChange}
                  refresh={refresh}
                  poolGroup={poolGroup}
                  userSummaryAndIncentivesGroup={userSummaryAndIncentivesGroup}
                />
              ))}
            </IonAccordionGroup>
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
