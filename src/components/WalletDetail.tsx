
import { useEffect, useState } from "react"
import { useWeb3Provider } from "../context/Web3Context"
import { IonButton, IonCol, IonGrid, IonIcon, IonImg, IonRow, IonText } from "@ionic/react"
import { getAvatarFromEVMAddress } from "../servcies/avatar"

const WalletDetail = () => {
  // Use the UserContext to get the current logged-in user
  const { walletAddress } = useWeb3Provider()
  // Render the account address and balance
  return (
    <IonGrid>
      <IonRow>
        <IonCol size="12">
          <IonText>{`Account: ${walletAddress}`}</IonText>
        </IonCol>
      </IonRow>
      {/* <Divider my={2} />
      <Text fontWeight="bold">Balance</Text>
      <Text fontFamily="monospace">{balance} ETH</Text> */}
    </IonGrid>
  )
}

export default WalletDetail;