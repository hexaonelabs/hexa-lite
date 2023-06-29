import {
  IonApp,
  IonButton,
  IonChip,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonListHeader,
  IonPage,
  IonPopover,
  IonRouterOutlet,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { ellipsisVerticalSharp, logoGithub } from "ionicons/icons";
import { useUser } from "./context/UserContext";
import ConnectButton from "./components/ConnectButton";
import WalletDetail from "./components/WalletDetail";
import DisconnectButton from "./components/DisconnectButton";
import ShowUIButton from "./components/ShowUIButton";
import SignMessage from "./components/SignMessage";
import { HiddenUI, LiFiWidget, WidgetConfig } from "@lifi/widget";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEthersProvider } from "./context/Web3Context";
import { magic } from "./servcies/magic";
import { useWallet } from "./context/WalletContext";
import { setupIonicReact } from "@ionic/react";
import { AuthBadge } from "./components/AuthBadge";
import { AaveProvider } from "./context/AaveContext";
import { DefiContainer } from "./components/DefiContainer";

setupIonicReact({
  mode: "ios",
});

const styleLogo = {
  // margin: '15px auto 20px',
  padding: " 0px",
  width: "42px",
  maxWidth: "42px",
  height: "42px",
  cursor: "pointer",
};

const styleChip = {
  position: "absolute",
  bottom: "0rem",
  right: "-15px",
  transform: "scale(0.6)",
  padding: " 0rem 0.5rem",
  margin: 0,
  "--color": "var(--ion-color-primary)",
  "--background": "var(--ion-color-warning)",
};

function App() {
  // Use the UserContext to get the current logged-in user
  const { user } = useUser();

  const { initializeWeb3 } = useEthersProvider();
  // load environment config
  const widgetConfig: WidgetConfig = useMemo((): WidgetConfig => {
    return {
      integrator: "cra-example",
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
            paper: '#1c2b42', //"rgb(39 39 71 / 80%)", // green
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
      appearance: 'dark',
      hiddenUI: [HiddenUI.Appearance, HiddenUI.Language, HiddenUI.PoweredBy],
      walletManagement: {
        connect: async () => {
          try {
            // Try to connect to the wallet using Magic's user interface
            await magic.wallet.connectWithUI();

            // If connection to the wallet was successful, initialize new Web3 instance
            const provider = await initializeWeb3();
            const signer = provider?.getSigner();
            console.log("signer", signer);
            if (!signer) {
              throw new Error("Signer not found");
            }
            // return signer instance from JsonRpcSigner
            return signer;
          } catch (error: any) {
            // Log any errors that occur during the connection process
            console.error("handleConnect:", error);
            throw new Error("handleConnect:" + error?.message);
          }
        },
        disconnect: async () => {
          try {
            // Try to disconnect the user's wallet using Magic's logout method
            await magic.user.logout();
            // After successful disconnection, re-initialize the Web3 instance
            initializeWeb3();
          } catch (error) {
            // Log any errors that occur during the disconnection process
            console.log("handleDisconnect:", error);
          }
        },
      },
      // set source chain to Polygon
      fromChain: 1,
      // set destination chain to Optimism
      toChain: 10,
      // set source token to ETH (Ethereum)
      fromToken: "0x0000000000000000000000000000000000000000",
      // set source token to USDC (Optimism)
      // toToken: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      // // set source token amount to 10 USDC (Polygon)
      // fromAmount: 10,
    };
  }, [initializeWeb3]);

  // use state to handle segment change
  const [currentSegment, setSegment] = useState("welcome");
  const handleSegmentChange = (e: any) => {
    setSegment(e.detail.value);
  };

  const renderSwitch = (param: string) => {
    switch (param) {
      case "welcome": 
        return (
          <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
            <IonRow class="ion-justify-content-center">
              <IonCol size="12" class="ion-text-center">
                  <IonImg
                    style={{
                      width: "200px",
                      height: "200px",
                      margin: 'auto'
                    }}
                    src={"./assets/images/logo.svg"}
                  ></IonImg>
              </IonCol>
              <IonCol size="12" size-md="6" class="ion-text-center">
                <IonText>
                  <h1 style={{
                    fontWeight: 'bold',
                  }}>WELCOME TO HEXA-LITE</h1>
                </IonText>
                <IonText color="medium">
                  <p style={{
                    lineHeight: '1.3rem',
                  }}>
                    Buy assets with fiats, exchange assets at best rate, 
                    lend and borrow money on DeFi protocols and earn interest
                  </p>
                </IonText>
              </IonCol>
              <IonCol size="12" class="ion-text-center">
                <IonButton onClick={(e) => handleSegmentChange({detail: {value: 'swap'}})}>
                  Launch App
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        )
      case "swap":
        return (
          <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
            <IonRow class="ion-justify-content-center">

              <IonCol size="12" class="ion-text-center">
                <IonText>
                  <h1>Swap Assets</h1>
                </IonText>
                <IonText color="medium">
                  <p style={{
                    lineHeight: '1.3rem',
                  }}>
                    Cross chain swap assets instantly at the best rates and lowest fees
                  </p>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="12">
                <div
                  style={{
                    paddingTop: '3rem',
                    paddingBottom: "10rem",
                  }}>
                    <LiFiWidget config={widgetConfig} integrator="hexa-lite" />
                  </div>
              </IonCol>
            </IonRow>
          </IonGrid>

        );
      case "fiat":
        return (
          <div
            style={{
              paddingTop: '1rem',
              paddingBottom: "10rem",
              textAlign: "center",
            }}
          >
            <iframe
              style={{
                maxWidth: "100vw",
                border: "solid 1px rgba(var(--ion-color-primary-rgb), 0.4)",
                borderRadius: "32px",
                overflow: "hidden",
                display: "inline-block",
              }}
              src="https://buy.onramper.com?themeName=dark&cardColor=1c2b42&borderRadius=12px"
              title="Onramper Widget"
              height="630px"
              width="450px"
              allow="payment"
            />
          </div>
        );
      case "defi":
        return (
          <AaveProvider>
            <DefiContainer></DefiContainer>
          </AaveProvider>
        );
      default:
        return (
          <div
            style={{
              textAlign: "center",
            }}
          >
            <IonText color="medium">
              <h1>{currentSegment.toUpperCase()}</h1>
              <p>
                This feature is in development. <br />
                Please check back later.
              </p>
            </IonText>
            <IonChip color="primary">Coming soon</IonChip>
          </div>
        );
    }
  };

  const popoverRef = useRef<HTMLIonPopoverElement>(null);

  return (
    <IonApp>
      <IonRouterOutlet>
        <IonHeader translucent={true} class="ion-no-border">
          <IonToolbar style={{ "--background": "transparent" }}>
            <IonGrid class="ion-no-padding">
              <IonRow class="ion-align-items-center ion-justify-content-between">

                {
                  currentSegment !== 'welcome' 
                  ? (
                    <>
                      <IonCol size="2" class="ion-padding ion-text-start">
                        <div
                          style={{ position: "relative", display: "inline-block" }}
                        >
                          <IonImg
                            style={styleLogo}
                            src={"./assets/images/logo.svg"}
                          ></IonImg>
                          {/* <IonIcon icon={'./assets/images/logo.svg'} style={styleLogo} /> */}
                          <IonChip style={styleChip}>beta</IonChip>
                        </div>
                      </IonCol>                    
                      <IonCol size="8" class="ion-padding ion-hide-md-down">
                        <IonSegment
                          style={{ maxWidth: "550px" }}
                          mode="ios"
                          value={currentSegment}
                          onIonChange={(e: any) => handleSegmentChange(e)}
                        >
                          <IonSegmentButton value="swap">Exchange</IonSegmentButton>
                          <IonSegmentButton value="defi">
                            Lending & Borrow
                          </IonSegmentButton>
                          <IonSegmentButton value="stacking">
                            Earn Interest
                          </IonSegmentButton>
                          <IonSegmentButton value="fiat">Buy</IonSegmentButton>
                        </IonSegment>
                      </IonCol>
                      <IonCol
                        size="2"
                        class="ion-padding ion-text-end ion-hide-md-down"
                      >
                        <AuthBadge user={user} />
                      </IonCol>
                      {/* Mobile nav button */}
                      <IonCol size="auto" class="ion-padding ion-hide-md-up">
                        <IonButton fill="clear" color="primary" id="click-trigger">
                          <IonIcon slot="icon-only" icon={ellipsisVerticalSharp} />
                        </IonButton>
                        {/* Popover wiith options */}
                        <IonPopover ref={popoverRef} trigger="click-trigger" triggerAction="click">
                          <IonContent class="ion-no-padding">
                            <IonListHeader>
                              <IonLabel class="ion-no-margin ion-padding-vertical">Menu</IonLabel>
                            </IonListHeader>
                            <IonItem
                              lines="none"
                              button={true}
                              style={{ "--background": "transparent" }}
                              onClick={() => {
                                popoverRef.current?.dismiss();
                                handleSegmentChange({ detail: { value: "swap" } });
                              }}
                            >
                              <IonLabel class="ion-text-wrap">
                                <IonText>
                                  <h2>Exchange</h2>
                                </IonText>
                                <IonText color="medium">
                                  <p>Swap tokens instantly at the best rates.</p>
                                </IonText>
                              </IonLabel>
                            </IonItem>
                            <IonItem
                              lines="none"
                              button={true}
                              style={{ "--background": "transparent" }}
                              onClick={() => {
                                popoverRef.current?.dismiss();
                                handleSegmentChange({ detail: { value: "defi" } });
                              }}
                            >
                              <IonLabel class="ion-text-wrap">
                                <IonText>
                                  <h2>Lending & Borrow</h2>
                                </IonText>
                                <IonText color="medium">
                                  <p>Provide liquidity and earn interest.</p>
                                </IonText>
                              </IonLabel>
                            </IonItem>
                            <IonItem
                              lines="none"
                              button={true}
                              style={{ "--background": "transparent" }}
                              onClick={() => {
                                popoverRef.current?.dismiss();
                                handleSegmentChange({ detail: { value: "stack" } });
                              }}
                            >
                              <IonLabel class="ion-text-wrap">
                                <IonText>
                                  <h2>Earn Interest</h2>
                                </IonText>
                                <IonText color="medium">
                                  <p>Earn interest on your crypto.</p>
                                </IonText>
                              </IonLabel>
                            </IonItem>
                            <IonItem
                              lines="none"
                              button={true}
                              style={{ "--background": "transparent" }}
                              onClick={() => {
                                popoverRef.current?.dismiss();
                                handleSegmentChange({ detail: { value: "fiat" } });
                              }}
                            >
                              <IonLabel>
                                <IonText>
                                  <h2>Buy</h2>
                                </IonText>
                                <IonText color="medium">
                                  <p>Buy crypto with fiat.</p>
                                </IonText>
                              </IonLabel>
                            </IonItem>
                            <IonItemDivider style={{ "--background": "transparent" }}></IonItemDivider>
                            {/* <IonItem button={true} style={{ "--background": "transparent" }}>
                              <IonLabel>
                                <IonText>
                                  <h2>Wallet</h2>
                                </IonText>
                                <IonText color="medium">
                                  <p>Manage your wallet.</p>
                                </IonText>
                              </IonLabel>
                            </IonItem> */}
                            <div 
                              className="ion-padding ion-text-center"
                              onClick={() => {
                                popoverRef.current?.dismiss();
                              }}>
                                {
                                  !user 
                                  ? <ConnectButton size="default" expand="block"></ConnectButton>
                                  : <DisconnectButton size="default" expand="block"></DisconnectButton>

                                }
                              {/* <IonLabel>
                                <IonText>
                                  <h2>Disconnect</h2>
                                </IonText>
                              </IonLabel> */}
                            </div>
                          </IonContent>
                        </IonPopover>
                      </IonCol>                    
                    </>
                  )
                  : (<></>)
                }
                
                {/* <IonCol size="12">{AuthButton}</IonCol> */}
                {/* <IonCol size="12">{WalletInfo}</IonCol> */}
              </IonRow>
            </IonGrid>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen={true} className="ion-padding">
          <IonGrid class="ion-no-padding" style={{ minHeight: "95vh" }}>
            <IonRow
              style={{ 
                minHeight: "100%", 
                height: currentSegment !== "welcome" ? "100%" : "90vh" 
              }}
              class={
                currentSegment !== "welcome"
                ? 'ion-align-items-top ion-justify-content-center ion-no-padding'
                : 'ion-align-items-center ion-justify-content-center ion-no-padding'
              }
            >
              <IonCol size="12" class="ion-no-padding">
                {renderSwitch(currentSegment)}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
        {
          currentSegment === 'welcome'
            ? (
            <IonFooter style={{
              position: 'fixed',
              bottom: 0,
            }}  class="ion-no-border">
              <IonToolbar style={{'--background': 'transparent'}}>
                <IonGrid class="ion-no-padding">
                  <IonRow class="ion-align-items-center ion-justify-content-between">
                    <IonCol size="auto" class="ion-padding-horizontal">
                      <IonText color="medium">
                        <p>
                          <small>
                          Open source software powered by HexaOneLabs
                          </small>
                        </p>
                      </IonText>
                    </IonCol>
                    <IonCol size="auto" class="ion-padding-horizontal ion-text-end">
                      <a href="https://github.com/hexaonelabs" target="_blank" rel="noreferrer">
                        <IonIcon style={{
                            color: '#fff'
                          }} icon={logoGithub}></IonIcon>
                      </a>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonToolbar>
            </IonFooter>              
            )
            : (
              <></>
            )
        }

      </IonRouterOutlet>
    </IonApp>
  );
}

export default App;
