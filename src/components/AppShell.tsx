import { IonApp, IonButton, IonRouterOutlet, setupIonicReact, IonText, IonChip, IonContent, IonGrid, IonRow, IonCol, IonPage } from '@ionic/react';
import { StatusBar, Style } from '@capacitor/status-bar';

import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { useRef, useState } from 'react';
import { Welcome } from './Welcome';
import { SwapContainer } from '@/containers/SwapContainer';
import { FiatContainer } from '@/containers/FiatContainer';
import { AaveProvider } from '@/context/AaveContext';
import { DefiContainer } from '@/containers/DefiContainer';
import { EarnContainer } from '@/containers/EarnContainer';
import { Header } from './Header';
import MenuSlide from './MenuSlide';
import { Web3Provider } from '@/context/Web3Context';
import { LoaderProvider } from '@/context/LoaderContext';
import { Leaderboard } from '@/containers/LeaderboardContainer';
import { NotFoundPage } from '@/containers/NotFoundPage';
import PwaInstall from './PwaInstall';
import { SolendProvider } from '@/context/SolendContext';
import { PoolsProvider } from '@/context/PoolContext';


setupIonicReact({ mode: 'ios' });

window.matchMedia("(prefers-color-scheme: dark)").addListener(async (status) => {
  console.log(`[INFO] Dark mode is ${status.matches ? 'enabled' : 'disabled'}`);
  try {
    await StatusBar.setStyle({
      style: status.matches ? Style.Dark : Style.Light,
    });
  } catch { }
});

const AppShell = () => {
  // get params from url `s=`
  const urlParams = new URLSearchParams(window.location.search);
  let segment = urlParams.get("s") || "welcome";
  // handle unsupported segment
  // if (segment && ['welcome', 'swap', 'fiat', 'defi', 'earn'].indexOf(segment) === -1) {
  //   urlParams.delete('s');
  //   segment = '';
  //   // reload window with correct segment
  //   window.location.href = `${window.location.origin}?${urlParams.toString()}`;
  // }
  // use state to handle segment change
  const [currentSegment, setSegment] = useState(segment);
  const handleSegmentChange = (e: any) => {
    setSegment(e.detail.value);
  };
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const scrollToTop = () => {
    // @ts-ignore
    contentRef.current.scrollToTop();
  };

  const renderSwitch = (param: string) => {
    switch (param) {
      case "welcome":
        return <Welcome handleSegmentChange={handleSegmentChange} />;
      case "swap":
        return <SwapContainer />;
      case "fiat":
        return (<FiatContainer />);
      case "defi":
        return (
          <AaveProvider>
            <SolendProvider >
              <PoolsProvider>  
                <DefiContainer handleSegmentChange={handleSegmentChange} />
              </PoolsProvider>
            </SolendProvider>
          </AaveProvider>
        );
      case "earn": {
        return (
          <EarnContainer />
        )
      }
      default:
        return currentSegment ?
          (
            <>
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
            </>
          )
          : (<></>)
    }
  };
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet id="main">
          <Route path="/index" render={() => (<>  
            <Web3Provider>
              <LoaderProvider>
                <IonPage>
                  <MenuSlide handleSegmentChange={handleSegmentChange}/>
                  <Header currentSegment={currentSegment} handleSegmentChange={handleSegmentChange} scrollToTop={scrollToTop} />
                  <IonContent ref={contentRef} id="main-content" scrollEvents={true} fullscreen={true}>
                    <IonGrid class="ion-no-padding" style={{ minHeight: "100vh" }}>
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
                          {currentSegment !== "welcome" && (
                            <div style={{
                              position: 'fixed',
                              bottom: '0.5rem',
                              margin: 'auto',
                              width: '100%',
                              left: 0,
                              textAlign: 'center',
                              zIndex: -1,
                              opacity: 0.4
                            }}>
                              <small>
                                {`HexaLite v${process.env.NEXT_PUBLIC_APP_VERSION} - ${process.env.NEXT_PUBLIC_APP_BUILD_DATE}`}
                              </small>
                            </div>
                          )}
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonContent>
                </IonPage>
              </LoaderProvider>
            </Web3Provider>
          </>)} />
          <Route path="/leaderboard" render={() => <Leaderboard />} />
          <Route path="/" render={() => <Redirect to="/index" />} exact={true} />
          <Route component={NotFoundPage} />
        </IonRouterOutlet>
      </IonReactRouter>
      <PwaInstall />
    </IonApp>
  );
};

export default AppShell;
