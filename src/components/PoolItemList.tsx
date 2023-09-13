import { ReserveDataHumanized } from "@aave/contract-helpers";
import { FormatReserveUSDResponse } from "@aave/math-utils";
import {
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
import { openOutline, warningOutline } from "ionicons/icons";
import { useUser } from "../context/UserContext";
import { getReadableAmount } from "../utils/getReadableAmount";
import { IReserve } from "../interfaces/reserve.interface";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { ReserveDetail } from "./ReserveDetail";

interface IPoolItemListProps {
  reserve: IReserve;
  chainId: number;
  iconSize: string;
}
export function PoolItemList(props: IPoolItemListProps) {
  const { reserve, iconSize, chainId } = props;
  const { user } = useUser();
  const [present, dismiss] = useIonModal(ReserveDetail, {
    reserve,
    dismiss: () => dismiss(),
    // onDismiss: (data: string, role: string) => dismiss(data, role),
  });
  return (
    <IonItem lines="none">
      <IonGrid className="ion-no-padding">
        <IonRow className="poolItemList ion-align-items-center ion-justify-content-between ion-no-padding ion-padding-start">
          <IonCol size-md="2"
            class="ion-text-start ion-padding-start"
            style={{
              display: "flex",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            <div style={{ minWidth: "48px" }}>
              <IonAvatar
                style={{
                  height: iconSize,
                  width: iconSize,
                  minHeight: iconSize,
                  minWidth: iconSize,
                }}
              >
                <IonImg src={reserve.logo}></IonImg>
              </IonAvatar>
              <IonIcon
                style={{
                  fontSize: "0.8rem",
                  transform: "translateX(-0.2rem)",
                  position: "absolute",
                  bottom: "0.15rem",
                }}
                src={CHAIN_AVAILABLES.find((c) => c.id === chainId)?.logo}
              ></IonIcon>
            </div>
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
                <small>
                  {CHAIN_AVAILABLES.find((c) => c.id === chainId)?.name} network
                </small>
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
          <IonCol size="1"
            class="ion-text-end ion-hide-md-down"
          >
            <IonImg
              style={{
                width: "18px",
                heigth: "18px",
                position: "absolute",
                right: "0",
              }}
              src="./assets/icons/aave.svg"
            ></IonImg>
          </IonCol>
          <IonCol size-md="2" class="ion-text-end ion-hide-md-down">
            <IonLabel>
              {+reserve?.supplyBalance > 0
                ? (+reserve?.supplyBalance).toFixed(6)
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
          <IonCol size="auto" size-md="2" class="ion-text-end ion-hide-md-down">
            <IonLabel>
              {+reserve?.borrowBalance > 0
                ? (+reserve?.borrowBalance).toFixed(6)
                : reserve?.borrowingEnabled === false
                ? "-"
                : "0.00"}
              {reserve?.borrowingEnabled === true && (
                <IonText color="medium">
                  <br />
                  <small>
                    {getReadableAmount(
                      +reserve?.borrowBalance,
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
          <IonCol size="auto" size-md="2" class="ion-text-end ion-hide-md-down">
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
          <IonCol size="3" size-md="1" className="ion-text-end ion-padding-horizontal">
            <IonButton onClick={()=> present({
              cssClass: 'modalPage',
            })}>Details</IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonItem>
  );
}