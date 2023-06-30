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
  IonSpinner,
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

  // create state that contains `integrator` and `fee` config for LiFi widget
  // and set default value to `undefined` and `undefined` as initial value: `{}`
  // then fetch the result access api to get the config fro LiFi using useEffect()
  const [lifiConfig, setLifiConfig] = useState<Partial<WidgetConfig>|null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(
          "https://li.quest/v1/integrators/hexa-lite"
        );
        const {integratorId = null} = await (response.status === 200 ? response.json() : {});
        if (integratorId) {
          setLifiConfig({
            integrator: "hexa-lite",
            fee: 0.01,
          });
        } else {
          setLifiConfig({});
        }
      } catch (error) {
        console.error("fetchConfig:", error);
        setLifiConfig({});
      }
    };
    fetchConfig();
  }, []);

  // load environment config
  const widgetConfig = useMemo((): WidgetConfig => {
    return {
      integrator: "cra-example",
      // fee: 0.01,
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
      appearance: "dark",
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
          <IonGrid
            class="ion-no-padding welcomeSection"
            style={{ marginBottom: "3rem" }}
          >
            <IonRow
              class="ion-justify-content-center"
              style={{ minHeight: "90vh", marginBottom: "20vh" }}
            >
              <IonCol size="12" class="ion-text-center"></IonCol>
              <IonCol size="12" size-md="7" class="ion-text-center">
                <IonImg
                  style={{
                    width: "200px",
                    height: "200px",
                    margin: "auto",
                  }}
                  src={"./assets/images/logo.svg"}
                ></IonImg>
                <IonText>
                  <h1
                    style={{
                      fontWeight: "bold",
                      marginTop: "2rem",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontSize: "4.5rem",
                        lineHeight: "4.8rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      Hexa Lite
                    </span>
                  </h1>
                </IonText>
                <IonText>
                  <p
                    style={{
                      fontSize: "1.2rem",
                      lineHeight: "1.6rem",
                      margin: "0.5rem 0 2.5rem 0",
                    }}
                  >
                    Buy assets with fiats, exchange assets at best rate, lend
                    and borrow money on DeFi protocols without any intermediate
                    smart contract to enforce security and increase earn
                    interest.
                  </p>
                </IonText>
                <IonButton
                  size="large"
                  onClick={(e) =>
                    handleSegmentChange({ detail: { value: "swap" } })
                  }
                >
                  Launch App
                </IonButton>
              </IonCol>
            </IonRow>

            <IonRow
              class="ion-justify-content-center ion-align-items-center"
              style={{ minHeight: "80vh" }}
            >
              <IonCol size="12" class="ion-text-center ">
                <IonText>
                  <h2
                    style={{
                      fontSize: "2.5rem",
                      lineHeight: "2.8rem",
                      fontWeight: "bold",
                    }}
                  >
                    Manage your digitals assets <IonText color="primary">in one place</IonText>
                  </h2>
                </IonText>
                <IonText>
                  <p>
                    Hexa Lite allow you to manage your digitals assets across
                    DeFi with ease and security
                  </p>
                </IonText>
              </IonCol>
              <IonCol size="12" size-md="6">
                <IonText>
                  <h3
                    style={{
                      fontWeight: 'bold',
                      fontSize: "1.8rem",
                      lineHeight: "2rem",
                    }}
                  >
                    Frictionless onBoarding
                  </h3>
                  <p>
                    Hexa Lite is secure, and reliable for everyone to use and
                    enjoy the benefits of blockchain technology & DeFi services
                    without the need to manage private keys or seed phrases.
                  </p>
                </IonText>
                <IonText>
                  <br />
                  <h3
                    style={{
                      fontWeight: 'bold',
                      fontSize: "1.8rem",
                      lineHeight: "2rem",
                    }}
                  >
                    EVM-Compatible Chains
                  </h3>
                  <p>
                    Hexa Lite support 9 EVM-Compatible blockchain such as
                    Ethereum, Polygon, Binance Smart Chain, Optimism, Arbitrum,
                    etc. without have to care about how to manage networks
                    changes.
                  </p>
                </IonText>
                <br />
                <IonText>
                  <h3
                    style={{
                      fontWeight: 'bold',
                      fontSize: "1.8rem",
                      lineHeight: "2rem",
                    }}
                  >
                    Security & Privacy
                  </h3>
                  <p>
                    Hexa Lite is open-source, non-custodial and does not store any user data
                    or private keys. Users are in full control of their assets
                    and can interact with DeFi protocols and services without
                    intermediates smart contracts or any third-party services
                    without need to leave the platform.
                  </p>
                </IonText>
              </IonCol>
              <IonCol size="4">
              <svg fill="#fff" height="800px" width="800px" version="1.1"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 55 55">
                <path d="M49,0c-3.309,0-6,2.691-6,6c0,1.035,0.263,2.009,0.726,2.86l-9.829,9.829C32.542,17.634,30.846,17,29,17
                  s-3.542,0.634-4.898,1.688l-7.669-7.669C16.785,10.424,17,9.74,17,9c0-2.206-1.794-4-4-4S9,6.794,9,9s1.794,4,4,4
                  c0.74,0,1.424-0.215,2.019-0.567l7.669,7.669C21.634,21.458,21,23.154,21,25s0.634,3.542,1.688,4.897L10.024,42.562
                  C8.958,41.595,7.549,41,6,41c-3.309,0-6,2.691-6,6s2.691,6,6,6s6-2.691,6-6c0-1.035-0.263-2.009-0.726-2.86l12.829-12.829
                  c1.106,0.86,2.44,1.436,3.898,1.619v10.16c-2.833,0.478-5,2.942-5,5.91c0,3.309,2.691,6,6,6s6-2.691,6-6c0-2.967-2.167-5.431-5-5.91
                  v-10.16c1.458-0.183,2.792-0.759,3.898-1.619l7.669,7.669C41.215,39.576,41,40.26,41,41c0,2.206,1.794,4,4,4s4-1.794,4-4
                  s-1.794-4-4-4c-0.74,0-1.424,0.215-2.019,0.567l-7.669-7.669C36.366,28.542,37,26.846,37,25s-0.634-3.542-1.688-4.897l9.665-9.665
                  C46.042,11.405,47.451,12,49,12c3.309,0,6-2.691,6-6S52.309,0,49,0z M11,9c0-1.103,0.897-2,2-2s2,0.897,2,2s-0.897,2-2,2
                  S11,10.103,11,9z M6,51c-2.206,0-4-1.794-4-4s1.794-4,4-4s4,1.794,4,4S8.206,51,6,51z M33,49c0,2.206-1.794,4-4,4s-4-1.794-4-4
                  s1.794-4,4-4S33,46.794,33,49z M29,31c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S32.309,31,29,31z M47,41c0,1.103-0.897,2-2,2
                  s-2-0.897-2-2s0.897-2,2-2S47,39.897,47,41z M49,10c-2.206,0-4-1.794-4-4s1.794-4,4-4s4,1.794,4,4S51.206,10,49,10z"/>
                </svg>
              </IonCol>
            </IonRow>

            <IonRow
              class="ion-justify-content-center ion-align-items-center"
              style={{ minHeight: "100vh", marginBottom: "-4rem", }}
            >
              <IonCol size="12" class="ion-text-center ">
                <IonText>
                  <h2
                    style={{
                      fontSize: "3.5rem",
                      lineHeight: "3.8rem",
                      fontWeight: "bold",
                    }}
                  >
                    Try Hexa Lite now
                  </h2>
                </IonText>
                <IonButton
                  className="ion-margin-top"
                  size="large"
                  onClick={(e) =>
                    handleSegmentChange({ detail: { value: "swap" } })
                  }>
                  Launch App
                  </IonButton>
              </IonCol>
            </IonRow>

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
              <IonCol
                size="auto"
                class="ion-padding-horizontal ion-text-end"
              >
                <a
                  href="https://github.com/hexaonelabs"
                  target="_blank"
                  rel="noreferrer"
                >
                  <IonIcon
                    style={{
                      color: "#fff",
                    }}
                    icon={logoGithub}
                  ></IonIcon>
                </a>
              </IonCol>
            </IonRow>
          </IonGrid>
        );
      case "swap":
        return (
          <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
            <IonRow class="ion-justify-content-center">
              <IonCol size="12" class="ion-text-center">
                <IonText>
                  <h1>Swap Assets</h1>
                </IonText>
                <IonText color="medium">
                  <p
                    style={{
                      lineHeight: "1.3rem",
                    }}
                  >
                    Crosschain swap assets instantly at the best rates and
                    lowest fees
                  </p>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="12">
                <div
                  style={{
                    paddingTop: "1rem",
                    paddingBottom: "10rem",
                  }}
                >
                  {
                    !lifiConfig
                      ? <IonSpinner name="circles" />
                      : <LiFiWidget config={{
                        ...widgetConfig,
                        ...lifiConfig,
                      }} integrator="hexa-lite" />

                  }
                  
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        );
      case "fiat":
        return (
          <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
            <IonRow class="ion-justify-content-center">
              <IonCol size="12" class="ion-text-center">
                <IonText>
                  <h1>Buy crypto</h1>
                </IonText>
                <IonText color="medium">
                  <p
                    style={{
                      lineHeight: "1.3rem",
                    }}
                  >
                    Use your credit card, Google Pay or Apple Pay to buy crypto
                    instantly
                  </p>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="12">
                <div
                  style={{
                    paddingTop: "1rem",
                    paddingBottom: "10rem",
                    textAlign: "center",
                  }}
                >
                  <iframe
                    style={{
                      maxWidth: "100vw",
                      border:
                        "solid 1px rgba(var(--ion-color-primary-rgb), 0.4)",
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
              </IonCol>
            </IonRow>
          </IonGrid>
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
                {currentSegment !== "welcome" ? (
                  <>
                    <IonCol size="2" class="ion-padding ion-text-start">
                      <div
                        onClick={() =>
                          handleSegmentChange({ detail: { value: "welcome" } })
                        }
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
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
                        <IonSegmentButton value="swap">
                          Exchange
                        </IonSegmentButton>
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
                      <IonButton
                        fill="clear"
                        color="primary"
                        id="click-trigger"
                      >
                        <IonIcon
                          slot="icon-only"
                          icon={ellipsisVerticalSharp}
                        />
                      </IonButton>
                      {/* Popover wiith options */}
                      <IonPopover
                        ref={popoverRef}
                        trigger="click-trigger"
                        triggerAction="click"
                      >
                        <IonContent class="ion-no-padding">
                          <IonListHeader>
                            <IonLabel class="ion-no-margin ion-padding-vertical">
                              Menu
                            </IonLabel>
                          </IonListHeader>
                          <IonItem
                            lines="none"
                            button={true}
                            style={{ "--background": "transparent" }}
                            onClick={() => {
                              popoverRef.current?.dismiss();
                              handleSegmentChange({
                                detail: { value: "swap" },
                              });
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
                              handleSegmentChange({
                                detail: { value: "defi" },
                              });
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
                              handleSegmentChange({
                                detail: { value: "stack" },
                              });
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
                              handleSegmentChange({
                                detail: { value: "fiat" },
                              });
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
                          <IonItemDivider
                            style={{ "--background": "transparent" }}
                          ></IonItemDivider>
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
                            }}
                          >
                            {!user ? (
                              <ConnectButton
                                size="default"
                                expand="block"
                              ></ConnectButton>
                            ) : (
                              <DisconnectButton
                                size="default"
                                expand="block"
                              ></DisconnectButton>
                            )}
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
                ) : (
                  <></>
                )}

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
                height: currentSegment !== "welcome" ? "100%" : "90vh",
              }}
              class={
                currentSegment !== "welcome"
                  ? "ion-align-items-top ion-justify-content-center ion-no-padding"
                  : "ion-align-items-center ion-justify-content-center ion-no-padding"
              }
            >
              <IonCol size="12" class="ion-no-padding">
                {renderSwitch(currentSegment)}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonRouterOutlet>
    </IonApp>
  );
}

export default App;
