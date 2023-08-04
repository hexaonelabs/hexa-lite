import { IonCol, IonGrid, IonRow, IonText, useIonToast } from "@ionic/react";
import { HiddenUI, LiFiWidget, WidgetConfig } from "@lifi/widget";
import { useMemo } from "react";
import { connect, disconnect } from "../servcies/magic";
import { useEthersProvider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";
import { CHAIN_DEFAULT } from "../constants/chains";

export function SwapContainer() {
  const { initializeWeb3, ethereumProvider } = useEthersProvider();
  const { display: displayLoader, hide: hideLoader } = useLoader();
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];

  // load environment config
  const widgetConfig = useMemo((): WidgetConfig => {
    return {
      // integrator: "cra-example",
      integrator: "hexa-lite",
      fee: 0.005,
      variant: "expandable",
      insurance: true,
      containerStyle: {
        border: `1px solid rgba(var(--ion-color-primary-rgb), 0.4);`,
        borderRadius: "32px",
      },
      theme: {
        shape: {
          borderRadius: 12,
          borderRadiusSecondary: 24,
        },
        palette: {
          background: {
            paper: "#1c2b42", //"rgb(39 39 71 / 80%)", // green
            // default: '#272747',
          },
          primary: {
            main: "#428cff",
          },
          // grey: {
          //   300: theme.palette.grey[300],
          //   800: theme.palette.grey[800],
          // },
        },
      },
      languages: {
        default: "en",
      },
      appearance: "dark",
      hiddenUI: [HiddenUI.Appearance, HiddenUI.PoweredBy, HiddenUI.Language],
      walletManagement: {
        connect: async () => {
          try {
            await displayLoader();
            await connect();
            // If connection to the wallet was successful, initialize new Web3 instance
            const provider = await initializeWeb3();
            const signer = provider?.getSigner();
            console.log("signer", signer);
            if (!signer) {
              throw new Error("Signer not found");
            }
            // return signer instance from JsonRpcSigner
            hideLoader();
            return signer;
          } catch (error: any) {
            // Log any errors that occur during the connection process
            hideLoader();
            await presentToast({
              message: `[ERROR] Connect Failed with reason: ${
                error?.message || error
              }`,
              color: "danger",
              buttons: [
                {
                  text: "x",
                  role: "cancel",
                  handler: () => {
                    dismissToast();
                  },
                },
              ],
            });
            throw new Error("handleConnect:" + error?.message);
          }
        },
        disconnect: async () => {
          try {
            displayLoader();
            await disconnect();
            // After successful disconnection, re-initialize the Web3 instance
            await initializeWeb3();
            hideLoader();
          } catch (error: any) {
            // Log any errors that occur during the disconnection process
            console.log("handleDisconnect:", error);
            hideLoader();
            await presentToast({
              message: `[ERROR] Disconnect Failed with reason: ${
                error?.message || error
              }`,
              color: "danger",
              buttons: [
                {
                  text: "x",
                  role: "cancel",
                  handler: () => {
                    dismissToast();
                  },
                },
              ],
            });
          }
        },
      },
      // set source chain to Polygon
      fromChain: ethereumProvider?.network?.chainId || CHAIN_DEFAULT.id,
      // set destination chain to Optimism
      toChain: 10,
      // set source token to ETH (Ethereum)
      fromToken: "0x0000000000000000000000000000000000000000",
      // set source token to USDC (Optimism)
      // toToken: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      // // set source token amount to 10 USDC (Polygon)
      // fromAmount: 10,
    };
  }, []);

  // useEffect(() => {
  //   const fetchConfig = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://li.quest/v1/integrators/hexa-lite"
  //       );
  //       const {integratorId = null} = await (response.status === 200 ? response.json() : {});
  //       if (integratorId) {
  //         setLifiConfig({
  //           integrator: "hexa-lite",
  //           fee: 0.01,
  //         });
  //       } else {
  //         setLifiConfig({});
  //       }
  //     } catch (error) {
  //       console.error("fetchConfig:", error);
  //       setLifiConfig({});
  //     }
  //   };
  //   fetchConfig();
  // }, []);

  return (
    <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
      <IonRow class="ion-justify-content-center ion-padding">
        <IonCol size="12" class="ion-text-center">
          <IonText>
            <h1>Exchange Assets</h1>
          </IonText>
          <IonText color="medium">
            <p
              style={{
                lineHeight: "1.5rem",
              }}
            >
              <span style={{ maxWidth: "650px", display: "inline-block" }}>
                Crosschain swap assets instantly at the best rates and lowest
                fees using AMM and DEX liquidity.
              </span>
            </p>
          </IonText>
        </IonCol>
      </IonRow>
      <IonRow class=" ion-padding">
        <IonCol size="12">
          <div
            style={{
              paddingTop: "1rem",
              paddingBottom: "10rem",
            }}
          >
            <LiFiWidget config={widgetConfig} integrator="hexa-lite" />
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}
