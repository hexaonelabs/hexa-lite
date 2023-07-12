
import { useEffect, useState } from "react"
import { getMagic } from "../servcies/magic";
import { IonButton, IonSpinner } from "@ionic/react";

const ShowUIButton = () => {
  // Initialize state variable to decide whether to show button or not
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Define a function to check the type of the wallet
  const checkWalletType = async () => {
    try {
      setIsLoading(true);
      const magic = await getMagic();
      const provider = await magic?.wallet.getProvider();
      console.log(provider);
      const isMagicProvider = provider.isMagicProvider|| provider.isMagic;
      if (!isMagicProvider) {
        setIsLoading(false);
        setShowButton(false);
        return;
      }
      // Fetch the wallet's information using Magic's user.getInfo method
      const walletInfo = await magic.user.getInfo()
      console.log(walletInfo)

      ///@ts-ignore
      // Determine if the wallet type is "magic"
      const isMagicWallet = walletInfo.walletType === "magic"

      // Set 'showButton' state based on the result of the check
      setIsLoading(false);
      setShowButton(isMagicWallet);
    } catch (error) {
      // Log any errors that occur during the wallet type check process
      console.error("checkWalletType:", error)
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Call the checkWalletType function
    checkWalletType();
    return () => {}
  }, [])

  // Define the event handler for the button click
  const handleShowUI = async () => {
    try {
      const magic = await getMagic();
      // Try to show the magic wallet user interface
      await magic?.wallet.showUI()
    } catch (error) {
      // Log any errors that occur during the process
      console.error("handleShowUI:", error)
    }
  }

  // Render the button component if showButton is true, otherwise render nothing
  return isLoading 
    ? <IonSpinner name="dots" />
    : showButton
      ? <IonButton expand="block" fill="outline" onClick={handleShowUI}>Wallet overview</IonButton>
      : null
}

export default ShowUIButton