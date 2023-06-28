
import { useState, useRef } from "react"
import { useEthersProvider } from "../context/Web3Context"
import { useUser } from "../context/UserContext"
import { IonButton, IonCol, IonGrid, IonInput, IonRow, IonText } from "@ionic/react"

const SignMessage = () => {
  // Use the Web3Context to get the current instance of web3
  const { ethereumProvider } = useEthersProvider()
  // Use the UserContext to get the current logged-in user
  const { user } = useUser()

  // Initialize state for message and signature
  const [message, setMessage] = useState("")
  const [signature, setSignature] = useState("")

  // Define the handler for input change, it updates the message state with input value
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMessage(e.target.value)

  // Define the signMessage function which is used to sign the message
  const handleSignMessage = async () => {
    if (user && ethereumProvider) {
      try {
        // Sign the message using the connected wallet
        const signer = ethereumProvider.getSigner();
        const signedMessage = await signer.signMessage(message)
        console.log(signedMessage)
        // Set the signature state with the signed message
        setSignature(signedMessage.toString())
      } catch (error) {
        // Log any errors that occur during the signing process
        console.error("handleSignMessage:", error)
      }
    }
  }

  // Render the component
  return (
    <IonGrid>
      <IonRow>
        <IonCol size="12">
          <IonInput 
            onIonInput={(e: any) => handleInput(e)}></IonInput>
        </IonCol>
        <IonCol size="12">
          <IonButton onClick={handleSignMessage} disabled={!message}>
            Sign Message
          </IonButton>
        </IonCol>
        <IonCol size="12">
          {/* Display the signature if available */}
          {signature && <IonText>{`Signature: ${signature}`}</IonText>}
        </IonCol>
      </IonRow>   
    </IonGrid>
  )
}

export default SignMessage