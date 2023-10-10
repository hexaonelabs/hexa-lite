import {
  IonAvatar,
  IonButton,
  IonCol,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonModal,
  IonRow,
  IonText,
  useIonModal,
} from "@ionic/react";
import { warningOutline, searchOutline } from "ionicons/icons";
import { useUser } from "../context/UserContext";
import { getReadableAmount } from "../utils/getReadableAmount";
import { IReserve, IUserSummary } from "../interfaces/reserve.interface";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { ReserveDetail } from "./ReserveDetail";
import { useAave } from "../context/AaveContext";
import { useMemo, useRef, useState } from "react";

interface IPoolItemListProps {
  reserveId: string;
  userSummary: IUserSummary | undefined;
  chainId: number;
  iconSize: string;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}
export function PoolItemList(props: IPoolItemListProps) {
  const { reserveId, iconSize, chainId, userSummary, handleSegmentChange } = props;
  const { user } = useUser();
  const { markets, poolGroups } = useAave();
  const modal = useRef<HTMLIonModalElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // find reserve in `poolGroups[*].reserves` by `reserveId`
  const reserve = useMemo(
    () => {
      return poolGroups
      ?.find((pg) => pg.reserves.find((r) => r.id === reserveId))
      ?.reserves.find((r) => r.id === reserveId) as IReserve;
    },
    [reserveId]
  );
  
  return (
    <>
      <IonItem 
        lines="none" 
        onClick={() => {
          console.log({reserve})
          setIsModalOpen(() => true);
        }}
      >
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
              <div>
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
              <IonLabel className="ion-padding-end">
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
        
        <IonFabButton
          slot="end"
          color="gradient"
          size="small"
          className="ion-margin-horizontal"
        > 
          <IonIcon size="small" icon={searchOutline} />
        </IonFabButton>
      </IonItem>

      <IonModal 
        ref={modal} 
        isOpen={isModalOpen}
        className="modalPage"
        onDidDismiss={() => setIsModalOpen(() => false)}
      >
        <ReserveDetail 
          reserve={reserve}
          userSummary={userSummary}
          markets={markets?.find((m) => m.CHAIN_ID === chainId)}
          dismiss={() => modal.current?.dismiss()}
          handleSegmentChange={handleSegmentChange} />
      </IonModal>
    </>
  );
}
