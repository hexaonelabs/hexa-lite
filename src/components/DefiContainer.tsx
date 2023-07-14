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
import { informationCircleOutline, closeSharp, openOutline } from "ionicons/icons";
import { useAave } from "../context/AaveContext";
import { ChainId, InterestRate, Pool, ReserveDataHumanized } from "@aave/contract-helpers";
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
import ConnectButton from "./ConnectButton";
import { ethers } from "ethers";
import {
  borrow,
  repay,
  submitTransaction,
  supplyWithPermit,
  withdraw,
} from "../servcies/aave.service";
import { useEthersProvider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";
import { FormattedNumber } from "./FormattedNumber";
import { CircularProgressbar, CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { getPercent } from "../utils/utils";
import { getMaxAmountAvailableToSupply } from "../utils/getMaxAmountAvailableToSupply";
import { getMaxAmountAvailableToBorrow } from "../utils/getMaxAmountAvailableToBorrow";
import { getMaxAmountAvailableToWithdraw } from "../utils/getMaxAmountAvailableToWithdraw";

export const minBaseTokenRemainingByNetwork: Record<number, string> = {
  [ChainId.optimism]: '0.0001',
  [ChainId.arbitrum_one]: '0.0001',
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

const FormModal = ({
  onDismiss,
  selectedReserve,
  user,
}: {
  selectedReserve: {
    actionType: 'deposit' | 'withdraw' | 'borrow' | 'repay';
    reserve: ReserveDataHumanized & { borrowBalance: number;
    borrowBalanceUsd: number;
    supplyBalance: number;
    supplyBalanceUsd: number;
    maxAmount: number|undefined;
    logo: string;
    priceInUSD: string;} | null;
  }
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
  user: {
    totalCollateralUSD: string;
    totalBorrowsUSD: string;
    currentLiquidationThreshold: string;
  }
}) => {
  const inputRef = useRef<HTMLIonInputElement>(null);
  const {reserve, actionType} = selectedReserve || {reserve: null, actionType: null};
  // const [ amount, setAmount ] = useState<number|undefined>(0);
  const [ healthFactor, setHealthFactor ] = useState<number|undefined>(undefined);

  const displayRiskCheckbox =
    healthFactor && healthFactor < 1.5 && healthFactor?.toString() !== '-1';

  return (
      <IonGrid className="ion-padding" style={{ width: "100%" }}>
        <IonRow class="ion-align-items-top ion-margin-bottom">
          <IonCol size="10">
              <h3>
                {actionType?.toUpperCase()} {reserve?.symbol}
              </h3>
          </IonCol>
          <IonCol size="2" class="ion-text-end">
            <IonButton size="small" fill="clear" onClick={() => onDismiss(null, "cancel")}>
              <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="12">
            <IonLabel>
              <IonText color="medium">Amount</IonText>
            </IonLabel>
            <IonItem lines="none" className="ion-margin-vertical">
              <div style={{
                display: 'flex',
                alignItems: 'center',
              }}>
                <IonAvatar slot="start">
                  <IonImg src={reserve?.logo}></IonImg>
                </IonAvatar>
                <div className="ion-padding" style={{cursor: 'pointer'}} onClick={() => {
                  const el = inputRef.current
                  if (el) {
                    (el as any).value = reserve?.maxAmount||0;
                  }
                }}>
                  <IonText>
                    <h3 style={{margin: ' 0'}}>
                      {reserve?.symbol}
                    </h3>
                      <small style={{margin: '0'}}>
                        Max :{reserve?.maxAmount?.toFixed(6)}
                      </small>
                  </IonText>
                </div>
              </div>
              <div slot="end" className="ion-text-end">
                <IonInput
                  ref={inputRef}
                  style={{fontSize: '1.5rem'}}
                  placeholder="0"
                  type="number"
                  max={reserve?.maxAmount}
                  min={0}
                  debounce={100}
                  onKeyUp={(e) => {
                    const value =( e.target as any).value;
                    if (reserve?.maxAmount && value && (Number(value) > reserve?.maxAmount)) {
                      ( e.target as any).value = reserve?.maxAmount;
                    }
                    if (value && (Number(value) < 0)) {
                      ( e.target as any).value = "0";
                    }
                    const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
                      collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
                      borrowBalanceMarketReferenceCurrency: valueToBigNumber(user.totalBorrowsUSD).plus(
                        valueToBigNumber(inputRef.current?.value || 0).times(reserve?.priceInUSD || 0)
                      ),
                      currentLiquidationThreshold: user.currentLiquidationThreshold,
                    });
                    console.log('>>newHealthFactor.toNumber()', {newHealthFactor, user, v: inputRef.current?.value});
                    
                    setHealthFactor( newHealthFactor.toNumber());
                  }}
                />
              </div>
            </IonItem>
          </IonCol>
        </IonRow>
        {
          displayRiskCheckbox && (
            <IonRow class="ion-justify-content-center">
              <IonCol size="auto" class="ion-text-center ion-padding-vertical ion-margin-bottom" style={{maxWidth: 400}}>
                <IonText color="danger">
                  <small>
                    Borrowing this amount will reduce your health factor and increase risk of liquidation. 
                    Add more collateral to increase your health factor.
                  </small>
                </IonText>
                {/* <IonLabel>
                  Health factor
                </IonLabel>
                <IonItem lines="none" className="ion-margin-vertical">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <div className="ion-padding" style={{cursor: 'pointer'}}>
                      <IonText>
                        <h3 style={{margin: ' 0'}}>
                          {healthFactor?.toString()}
                        </h3>
                      </IonText>
                    </div>
                  </div>
                </IonItem> */}
              </IonCol>
            </IonRow>
          )
        }

        <IonRow class="ion-justify-content-between">
          <IonCol size="12">
            <IonButton
              expand="block"
              onClick={() => onDismiss(inputRef.current?.value, "confirm")}
              strong={true}
            >
              Confirm
            </IonButton>
          </IonCol>
          </IonRow>
      </IonGrid>
  );
};

export const DefiContainer = ({handleSegmentChange}: {handleSegmentChange: (e: {detail: {value: string}}) => void}) => {
  console.log("[INFO] {{DefiContainer}} rendering...");
  
  const [selectedReserve, setSelectedReserve] = useState<{
    reserve: ReserveDataHumanized & {maxAmount: number|undefined};
    actionType: 'deposit' | 'withdraw' | 'borrow' | 'repay';
  } | null>(null);
  const {display: displayLoader, hide: hideLoader} = useLoader();
  const { user, assets } = useUser();
  const { ethereumProvider } = useEthersProvider();
  const { poolReserves, markets, totalTVL, refresh, userSummaryAndIncentives } = useAave();
  const [present, dismiss] = useIonModal(FormModal, {
    selectedReserve,
    user: {
      totalCollateralUSD: userSummaryAndIncentives?.totalCollateralUSD,
      totalBorrowsUSD: userSummaryAndIncentives?.totalBorrowsUSD,
      currentLiquidationThreshold: userSummaryAndIncentives?.currentLiquidationThreshold,
    },
    onDismiss: (data: string, role: string) => dismiss(data, role),
  });
  console.log("[INFO] {{DefiContainer}} userSummaryAndIncentives: ", {userSummaryAndIncentives});
  

  function handleEvents(type: string, reserve: ReserveDataHumanized & {
    borrowBalance: number;
    borrowBalanceUsd: number;
    supplyBalance: number;
    supplyBalanceUsd: number;
    walletBalance: number;
    logo: string;
    priceInUSD: string;
  }) {
    switch (true) {
      case type === 'swap':
        handleSegmentChange({ detail: { value: "swap" } });
        break;
      case type === 'fiat':
        handleSegmentChange({ detail: { value: "fiat" } });
        break;
      default:
        break;
    }
  }

  function handleOpenModal(type: string, reserve: ReserveDataHumanized & FormatReserveUSDResponse & {
    borrowBalance: number;
    borrowBalanceUsd: number;
    supplyBalance: number;
    supplyBalanceUsd: number;
    walletBalance: number;
    logo: string;
    priceInUSD: string;
  }) {
    
    // calcul max amount
    let maxAmount = undefined
    switch (true) {
      case type === "deposit": {
        const {
          supplyCap, isFrozen, decimals, debtCeiling, isolationModeTotalDebt, totalLiquidity, underlyingAsset
        } = reserve;
        const minBaseTokenRemaining = minBaseTokenRemainingByNetwork[ethereumProvider?.network?.chainId || 137] || '0.001';
        maxAmount = +getMaxAmountAvailableToSupply(
          `${Number(reserve?.walletBalance)}`,
          { supplyCap, totalLiquidity, isFrozen, decimals, debtCeiling, isolationModeTotalDebt },
          underlyingAsset,
          minBaseTokenRemaining
        )
        break;
      }
      case type === "withdraw": {
        maxAmount = +getMaxAmountAvailableToWithdraw(
          {
            underlyingBalance: reserve?.supplyBalance.toString(),
            usageAsCollateralEnabledOnUser: true,
          },
          {
            eModeCategoryId: 0,
            formattedEModeLiquidationThreshold: reserve?.formattedEModeLiquidationThreshold,
            formattedPriceInMarketReferenceCurrency: reserve?.formattedPriceInMarketReferenceCurrency,
            formattedReserveLiquidationThreshold: reserve?.formattedReserveLiquidationThreshold,
            reserveLiquidationThreshold: reserve?.reserveLiquidationThreshold,
            unborrowedLiquidity: reserve.unborrowedLiquidity
          },
          {
            healthFactor: `${userSummaryAndIncentives?.healthFactor||0}`,
            isInEmode: false,
            userEmodeCategoryId: 0,
            totalBorrowsMarketReferenceCurrency: `${userSummaryAndIncentives?.totalBorrowsUSD||0}`,
          }
        );
        break;
      }
      case type === "borrow": {
        // maxAmount = (Number(borrowingCapacity) - Number(totalBorrowsUsd)) / Number(reserve?.priceInUSD);
        maxAmount = +getMaxAmountAvailableToBorrow(
          reserve, 
          (userSummaryAndIncentives as FormatUserSummaryAndIncentivesResponse<ReserveDataHumanized & FormatReserveUSDResponse>), 
          InterestRate.Variable
        );
        break;
      }
      case type === "repay": {
        maxAmount = Number(reserve?.borrowBalance);
        break
      }
      default:
        break;

    }
    console.log("[INFO] maxAmount: ", {type, reserve, maxAmount});
    
    setSelectedReserve({
      reserve: {
        ...reserve, maxAmount
      },
      actionType: type as any,
    });
    present({
      cssClass: 'modalAlert ',
      onWillDismiss: async (ev: CustomEvent<OverlayEventDetail>) => {
        console.log(`onWillDismiss: ${ev.detail.data}!`);
        if (ev.detail.role === "confirm") {
          if (!ethereumProvider) {
            throw new Error("No ethereumProvider provider found");
          }
          displayLoader();
          switch (true) {
            case type === "deposit": {
              const value = ev.detail.data;
              const amount = Number(value);
              // handle invalid amount
              if (isNaN(amount) || amount <= 0) {
                throw new Error(
                  "Invalid amount. Value must be greater than 0."
                );
              }
              // call method
              const params = {
                provider: ethereumProvider,
                reserve,
                amount: amount.toString(),
                onBehalfOf: undefined,
                poolAddress: `${markets?.POOL}`,
                gatewayAddress: `${markets?.WETH_GATEWAY}`,
              };
              console.log("params: ", params);
              try {
                const txReceipts = await supplyWithPermit(params);
                console.log("TX result: ", txReceipts);
                await hideLoader();
                await refresh();
              } catch (error) {
                await hideLoader();
              }
              break;
            }
            case type === "withdraw": {
              const value = ev.detail.data;
              const amount = Number(value);
              // handle invalid amount
              if (isNaN(amount) || amount <= 0) {
                throw new Error(
                  "Invalid amount. Value must be greater than 0."
                );
              }
              // call method
              const params = {
                provider: ethereumProvider,
                reserve,
                amount: amount.toString(),
                onBehalfOf: undefined,
                poolAddress: `${markets?.POOL}`,
                gatewayAddress: `${markets?.WETH_GATEWAY}`,
              };
              console.log("params: ", params);
              try {
                const txReceipts = await withdraw(params);
                console.log("TX result: ", txReceipts);
                await hideLoader();
                await refresh();
                refresh();
              } catch (error) {
                console.log("error: ", error);
                await hideLoader();
              }
              break;
            }
            case type === "borrow": {
              const value = ev.detail.data;
              const amount = Number(value);
              // handle invalid amount
              if (isNaN(amount) || amount <= 0) {
                throw new Error(
                  "Invalid amount. Value must be greater than 0."
                );
              }
              // call method
              const params = {
                provider: ethereumProvider,
                reserve,
                amount: amount.toString(),
                onBehalfOf: undefined,
                poolAddress: `${markets?.POOL}`,
                gatewayAddress: `${markets?.WETH_GATEWAY}`,
              };
              console.log("params: ", params);
              try {
                const txReceipts = await borrow(params);
                console.log("TX result: ", txReceipts);
                await hideLoader();
                refresh();
              } catch (error) {
                console.log("[ERROR]: ", error);
                await hideLoader();
                // await refresh();
              }
              break;
            }
            case type === "repay": {
              const value = ev.detail.data;
              const amount = Number(value);
              // handle invalid amount
              if (isNaN(amount) || amount <= 0) {
                throw new Error(
                  "Invalid amount. Value must be greater than 0."
                );
              }
              // call method
              const params = {
                provider: ethereumProvider,
                reserve,
                amount: amount.toString(),
                onBehalfOf: undefined,
                poolAddress: `${markets?.POOL}`,
                gatewayAddress: `${markets?.WETH_GATEWAY}`,
              };
              console.log("params: ", params);
              try {
                const txReceipts = await repay(params);
                console.log("TX result: ", txReceipts);
                await hideLoader();
                await refresh();
              } catch (error) {
                console.log("[ERROR]: ", error);
                await hideLoader();
                // await refresh();
              }
              break;
            }
            default:
              break;
          }
        }
      }
    });
  }

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
    ? userSummaryAndIncentives.userReservesData.map(({
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
          totalBorrowsUSD
        }
      })
    : poolReserves?.map(( reserve ) => ({ 
        reserve,
        underlyingBalance: '0',
        underlyingBalanceUSD: '0',
        totalBorrows: '0',
        totalBorrowsUSD: '0'
      }));

  const reserves = (pools)
  ?.filter(({reserve: { usageAsCollateralEnabled, isIsolated  }}) => usageAsCollateralEnabled === true && isIsolated === false)
  ?.map(
    ({reserve, underlyingBalance, underlyingBalanceUSD, totalBorrows, totalBorrowsUSD}) => {
      const { underlyingAsset } = reserve;
      const { balance: walletBalance = 0 } = assets?.find(
        ({contractAddress, chain = {}}) =>
          contractAddress?.toLocaleLowerCase() ===
          underlyingAsset?.toLocaleLowerCase()
          && chain?.id === markets?.CHAIN_ID
      ) || {};
      
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
        walletBalance,
        logo: getAssetIconUrl(reserve),
        supplyPoolRatioInPercent,
        borrowPoolRatioInPercent
      };
    }
  );

  const totalBorrowsUsd = Number(userSummaryAndIncentives?.totalBorrowsUSD);
  const totalCollateralUsd = Number(userSummaryAndIncentives?.totalCollateralUSD);

  // calcule 70% of totalCollateralUsd
  const borrowingCapacity = Number(userSummaryAndIncentives?.netWorthUSD);

  // calcule percentage of totalBorrowsUsd
  const percentageBorrowingCapacity = totalBorrowsUsd / borrowingCapacity * 100;
  const progressBarFormatedValue = Number((percentageBorrowingCapacity / 100).toFixed(2));
  let getProgressBarFormatedColor = (value: number) => {
    let color = "primary";
    switch (true) {
      case value > 75:
        color = "danger";
        break;
      case value > 60:
        color = "warning";
        break;
      case value > 0:
        color = "success";  
        break;
      default:
        break;
    }
    return color;
  };

  return !reserves || reserves.length === 0 ? (
    <IonGrid class="ion-padding">
      <IonRow class="ion-padding">
        <IonCol size="12" class="ion-text-center ion-padding">
          <IonSpinner></IonSpinner>
        </IonCol>
      </IonRow>
    </IonGrid>
  ) : (
    <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
      <IonRow class="ion-justify-content-center">
        <IonCol size="12" class="ion-text-center">
          <IonText>
            <h1>DeFi liquidity protocol</h1>
          </IonText>
          <IonText color="medium">
            <p
              style={{
                lineHeight: "1.3rem",
              }}
            >
              <span style={{maxWidth: '600px', display: 'inline-block'}}>
                Connect to the best DeFi liquidity protocols, 
                borrow assets using your crypto as collateral 
                and earn interest by providing liquidity over 
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
            {
              user && borrowingCapacity > 0
                ? (
                  <IonRow class="ion-text-center widgetWrapper">
                    <IonCol
                      size="12"
                      size-md="4"
                      class=" ion-padding-vertical ion-margin-vertical"
                    >
                      <h3>
                        {currencyFormat(
                          +totalCollateralUsd
                        )}
                      </h3>
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
                      <h3>
                        {Number(percentageBorrowingCapacity.toFixed(2))}%
                      </h3>
                      <div className="ion-margin-horizontal">
                        <IonProgressBar 
                          color={getProgressBarFormatedColor(percentageBorrowingCapacity)}
                          value={progressBarFormatedValue}></IonProgressBar>
                      </div>
                      <IonText color="medium">
                        <p>
                          BORROWING CAPACITY 
                          <IonIcon 
                            icon={informationCircleOutline}
                            style={{
                              transform: 'scale(0.8)',
                              marginLeft: '0.2rem',
                              cursor: 'pointer'
                            }} />
                          <br />
                          <small>
                          {currencyFormat(
                          +totalBorrowsUsd
                        )} of {currencyFormat(
                          borrowingCapacity
                        )}
                          </small>
                        </p>
                      </IonText>
                    </IonCol>
                    <IonCol
                      size="12"
                      size-md="4"
                      class=" ion-padding-vertical ion-margin-vertical"
                    >
                      <h3>
                      {currencyFormat(
                          totalBorrowsUsd
                        )}
                      </h3>
                      <IonText color="medium">
                        <p>
                          MY BORROW BALANCE
                          <br />
                          <small>Total amount borrowed</small>
                        </p>
                      </IonText>
                    </IonCol>
                  </IonRow>
                )
                : (
                  <IonRow class="ion-text-center widgetWrapper">
                    <IonCol
                      size="12"
                      class=" ion-padding ion-margin-vertical ion-text-center"
                    >
                      <IonText>
                        <p>
                          {!user ? 'Connect wallet, deposit' : 'Deposit'}, assets as collateral to borrow assets and start earning interest
                        </p>
                      </IonText>
                    </IonCol>
                  </IonRow>
                )
            }
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
            <IonGrid>
              <IonRow class="ion-align-items-center ion-justify-content-between">
                <IonCol size="3" class="ion-padding-start">
                  <IonLabel color="medium">
                    <h3>Asset</h3>
                  </IonLabel>
                </IonCol>
                <IonCol size="1" class="ion-text-center">
                  <IonLabel color="medium">
                    <h3>Protocol</h3>
                  </IonLabel>
                </IonCol>
                <IonCol size="2" class="ion-text-end">
                  <IonLabel color="medium">
                    <h3 style={{marginRight: '0.6rem'}}>Deposits</h3>
                  </IonLabel>
                </IonCol>
                <IonCol size="2" class="ion-text-end">
                  <IonLabel color="medium">
                    <h3 style={{marginRight: '1.2rem'}}>Borrows</h3>
                  </IonLabel>
                </IonCol>
                <IonCol size="2" class="ion-text-end">
                  <IonLabel color="medium">
                    <h3 style={{marginRight: '1.8rem'}}>Deposit APY</h3>
                  </IonLabel>
                </IonCol>
                <IonCol size="2" class="ion-text-end">
                  <IonLabel color="medium">
                    <h3 style={{ paddingRight: "2rem" }}>Borrow APY</h3>
                  </IonLabel>
                </IonCol>
              </IonRow>
            </IonGrid>
            <IonAccordionGroup>
              {reserves
                .filter((reserve) => Number(reserve.borrowCapUSD) > 0)
                .sort((a, b) => b.borrowBalance - a.borrowBalance)
                .sort((a, b) => (+b.supplyBalance) - (+a.supplyBalance))
                .map((reserve, index) => (
                  <IonAccordion key={index}>

                    <IonItem slot="header">
                      <IonGrid onClick={() => console.log(reserve)}>
                        <IonRow class="ion-align-items-center ion-justify-content-between ion-padding-vertical">

                          <IonCol size="3" class="ion-text-start" style={{
                            display: 'flex',
                            alignItems: 'center',
	                          alignContent: 'center'
                          }}>
                            <IonAvatar
                                style={{ height: "48px", width: "48px", minHeight: "48px", minWidth: "48px" }}
                              >
                              <IonImg src={reserve?.logo}></IonImg>
                            </IonAvatar>
                            <IonLabel class="ion-padding-start">
                              {reserve?.symbol}
                              <p>
                                <small>{reserve?.name}</small>
                                <br/>
                                <IonText color="dark">
                                  <small>Wallet balance:  {Number(reserve.walletBalance)}</small>
                                </IonText>
                              </p>
                            </IonLabel>
                          </IonCol>
                          <IonCol size="1" class="ion-text-center" style={{
                            display: 'flex',
                            justifyContent: 'center'
                          }}>
                            <IonImg
                              style={{ width: "18px", heigth: "18px", marginRight: '0.5rem' }}
                              src="./assets/icons/aave.svg"
                            ></IonImg>
                            <a href="https://aave.com/" target="_blank" rel="noreferrer">
                              <IonIcon color="medium" style={{
                                fontSize: '0.8rem',
                                transform: 'translateY(-0.5rem)'
                              }} icon={openOutline}></IonIcon>
                            </a>
                          </IonCol>
                          <IonCol size="2" class="ion-text-end">
                            <IonLabel>
                              {(+reserve?.supplyBalance).toFixed(6) || "0.00"}
                              <br />
                              <IonText color="medium">
                                <small>
                                  {formatCurrencyValue(
                                    (+reserve?.supplyBalance),
                                    Number(reserve?.priceInUSD),
                                    "No deposit"
                                  )}
                                </small>
                              </IonText>
                            </IonLabel>
                          </IonCol>
                          <IonCol size="2" class="ion-text-end">
                            <IonLabel>
                              {reserve?.borrowBalance.toFixed(6) || "0.00"}
                              <br />
                              <IonText color="medium">
                                <small>
                                  {formatCurrencyValue(
                                    reserve?.borrowBalance,
                                    Number(reserve?.priceInUSD),
                                    "No debit"
                                  )}
                                </small>
                              </IonText>
                            </IonLabel>
                          </IonCol>
                          <IonCol size="2" class="ion-text-end">
                            <IonLabel>
                              {(Number(reserve?.supplyAPY || 0) * 100).toFixed(
                                2
                              )}
                              %
                            </IonLabel>
                          </IonCol>
                          <IonCol size="2" class="ion-text-end">
                            <IonLabel>
                              {(Number(reserve?.variableBorrowAPY || 0) * 100).toFixed(
                                2
                              )}
                              %
                            </IonLabel>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonItem>

                    <IonGrid className="ion-padding" slot="content">
                      <IonRow class="ion-padding-top">

                        <IonCol size="6" class="ion-padding ion-text-center">
                          <div style={{ maxWidth: 200, maxHeight: 200, margin: 'auto' }}>
                            <CircularProgressbarWithChildren 
                              styles={buildStyles({
                                textColor: "var(--ion-text-color)",
                                pathColor: reserve.supplyPoolRatioInPercent < 80 
                                  ? "var(--ion-color-primary)"
                                  : "var(--ion-color-danger)",
                                trailColor: "rgba(var(--ion-color-primary-rgb), 0.2)",
                              })}
                              value={reserve.supplyPoolRatioInPercent} >
                              <div>
                                <h3>{`${reserve.supplyPoolRatioInPercent.toFixed(2)}%`}</h3>
                                <IonText color="medium">
                                  <small>
                                    Total deposit
                                  </small>
                                </IonText>
                              </div>
                            </CircularProgressbarWithChildren>
                          </div>
                        </IonCol>

                        <IonCol size="6" class="ion-padding ion-text-center">
                          <div style={{ maxWidth: 200, maxHeight: 200, margin: 'auto' }}>
                            <CircularProgressbarWithChildren 
                              styles={buildStyles({
                                textColor: "var(--ion-text-color)",
                                pathColor: reserve.borrowPoolRatioInPercent < 80 
                                  ? "var(--ion-color-primary)"
                                  : "var(--ion-color-danger)",
                                trailColor: "rgba(var(--ion-color-primary-rgb), 0.2)",
                              })}
                              value={reserve.borrowPoolRatioInPercent} >
                              <div>
                                <h3>{`${reserve.borrowPoolRatioInPercent.toFixed(2)}%`}</h3>
                                <IonText color="medium">
                                  <small>
                                    Total debits
                                  </small>
                                </IonText>
                              </div>
                            </CircularProgressbarWithChildren>
                          </div>
                        </IonCol>
                        
                        <IonCol size="6" class="ion-padding">
                          <IonItem lines="none" style={{ "--background": "transparent" }}>
                            <IonLabel class="ion-text-center">
                              Deposit liquidity
                            </IonLabel>
                          </IonItem>
                          <IonItem
                            style={{ "--background": "transparent" }}>
                            <IonLabel color="medium">
                              APY
                            </IonLabel>
                            <IonText color="medium">
                              {(Number(reserve?.supplyAPY || 0) * 100).toFixed(
                                2
                              )}
                              %
                            </IonText>
                          </IonItem>
                          <IonItem style={{ "--background": "transparent" }}>
                            <IonLabel color="medium">
                              My deposit
                            </IonLabel>
                            <IonText color="medium">
                            {(+reserve?.supplyBalance) > 0 ? (+reserve?.supplyBalance).toFixed(6): undefined || "0"}
                            </IonText>
                          </IonItem>
                          <IonItem style={{ "--background": "transparent" }}>
                            <IonLabel color="medium">
                              Deposit liquidity
                            </IonLabel>
                            <IonText color="medium">
                              {/* <FormattedNumber
                                compact
                                value={reserve.totalLiquidityUSD}
                                symbolsVariant="secondary12"
                                symbolsColor="text.secondary"
                                symbol="USD"
                              /> */}
                              {/* {formatCurrencyValue(
                                Number(reserve.totalLiquidityUSD )
                              )} */}
                              {/* {formatCurrencyValue(+reserve.totalLiquidityUSD)} */}
                              {/* <FormattedNumber
                                compact={true}
                                value={Math.max(Number(reserve.totalLiquidityUSD), 0)}
                                symbol="USD"
                              /> */}
                              {formatCurrencyValue(
                                valueToBigNumber(reserve.totalLiquidityUSD).toNumber()
                              )}
                            </IonText>
                          </IonItem>
                          <IonItem
                            lines="none"
                            style={{ "--background": "transparent" }}
                          >
                            <IonLabel color="medium">
                              Deposit capitalisation
                            </IonLabel>
                            <IonText color="medium">
                              {formatCurrencyValue(
                                Number(reserve.supplyCapUSD)
                              )}
                            </IonText>
                          </IonItem>
                        </IonCol>

                        <IonCol size="6" class="ion-padding">
                          <IonItem lines="none" style={{ "--background": "transparent" }}>
                            <IonLabel class="ion-text-center">
                              Borrow liquidity
                            </IonLabel>
                          </IonItem>
                          <IonItem
                            style={{ "--background": "transparent" }}>
                            <IonLabel color="medium">
                              APY
                            </IonLabel>
                            <IonText color="medium">
                              {(Number(reserve?.variableBorrowAPY || 0) * 100).toFixed(
                                2
                              )}
                              %
                            </IonText>
                          </IonItem>
                          <IonItem style={{ "--background": "transparent" }}>
                            <IonLabel color="medium">
                              My debit
                            </IonLabel>
                            <IonText color="medium">
                              {reserve?.borrowBalance > 0 ? reserve?.borrowBalance.toFixed(6): undefined || "0"}
                            </IonText>
                          </IonItem>
                          <IonItem style={{ "--background": "transparent" }}>
                            <IonLabel color="medium">
                              Debit liquidity
                            </IonLabel>
                            <IonText color="medium">
                              {formatCurrencyValue(
                                Number(reserve.totalDebtUSD)
                              )}
                              {/* {formatCurrencyValue(+reserve.totalLiquidityUSD)} */}
                              {/* <FormattedNumber
                                compact={true}
                                value={Math.max(Number(reserve.totalLiquidityUSD), 0)}
                                symbol="USD"
                              /> */}
                              {/* {valueToBigNumber(reserve.supplyCapUSD).toNumber()} */}
                            </IonText>
                          </IonItem>
                          <IonItem
                            lines="none"
                            style={{ "--background": "transparent" }}
                          >
                            <IonLabel color="medium">
                              Borrow capitalisation
                            </IonLabel>
                            <IonText color="medium">
                              {formatCurrencyValue(
                                Number(reserve.borrowCapUSD)
                              )}
                            </IonText>
                          </IonItem>
                        </IonCol>
                      </IonRow>

                      {!user ? (
                        <IonRow class="ion-justify-content-center ion-align-item-center ion-padding-vertical">
                          <IonCol size="auto" class="ion-margin-bottom ion-padding-vertical">
                            <ConnectButton></ConnectButton>
                          </IonCol>
                        </IonRow>
                      ) : (
                        <IonRow class="ion-justify-content-center ion-padding-vertical">
                          <IonCol size="6" class="ion-padding-horizontal ion-text-center">
                            {
                              (!reserve?.walletBalance||(+reserve.walletBalance) <= 0)
                                ? (<>
                                    <IonButton
                                      fill="solid"
                                      color="primary"
                                      size="small"
                                      onClick={() =>
                                        handleEvents("swap", reserve)
                                      }
                                    >
                                      Exchange assets
                                    </IonButton>
                                    <IonButton
                                      fill="solid"
                                      color="primary"
                                      size="small"
                                      onClick={() =>
                                        handleEvents("fiat", reserve)
                                      }
                                    >
                                      Buy assets
                                    </IonButton>
                                  </>)
                                : (
                                    <>
                                    <IonButton
                                      fill="solid"
                                      color="primary"
                                      size="small"
                                      disabled={(!reserve?.supplyBalance||(+reserve.supplyBalance) <= 0) ? true : false}
                                      onClick={() =>
                                        handleOpenModal("withdraw", reserve)
                                      }
                                    >
                                      Withdraw
                                    </IonButton>
                                    <IonButton
                                      fill="solid"
                                      color="primary"
                                      size="small"
                                      disabled={reserve.supplyPoolRatioInPercent > 99 
                                        ? true
                                        : (!reserve?.walletBalance||reserve.walletBalance <= 0) ? true : false}
                                      onClick={() =>
                                        handleOpenModal("deposit", reserve)
                                      }
                                    >
                                      Deposit
                                    </IonButton>
                                    </>
                                  )
                            }
                            
                          </IonCol>
                          <IonCol size="6" class="ion-padding-horizontal ion-text-center">

                            <IonButton
                              fill="solid"
                              color="primary"
                              size="small"
                              disabled={(!reserve?.borrowBalance||reserve.borrowBalance <= 0) ? true : false}
                              onClick={() => handleOpenModal("repay", reserve)}
                            >
                              Repay
                            </IonButton>
                            <IonButton
                              fill="solid"
                              color="primary"
                              size="small"
                              disabled={reserve.borrowPoolRatioInPercent > 99
                                ? true
                                : (borrowingCapacity - totalBorrowsUsd <= 0) ? true : false}
                              onClick={() => handleOpenModal("borrow", reserve)}
                            >
                              Borrow
                            </IonButton>
                          </IonCol>
                        </IonRow>
                      )}
                    </IonGrid>
                  </IonAccordion>
                ))}
            </IonAccordionGroup>
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
