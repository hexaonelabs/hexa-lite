import { TokenInfo } from "@/utils/getTokenInfo";
import { IonChip, IonLabel, IonListHeader, IonText } from "@ionic/react";

export function TokenDetailDescription(props: { tokenInfo: TokenInfo }) {
  const { tokenInfo } = props;

  return (
    <>
      <IonListHeader className="ion-no-padding">
        <IonLabel>
          <h3>Description</h3>
        </IonLabel>
      </IonListHeader>
      <IonText>
        <p className="fontWeight300">{tokenInfo.description.en}</p>
      </IonText>
      <div className="ion-padding-vertical">
        <IonListHeader className="ion-no-padding">
          <IonLabel>
            <h3>Categories</h3>
          </IonLabel>
        </IonListHeader>
        <div className="ion-margin-vertical">
          {tokenInfo.categories.map((categorie, i) => (
            <IonChip key={i}>{categorie}</IonChip>
          ))}
        </div>
      </div>
    </>
  );
}
