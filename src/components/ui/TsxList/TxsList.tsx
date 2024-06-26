import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import { IonCol, IonGrid, IonInfiniteScroll, IonLabel, IonRow, IonText } from "@ionic/react";
import { useState } from "react";
import { WalletTxEntity } from "../WalletTxEntity";
import { LoadingPoolGroupsSkeleton } from "@/components/LoadingPoolGroupsSkeleton";
import { WalletTxEntitySkeleton } from "../WalletTxEntitySkeleton";

export const TxsList = (props: {
  filterBy?: string|null;
}) => {
  const { txs } = Store.useState(getWeb3State);
  const [maxItemCount, setMaxItemCount] = useState(10);
  const data = txs
  .filter((tx)=> {
    if (!props.filterBy) {
      return true;
    }
    // check transfers
    if (tx.attributes.transfers.find(
      t => t.fungible_info?.symbol.toLocaleLowerCase() === props.filterBy?.toLocaleLowerCase())
    ) {
      return true;
    }
    // check approvals
    if (tx.attributes.approvals.find(
      t => t.fungible_info?.symbol.toLocaleLowerCase() === props.filterBy?.toLocaleLowerCase())
    ) {
      return true;
    }
    return false
  });

  return (
    <>
      <IonGrid
        class="ion-padding ion-hide-md-down"
        style={{
          borderBottom: "solid 1px rgba(var(--ion-color-primary-rgb), 0.2)",
        }}
      >
        <IonRow className="ion-align-items-center ion-justify-content-between">
          <IonCol 
            size-xs="2"
            size-sm="2"
            size-md="2"
            size-lg="2"
            size-xl="2">
            <IonLabel color="medium" className="ion-no-padding">
              <small>Transaction Type</small>
            </IonLabel>
          </IonCol>

          <IonCol  size="auto">
            <IonLabel color="medium" className="ion-no-padding">
              <small>Details</small>
            </IonLabel>
          </IonCol>

          <IonCol className="ion-text-end">
            <IonText color="medium">
              <small>Date/Time</small>
            </IonText>
          </IonCol>

        </IonRow>
      </IonGrid>
      {data.length <= 0 
        ? (<div className="ion-padding ion-text-center">
          <IonText>
            <small>no existing transaction</small>
          </IonText>
        </div>) 
        : data
      .slice(0, maxItemCount)
      .map((tx, i) => (
        <WalletTxEntity key={i} tx={tx} />
      ))}
      <IonInfiniteScroll
        threshold="25%"
        onIonInfinite={(ev) => {
          console.log(maxItemCount, data.length)
          if (maxItemCount >= data.length) {
            ev.target.disabled = true;
            ev.target.complete();
            return;
          }
          setMaxItemCount((s) => s + 10);
          setTimeout(() => ev.target.complete(), 150);
        }}
      >
        <div className="infinite-scroll-content">
          <WalletTxEntitySkeleton itemCounts={txs.length - maxItemCount > 10 ? 5 : txs.length - maxItemCount} />
        </div>
      </IonInfiniteScroll>
    </>
  );
};
