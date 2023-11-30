
import { useState, useRef } from "react"
import { useWeb3Provider } from "../context/Web3Context"
import { IonButton, IonCol, IonGrid, IonInput, IonRow, IonText } from "@ionic/react"

const SignMessage = () => {
  // Initialize state for message and signature
  const [message, setMessage] = useState("")
  const [signature, setSignature] = useState("")

  // Define the handler for input change, it updates the message state with input value
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMessage(e.target.value)

  // Define the signMessage function which is used to sign the message
  const handleSignMessage = async () => {
    throw new Error("Not implemented")
    // if (user && web3Provider) {
    //   try {
    //     // Sign the message using the connected wallet
    //     const signer = web3Provider.getSigner();
    //     const signedMessage = await signer.signMessage(message)
    //     console.log(signedMessage)
    //     // Set the signature state with the signed message
    //     setSignature(signedMessage.toString())
    //   } catch (error) {
    //     // Log any errors that occur during the signing process
    //     console.error("handleSignMessage:", error)
    //   }
    // }
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