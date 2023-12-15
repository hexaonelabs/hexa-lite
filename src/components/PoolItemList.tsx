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
import { getReadableAmount } from "../utils/getReadableAmount";
import { IReserve, IUserSummary } from "../interfaces/reserve.interface";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { ReserveDetail } from "./ReserveDetail";
import { useAave } from "../context/AaveContext";
import { useMemo, useRef, useState } from "react";
import { useWeb3Provider } from "../context/Web3Context";
import { SymbolIcon } from "./SymbolIcon";

interface IPoolItemListProps {
  poolId: string;
  chainId: number;
  iconSize: string;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}
export function PoolItemList(props: IPoolItemListProps) {
  const { poolId, iconSize, chainId, handleSegmentChange } = props;
  const { walletAddress } = useWeb3Provider();
  const { markets, poolGroups } = useAave();
  const modal = useRef<HTMLIonModalElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // find pool in `poolGroups[*].pool` by `poolId`
  const pool = useMemo(
    () => {
      return poolGroups
      .find((pg) => pg.pools.find((p) => p.id === poolId))?.pools.find((p) => p.id === poolId);
    },
    [poolId]
  );
  if (!pool) return null;
  return (
    <>
      <IonItem 
        lines="none" 
        onClick={() => {
          console.log({pool})
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
              <SymbolIcon  
                symbol={pool.symbol}
                chainId={pool.chainId}
                iconSize={iconSize}
                />
              <IonLabel class="ion-padding-start">
                {pool?.symbol}
                {(pool?.usageAsCollateralEnabled === false) && (
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
                  {walletAddress && (
                    <IonText color="dark">
                      <br />
                      <small>
                        Wallet balance: {Number(pool.walletBalance)}
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
                {pool.supplyBalance > 0
                  ? pool.supplyBalance.toFixed(6)
                  : "0.00"}
                <br />
                <IonText color="medium">
                  <small>
                    {getReadableAmount(
                      pool.supplyBalance,
                      Number(pool.priceInUSD),
                      "No deposit"
                    )}
                  </small>
                </IonText>
              </IonLabel>
            </IonCol>
            <IonCol size="auto" size-md="2" class="ion-text-end ion-hide-md-down">
              <IonLabel>
                {pool.borrowBalance > 0
                  ? pool.borrowBalance.toFixed(6)
                  : pool.borrowingEnabled === false
                  ? "-"
                  : "0.00"}
                {pool?.borrowingEnabled === true && (
                  <IonText color="medium">
                    <br />
                    <small>
                      {getReadableAmount(
                        +pool?.borrowBalance,
                        Number(pool?.priceInUSD),
                        "No debit"
                      )}
                    </small>
                  </IonText>
                )}
              </IonLabel>
            </IonCol>
            <IonCol size="auto" size-md="2" class="ion-text-end">
              <IonLabel>
                {Number(pool?.supplyAPY || 0) * 100 === 0
                  ? "0"
                  : Number(pool?.supplyAPY || 0) * 100 < 0.01
                  ? "< 0.01"
                  : (Number(pool?.supplyAPY || 0) * 100).toFixed(2)}
                %
              </IonLabel>
            </IonCol>
            <IonCol size="auto" size-md="2" class="ion-text-end ion-hide-md-down">
              <IonLabel className="ion-padding-end">
                {Number(pool?.borrowAPY || 0) * 100 === 0
                  ? pool?.borrowingEnabled === false
                    ? "- "
                    : `0%`
                  : Number(pool?.borrowAPY || 0) * 100 < 0.01
                  ? `< 0.01%`
                  : (Number(pool?.borrowAPY || 0) * 100).toFixed(2) +
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
          pool={pool}
          markets={markets?.find((m) => m.CHAIN_ID === chainId)}
          dismiss={() => modal.current?.dismiss()}
          handleSegmentChange={handleSegmentChange} />
      </IonModal>
    </>
  );
}
