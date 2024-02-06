
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import { IonButton, IonCol, IonGrid, IonIcon, IonImg, IonRow, IonText } from "@ionic/react"

const WalletDetail = () => {
  // Use the UserContext to get the current logged-in user
  const { walletAddress } = Store.useState(getWeb3State);
  // Render the account address and balance
  return (
    <IonGrid>
      <IonRow>
        <IonCol size="12">
          <IonText>{`Account: ${walletAddress}`}</IonText>
        </IonCol>
      </IonRow>
    </IonGrid>
  )
}

export default WalletDetail;