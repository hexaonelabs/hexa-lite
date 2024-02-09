import {
  IonAvatar,
  IonBadge,
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
import { getPoolsState, getWeb3State } from "@/store/selectors";
import { getPoolSupplyAndBorrowBallance, getPoolWalletBalance } from "@/utils/getPoolWalletBalance";

interface IPoolItemListProps {
  poolId: string;
  chainId: number;
  iconSize: string;
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}
export function PoolItemList(props: IPoolItemListProps) {
  const { poolId, iconSize, chainId, handleSegmentChange } = props;
  const { walletAddress, assets, loadAssets } = Store.useState(getWeb3State);
  const { poolGroups, userSummaryAndIncentivesGroup } = Store.useState(getPoolsState);
  const modal = useRef<HTMLIonModalElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // find pool in `poolGroups[*].pool` by `poolId`
  const pool = poolGroups
      .find((pg) => pg.pools.find((p) => p.id === poolId))
      ?.pools.find((p) => p.id === poolId);
  if (!pool) throw new Error(`[ERROR] Pool not found: ${poolId}`);

  const balance = getPoolWalletBalance(pool, assets).toFixed(6);
  const walletBalance = Number(balance) > 0 ? balance : "0";
  const { borrowBalance, supplyBalance } = getPoolSupplyAndBorrowBallance(pool, userSummaryAndIncentivesGroup||[])
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
          position: "absolute",
          right: "0",
          borderRadius: '50%',
          overflow: 'hidden'
        }}
        src={url} />
    );
  };
  const ActionBtn = (props: {provider: string}) => {
    const { provider } = props;
    if (provider === 'aave-v3') {
      return (
        <IonFabButton
          slot="end"
          color="gradient"
          size="small"
          className="ion-margin-horizontal"
        >
          <IonIcon size="small" icon={searchOutline} />
        </IonFabButton>
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
              <IonLabel class="ion-padding-start">
                {pool.symbol}
                {pool.usageAsCollateralEnabled === false && (
                  <IonIcon
                    icon={warningOutline}
                    color="warning"
                    style={{ marginLeft: "0.5rem" }}
                  ></IonIcon>
                )}
                <p>
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
        ref={modal}
        isOpen={isModalOpen}
        className="modalPage"
        onDidDismiss={() => setIsModalOpen(() => false)}
      >
        <ReserveDetail
          pool={pool}
          dismiss={(actionType?: string) => {
            modal.current?.dismiss();
            // reload asset if user have trigger an action from ReserveDetails.
            // Ex: deposit, withdraw, borrow, repay
            if (actionType) {
              loadAssets();
            }
          }}
          handleSegmentChange={handleSegmentChange}
        />
      </IonModal>
    </>
  );
}
