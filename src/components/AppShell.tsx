import {
  IonApp,
  IonButton,
  IonRouterOutlet,
  setupIonicReact,
  IonText,
  IonChip,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonPage,
  useIonModal,
  IonIcon,
  useIonAlert,
  IonImg,
  IonSkeletonText,
  IonFab,
  IonFabButton,
  IonList,
  IonItem,
  IonAvatar,
  IonProgressBar,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from "@ionic/react";
import { StatusBar, Style } from "@capacitor/status-bar";

import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route, useHistory } from "react-router-dom";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Welcome } from "./Welcome";
import { Header } from "./Header";
import { NotFoundPage } from "@/containers/NotFoundPage";
import PwaInstall from "./PwaInstall";
import { initializeWeb3 } from "@/store/effects/web3.effects";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import { IonRoute } from "@ionic/react";
import { isPlatform } from "@ionic/core";
import { close } from "ionicons/icons";

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

const LeaderboardContainer = lazy(() => import("@/containers/desktop/LeaderboardContainer"));
const WalletDesktopContainer = lazy(() => import("@/containers/desktop/WalletDesktopContainer"));
const SwapContainer = lazy(() => import("@/containers/desktop/SwapContainer"));
const DefiContainer = lazy(() => import("@/containers/desktop/DefiContainer"));
const EarnContainer = lazy(() => import("@/containers/desktop/EarnContainer"));
const AvailablePlatformsContainer = lazy(() => import("@/containers/desktop/AvailablePlatformsContainer"));
const AboutContainer = lazy(() => import("@/containers/desktop/AboutContainer"));
const BuyWithFiatContainer = lazy(() => import("@/containers/BuyWithFiat"));
const WalletMobileContainer = lazy(
  () => import("@/containers/mobile/WalletMobileContainer")
);
const WelcomeMobileContainer = lazy(
  () => import("@/containers/mobile/WelcomeMobileContainer")
);

const DefaultProgressBar = () => {
  return (<IonProgressBar
    type="indeterminate"
    color="primary"
    style={{ position: "absolute", top: "0", width: "100%"}}
  />)
};
const DefaultLoadingPage = () => {
  return (
    <IonPage>
    <IonContent className="ion-no-padding">
      <DefaultProgressBar />
    </IonContent>
  </IonPage>
  )
}

const isMobilePWADevice =
  localStorage.getItem('hexa-lite_is-pwa') ||
  Boolean(isPlatform("pwa")) ||
  Boolean(isPlatform("electron")) ||
  Boolean(isPlatform("mobile")) && !Boolean(isPlatform("mobileweb"));

const setPreferScheme = () => {
  const prefersLightScheme = window.matchMedia("(prefers-color-scheme: light)");
  if (prefersLightScheme.matches) {
    document.querySelector('body')?.classList.remove('dark');
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('hexa-lite_is-lightmode', 'true');
    }
  } else {
    localStorage.setItem('hexa-lite_is-lightmode', 'false');
  }
}

const AppShell = () => {
  // get params from url `s=`
  const { pathname = "/swap" } = window.location;
  let segment = pathname.split("/")[1] || "swap"; // urlParams.get("s") || "swap";
  const { walletAddress, isMagicWallet } = Store.useState(getWeb3State);
  const [presentFiatWarning, dismissFiatWarning] = useIonAlert();
  const [isBuyWithFiatModalOpen, setIsBuyWithFiatModalOpen] = useState(false);

  const isNotFound =
    segment && ["wallet", "swap", "fiat", "defi", "earn"].indexOf(segment) === -1;
  // use state to handle segment change
  const [currentSegment, setSegment] = useState(segment);
  const handleSegmentChange = async (e: any) => {
    if (e.detail.value === "fiat") {
      if (walletAddress && walletAddress !== "") {
        setIsBuyWithFiatModalOpen(true);
      } else {
        await presentFiatWarning({
          header: "Information",
          message:
            "Connect to enable buy crypto with fiat.",
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
    initializeWeb3();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const isLightmode = localStorage.getItem('hexa-lite_is-lightmode');
      isLightmode && isLightmode === 'true'
        ? document.querySelector('body')?.classList.remove('dark')
        : setPreferScheme();
    } else {
      setPreferScheme();
    }
    return ()=> {};
  }, []);

  return (
    <IonApp>
      {!isMobilePWADevice && (
        <IonReactRouter>
          <IonRouterOutlet id="main">
            <IonRoute
              path="/index"
              render={() => (
                <>
                  <IonPage>
                    <IonContent ref={contentRef} scrollEvents={true}>
                      <IonGrid
                        class="ion-no-padding"
                        style={{ minHeight: "100vh" }}
                      >
                        <IonRow
                          style={{
                            minHeight: "100%",
                            height:
                              currentSegment !== "welcome" ? "100%" : "90vh",
                          }}
                          class={
                            currentSegment !== "welcome"
                              ? "ion-align-items-top ion-justify-content-center ion-no-padding"
                              : "ion-align-items-center ion-justify-content-center ion-no-padding"
                          }
                        >
                          <IonCol size="12" class="ion-no-padding">
                            <Welcome
                              handleSegmentChange={handleSegmentChange}
                            />
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonContent>
                  </IonPage>
                </>
              )}
            />
            <IonRoute path="/leaderboard" render={() => <Suspense fallback={<DefaultProgressBar />} >
              <LeaderboardContainer />
            </Suspense>} />
            <IonRoute path="/about" render={() => <Suspense fallback={<DefaultProgressBar />}>
              <AboutContainer/>
            </Suspense>} />
            <IonRoute path="/available-platforms" render={() => <Suspense fallback={<DefaultProgressBar />}>
              <AvailablePlatformsContainer />
            </Suspense>} />
            <IonRoute
              path="/"
              render={() => (
                <Redirect to={isPlatform("pwa") ? "/swap" : "/index"} />
              )}
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
                        {currentSegment === "swap" && (<SwapContainer />)}
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
                        {currentSegment === isNotFound && <NotFoundPage />}
                      </Suspense>
                    </IonContent>
                  </IonPage>
                </>
              )}
            />
          </IonRouterOutlet>
        </IonReactRouter>
      )}

      {/* Here use mobile UI */}
      {isMobilePWADevice && (
        <IonReactRouter>
          <IonRouterOutlet id="main">
            <IonRoute path="/leaderboard" render={() => <Suspense fallback={<DefaultProgressBar />} >
              <LeaderboardContainer />
            </Suspense>} />
            <IonRoute
              path="/index"
              render={() =>
                !walletAddress ? (
                  <Suspense
                    fallback={<DefaultLoadingPage />}
                  >
                    <WelcomeMobileContainer />
                  </Suspense>
                ) : (
                  <Suspense
                    fallback={<>
                      <IonPage>
                        <IonContent>
                          <IonGrid
                            style={{ margin: "20vh auto 5vh", maxWidth: "450px" }}
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
                                <IonList style={{'background': 'transparent'}}>
                                  {[1,2,3,4,5].map((_: any, i: number) => (
                                    <IonItem key={i} style={{'--background': 'transparent'}}>
                                      <IonAvatar slot="start">
                                        <IonSkeletonText
                                          animated={true}
                                          style={{ width: "42px", height: "42px" }}
                                        />
                                      </IonAvatar>
                                      <IonText>
                                        <h3>
                                          <IonSkeletonText
                                            animated={true}
                                            style={{ width: "50px", height: "22px" }}
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
                                  ))}
                                </IonList>
                              </IonCol>
                            </IonRow>
                          </IonGrid>
                        </IonContent>
                      </IonPage>
                    </>}
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
            <BuyWithFiatContainer dismiss={()=> setIsBuyWithFiatModalOpen(false)} />
          </Suspense>
        </IonModal>
    </IonApp>
  );
};

export default AppShell;
