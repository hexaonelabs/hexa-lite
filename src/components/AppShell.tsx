import { IonApp, IonLabel, IonRouterOutlet, setupIonicReact, IonText, IonChip, IonContent, IonGrid, IonRow, IonCol, IonPage } from '@ionic/react';
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
            <DefiContainer handleSegmentChange={handleSegmentChange} />
          </AaveProvider>
        );
      case "earn": {
        return (
          <AaveProvider>
            <EarnContainer />
          </AaveProvider>
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
                    {`HexaLite v${process.env.NEXT_PUBLIC_APP_VERSION}`}
                  </small>
                </div>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>


      {/* <IonReactRouter>
        <IonRouterOutlet id="main">
          <Route path="/index" render={() => <Feed />} />
          <Route path="/" render={() => <Redirect to="/index" />} exact={true} />
        </IonRouterOutlet>
      </IonReactRouter> */}
    </IonApp>
  );
};

export default AppShell;
