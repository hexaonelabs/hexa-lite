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
  IonSpinner,
  IonText,
} from "@ionic/react";
import { chevronDownOutline } from "ionicons/icons";
import { useAave } from "../context/AaveContext";
import { ChainId } from "@aave/contract-helpers";

import { getPercent } from "../utils/utils";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { useEffect, useState } from "react";
import { MarketList } from "../components/MarketsList";
import { currencyFormat } from "../utils/currency-format";
import { useWeb3Provider } from "../context/Web3Context";
import { A } from "@bgd-labs/aave-address-book/dist/AaveV2EthereumAMM-7c73b6ab";
import { valueToBigNumber } from "@aave/math-utils";
import { getReadableAmount } from "@/utils/getReadableAmount";

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
  const { walletAddress, assets } = useWeb3Provider();
  const { poolGroups, totalTVL, refresh, userSummaryAndIncentivesGroup } =
    useAave();
  const [filterBy, setFilterBy] = useState<{ [key: string]: string } | null>(
    null
  );
  
  const totalBorrowsUsd = poolGroups
    .map((pool) => valueToBigNumber(pool.totalBorrowBalance).multipliedBy(pool.priceInUSD).toFixed(2))
    .map((amount) => Number(amount))
    .reduce((a, b) => a + b, 0) || 0;
  const totalSupplyUsd = poolGroups
    .map((pool) => valueToBigNumber(pool.totalSupplyBalance).multipliedBy(pool.priceInUSD).toFixed(2))
    .map((amount) => Number(amount))
    .reduce((a, b) => a + b, 0) || 0;
  const totalCollateralUsd =
    userSummaryAndIncentivesGroup
      ?.map((summary) => Number(summary?.totalCollateralUSD || 0))
      .reduce((a, b) => a + b, 0) || 0;
  // The % of your total borrowing power used.
  // This is based on the amount of your collateral supplied (totalCollateralUSD) and the total amount that you can borrow (totalCollateralUSD - totalBorrowsUsd)
  // remove `currentLiquidationThreshold` present in the `userSummaryAndIncentivesGroup` response
  const poolGroupsWithUserLiquidationThresholdValue = poolGroups
    .flatMap(({pools}) => pools)
    .filter(
        (pool) => pool.userLiquidationThreshold > 0
    );
  const totalLiquidationThreshold = poolGroupsWithUserLiquidationThresholdValue
    .map((pool) =>pool.userLiquidationThreshold )
    .reduce((a, b) => a + b, 0) / poolGroupsWithUserLiquidationThresholdValue.length||0;

  const totalBorrowableUsd = totalCollateralUsd * totalLiquidationThreshold;
  const percentBorrowingCapacity =
    100 - getPercent(totalBorrowsUsd, totalBorrowableUsd);
  const progressBarFormatedValue = percentBorrowingCapacity / 100;
  const totalAbailableToBorrow = totalBorrowableUsd - totalBorrowsUsd;

  console.log("[INFO] {{DefiContainer}} poolGroups > ", poolGroups, totalCollateralUsd);

  useEffect(() => {}, []);

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
                Connect to DeFi liquidity protocols and access to {poolGroups.length} markets across {CHAIN_AVAILABLES.filter(chain => chain.type === 'evm').length} networks, borrow assets
                using your crypto as collateral and earn interest by providing
                liquidity over
              </span>
              <span
                className="ion-color-gradient-text"
                style={{
                  fontSize: "2rem",
                  display: "block",
                  margin: "1rem 1rem 3rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  lineHeight: "1.8rem",
                  letterSpacing: "-0.1rem",
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
                            Total funds deposited as collateral to borrow
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

                      {/* <div className="ion-margin">
                          <IonProgressBar
                            color="success"
                            value={progressBarFormatedValue}
                            style={{
                              background: "var(--ion-color-danger)",
                              height: "0.5rem",
                            }}
                          ></IonProgressBar>
                        </div> */}
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
                    {poolGroups
                      .flatMap(({pools})=> pools)
                      .filter(pool => pool.borrowBalance > 0 || pool.supplyBalance > 0)
                      .reduce((acc, pool) => {
                        // check if the pool is already in the array
                        const index = acc.findIndex(
                          (p) => p.chainId === pool.chainId && p.provider === pool.provider
                        );
                        const totalBorrowsUSD = Number(valueToBigNumber(
                          pool.borrowBalance).multipliedBy(pool.priceInUSD));
                        const totalCollateralUSD = Number(valueToBigNumber(
                          pool.supplyBalance).multipliedBy(pool.priceInUSD));
                        
                        if (index > -1) {
                          // if it is, update the totalBorrowsUSD
                          acc[index].totalBorrowsUSD = (
                            Number(acc[index].totalBorrowsUSD) +
                            totalBorrowsUSD
                          );
                          // update the totalCollateralUSD
                          acc[index].totalCollateralUSD = (
                            Number(acc[index].totalCollateralUSD) +
                            totalCollateralUSD
                          );
                        } else {
                          // if it is not, add it to the array
                          acc.push({
                            chainId: pool.chainId,
                            provider: pool.provider,
                            totalCollateralUSD,
                            totalBorrowsUSD,
                            currentLiquidationThreshold: pool.userLiquidationThreshold,
                          });
                        }
                        return acc;
                      }, [] as {
                        chainId: number;
                        provider: string;
                        totalCollateralUSD: number;
                        totalBorrowsUSD: number;
                        currentLiquidationThreshold: number;
                      }[])
                      .map((summary, index) => (
                        <IonItem
                          key={index}
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
                            className="ion-no-padding"
                            style={{
                              paddingBottom:
                                index ===
                                poolGroups.length - 1
                                  ? "0"
                                  : "1rem",
                            }}
                          >
                            <IonRow className="poolItemList ion-align-items-center ion-justify-content-between ion-no-padding ion-padding-start">
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
                                  {currencyFormat(+summary.totalCollateralUSD)}
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
                                    Number(summary.totalCollateralUSD) *
                                      Number(
                                        summary.currentLiquidationThreshold
                                      ) -
                                      Number(summary.totalBorrowsUSD)
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
                                    Number(summary.totalCollateralUSD) *
                                      Number(
                                        summary.currentLiquidationThreshold
                                      )
                                  )}{" "}
                                  <small>
                                    (
                                    {(
                                      100 -
                                      getPercent(
                                        +summary.totalBorrowsUSD,
                                        Number(summary.totalCollateralUSD) *
                                          Number(
                                            summary.currentLiquidationThreshold
                                          )
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
                                        +summary.totalCollateralUSD
                                      )) /
                                    100
                                  }
                                  style={{
                                    background: "var(--ion-color-danger)",
                                    height: "0.2rem",
                                    marginTop: "0.25rem",
                                    maxWidth: '250px',
                                    display: 'inline-block'
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
                      <IonCol size="12" class="ion-text-center ion-padding-horizontal">
                        <IonText>
                          <p>
                            {!walletAddress ? "Connect wallet and deposit" : "Deposit"}{" "}
                            assets as collateral to borrow and start earning
                            interest
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
              handleSegmentChange={handleSegmentChange}
              filterBy={filterBy ? undefined : undefined}
            />
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
