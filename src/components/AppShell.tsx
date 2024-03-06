import { IonApp, IonButton, IonRouterOutlet, setupIonicReact, IonText, IonChip, IonContent, IonGrid, IonRow, IonCol, IonPage, useIonModal, IonIcon, useIonAlert } from '@ionic/react';
import { StatusBar, Style } from '@capacitor/status-bar';

import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Welcome } from './Welcome';
// import { SwapContainer } from '@/containers/SwapContainer';
import { FiatContainer } from '@/containers/FiatContainer';
// import { DefiContainer } from '@/containers/DefiContainer';
// import { EarnContainer } from '@/containers/EarnContainer';
import { Header } from './Header';
import MenuSlide from './MenuSlide';
import { LoaderProvider } from '@/context/LoaderContext';
import { Leaderboard } from '@/containers/LeaderboardContainer';
import { NotFoundPage } from '@/containers/NotFoundPage';
import PwaInstall from './PwaInstall';
import { initializeWeb3 } from '@/store/effects/web3.effects';
import { getMagic } from '@/servcies/magic';
import Store from '@/store';
import { getWeb3State } from '@/store/selectors';
import { useIonRouter, IonRoute } from '@ionic/react';

setupIonicReact({ mode: 'ios' });

window.matchMedia("(prefers-color-scheme: dark)").addListener(async (status) => {
  console.log(`[INFO] Dark mode is ${status.matches ? 'enabled' : 'disabled'}`);
  try {
    await StatusBar.setStyle({
      style: status.matches ? Style.Dark : Style.Light,
    });
  } catch { }
});

const SwapContainer = lazy(() => import('@/containers/SwapContainer'));
const DefiContainer = lazy(() => import('@/containers/DefiContainer'));
const EarnContainer = lazy(() => import('@/containers/EarnContainer'));

const AppShell = () => {
  // get params from url `s=`
  const urlParams = new URLSearchParams(window.location.search);
  const {pathname = '/swap'} = window.location;
  let segment = pathname.split('/')[1]|| 'swap' // urlParams.get("s") || "swap";
  const {walletAddress, isMagicWallet } = Store.useState(getWeb3State);
  const [presentFiatWarning, dismissFiatWarning] = useIonAlert();
  const isNotFound = (segment && ['swap', 'fiat', 'defi', 'earn'].indexOf(segment) === -1);
  // use state to handle segment change
  const [currentSegment, setSegment] = useState(segment);
  const handleSegmentChange = async (e: any) => {
    if (e.detail.value === 'fiat'){ 
      if (walletAddress && walletAddress !== '' && isMagicWallet) {
        const magic = await getMagic();
        magic.wallet.showOnRamp();
      } else {
        await presentFiatWarning({
          header: 'Information',
          message: 'Connect with e-mail or social login to enable buy crypto with fiat.',
          buttons: ['OK'],
          cssClass: 'modalAlert'
        });
      };
      return;
    };
    setSegment(e.detail.value);
    // router.push(`/${e.detail.value}`);
  };
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const scrollToTop = () => {
    // @ts-ignore
    contentRef.current.scrollToTop();
  };

  useEffect(()=> {
    initializeWeb3();
  }, []);
  
  return (
    <IonApp>
      <IonReactRouter >
        <IonRouterOutlet id="main">
          <IonRoute path="/index" render={() => <>
            <IonPage>
              <IonContent ref={contentRef} scrollEvents={true} >
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
                    <Welcome handleSegmentChange={handleSegmentChange} />
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonContent>
            </IonPage>
          </>} />
          <IonRoute path="/leaderboard" render={() => <Leaderboard />} />
          <IonRoute path="/" render={() => <Redirect to="/index" />} exact={true} />
          <IonRoute render={() => <>
            <IonPage>
              {!isNotFound && (
                <Header 
                  currentSegment={currentSegment} 
                  handleSegmentChange={handleSegmentChange} />
              )}
              <IonContent>
                <Suspense fallback={<div>Loading SwapContainer...</div>}>
                  { currentSegment === 'swap' && <SwapContainer />}
                </Suspense>
                <Suspense fallback={<div>Loading EarnContainer...</div>}>
                  { currentSegment === 'earn' && <EarnContainer />}
                </Suspense>
                <Suspense fallback={<div>Loading DefiContainer...</div>}>
                  { currentSegment === 'defi' && <DefiContainer handleSegmentChange={handleSegmentChange} />}
                </Suspense>
                <Suspense fallback={<div>Loading NotFoundPage...</div>}>
                  { currentSegment === isNotFound && <NotFoundPage />}
                </Suspense>
              </IonContent>
            </IonPage>
          </>} />
        </IonRouterOutlet>
      </IonReactRouter>
      <PwaInstall />
    </IonApp>
  );
};

export default AppShell;
