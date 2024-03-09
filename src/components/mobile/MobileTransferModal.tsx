import { IAsset } from "@/interfaces/asset.interface";
import { IonCol, IonContent, IonGrid, IonRow, IonText } from "@ionic/react";

export const MobileTransferModal = (props: { 
  name: string; symbol: string; priceUsd: number; balance: number; balanceUsd: number; thumbnail: string; assets: IAsset[];
 }) => {
  return (
    <IonContent className="mobileConentModal">
      <IonGrid>
        <IonRow className="ion-text-center">
          <IonCol size="12" className="ion-margin-top">
            <IonText>
              <h1>Send token</h1>
            </IonText>
          </IonCol>
          <IonCol size="12">xxx</IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};
