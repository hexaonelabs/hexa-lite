import {
  IonAvatar,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonRow,
  IonText,
  useIonModal,
} from "@ionic/react";
import { IReserve } from "../interfaces/reserve.interface";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import { useUser } from "../context/UserContext";
import { getReadableAmount } from "../utils/getReadableAmount";
import { valueToBigNumber } from "@aave/math-utils";
import ConnectButton from "./ConnectButton";
import { getMaxAmount } from "../utils/getMaxAmount";
import { LoanFormModal } from "./LoanFormModal";
import { useState } from "react";
import { closeOutline, warningOutline } from "ionicons/icons";
import { CHAIN_AVAILABLES } from "../constants/chains";

interface IReserveDetailProps {
  reserve: IReserve;
  userSummary: any;
  dismiss: () => void;
}

export function ReserveDetail(props: IReserveDetailProps) {
  const { reserve, userSummary } = props;
  const { user } = useUser();
  const [state, setState] = useState<
    | {
        actionType: "deposit" | "withdraw" | "borrow" | "repay" | undefined;
        maxAmount: number;
      }
    | undefined
  >(undefined);
  const [present, dismiss] = useIonModal(LoanFormModal, {
    selectedReserve: {
      reserve: {
        ...reserve,
        maxAmount: -1,
      },
      actionType: state?.actionType,
    },
    userSummary: undefined,
    onDismiss: (data: string, role: string) => dismiss(data, role),
  });
  const borrowPoolRatioInPercent = 0;
  const supplyPoolRatioInPercent = 0;
  const percentBorrowingCapacity = 0;

  const handleOpenModal = (type: string, reserve: IReserve) => {
    if (!userSummary) {
      throw new Error("No userSummary found");
    }
    const maxAmount = getMaxAmount(
      type,
      reserve as any,
      userSummary,
      reserve.chainId
    );
  };

  return (
    <IonContent>
      <IonGrid style={{ width: "100%" }}>
        <IonRow>
          <IonCol
            size="10"
            class="ion-text-start ion-padding"
            style={{
              display: "flex",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            <div style={{ minWidth: "64px" }}>
              <IonAvatar
                style={{
                  height: "64px",
                  width: "64px",
                  minHeight: "64px",
                  minWidth: "64px",
                }}
              >
                <IonImg src={reserve.logo}></IonImg>
              </IonAvatar>
              <IonIcon
                style={{
                  fontSize: "1.3rem",
                  transform: "translateX(-0.2rem)",
                  position: "absolute",
                  bottom: "0.15rem",
                }}
                src={
                  CHAIN_AVAILABLES.find((c) => c.id === reserve.chainId)?.logo
                }
              ></IonIcon>
            </div>
            <IonLabel class="ion-padding-start">
              <h2>
                {reserve?.symbol}
                <small style={{ display: "block" }}>{reserve.name}</small>
              </h2>
              {(reserve?.usageAsCollateralEnabled === false ||
                reserve.isIsolated === true) && (
                <IonIcon
                  icon={warningOutline}
                  color="warning"
                  style={{ marginLeft: "0.5rem" }}
                ></IonIcon>
              )}
            </IonLabel>
          </IonCol>
          <IonCol size="2" className="ion-text-end">
            <IonButton
              fill="clear"
              color="primary"
              onClick={() => props.dismiss()}
            >
              <IonIcon icon={closeOutline}></IonIcon>
            </IonButton>
          </IonCol>
        </IonRow>
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
                    supplyPoolRatioInPercent < 80
                      ? "var(--ion-color-primary)"
                      : "var(--ion-color-danger)",
                  trailColor: "rgba(var(--ion-color-primary-rgb), 0.2)",
                })}
                value={supplyPoolRatioInPercent}
              >
                <div>
                  <h3>{`${supplyPoolRatioInPercent.toFixed(2)}%`}</h3>
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
                      {/* <IonButton
                          fill="solid"
                          color="primary"
                          onClick={() => handleEvents("swap", reserve)}
                        >
                          Exchange assets
                        </IonButton> */}
                      {/* <IonButton
                          fill="solid"
                          color="primary"
                          onClick={() => handleEvents("fiat", reserve)}
                        >
                          Buy assets
                        </IonButton> */}
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
                          supplyPoolRatioInPercent > 99
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
                      borrowPoolRatioInPercent < 80
                        ? "var(--ion-color-primary)"
                        : "var(--ion-color-danger)",
                    trailColor: "rgba(var(--ion-color-primary-rgb), 0.2)",
                  })}
                  value={borrowPoolRatioInPercent}
                >
                  <div>
                    <h3>{`${borrowPoolRatioInPercent.toFixed(2)}%`}</h3>
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
                        borrowPoolRatioInPercent > 99
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
    </IonContent>
  );
}
