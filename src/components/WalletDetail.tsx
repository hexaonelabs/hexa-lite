
import { useEffect, useState } from "react"
import { useEthersProvider } from "../context/Web3Context"
import { useUser } from "../context/UserContext"
import { IonButton, IonCol, IonGrid, IonIcon, IonImg, IonRow, IonText } from "@ionic/react"
import { getAvatarFromEVMAddress } from "../servcies/avatar"

const WalletDetail = () => {
  // Use the UserContext to get the current logged-in user
  const { user } = useUser()
  // Render the account address and balance
  return (
    <IonGrid>
      <IonRow>
        <IonCol size="12">
          <IonText>{`Account: ${user}`}</IonText>
        </IonCol>
      </IonRow>
      {/* <Divider my={2} />
      <Text fontWeight="bold">Balance</Text>
      <Text fontFamily="monospace">{balance} ETH</Text> */}
    </IonGrid>
  )
}

export default WalletDetail;