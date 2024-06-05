import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonText,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonPage,
  useIonAlert,
  IonSkeletonText,
  IonList,
  IonItem,
  IonAvatar,
  IonProgressBar,
  IonModal,
  useIonToast,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
} from "@ionic/react";
import { StatusBar, Style } from "@capacitor/status-bar";

import { IonReactRouter } from "@ionic/react-router";
import { Redirect } from "react-router-dom";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Header } from "./Header";
import { NotFoundPage } from "@/containers/NotFoundPage";
import PwaInstall from "./PwaInstall";
import { initializeWeb3 } from "@/store/effects/web3.effects";
import Store from "@/store";
import { getErrorState, getWeb3State } from "@/store/selectors";
import { IonRoute } from "@ionic/react";
import { isPlatform } from "@ionic/core";
import { setErrorState } from "@/store/actions";
import { initializeAppSettings } from "@/store/effects/app-settings.effect";
import { LoaderProvider } from "@/context/LoaderContext";
import {
  BuyWithFiatContainer,
  DefiContainer,
  EarnContainer,
  LeaderboardContainer,
  MagicMigrationContainer,
  SwapContainer,
  WalletDesktopContainer,
  WalletMobileContainer,
  WelcomeMobileContainer,
} from "@/containers";
import { isMobilePWADevice } from "@/utils/isMobile";

setupIonicReact({ mode: "ios" });

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addListener(async (status) => {
    console.log(
      `[INFO] Dark mode is ${status.matches ? "enabled" : "disabled"}`
    );
    try {
      await StatusBar.setStyle({
        style: status.matches ? Style.Dark : Style.Light,
      });
    } catch {}
  });

const DefaultProgressBar = () => {
  return (
    <IonProgressBar
      type="indeterminate"
      color="primary"
      style={{ position: "absolute", top: "0", width: "100%" }}
    />
  );
};
const DefaultLoadingPage = () => {
  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <DefaultProgressBar />
      </IonContent>
    </IonPage>
  );
};


const setPreferScheme = () => {
  const prefersLightScheme = window.matchMedia("(prefers-color-scheme: light)");
  if (prefersLightScheme.matches) {
    document.querySelector("body")?.classList.remove("dark");
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("hexa-lite_is-lightmode", "true");
    }
  } else {
    localStorage.setItem("hexa-lite_is-lightmode", "false");
  }
};

const AppShell = () => {
  const { pathname = "/wallet" } = window.location;
  let segment = pathname.split("/")[1] || "wallet"; // urlParams.get("s") || "swap";
  const { walletAddress } = Store.useState(getWeb3State);
  const error = Store.useState(getErrorState);
  const [presentFiatWarning, dismissFiatWarning] = useIonAlert();
  const [isBuyWithFiatModalOpen, setIsBuyWithFiatModalOpen] = useState(false);
  const [isMagicMigrationModalOpen, setIsMagicMigrationModalOpen] =
    useState(false);
  const [
    isMigrationMadalAlreadyDisplayed,
    setIsMigrationMadalAlreadyDisplayed,
  ] = useState(
    Boolean(localStorage.getItem("hexa-lite__migration-modal-displayed"))
  );
  const [presentToast, dismissToast] = useIonToast();

  if (error) {
    presentToast({
      message: `[ERROR] ${error?.message || error}`,
      color: "danger",
      duration: 1000 * 30,
      buttons: [
        {
          text: "x",
          role: "cancel",
          handler: () => {
            dismissToast();
          },
        },
      ],
      onDidDismiss: () => setErrorState(undefined),
    });
  }

  // use state to handle segment change
  const [currentSegment, setSegment] = useState(
    segment.includes("index") ? "wallet" : segment
  );
  const isNotFound =
    ["wallet", "swap", "fiat", "defi", "earn"].indexOf(currentSegment) === -1;
  const handleSegmentChange = async (e: any) => {
    if (e.detail.value === "fiat") {
      if (walletAddress && walletAddress !== "") {
        setIsBuyWithFiatModalOpen(true);
      } else {
        await presentFiatWarning({
          header: "Information",
          message: "Connect to enable buy crypto with fiat.",
          buttons: ["OK"],
          cssClass: "modalAlert",
        });
      }
      return;
    }
    setSegment(e.detail.value);
  };
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const scrollToTop = () => {
    // @ts-ignore
    contentRef.current.scrollToTop();
  };

  useEffect(() => {
    // initialize by check if user have an existing Wallet created with Magic.link
    // to display Migration Guide to Hexa Lite FirebaseWeb3Connect integration
    window.indexedDB?.databases().then((databases) => {
      // check existing DB
      const magicExist = databases.find((db) =>
        db.name?.toLowerCase()?.includes("magic")
      );
      // check modal already displayed
      const displayModal = magicExist && !isMigrationMadalAlreadyDisplayed;
      if (displayModal) {
        // Migration guide process
        setIsMagicMigrationModalOpen(true);
        setIsMigrationMadalAlreadyDisplayed(true);
        localStorage.setItem("hexa-lite__migration-modal-displayed", "true");
      }
    });
    // initialze Web3 connection & app settings
    initializeWeb3();
    initializeAppSettings();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const isLightmode = localStorage.getItem("hexa-lite_is-lightmode");
      isLightmode && isLightmode === "true"
        ? document.querySelector("body")?.classList.remove("dark")
        : setPreferScheme();
    } else {
      setPreferScheme();
    }
    return () => {};
  }, []);

  return (
    <IonApp>
      {!isMobilePWADevice && !isMagicMigrationModalOpen && (
        <IonReactRouter>
          <LoaderProvider>
            <IonRouterOutlet id="main">
              <IonRoute
                path="/leaderboard"
                render={() => (
                  <Suspense fallback={<DefaultProgressBar />}>
                    <LeaderboardContainer />
                  </Suspense>
                )}
              />
              {/* <IonRoute path="/about" render={() => <Suspense fallback={<DefaultProgressBar />}>
                <AboutContainer/>
              </Suspense>} />
              <IonRoute path="/available-platforms" render={() => <Suspense fallback={<DefaultProgressBar />}>
                <AvailablePlatformsContainer />
              </Suspense>} /> */}
              <IonRoute
                path="/"
                render={() => <Redirect to="/wallet" />}
                exact={true}
              />
              <IonRoute
                path="/index"
                render={() => <Redirect to="/wallet" />}
                exact={true}
              />
              <IonRoute
                render={() => (
                  <>
                    <IonPage>
                      {!isNotFound && (
                        <Header
                          currentSegment={currentSegment}
                          handleSegmentChange={handleSegmentChange}
                        />
                      )}
                      <IonContent>
                        <Suspense fallback={<DefaultProgressBar />}>
                          {currentSegment === "wallet" && (
                            <WalletDesktopContainer />
                          )}
                        </Suspense>
                        <Suspense fallback={<DefaultProgressBar />}>
                          {currentSegment === "swap" && <SwapContainer />}
                        </Suspense>
                        <Suspense fallback={<DefaultProgressBar />}>
                          {currentSegment === "earn" && <EarnContainer />}
                        </Suspense>
                        <Suspense fallback={<DefaultProgressBar />}>
                          {currentSegment === "defi" && (
                            <DefiContainer
                              handleSegmentChange={handleSegmentChange}
                            />
                          )}
                        </Suspense>
                        <Suspense fallback={<DefaultProgressBar />}>
                          {isNotFound === true && <NotFoundPage />}
                        </Suspense>
                      </IonContent>
                    </IonPage>
                  </>
                )}
              />
            </IonRouterOutlet>
          </LoaderProvider>
        </IonReactRouter>
      )}

      {/* Here use mobile UI */}
      {isMobilePWADevice && !isMagicMigrationModalOpen && (
        <IonReactRouter>
          <IonRouterOutlet id="main">
            <IonRoute
              path="/leaderboard"
              render={() => (
                <Suspense fallback={<DefaultProgressBar />}>
                  <LeaderboardContainer />
                </Suspense>
              )}
            />
            <IonRoute
              path="/index"
              render={() =>
                !walletAddress ? (
                  <Suspense fallback={<DefaultLoadingPage />}>
                    <WelcomeMobileContainer />
                  </Suspense>
                ) : (
                  <Suspense
                    fallback={
                      <>
                        <IonPage>
                          <IonContent>
                            <IonGrid
                              style={{
                                margin: "20vh auto 5vh",
                                maxWidth: "450px",
                              }}
                            >
                              <IonRow className="ion-align-items-center ion-text-center">
                                <IonCol>
                                  <div>
                                    <IonText>
                                      <h1 style={{ fontSize: "2.618rem" }}>
                                        <IonSkeletonText
                                          animated={true}
                                          style={{
                                            width: "180px",
                                            height: "30px",
                                            margin: "auto",
                                          }}
                                        />
                                      </h1>
                                      <p
                                        style={{
                                          fontSize: "1.625rem",
                                          margin: "0px 0px 1.5rem",
                                        }}
                                      >
                                        <IonSkeletonText
                                          animated={true}
                                          style={{
                                            width: "120px",
                                            height: "20px",
                                            margin: "auto",
                                          }}
                                        />
                                      </p>
                                    </IonText>
                                  </div>
                                </IonCol>
                              </IonRow>
                            </IonGrid>
                            <IonGrid
                              className="ion-no-padding"
                              style={{
                                background: "var(--ion-background-color)",
                                minHeight: "100%",
                              }}
                            >
                              <IonRow className="ion-no-padding ion-padding-top ">
                                <IonCol size="12">
                                  <IonList
                                    style={{ background: "transparent" }}
                                  >
                                    {[1, 2, 3, 4, 5].map(
                                      (_: any, i: number) => (
                                        <IonItem
                                          key={i}
                                          style={{
                                            "--background": "transparent",
                                          }}
                                        >
                                          <IonAvatar slot="start">
                                            <IonSkeletonText
                                              animated={true}
                                              style={{
                                                width: "42px",
                                                height: "42px",
                                              }}
                                            />
                                          </IonAvatar>
                                          <IonText>
                                            <h3>
                                              <IonSkeletonText
                                                animated={true}
                                                style={{
                                                  width: "50px",
                                                  height: "22px",
                                                }}
                                              />
                                            </h3>
                                            <p className="ion-no-margin ion-margin-bottom">
                                              <IonSkeletonText
                                                animated={true}
                                                style={{ width: "120px" }}
                                              />
                                            </p>
                                          </IonText>
                                          <IonText slot="end">
                                            <IonSkeletonText
                                              animated={true}
                                              style={{ width: "40px" }}
                                            />
                                          </IonText>
                                        </IonItem>
                                      )
                                    )}
                                  </IonList>
                                </IonCol>
                              </IonRow>
                            </IonGrid>
                          </IonContent>
                        </IonPage>
                      </>
                    }
                  >
                    <WalletMobileContainer />
                  </Suspense>
                )
              }
            />
            <IonRoute render={() => <Redirect to="/index" />} exact={true} />
          </IonRouterOutlet>
        </IonReactRouter>
      )}

      <PwaInstall />

      <IonModal
        isOpen={isBuyWithFiatModalOpen}
        onDidDismiss={() => setIsBuyWithFiatModalOpen(false)}
      >
        <Suspense fallback={<DefaultProgressBar />}>
          <BuyWithFiatContainer
            dismiss={() => setIsBuyWithFiatModalOpen(false)}
            isLightmode={
              localStorage.getItem("hexa-lite_is-lightmode") === "true"
                ? true
                : undefined
            }
          />
        </Suspense>
      </IonModal>

      <IonModal
        isOpen={isMagicMigrationModalOpen}
        onDidDismiss={() => {
          setIsMagicMigrationModalOpen(false);
        }}
      >
        <Suspense fallback={<DefaultProgressBar />}>
          <MagicMigrationContainer
            setIsMagicMigrationModalOpen={setIsMagicMigrationModalOpen}
          />
        </Suspense>
      </IonModal>
    </IonApp>
  );
};

export default AppShell;
