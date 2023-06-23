
import { useEthersProvider } from "../context/Web3Context"
import { magic } from "../servcies/magic"
import { IonButton } from "@ionic/react"

const ConnectButton = (props: {style?: any}) => {
  // Get the initializeWeb3 function from the Web3 context
  const { initializeWeb3 } = useEthersProvider()
  // Define the event handler for the button click
  const handleConnect = async () => {
    try {
      // Try to connect to the wallet using Magic's user interface
      await magic.wallet.connectWithUI()

      // If connection to the wallet was successful, initialize new Web3 instance
      initializeWeb3()
    } catch (error) {
      // Log any errors that occur during the connection process
      console.error("handleConnect:", error)
    }
  }

  // Render the button component with the click event handler
  return <IonButton style={props.style||{}} onClick={handleConnect}>Connect</IonButton>
}

export default ConnectButton