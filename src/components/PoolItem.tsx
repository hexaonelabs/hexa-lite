import {
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
} from "@ionic/react";
import { warningOutline, searchOutline } from "ionicons/icons";
import { getReadableAmount } from "../utils/getReadableAmount";
import { CHAIN_AVAILABLES } from "../constants/chains";
import { ReserveDetail } from "./ReserveDetail";
import { useMemo, useRef, useState } from "react";
import { SymbolIcon } from "./SymbolIcon";
import Store from "@/store";
import { getWeb3State, getPoolGroupsState } from "@/store/selectors";

const LogoProviderImage = (props: { provider: string }) => {
  const { provider } = props;
  let url = "./assets/icons/aave.svg";
  switch (true) {
    case provider.includes("aave"):
      break;
    case provider.includes("solend"):
      url = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp/logo.png";
      break;
  }
  return (
    <IonImg
      style={{
        width: "18px",
        heigth: "18px",
        display: "inline-block",
        margin: "auto",
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: '0 0 8px 2px var(--ion-border-color)'
      }}
      src={url} />
  );
};

const ActionBtn = (props: {provider: string}) => {
  const { provider } = props;
  if (provider === 'aave-v3') {
    return (
      <IonButton
        slot="end"
        fill="clear"
        size="small"
        shape="round"
        className="ion-margin-horizontal"
      >
        <IonIcon size="small" color="gradient" className="ion-color-gradient-text" icon={searchOutline} />
      </IonButton>
    )
  }
  return (
    <IonButton 
      disabled={true}
      className="ion-margin-horizontal"
      slot="end"
      size="small"
      color="gradient">
      <small>
        soon
      </small>
    </IonButton>
  );
}

interface IPoolItemProps {
  poolId: string;
  chainId: number;
  iconSize: string;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}
export function PoolItem(props: IPoolItemProps) {
  const { poolId, iconSize, chainId, handleSegmentChange } = props;
  const { walletAddress, loadAssets } = Store.useState(getWeb3State);
  const poolGroups  = Store.useState(getPoolGroupsState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // find pool in `poolGroups[*].pool` by `poolId`
  const pool = useMemo(() => {
    const foundPoolGroup = poolGroups.find((pg) => pg.pools.find((p) => p.id === poolId));
    if (!foundPoolGroup) throw new Error(`[ERROR] Pool group not found: ${poolId}`);
    const foundPool = foundPoolGroup.pools.find((p) => p.id === poolId);
    if (!foundPool) throw new Error(`[ERROR] Pool not found: ${poolId}`);
    return foundPool;
  }, [poolGroups, poolId]);

  const walletBalance = pool.walletBalance > 0 ? pool.walletBalance.toFixed(6) : "0";
  const { borrowBalance, supplyBalance } = pool;
  
  return (
    <>
      <IonItem
        lines="none"
        className="poolItem"
        disabled={pool.provider !== 'aave-v3'}
        onClick={() => {
          console.log(`[INFO] Pool: `,{ pool });
          if (pool.provider !== 'aave-v3') {
            return;
          }
          setIsModalOpen(() => true);
        }}
      >
        <IonGrid className="ion-no-padding">
          <IonRow className="poolItemList ion-align-items-center ion-justify-content-between ion-no-padding ion-padding-start">
            <IonCol
              size-md="2"
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
                assetIconURL={pool.logo}
                iconSize={iconSize}
              />
              <IonLabel class="ion-padding-start ion-text-nowrap">
                {pool.symbol}
                {pool.usageAsCollateralEnabled === false && (
                  <IonIcon
                    icon={warningOutline}
                    color="warning"
                    style={{ marginLeft: "0.5rem" }}
                  ></IonIcon>
                )}
                <p style={{lineHeight: '80%'}}>
                  <small>
                    {CHAIN_AVAILABLES.find((c) => c.id === chainId)?.name}{" "}
                    network
                  </small>
                  {walletAddress && (
                    <IonText color="dark">
                      <br />
                      <small>
                        Balance: {walletBalance}
                      </small>
                    </IonText>
                  )}
                </p>
              </IonLabel>
            </IonCol>
            <IonCol size="1" class="ion-text-end ion-hide-md-down">
              <LogoProviderImage provider={pool.provider} />
            </IonCol>
            <IonCol size-md="2" class="ion-text-end ion-hide-md-down">
              <IonLabel>
                {supplyBalance > 0
                  ? supplyBalance.toFixed(6)
                  : "0.00"}
                <br />
                <IonText color="medium">
                  <small>
                    {getReadableAmount(
                      supplyBalance,
                      Number(pool.priceInUSD),
                      "No deposit"
                    )}
                  </small>
                </IonText>
              </IonLabel>
            </IonCol>
            <IonCol
              size="auto"
              size-md="2"
              class="ion-text-end ion-hide-md-down"
            >
              <IonLabel>
                {borrowBalance > 0
                  ? borrowBalance.toFixed(6)
                  : pool.borrowingEnabled === false
                  ? "-"
                  : "0.00"}
                {pool?.borrowingEnabled === true && (
                  <IonText color="medium">
                    <br />
                    <small>
                      {getReadableAmount(
                        borrowBalance,
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
            <IonCol
              size="auto"
              size-md="2"
              class="ion-text-end ion-hide-md-down"
            >
              <IonLabel className="ion-padding-end">
                {Number(pool?.borrowAPY || 0) * 100 === 0
                  ? pool?.borrowingEnabled === false
                    ? "- "
                    : `0%`
                  : Number(pool?.borrowAPY || 0) * 100 < 0.01
                  ? `< 0.01%`
                  : (Number(pool?.borrowAPY || 0) * 100).toFixed(2) + "%"}
              </IonLabel>
            </IonCol>
          </IonRow>
        </IonGrid>

        <ActionBtn provider={pool.provider} />
      </IonItem>

      <IonModal
        isOpen={isModalOpen}
        className="modalPage"
        onDidDismiss={() => setIsModalOpen(() => false)}
      >
        <ReserveDetail
          pool={pool}
          dismiss={(actionType?: string) => {
            setIsModalOpen(() => false);
            // modal.current?.dismiss();
            // reload asset if user have trigger an action from ReserveDetails.
            // Ex: deposit, withdraw, borrow, repay
            if (actionType) {
              loadAssets(true);
            }
          }}
          handleSegmentChange={handleSegmentChange}
        />
      </IonModal>
    </>
  );
}
