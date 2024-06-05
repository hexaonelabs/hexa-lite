import {

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
  IonNote,
  IonRow,
  IonText,
} from "@ionic/react";
import { closeSharp } from "ionicons/icons";
import { useRef, useState } from "react";
import { getMaxAmount } from "../utils/getMaxAmount";
import {
  IMarketPool,
  IReserve,
  IUserSummary,
  ReserveDetailActionType,
} from "../interfaces/reserve.interface";
import { WarningBox } from "./WarningBox";
import { CrosschainLoanForm } from "./CrosschainLoanForm";
import { IAavePool } from "@/pool/Aave.pool";
import web3Connector from '@/servcies/firebase-web3-connect';

export function LoanFormModal({
  onDismiss,
  selectedPool,
  isCrossChain,
}: {
  selectedPool: {
    actionType: ReserveDetailActionType;
    pool: IAavePool;
    userSummary: IUserSummary;
  };
  isCrossChain?: boolean;
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
}) {
  const { pool, actionType, userSummary } = selectedPool;
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [isConfirm, setIsConfirm ] = useState(false);
  const [feesAmount, setFeesAmount ] = useState('0 Gwei');
  const [valueAmount, setValueAmount ] = useState(0);
  const [isCrossChainEnabled, setIsCrossChainEnabled] = useState(isCrossChain);
  const [healthFactor, setHealthFactor] = useState<number | undefined>(
    -1
  );
  const maxAmount = getMaxAmount(
    actionType,
    pool,
    userSummary,
    pool.chainId
  );
  const displayRiskCheckbox =
    (actionType.toLocaleLowerCase() === "borrow" ||
      actionType.toLocaleLowerCase() === "withdraw") &&
    healthFactor &&
    healthFactor < 1.15 &&
    healthFactor?.toString() !== "-1";
  const readableAction =
    actionType[0].toUpperCase() + actionType.slice(1).toLocaleLowerCase();

  const handleClick = async () => {
    if (!isConfirm) {
      const fees = await web3Connector.getNetworkFeesAsUSD();
      setFeesAmount(fees);
      setIsConfirm(true);
      return;
    }
    onDismiss(valueAmount, "confirm");
  }

  return (
    <IonGrid className="ion-no-padding" style={{ width: "100%" }}>
      <IonRow class="ion-align-items-center ion-padding-start ion-padding-end ion-padding-top">
        <IonCol size="10">
          <h3>
            {isCrossChainEnabled ? "Crosschain " : null}
            {readableAction} {!isCrossChainEnabled ? pool.symbol : null}
          </h3>
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
      {/* {isCrossChainEnabled && (
        <CrosschainLoanForm
          reserve={reserve}
          userSummary={userSummary}
          toggleCrosschainForm={() => setIsCrossChainEnabled(false)}
          onSubmit={(data, role) => {
            // TODO: implement call
            console.log('CrosschainLoanForm submited: ', {
              data,
              role,
            });
          }}
        />
      )} */}
      {!isCrossChainEnabled && (
        <>
          <IonRow className="ion-padding-top">
            {!isConfirm && (
              <IonCol
                size="12"
                className="ion-padding-horizontal ion-padding-top"
              >
                <IonText
                  color="medium"
                  style={{
                    display: "block",
                    padding: "0rem 0rem 0.25rem",
                  }}
                >
                  <small>Amount</small>
                </IonText>
                <IonItem lines="none">
                  <div
                    slot="start"
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <IonAvatar>
                      <IonImg src={pool.logo}></IonImg>
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
                              borrowBalanceMarketReferenceCurrency:
                                valueToBigNumber(
                                  userSummary.totalBorrowsUSD
                                ).plus(
                                  valueToBigNumber(
                                    inputRef.current?.value || 0
                                  ).times(pool?.priceInUSD || 0)
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
                        <h3 style={{ margin: " 0" }}>{pool.symbol}</h3>
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
                        if (maxAmount && value && Number(value) > maxAmount) {
                          (e.target as any).value = maxAmount;
                        }
                        if (value && Number(value) < 0) {
                          (e.target as any).value = "0";
                          setValueAmount(0);
                          return;
                        }
                        // set State
                        setValueAmount(Number(value));
                        // calculate healthfactor
                        const newHealthFactor =
                          calculateHealthFactorFromBalancesBigUnits({
                            collateralBalanceMarketReferenceCurrency:
                              userSummary.totalCollateralUSD,
                            borrowBalanceMarketReferenceCurrency:
                              valueToBigNumber(userSummary.totalBorrowsUSD).plus(
                                valueToBigNumber(
                                  inputRef.current?.value || 0
                                ).times(pool?.priceInUSD || 0)
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
            )}
            {isConfirm && (
              <IonCol
                size="12"
                className="ion-padding-horizontal ion-padding-top"
              >
                <IonText
                  color="medium"
                  style={{
                    display: "block",
                    padding: "0rem 0rem 0.25rem",
                  }}
                >
                  <small>Review Transaction</small>
                </IonText>
                <IonItem>
                  <IonLabel>Action</IonLabel>
                  <IonText slot="end">{readableAction}</IonText>
                </IonItem>
                <IonItem>
                  <IonLabel>Amount</IonLabel>
                  <IonText slot="end">{valueAmount||0} { pool.symbol }</IonText>
                </IonItem>
                <IonItem>
                  <IonLabel>Fees</IonLabel>
                  <IonText slot="end">{feesAmount||0}</IonText>
                </IonItem>
              </IonCol>
            )}
          </IonRow>
          {displayRiskCheckbox && (
            <IonRow class="ion-justify-content-center">
              <IonCol
                size="auto"
                class="ion-text-center ion-padding"
              >
                <WarningBox>
                  <p className="ion-no-padding ion-no-margin">
                    <small>
                      {readableAction} this amount will reduce your health
                      factor and increase risk of liquidation. Add more
                      collateral to increase your health factor.
                    </small>
                  </p>
                </WarningBox>
              </IonCol>
            </IonRow>
          )}
          <IonRow class="ion-justify-content-between ion-padding">
            <IonCol size="12">
              {/* {actionType === "borrow" && (
                <IonButton
                  expand="block"
                  fill="clear"
                  color="primary"
                  onClick={() => setIsCrossChainEnabled(() => true)}
                >
                  <small>or use crosschain collateral</small>
                </IonButton>
              )} */}
              
              <IonButton
                expand="block"
                onClick={() => handleClick()}
                strong={true}
                color="gradient"
                disabled={(valueAmount||0) > maxAmount || Number(valueAmount||0) <= 0}
              >
                {isConfirm ? 'Confirm' : readableAction}
              </IonButton>
            </IonCol>
          </IonRow>
        </>
      )}
    </IonGrid>
  );
}
