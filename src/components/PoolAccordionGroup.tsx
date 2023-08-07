import {
  IonAccordion,
  IonAvatar,
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonRow,
  IonText,
  useIonModal,
} from "@ionic/react";
import {
  openOutline,
  warningOutline,
} from "ionicons/icons";
import { useUser } from "../context/UserContext";
import { getReadableAmount } from "../utils/getReadableAmount";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import {
  FormatReserveUSDResponse,
  FormatUserSummaryAndIncentivesResponse,
  valueToBigNumber,
} from "@aave/math-utils";
import ConnectButton from "./ConnectButton";
import { ReserveDataHumanized } from "@aave/contract-helpers";
import { useEthersProvider } from "../context/Web3Context";
import {
  MARKETTYPE,
  borrow,
  repay,
  supplyWithPermit,
  withdraw,
} from "../servcies/aave.service";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useLoader } from "../context/LoaderContext";
import { LoanFormModal } from "./LoanFormModal";
import { getPercent } from "../utils/utils";
import { useState } from "react";
import { getMaxAmount } from "../utils/getMaxAmount";

interface IPoolAccordionProps {
  refresh: () => void;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
  markets: MARKETTYPE;
  reserve: any;
  userSummary: FormatUserSummaryAndIncentivesResponse<
    ReserveDataHumanized & FormatReserveUSDResponse
  > | null;
}

export function PoolAccordion(props: IPoolAccordionProps) {
  const { refresh, handleSegmentChange, reserve, userSummary, markets } = props;
  const [state, setState] = useState<
    | {
        actionType: "deposit" | "withdraw" | "borrow" | "repay" | undefined;
        maxAmount: number;
      }
    | undefined
  >(undefined);
  const { user } = useUser();
  const { ethereumProvider } = useEthersProvider();
  const { display: displayLoader, hide: hideLoader } = useLoader();
  const [present, dismiss] = useIonModal(LoanFormModal, {
    selectedReserve: {
      reserve: {
        ...reserve,
        maxAmount: state?.maxAmount || -1,
      },
      actionType: state?.actionType,
    },
    userSummary,
    onDismiss: (data: string, role: string) => dismiss(data, role),
  });

  const totalBorrowsUsd = Number(userSummary?.totalBorrowsUSD);
  const totalCollateralUsd = Number(userSummary?.totalCollateralUSD);

  // The % of your total borrowing power used.
  // This is based on the amount of your collateral supplied (totalCollateralUSD) and the total amount that you can borrow (totalCollateralUSD - totalBorrowsUsd).
  const percentBorrowingCapacity =
    100 - getPercent(totalBorrowsUsd, totalCollateralUsd);

  function handleEvents(
    type: string,
    reserve: ReserveDataHumanized &
      FormatReserveUSDResponse & {
        borrowBalance: number;
        borrowBalanceUsd: number;
        supplyBalance: number;
        supplyBalanceUsd: number;
        walletBalance: number;
        logo: string;
        priceInUSD: string;
      }
  ) {
    switch (true) {
      case type === "swap":
        handleSegmentChange({ detail: { value: "swap" } });
        break;
      case type === "fiat":
        handleSegmentChange({ detail: { value: "fiat" } });
        break;
      case type === "openModal":
        handleOpenModal(type, reserve);
        break;
      default:
        break;
    }
  }

  function handleOpenModal(
    type: string,
    reserve: ReserveDataHumanized &
      FormatReserveUSDResponse & {
        borrowBalance: number;
        borrowBalanceUsd: number;
        supplyBalance: number;
        supplyBalanceUsd: number;
        walletBalance: number;
        logo: string;
        priceInUSD: string;
      }
  ) {
    if (!userSummary) {
      throw new Error("No userSummary found");
    }
    // calcul max amount
    const maxAmount = getMaxAmount(
      type,
      reserve,
      userSummary,
      markets?.CHAIN_ID
    );
    // update state
    setState({
      actionType: type as "deposit" | "withdraw" | "borrow" | "repay",
      maxAmount,
    });
    console.log("[INFO] maxAmount: ", { type, reserve, maxAmount });

    // call method to open modal
    present({
      cssClass: "modalAlert ",
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
      },
    });
  }

  return (
    <IonAccordion>
      <IonItem slot="header">
        <IonGrid onClick={() => console.log(reserve)}>
          <IonRow class="ion-align-items-center ion-justify-content-between ion-padding-vertical">
            <IonCol
              size-md="3"
              class="ion-text-start"
              style={{
                display: "flex",
                alignItems: "center",
                alignContent: "center",
              }}
            >
              <IonAvatar
                style={{
                  height: "48px",
                  width: "48px",
                  minHeight: "48px",
                  minWidth: "48px",
                }}
              >
                <IonImg src={reserve?.logo}></IonImg>
              </IonAvatar>
              <IonLabel class="ion-padding-start">
                {reserve?.symbol}
                {(reserve?.usageAsCollateralEnabled === false ||
                  reserve.isIsolated === true) && (
                  <IonIcon
                    icon={warningOutline}
                    color="warning"
                    style={{ marginLeft: "0.5rem" }}
                  ></IonIcon>
                )}
                <p>
                  <small>{reserve?.name}</small>
                  {user && (
                    <IonText color="dark">
                      <br />
                      <small>
                        Wallet balance: {Number(reserve.walletBalance)}
                      </small>
                    </IonText>
                  )}
                </p>
              </IonLabel>
            </IonCol>
            <IonCol
              size="1"
              class="ion-text-center ion-hide-md-down"
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <IonImg
                style={{
                  width: "18px",
                  heigth: "18px",
                  marginRight: "0.5rem",
                }}
                src="./assets/icons/aave.svg"
              ></IonImg>
              <a
                href="https://aave.com/"
                target="_blank"
                rel="noreferrer noopener"
              >
                <IonIcon
                  color="medium"
                  style={{
                    fontSize: "0.8rem",
                    transform: "translateY(-0.5rem)",
                  }}
                  icon={openOutline}
                ></IonIcon>
              </a>
            </IonCol>
            <IonCol size="2" class="ion-text-end ion-hide-md-down">
              <IonLabel>
                {+reserve?.supplyBalance > 0
                  ? (reserve?.supplyBalance).toFixed(6)
                  : "0.00"}
                <br />
                <IonText color="medium">
                  <small>
                    {getReadableAmount(
                      +reserve?.supplyBalance,
                      Number(reserve?.priceInUSD),
                      "No deposit"
                    )}
                  </small>
                </IonText>
              </IonLabel>
            </IonCol>
            <IonCol size="2" class="ion-text-end ion-hide-md-down">
              <IonLabel>
                {+reserve?.borrowBalance > 0
                  ? reserve?.borrowBalance.toFixed(6)
                  : reserve?.borrowingEnabled === false
                  ? "-"
                  : "0.00"}
                {reserve?.borrowingEnabled === true && (
                  <IonText color="medium">
                    <br />
                    <small>
                      {getReadableAmount(
                        reserve?.borrowBalance,
                        Number(reserve?.priceInUSD),
                        "No debit"
                      )}
                    </small>
                  </IonText>
                )}
              </IonLabel>
            </IonCol>
            <IonCol size="auto" size-md="2" class="ion-text-end">
              <IonLabel>
                {Number(reserve?.supplyAPY || 0) * 100 === 0
                  ? "0"
                  : Number(reserve?.supplyAPY || 0) * 100 < 0.01
                  ? "< 0.01"
                  : (Number(reserve?.supplyAPY || 0) * 100).toFixed(2)}
                %
              </IonLabel>
            </IonCol>
            <IonCol size="2" class="ion-text-end ion-hide-sm-down">
              <IonLabel>
                {Number(reserve?.variableBorrowAPY || 0) * 100 === 0
                  ? reserve?.borrowingEnabled === false
                    ? "- "
                    : `0%`
                  : Number(reserve?.variableBorrowAPY || 0) * 100 < 0.01
                  ? `< 0.01%`
                  : (Number(reserve?.variableBorrowAPY || 0) * 100).toFixed(2) +
                    "%"}
              </IonLabel>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>

      <IonGrid className="ion-padding" slot="content">
        <IonRow class="ion-padding-top ion-justify-content-center">
          {!reserve.usageAsCollateralEnabled && (
            <IonCol
              size-md="12"
              class="ion-padding ion-margin-bottom ion-text-center"
            >
              <IonText color="warning">
                This asset can not be used as collateral. Providing liquidity
                with this asset will not incrase your borrowing capacity.
              </IonText>
            </IonCol>
          )}
          {reserve.isIsolated === true && (
            <IonCol
              size-md="12"
              class="ion-padding ion-margin-bottom ion-text-center"
            >
              <IonText color="warning">
                This asset can only be used as collateral in isolation mode
                only. <br />
                In Isolation mode you cannot supply other assets as collateral
                for borrowing. Assets used as collateral in Isolation mode can
                only be borrowed to a specific debt ceiling
              </IonText>
            </IonCol>
          )}
          <IonCol size-md="6" class="ion-padding ion-text-center">
            <div
              style={{
                maxWidth: 200,
                maxHeight: 200,
                margin: "auto",
              }}
            >
              <CircularProgressbarWithChildren
                styles={buildStyles({
                  textColor: "var(--ion-text-color)",
                  pathColor:
                    reserve.supplyPoolRatioInPercent < 80
                      ? "var(--ion-color-primary)"
                      : "var(--ion-color-danger)",
                  trailColor: "rgba(var(--ion-color-primary-rgb), 0.2)",
                })}
                value={reserve.supplyPoolRatioInPercent}
              >
                <div>
                  <h3>{`${reserve.supplyPoolRatioInPercent.toFixed(2)}%`}</h3>
                  <IonText color="medium">
                    <small>Total deposit</small>
                  </IonText>
                </div>
              </CircularProgressbarWithChildren>
            </div>
            <div className="ion-padding">
              <IonItem
                lines="none"
                style={{
                  "--background": "transparent",
                  marginBottom: "1.5rem",
                }}
              >
                <IonLabel class="ion-text-center">Deposit details</IonLabel>
              </IonItem>
              {user && (
                <IonItem style={{ "--background": "transparent" }}>
                  <IonLabel color="medium">My deposit</IonLabel>
                  <div className="ion-text-end">
                    <IonText color="medium">
                      {+reserve?.supplyBalance > 0
                        ? (+reserve?.supplyBalance).toFixed(6)
                        : undefined || "0"}
                    </IonText>
                    <br />
                    <IonText color="medium">
                      <small>
                        {getReadableAmount(
                          +reserve?.supplyBalance,
                          Number(reserve?.priceInUSD),
                          "No deposit"
                        )}
                      </small>
                    </IonText>
                  </div>
                </IonItem>
              )}
              <IonItem style={{ "--background": "transparent" }}>
                <IonLabel color="medium">APY</IonLabel>
                <IonText color="medium">
                  {(Number(reserve?.supplyAPY || 0) * 100).toFixed(2)}%
                </IonText>
              </IonItem>

              <IonItem style={{ "--background": "transparent" }}>
                <IonLabel color="medium">Deposit liquidity</IonLabel>
                <IonText color="medium">
                  {getReadableAmount(
                    valueToBigNumber(reserve.totalLiquidityUSD).toNumber()
                  )}
                </IonText>
              </IonItem>
              <IonItem lines="none" style={{ "--background": "transparent" }}>
                <IonLabel color="medium">Deposit capitalisation</IonLabel>
                <IonText color="medium">
                  {getReadableAmount(Number(reserve.supplyCapUSD))}
                </IonText>
              </IonItem>
            </div>
            <div className="ion-margin-vertical ion-padding-vertical">
              {user && (
                <>
                  {Number(reserve.walletBalance || 0) <= 0 &&
                  reserve.supplyBalance <= 0 ? (
                    <>
                      <IonButton
                        fill="solid"
                        color="primary"
                        onClick={() => handleEvents("swap", reserve)}
                      >
                        Exchange assets
                      </IonButton>
                      <IonButton
                        fill="solid"
                        color="primary"
                        onClick={() => handleEvents("fiat", reserve)}
                      >
                        Buy assets
                      </IonButton>
                    </>
                  ) : (
                    <>
                      <IonButton
                        fill="solid"
                        color="primary"
                        disabled={
                          !reserve?.supplyBalance || +reserve.supplyBalance <= 0
                            ? true
                            : false
                        }
                        onClick={() => handleOpenModal("withdraw", reserve)}
                      >
                        Withdraw
                      </IonButton>
                      <IonButton
                        fill="solid"
                        color="primary"
                        disabled={
                          reserve.supplyPoolRatioInPercent > 99
                            ? true
                            : !reserve?.walletBalance ||
                              reserve.walletBalance <= 0
                            ? true
                            : false
                        }
                        onClick={() => handleOpenModal("deposit", reserve)}
                      >
                        Deposit
                      </IonButton>
                    </>
                  )}
                </>
              )}
            </div>
          </IonCol>

          {reserve.borrowingEnabled && (
            <IonCol size-md="6" class="ion-padding ion-text-center">
              <div
                style={{
                  maxWidth: 200,
                  maxHeight: 200,
                  margin: "auto",
                }}
              >
                <CircularProgressbarWithChildren
                  styles={buildStyles({
                    textColor: "var(--ion-text-color)",
                    pathColor:
                      reserve.borrowPoolRatioInPercent < 80
                        ? "var(--ion-color-primary)"
                        : "var(--ion-color-danger)",
                    trailColor: "rgba(var(--ion-color-primary-rgb), 0.2)",
                  })}
                  value={reserve.borrowPoolRatioInPercent}
                >
                  <div>
                    <h3>{`${reserve.borrowPoolRatioInPercent.toFixed(2)}%`}</h3>
                    <IonText color="medium">
                      <small>Total debits</small>
                    </IonText>
                  </div>
                </CircularProgressbarWithChildren>
              </div>
              <div className="ion-padding">
                <IonItem
                  lines="none"
                  style={{
                    "--background": "transparent",
                    marginBottom: "1.5rem",
                  }}
                >
                  <IonLabel class="ion-text-center">Borrow details</IonLabel>
                </IonItem>
                {user && (
                  <IonItem style={{ "--background": "transparent" }}>
                    <IonLabel color="medium">My debit</IonLabel>
                    <div className="ion-text-end">
                      <IonText color="medium">
                        {reserve?.borrowBalance > 0
                          ? reserve?.borrowBalance.toFixed(6)
                          : undefined || "0"}
                      </IonText>
                      <br />
                      <IonText color="medium">
                        <small>
                          {getReadableAmount(
                            +reserve?.borrowBalance,
                            Number(reserve?.priceInUSD),
                            "No debit"
                          )}
                        </small>
                      </IonText>
                    </div>
                  </IonItem>
                )}
                <IonItem style={{ "--background": "transparent" }}>
                  <IonLabel color="medium">APY</IonLabel>
                  <IonText color="medium">
                    {(Number(reserve?.variableBorrowAPY || 0) * 100).toFixed(2)}
                    %
                  </IonText>
                </IonItem>
                <IonItem style={{ "--background": "transparent" }}>
                  <IonLabel color="medium">Debit liquidity</IonLabel>
                  <IonText color="medium">
                    {getReadableAmount(Number(reserve.totalDebtUSD))}
                    {/* {formatCurrencyValue(+reserve.totalLiquidityUSD)} */}
                    {/* <FormattedNumber
                    compact={true}
                    value={Math.max(Number(reserve.totalLiquidityUSD), 0)}
                    symbol="USD"
                  /> */}
                    {/* {valueToBigNumber(reserve.supplyCapUSD).toNumber()} */}
                  </IonText>
                </IonItem>
                <IonItem lines="none" style={{ "--background": "transparent" }}>
                  <IonLabel color="medium">Borrow capitalisation</IonLabel>
                  <IonText color="medium">
                    {getReadableAmount(Number(reserve.borrowCapUSD))}
                  </IonText>
                </IonItem>
              </div>
              <div className="ion-margin-vertical ion-padding-vertical">
                {user ? (
                  <>
                    <IonButton
                      fill="solid"
                      color="primary"
                      disabled={
                        !reserve?.borrowBalance || reserve.borrowBalance <= 0
                          ? true
                          : false
                      }
                      onClick={() => handleOpenModal("repay", reserve)}
                    >
                      Repay
                    </IonButton>
                    <IonButton
                      fill="solid"
                      color="primary"
                      disabled={
                        reserve.borrowPoolRatioInPercent > 99
                          ? true
                          : percentBorrowingCapacity <= 0
                          ? true
                          : false
                      }
                      onClick={() => handleOpenModal("borrow", reserve)}
                    >
                      Borrow
                    </IonButton>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </IonCol>
          )}

          {!user && (
            <IonCol
              size="12"
              class="ion-padding ion-margin-bottom ion-text-center"
            >
              <ConnectButton></ConnectButton>
            </IonCol>
          )}
        </IonRow>
      </IonGrid>
    </IonAccordion>
  );
}
