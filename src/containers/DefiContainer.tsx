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
import { CHAIN_DEFAULT } from "../constants/chains";
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

  const [selectedReserve, setSelectedReserve] = useState<{
    reserve: ReserveDataHumanized & { maxAmount: number | undefined };
    actionType: "deposit" | "withdraw" | "borrow" | "repay";
  } | null>(null);
  const { display: displayLoader, hide: hideLoader } = useLoader();
  const { user, assets } = useUser();
  const { ethereumProvider } = useEthersProvider();
  const { poolGroups, poolReserves, markets, totalTVL, refresh, userSummaryAndIncentives } =
    useAave();
  console.log("[INFO] {{DefiContainer}} userSummaryAndIncentives: ", {
    userSummaryAndIncentives,
  });

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

  console.log("[INFO] {{DefiContainer}} poolReserves: ", poolReserves);
  const pools = userSummaryAndIncentives
    ? userSummaryAndIncentives.userReservesData.map(
        ({
          reserve,
          underlyingBalance,
          underlyingBalanceUSD,
          totalBorrows,
          totalBorrowsUSD,
        }) => {
          return {
            reserve,
            underlyingBalance,
            underlyingBalanceUSD,
            totalBorrows,
            totalBorrowsUSD,
          };
        }
      )
    : poolReserves?.map((reserve) => ({
        reserve,
        underlyingBalance: "0",
        underlyingBalanceUSD: "0",
        totalBorrows: "0",
        totalBorrowsUSD: "0",
      }));

  const reserves = pools
    // ?.filter(
    //   ({ reserve: { usageAsCollateralEnabled, isIsolated } }) =>
    //     isIsolated === false
    // )
    ?.map(
      ({
        reserve,
        underlyingBalance,
        underlyingBalanceUSD,
        totalBorrows,
        totalBorrowsUSD,
      }) => {
        const { underlyingAsset } = reserve;
        // const { balance: walletBalance = 0 } =
        //   assets?.find(
        //     ({ contractAddress, chain = {} }) =>
        //       contractAddress?.toLocaleLowerCase() ===
        //         underlyingAsset?.toLocaleLowerCase() &&
        //       chain?.id === markets?.CHAIN_ID
        //   ) || {};

        const supplyPoolRatioInPercent = getPercent(
          valueToBigNumber(reserve.totalLiquidityUSD).toNumber(),
          valueToBigNumber(reserve.supplyCapUSD).toNumber()
        );
        const borrowPoolRatioInPercent = getPercent(
          valueToBigNumber(reserve.totalDebtUSD).toNumber(),
          valueToBigNumber(reserve.borrowCapUSD).toNumber()
        );
        return {
          ...reserve,
          borrowBalance: Number(totalBorrows),
          borrowBalanceUsd: Number(totalBorrowsUSD),
          supplyBalance: Number(underlyingBalance),
          supplyBalanceUsd: Number(underlyingBalanceUSD),
          // walletBalance,
          logo: getAssetIconUrl(reserve),
          supplyPoolRatioInPercent,
          borrowPoolRatioInPercent,
        };
      }
    );

  const totalBorrowsUsd = Number(userSummaryAndIncentives?.totalBorrowsUSD);
  const totalCollateralUsd = Number(
    userSummaryAndIncentives?.totalCollateralUSD
  );

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

      <IonRow class="ion-justify-content-center">
        <IonCol class="ion-padding" size-md="12" size-lg="10" size-xl="10">
          <IonGrid class="ion-no-padding">
            {user && percentBorrowingCapacity > 0 ? (
              <IonRow class="ion-text-center widgetWrapper">
                <IonCol
                  size="12"
                  size-md="4"
                  class=" ion-padding-vertical ion-margin-vertical"
                >
                  <h3>{currencyFormat(+totalCollateralUsd)}</h3>
                  <IonText color="medium">
                    <p>
                      MY DEPOSIT BALANCE
                      <br />
                      <small>Used as collateral to borrow assets</small>
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
                      MY BORROW BALANCE
                      <br />
                      <small>Total amount borrowed</small>
                    </p>
                  </IonText>
                </IonCol>
              </IonRow>
            ) : (
              <IonRow class="ion-text-center widgetWrapper">
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
            )}
          </IonGrid>
        </IonCol>
      </IonRow>

      {/* <IonRow class="ion-justify-content-center">
        <IonCol class="ion-padding ion-text-center" size="12">
          <h1>Available Markets</h1>
        </IonCol>
      </IonRow> */}

      <IonRow class="ion-justify-content-center">
        <IonCol
          class="ion-padding"
          size-xs="12"
          size-sm="12"
          size-md="12"
          size-lg="10"
          size-xl="10"
        >
          <div className="widgetWrapper">
            <h3
              style={{
                textAlign: "center",
                margin: "3rem auto",
              }}
            >
              Available Markets
            </h3>
            {/* list header */}
            <PoolHeaderList titles={[
              'Assets', 'Networks', 'Total deposits', ' Total borrows',  'Best deposit APY', 'Best borrow APY', 
            ]} />
            <IonAccordionGroup>
              {
                poolGroups.map((poolGroup, index) => (
                  <PoolAccordionGroup 
                    key={index} 
                    handleSegmentChange={handleSegmentChange}
                    refresh={refresh}
                    poolGroup={poolGroup}
                    userSummary={userSummaryAndIncentives} />
                ))}
            </IonAccordionGroup>
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
