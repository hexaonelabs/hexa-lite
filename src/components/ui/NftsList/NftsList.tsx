import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonLabel,
  IonRow,
  IonText,
} from "@ionic/react";
import { imageOutline, ticket } from "ionicons/icons";
import { useEffect, useState } from "react";
import { WalletTxEntitySkeleton } from "../WalletTxEntitySkeleton";

export const NftsList = (props: { filterBy?: string | null }) => {
  const { nfts } = Store.useState(getWeb3State);
  const [maxItemCount, setMaxItemCount] = useState(9);
  const [] = useState();

  const data = nfts;
  // preload img
  useEffect(() => {});

  return (
    <>
      <IonGrid>
        {nfts.length > 0 ? (
          <>
            <IonRow>
              {data.slice(0, maxItemCount).map((nft, i) => (
                <IonCol key={i} sizeXs="12" sizeSm="12" sizeMd="4" sizeLg="4" sizeXl="3" className="ion-padding">
                  <IonCard
                    style={{
                      margin: "0",
                      boxShadow: "none",
                      borderRadius: '32px'
                    }}
                  >
                    {nft.imageUrl && nft.imageUrl.length > 0 ? (
                      <IonImg
                        src={nft.imageUrl}
                        onError={($event) => {
                          console.log("yy", $event.target);
                        }}
                      />
                    ) : (
                      <IonIcon
                        icon={imageOutline}
                        color="dark"
                        style={{
                          textAlign: "center",
                          width: "100%",
                          height: "80px",
                          background: "rgba(var(--ion-color-primary-rgb), 0.6)",
                          padding: "2rem 0",
                        }}
                      />
                    )}
                    <IonCardHeader>
                      <IonCardTitle>{nft.name || "unknown"}</IonCardTitle>
                      <IonCardSubtitle>
                        {nft.collectionName || "unknown"}
                      </IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonChip>{nft.chain?.name}</IonChip>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
            {maxItemCount < data.length
            ? (
            <>
              <IonRow class="ion-justify-content-center">
                <IonCol size="auto">
                  <IonButton 
                    size="small" 
                    color="light"
                    onClick={()=> setMaxItemCount(maxItemCount + 9)}>
                    load more
                  </IonButton>
                </IonCol>
              </IonRow>
            </>
            )
            : null}
          </>
        ) : (
          <>
            <IonRow>
              <IonCol>
                <p className="ion-padding ion-text-center">No NFTs found.</p>
              </IonCol>
            </IonRow>
          </>
        )}
      </IonGrid>
    </>
  );
};
