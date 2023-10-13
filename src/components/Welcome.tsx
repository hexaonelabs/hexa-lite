import { IonButton, IonCard, IonCol, IonGrid, IonIcon, IonImg, IonItem, IonLabel, IonRow, IonText } from "@ionic/react";
import { logoGithub, checkmarkCircle, chevronForwardCircle, chevronForward } from "ionicons/icons";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { EthOptimizedStrategyProvider } from "../context/EthOptimizedContext";
import { EthOptimizedStrategyCard } from "./ETHOptimizedStrategy";

export function Welcome({handleSegmentChange}: {handleSegmentChange: (e: {detail: {value: string}}) => void}) {

  return (
    <IonGrid
      class="ion-no-padding welcomeSection"
      style={{ marginBottom: "2rem" }}
    >
      <IonRow
        class="ion-justify-content-center ion-padding"
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
                letterSpacing: "-0.1rem",
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
                margin: "1rem 0 2.5rem 0",
              }}
            >
              Buy digitals assets with fiats, exchange at best rate, lend
              and borrow money on DeFi protocols without any intermediate 
              smart contract or third-party to enforce security and increase earn
              interest.
            </p>
          </IonText>
          <IonButton
            size="large"
            color="gradient"
            onClick={(e) =>
              handleSegmentChange({ detail: { value: "earn" } })
            }
          >
            Launch App
          </IonButton>
        </IonCol>
      </IonRow>

      <IonRow
        class="ion-justify-content-center ion-align-items-center  ion-padding"
        style={{ 
          minHeight: "100vh", 
          background: "#272747",
          paddingTop: "5rem",
          paddingBottom: "5rem",
        }}
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
              Onboard on <IonText className="ion-color-gradient-text">Web3</IonText>
            </h2>
          </IonText>
          <IonText color="medium">
            <p className="ion-no-margin">
              Take full controls of your digitals assets
            </p>
          </IonText>
        </IonCol>
        <IonCol size="12">
          <IonGrid>
            <IonRow class="ion-justify-content-center ion-align-items-center" style={{padding: '5rem 0'}}>
              <IonCol size="12" size-md="6">
                <IonText>
                  <h3
                    style={{
                      fontWeight: 'bold',
                      fontSize: "2rem",
                      lineHeight: "2rem",
                    }}
                  >
                    Frictionless onBoarding
                  </h3>
                  <p>
                    Hexa Lite is secure and reliable for everyone to use and
                    enjoy the benefits of blockchain technology & DeFi services
                    without the need to manage private keys or seed phrases.
                  </p>
                </IonText>
              </IonCol>
              <IonCol size="12" size-md="4" className="ion-text-center ion-padding">
                <div className="ion-padding">
                  <IonImg 
                    style={{
                      margin: '0 auto', 
                      borderRadius: '32px', 
                      overflow: 'hidden',
                      maxWidth: 'fit-content',
                      border: 'solid 2px var(--ion-color-primary)',
                      boxShadow: '0 0px 100px -30px var(--ion-color-tertiary)',
                      transform: 'matrix3d(1, 0.0, 0, -0.0004, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
                    }} src="./assets/images/onboarding.png" />
                </div>
              </IonCol>
            </IonRow>
            <IonRow class="ion-justify-content-center ion-align-items-center" style={{padding: '20vh 0'}}>
              <IonCol size="12" size-md="6">
                <IonText>
                  <h3
                    style={{
                      fontWeight: 'bold',
                      fontSize: "2rem",
                      lineHeight: "2rem",
                    }}
                  >
                    Increase digital assets yield 
                  </h3>
                  <p>
                    Hexa Lite level up your strategy to earn interest on leading crypto assets at the click of a button.
                  </p>
                </IonText>
              </IonCol>
              <IonCol size="12" size-md="4" className="ion-text-center ion-padding">
                <div className="ion-padding" style={{
                  margin: 'auto', 
                  display: 'inline-block',
                  transform: 'matrix3d(1, 0.0, 0, -0.0004, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
                  }}>
                  <EthOptimizedStrategyProvider>
                    <EthOptimizedStrategyCard asImage={true} />
                  </EthOptimizedStrategyProvider>
                </div>
              </IonCol>
            </IonRow>
            <IonRow class="ion-justify-content-center ion-align-items-center" style={{padding: '20vh 0'}}>
              <IonCol size="12" size-md="6">
                <IonText>
                  <h3
                    style={{
                      fontWeight: 'bold',
                      fontSize: "2rem",
                      lineHeight: "2rem",
                    }}
                  >
                    EVM-Compatible Chains
                  </h3>
                  <p>
                    Hexa Lite support 20 EVM-Compatible blockchain such as
                    Ethereum, Polygon, Binance Smart Chain, Optimism, Arbitrum,
                    etc. without have to care about how to manage networks
                    changes.
                  </p>
                </IonText>
              </IonCol>
              <IonCol size="12" size-md="4" className="ion-text-center ion-padding">
                <svg width="256px" height="417px" viewBox="0 0 256 417" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                  <g>
                    <polygon fill="#999" points="127.9611 0 125.1661 9.5 125.1661 285.168 127.9611 287.958 255.9231 212.32"/>
                    <polygon fill="#fff" points="127.962 0 0 212.32 127.962 287.959 127.962 154.158"/>
                    <polygon fill="#999" points="127.9611 312.1866 126.3861 314.1066 126.3861 412.3056 127.9611 416.9066 255.9991 236.5866"/>
                    <polygon fill="#fff" points="127.962 416.9052 127.962 312.1852 0 236.5852"/>
                    <polygon fill="#777" points="127.9611 287.9577 255.9211 212.3207 127.9611 154.1587"/>
                    <polygon fill="#999" points="0.0009 212.3208 127.9609 287.9578 127.9609 154.1588"/>
                  </g>
                </svg>
                <div className="homeIconsEVM">
                  <IonIcon src="./assets/icons/op.svg" />
                  {/* <IonIcon src="./assets/icons/arb.svg" /> */}
                  <IonIcon src="./assets/cryptocurrency-icons/bnb.svg" style={{transform: 'translateY(2.5rem)'}} />
                  <IonIcon src="./assets/cryptocurrency-icons/matic.svg" style={{transform: 'translateY(2.5rem)'}} />
                  <IonIcon src="./assets/icons/arb.svg" />
                </div>
              </IonCol>
            </IonRow>
            <IonRow class="ion-justify-content-center ion-align-items-center" style={{padding: '5rem 0'}}>
              <IonCol size="12" size-md="6">
                <IonText>      
                  <h3
                    style={{
                      fontWeight: 'bold',
                      fontSize: "2rem",
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
              <IonCol size="12" size-md="4" className="ion-text-center ion-padding">
                <IonIcon
                    style={{
                      color: "#fff",
                      width: '256px',
                      height: '256px',
                      cursor: 'pointer'
                    }}
                    icon={logoGithub}
                    onClick={() => {
                      window.open('https://github.com/hexaonelabs/hexa-lite', '_blank')
                    }}
                  ></IonIcon>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCol>
        {/* <IonCol size="4">
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
        </IonCol> */}
      </IonRow>

      <IonRow
        class="ion-justify-content-center ion-align-items-center ion-padding"
        style={{ minHeight: "100vh", marginBottom: "-4rem", }}
      >
        <IonCol size="12" class="ion-text-center ">
            <p>
          <IonText className="ion-color-gradient-text">
              Earn interest with your assets
          </IonText>
            </p>
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
            color="gradient"
            onClick={(e) =>
              handleSegmentChange({ detail: { value: "earn" } })
            }>
            Launch App
            </IonButton>
        </IonCol>
      </IonRow>

      <IonRow class="ion-align-items-center ion-justify-content-between">
        <IonCol size="auto" class="ion-padding-horizontal">
          <IonText color="medium">
            <p style={{fontSize: '12px'}}>
              Open source software by HexaOneLabs
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
            rel="noreferrer noopener"
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
} 