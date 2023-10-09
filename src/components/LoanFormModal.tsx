import { ReserveDataHumanized } from "@aave/contract-helpers";
import {
  FormatReserveUSDResponse,
  FormatUserSummaryAndIncentivesResponse,
  calculateHealthFactorFromBalancesBigUnits,
  valueToBigNumber,
} from "@aave/math-utils";
import {
  IonAvatar,
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonRow,
  IonText,
} from "@ionic/react";
import { closeSharp } from "ionicons/icons";
import { useRef, useState } from "react";
import { getMaxAmount } from "../utils/getMaxAmount";
import { IReserve, IUserSummary } from "../interfaces/reserve.interface";
import { WarningBox } from "./WarningBox";

export function LoanFormModal({
  onDismiss,
  selectedReserve,
  userSummary,
}: {
  selectedReserve: {
    actionType: "deposit" | "withdraw" | "borrow" | "repay";
    reserve: IReserve;
  };
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
  userSummary: IUserSummary;
}) {
  const { reserve, actionType } = selectedReserve || {
    reserve: null,
    actionType: null,
  };
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [ amount, setAmount ] = useState<number|undefined>(0);
  const [healthFactor, setHealthFactor] = useState<number | undefined>(
    +userSummary.healthFactor
  );
  const maxAmount = getMaxAmount(
    actionType,
    reserve,
    userSummary,
    reserve.chainId
  );

  const displayRiskCheckbox =
    (actionType.toLocaleLowerCase() === "borrow" ||
      actionType.toLocaleLowerCase() === "withdraw") &&
    healthFactor &&
    healthFactor < 1.15 &&
    healthFactor?.toString() !== "-1";
  const readableAction =
    actionType[0].toUpperCase() + actionType.slice(1).toLocaleLowerCase();

  return (
    <IonGrid className="ion-padding" style={{ width: "100%" }}>
      <IonRow class="ion-align-items-top ion-margin-bottom">
        <IonCol size="10">
          <h3>{readableAction} {reserve.symbol}</h3>
        </IonCol>
        <IonCol size="2" class="ion-text-end">
          <IonButton
            size="small"
            fill="clear"
            onClick={() => onDismiss(null, "cancel")}
          >
            <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
          </IonButton>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol size="12">
          <IonLabel>
            <IonText color="medium">Amount</IonText>
          </IonLabel>
          <IonItem lines="none" className="ion-margin-top">
            <div slot="start"
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <IonAvatar >
                <IonImg src={reserve?.logo}></IonImg>
              </IonAvatar>
              <div
                className="ion-padding"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const el = inputRef.current;
                  if (el) {
                    (el as any).value = maxAmount || 0;

                    const newHealthFactor =
                      calculateHealthFactorFromBalancesBigUnits({
                        collateralBalanceMarketReferenceCurrency:
                          userSummary.totalCollateralUSD,
                        borrowBalanceMarketReferenceCurrency: valueToBigNumber(
                          userSummary.totalBorrowsUSD
                        ).plus(
                          valueToBigNumber(inputRef.current?.value || 0).times(
                            reserve?.priceInUSD || 0
                          )
                        ),
                        currentLiquidationThreshold:
                          userSummary.currentLiquidationThreshold,
                      });
                    console.log(">>newHealthFactor.toNumber()", {
                      newHealthFactor: newHealthFactor.toNumber(),
                      userSummary,
                      v: inputRef.current?.value,
                    });

                    setHealthFactor(newHealthFactor.toNumber());
                  }
                }}
              >
                <IonText>
                  <h3 style={{ margin: " 0" }}>{reserve?.symbol}</h3>
                </IonText>
                <IonText color="medium">
                  <small style={{ margin: "0" }}>
                    Max :{maxAmount.toFixed(6)}
                  </small>
                </IonText>
              </div>
            </div>
            <div slot="end" className="ion-text-end">
              <IonInput
                ref={inputRef}
                style={{ fontSize: "1.5rem" }}
                placeholder="0"
                type="number"
                max={maxAmount}
                min={0}
                debounce={100}
                onIonInput={(e) => {
                  const value = (e.target as any).value;
                  if (
                    maxAmount &&
                    value &&
                    Number(value) > maxAmount
                  ) {
                    (e.target as any).value = maxAmount;
                  }
                  if (value && Number(value) < 0) {
                    (e.target as any).value = "0";
                  }
                  const newHealthFactor =
                    calculateHealthFactorFromBalancesBigUnits({
                      collateralBalanceMarketReferenceCurrency:
                        userSummary.totalCollateralUSD,
                      borrowBalanceMarketReferenceCurrency: valueToBigNumber(
                        userSummary.totalBorrowsUSD
                      ).plus(
                        valueToBigNumber(inputRef.current?.value || 0).times(
                          reserve?.priceInUSD || 0
                        )
                      ),
                      currentLiquidationThreshold:
                        userSummary.currentLiquidationThreshold,
                    });
                  console.log(">>newHealthFactor.toNumber()", {
                    newHealthFactor,
                    userSummary,
                    v: inputRef.current?.value,
                  });

                  setHealthFactor(newHealthFactor.toNumber());
                }}
              />
            </div>
          </IonItem>
        </IonCol>
      </IonRow>
      {displayRiskCheckbox && (
        <IonRow class="ion-justify-content-center">
          <IonCol
            size="auto"
            class="ion-text-center"
            style={{ maxWidth: 400 }}
          >
            <WarningBox>
              <p className="ion-padding-horizontal">
                <small>
                  {readableAction} this amount will reduce your health factor and
                  increase risk of liquidation. Add more collateral to increase
                  your health factor.
                </small>
              </p>
            </WarningBox>
          </IonCol>
        </IonRow>
      )}

      <IonRow class="ion-justify-content-between ion-padding-top">
        <IonCol size="12">
          <IonButton
            expand="block"
            onClick={() => onDismiss(inputRef.current?.value, "confirm")}
            strong={true}
            color="gradient"
          >
            Confirm
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}
