import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonRow,
  IonText,
  useIonRouter,
} from "@ionic/react";
import {
  logoGithub,
} from "ionicons/icons";
import { ETHLiquidStakingstrategyCard } from "./ETHLiquidStakingstrategy";
import { CHAIN_AVAILABLES } from "@/constants/chains";
import RevealComp from "@/components/RevealComp";
import { FooterComponent } from "./FooterComponent";
import { FAQ } from "./FAQ";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";

export function Welcome({
  handleSegmentChange,
}: {
  handleSegmentChange: (e: { detail: { value: string } }) => void;
}) {
  const { connectWallet } = Store.useState(getWeb3State);
  const router = useIonRouter();
  return (
    <IonGrid class="ion-no-padding welcomeSection">
      <IonRow 
        class="rowSection ion-justify-content-center ion-align-items-center ion-no-padding" 
        style={{
          overflow: 'hidden',
          borderBottom: 'solid 1px rgba(var(--ion-color-primary-rgb), 0.5)'}}>
        <IonCol size="12" size-md="6" size-lg="5" class="ion-text-start ion-padding">
          {/* <RevealComp x={0} duration="200ms" threshold={0.9}>
          </RevealComp> */}
          <RevealComp x={0} duration="200ms" threshold={0.9}>
            <div className="logoTextContainer">
              <img
                className="homeLogo"
                src={"./assets/images/logo.svg"}
                alt="Hexa Lite logo"
              />
              <IonText>
                <h1 className="homeTitle ion-text-nowrap">Hexa Lite</h1>
                <p className="slogan">Build your wealth with <IonText className="ion-color-gradient-text">crypto assets</IonText></p>
              </IonText>
            </div>
            {/* <IonText color="medium" className="ion-hide-lg-down">
              <p className="ion-no-padding">
                Buy digitals assets with fiats, exchange at best rate, lend and
                borrow money on DeFi protocols without any intermediate smart
                contract or third-party to enforce security and increase earn
                interest.
              </p>
            </IonText> */}
          </RevealComp>
          <RevealComp y={-10} duration="225ms" threshold={0.9}>
            <div className="homeActionBtns">
              <IonButton
                color="gradient"
                onClick={(e) => {
                  router.push("wallet", 'forward');
                  handleSegmentChange({ detail: { value: "wallet" } });
                }}
              >
                Launch App
              </IonButton>
              <IonButton
                color="medium"
                fill="clear"
                size="small"
                onClick={(e) => {
                  router.push("available-platforms", 'forward');
                }}
              >
                <small>
                  Available on iOS, Android and Desktop
                </small>
              </IonButton>
            </div>
          </RevealComp>
        </IonCol>
        <IonCol size="12" size-lg="5" className="ion-align-self-end">
          <RevealComp x={50} duration="200ms" threshold={0.35}>
            <img style={{
              minWidth: '65vw',
              marginBottom: '-1rem',
              filter: 'drop-shadow(0px 0px 60px rgba(var(--ion-color-primary-rgb),0.2))'
            }} src="./assets/images/preview-app.png"
            alt="app preview" />
          </RevealComp>
        </IonCol>
      </IonRow>

      <IonRow
        class="rowSection shaderContener withPadding ion-justify-content-center ion-align-items-center  ion-padding"
        style={{
          boxShadow: '0px -60px 60px 0px rgba(var(--ion-color-primary-rgb), 0.15)'
        }}
      >
        <IonCol size="12" class="ion-text-center ">
          <RevealComp y={20} duration="225ms" threshold={0.9}>
            <IonText>
              <h2
                style={{
                  fontSize: "3.5rem",
                  lineHeight: "3.8rem",
                  fontWeight: "bold",
                }}
              >
                Onboard on{" "}
                <IonText className="ion-color-gradient-text">DeFi</IonText>
              </h2>
            </IonText>
            <IonText color="medium">
              <p className="ion-no-margin">
                Take full controls of your digitals assets
              </p>
            </IonText>
          </RevealComp>
        </IonCol>
        <IonCol size="12">
          <IonGrid>
            <IonRow
              class="withPadding ion-justify-content-center ion-align-items-center"
              >
              <IonCol size="12" size-md="6">
                <RevealComp y={20} duration="200ms" threshold={0.2}>
                  <IonText className="withMaxWidth">
                    <h3
                      style={{
                        fontWeight: "bold",
                        fontSize: "2rem",
                        lineHeight: "2rem",
                      }}
                    >
                      Create or connect an account<br/> under a minute
                    </h3>
                    <p>
                      Hexa Lite ensures a secure and reliable user experience, <IonText className="ion-color-gradient-text">enabling everyone to own their own assets</IonText>. 
                      Users can enjoy the advantages of blockchain technology and DeFi services without the need to manage private keys or seed phrases.
                    </p>
                  </IonText>
                  <IonButton
                    size="default"
                    color="gradient"
                    onClick={async (e) => {
                      const html = (e.target as HTMLElement).innerHTML;
                      (e.target as HTMLElement).innerHTML = "Connecting...";
                      try {
                        await connectWallet();
                        router.push("wallet", 'forward');
                        handleSegmentChange({ detail: { value: "fiat" } });
                      } catch (error) {
                        console.error("[ERROR] handleConnect:", error);
                      }
                      (e.target as HTMLElement).innerHTML = html;
                    }}
                  >
                    Easy onBoarding
                  </IonButton>
                </RevealComp>
              </IonCol>
              <IonCol
                size="12"
                size-md="4"
                className="ion-text-center ion-padding"
              >
                <RevealComp x={50} duration="200ms" threshold={0.2}>
                  <div className="ion-padding">
                    <img
                      style={{
                        minWidth: "280px",
                        margin: "0",
                        borderRadius: "32px",
                        overflow: "hidden",
                        maxWidth: "fit-content",
                        border: "solid 2px var(--ion-color-primary)",
                        boxShadow:
                          "0 0px 100px -30px var(--ion-color-tertiary)",
                      }}
                      src="./assets/images/onboarding.png"
                      alt="login card"
                    />
                  </div>
                </RevealComp>
              </IonCol>
            </IonRow>
            <IonRow
              class="ion-justify-content-center ion-align-items-center"
              style={{ padding: "20vh 0" }}
            >
              <IonCol size="12" size-md="6">
                <RevealComp y={20} duration="200ms" threshold={0.2}>
                  <IonText className="withMaxWidth">
                    <h3
                      style={{
                        fontWeight: "bold",
                        fontSize: "2rem",
                        lineHeight: "2rem",
                      }}
                    >
                      Deposit liquidity & earn interest
                    </h3>
                    <p>
                      Safely deposit your liquidity <IonText className="ion-color-gradient-text">without any restrictions or censorship</IonText> into DeFi protocols across
                      more than 40 markets and{" "}
                      {CHAIN_AVAILABLES.filter((c) => c.type === "evm").length}{" "}
                      EVM-Compatible blockchains. Earn substantial interest
                      while retaining complete control over your assets.
                    </p>
                  </IonText>
                  <IonButton
                    size="default"
                    color="gradient"
                    onClick={(e) =>{
                      router.push("defi", 'forward');
                      handleSegmentChange({ detail: { value: "defi" } })
                    }}
                  >
                    Start Deposit
                  </IonButton>
                </RevealComp>
              </IonCol>
              <IonCol
                size="12"
                size-md="4"
                className="ion-text-center ion-padding"
              >
                <RevealComp x={50} duration="200ms" threshold={0.2}>
                  <div className="ion-padding">
                    <IonImg
                      style={{
                        margin: "0 auto",
                        maxWidth: "fit-content",
                        filter:
                          "drop-shadow(0px 0px 60px rgba(var(--ion-color-tertiary-rgb),0.5))",
                      }}
                      src="./assets/images/coins-b.png"
                    />
                  </div>
                </RevealComp>
              </IonCol>
            </IonRow>

            <IonRow
              class="ion-justify-content-center ion-align-items-center"
              style={{ padding: "20vh 0" }}
            >
              <IonCol size="12" size-md="6">
                <RevealComp y={20} duration="200ms" threshold={0.2}>
                  <IonText className="withMaxWidth">
                    <h3
                      style={{
                        fontWeight: "bold",
                        fontSize: "2rem",
                        lineHeight: "2rem",
                      }}
                    >
                      Earn interest with liquid Staking
                    </h3>
                    <p>
                      Unlock the potential of your assets by earn interest
                      through Liquid Staking. <br />
                      Stake with DeFi protocols <IonText className="ion-color-gradient-text">without any lockup periods or restrictions</IonText>.
                    </p>
                    <IonButton
                      size="default"
                      color="gradient"
                      onClick={(e) =>{
                        router.push("earn", 'forward');
                        handleSegmentChange({ detail: { value: "earn" } })
                      }}
                    >
                      Start Earning
                    </IonButton>
                  </IonText>
                </RevealComp>
              </IonCol>
              <IonCol
                size="12"
                size-md="4"
                className="ion-text-center ion-padding-vertical"
              >
                <RevealComp x={50} duration="200ms" threshold={0.2}>
                  <div
                    className="ion-no-padding"
                    style={{
                      margin: "auto",
                      display: "inline-block",
                    }}
                  >
                    <ETHLiquidStakingstrategyCard asImage={true} />
                  </div>
                </RevealComp>
              </IonCol>
            </IonRow>
            <IonRow
              class="ion-justify-content-center ion-align-items-center"
              style={{ padding: "20vh 0" }}
            >
              <IonCol size="12" size-md="6">
                <RevealComp y={20} duration="225ms" threshold={0.2}>
                  <IonText>
                    <h3
                      style={{
                        fontWeight: "bold",
                        fontSize: "2rem",
                        lineHeight: "2rem",
                      }}
                    >
                      Multi Chains
                    </h3>
                    <p>
                      Hexa Lite support Bitcoin, Solana and +20 EVM-Compatible blockchain such as
                      Ethereum, Polygon, Binance Smart Chain, Optimism,
                      Arbitrum, etc. without have to care about how to manage
                      networks changes.
                    </p>
                  </IonText>
                </RevealComp>
              </IonCol>
              <IonCol
                size="12"
                size-md="4"
                className="ion-text-center ion-padding"
              >
                <RevealComp x={50} duration="200ms" threshold={0.2}>
                  <svg
                    width="256px"
                    height="417px"
                    viewBox="0 0 256 417"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                    style={{
                      filter:
                        "drop-shadow(0px 0px 60px rgba(var(--ion-color-tertiary-rgb),0.5))",
                    }}
                  >
                    <g>
                      <polygon
                        fill="#999"
                        points="127.9611 0 125.1661 9.5 125.1661 285.168 127.9611 287.958 255.9231 212.32"
                      />
                      <polygon
                        fill="#fff"
                        points="127.962 0 0 212.32 127.962 287.959 127.962 154.158"
                      />
                      <polygon
                        fill="#999"
                        points="127.9611 312.1866 126.3861 314.1066 126.3861 412.3056 127.9611 416.9066 255.9991 236.5866"
                      />
                      <polygon
                        fill="#fff"
                        points="127.962 416.9052 127.962 312.1852 0 236.5852"
                      />
                      <polygon
                        fill="#777"
                        points="127.9611 287.9577 255.9211 212.3207 127.9611 154.1587"
                      />
                      <polygon
                        fill="#999"
                        points="0.0009 212.3208 127.9609 287.9578 127.9609 154.1588"
                      />
                    </g>
                  </svg>
                  <div className="homeIconsEVM">
                    <IonIcon src="./assets/icons/op.svg" />
                    {/* <IonIcon src="./assets/icons/arb.svg" /> */}
                    <IonIcon
                      src="./assets/cryptocurrency-icons/bnb.svg"
                      style={{ transform: "translateY(2.5rem)" }}
                    />
                    <IonIcon
                      src="./assets/cryptocurrency-icons/matic.svg"
                      style={{ transform: "translateY(2.5rem)" }}
                    />
                    <IonIcon src="./assets/icons/arb.svg" />
                  </div>
                </RevealComp>
              </IonCol>
            </IonRow>
            <IonRow
              class="ion-justify-content-center ion-align-items-center"
              style={{ padding: "5rem 0" }}
            >
              <IonCol size="12" size-md="6">
                <RevealComp y={20} duration="225ms" threshold={0.2}>
                  <IonText>
                    <h3
                      style={{
                        fontWeight: "bold",
                        fontSize: "2rem",
                        lineHeight: "2rem",
                      }}
                    >
                      Security & Privacy
                    </h3>
                    <p>
                      As an open-source and non-custodial platform, we don't
                      store any user data or private keys. You retain complete
                      control over your assets, enabling direct interaction with
                      DeFi protocols without intermediaries smart contracts or
                      third-party services,
                    </p>
                  </IonText>
                  <IonButton
                    size="default"
                    color="gradient"
                    onClick={(e) =>{
                      router.push("about", 'forward');
                    }}
                  >
                    About the team
                  </IonButton>
                </RevealComp>
              </IonCol>
              <IonCol
                size="12"
                size-md="4"
                className="ion-text-center ion-padding"
              >
                <RevealComp x={50} duration="200ms" threshold={0.2}>
                  <IonIcon
                    style={{
                      color: "#fff",
                      width: "256px",
                      height: "256px",
                      cursor: "pointer",
                      filter:
                        "drop-shadow(0px 0px 60px rgba(var(--ion-color-tertiary-rgb),0.5))",
                    }}
                    icon={logoGithub}
                    onClick={() => {
                      window.open(
                        "https://github.com/hexaonelabs/hexa-lite",
                        "_blank"
                      );
                    }}
                  ></IonIcon>
                </RevealComp>
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

      {/* Partners Section */}
      <IonRow
        class="ion-padding ion-text-center"
        style={{ background: "rgba(0,0,0, 0.5)" }}
      >
        <IonCol size="12" className="ion-padding-vertical ion-margin-top">
          <RevealComp y={20} duration="225ms" threshold={0.2}>
            <IonGrid className="ion-margin-bottom ion-padding-vertical">
              <IonRow>
                <IonCol
                  size="12"
                  className="ion-margin-bottom ion-padding-bottom"
                >
                  <IonText>
                    <h2
                      style={{
                        fontSize: "3.5rem",
                        lineHeight: "3.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      Partners
                    </h2>
                  </IonText>
                  <IonText color="medium">
                    <p className="ion-no-margin">
                      Hexa Lite Ecosystem and integrations
                    </p>
                  </IonText>
                </IonCol>
              </IonRow>
              <IonRow className="partners ion-justify-content-center ion-align-items-center ion-padding-vertical ion-margin-vertical">
                <IonCol class="ion-text-center">
                  <a
                    href="https://aave.com/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <IonImg
                      style={{
                        width: "65px",
                        height: "65px",
                        margin: "0.5rem auto",
                      }}
                      src={"./assets/images/Aave-Ghost-Gradient.svg"}
                    ></IonImg>
                    <IonText>AAVE</IonText>
                  </a>
                </IonCol>
                <IonCol class="ion-text-center">
                  <a
                    href="https://solend.fi"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <IonImg
                      style={{
                        width: "65px",
                        height: "65px",
                        margin: "0.5rem auto",
                      }}
                      src={"./assets/images/solend.svg"}
                    ></IonImg>
                    <IonText>SOLEND</IonText>
                  </a>
                </IonCol>
                <IonCol class="ion-text-center">
                  <a
                    href="https://lido.fi/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <IonImg
                      style={{
                        width: "65px",
                        height: "65px",
                        margin: "0.5rem auto",
                      }}
                      src={"./assets/images/lido-symbol.svg"}
                    ></IonImg>
                    <IonText>LIDO</IonText>
                  </a>
                </IonCol>
                <IonCol class="ion-text-center">
                  <a
                    href="https://www.ankr.com/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <IonImg
                      style={{
                        width: "65px",
                        height: "65px",
                        margin: "0.5rem auto",
                      }}
                      src="./assets/images/Ankr-blue-symbol.svg"
                    ></IonImg>
                    <IonText>ANKR</IonText>
                  </a>
                </IonCol>
                <IonCol class="ion-text-center">
                  <a
                    href="https://1inch.io/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <IonImg
                      style={{
                        width: "65px",
                        height: "65px",
                        margin: "0.5rem auto",
                      }}
                      src="./assets/images/1inch-logo.svg"
                    ></IonImg>
                    <IonText>1INCH</IonText>
                  </a>
                </IonCol>
                <IonCol class="ion-text-center">
                  <a
                    href="https://li.fi/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <IonImg
                      style={{
                        width: "65px",
                        height: "65px",
                        margin: "0.5rem auto",
                      }}
                      src="./assets/images/logo-lifi-mark.svg"
                    ></IonImg>
                    <IonText>LIFI</IonText>
                  </a>
                </IonCol>
                <IonCol class="ion-text-center">
                  <a
                    href="https://axelar.network/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <IonImg
                      style={{
                        width: "65px",
                        height: "65px",
                        margin: "0.5rem auto",
                      }}
                      src="./assets/images/Axelar-logo-symbol-blue.svg"
                    ></IonImg>
                    <IonText>AXELAR</IonText>
                  </a>
                </IonCol>
                <IonCol class="ion-text-center">
                  <a
                    href="https://magic.link/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <IonImg
                      style={{
                        width: "65px",
                        height: "65px",
                        margin: "0.5rem auto",
                      }}
                      src="./assets/images/Magic.svg"
                    ></IonImg>
                    <IonText>MAGIC</IonText>
                  </a>
                </IonCol>
                {/* <IonCol class="ion-text-center">
                  <a
                    href="https://onramper.com/"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <IonImg
                      style={{
                        width: "65px",
                        height: "65px",
                        margin: "0.5rem auto",
                      }}
                      src="./assets/images/onramp-logo-emblem.svg"
                    ></IonImg>
                    <IonText>ONRAMP</IonText>
                  </a>
                </IonCol> */}
              </IonRow>
            </IonGrid>
          </RevealComp>
        </IonCol>
      </IonRow>

      {/* FAQ */}
      <IonRow class="rowSection ion-justify-content-center ion-align-items-center ion-padding">
        <IonCol
          sizeMd="8"
          sizeLg="6"
          style={{ marginBottom: "8rem", marginTop: "8rem" }}
        >
          <h2
            className="ion-text-center"
            style={{
              fontWeight: "bold",
              fontSize: "3.5rem",
              lineHeight: "3.8rem",
              marginBottom: "2rem",
            }}
          >
            FAQ
          </h2>
          <FAQ />
        </IonCol>
      </IonRow>

      {/* Last call Action */}
      <IonRow class="rowSection ion-justify-content-center ion-align-items-center ion-padding">
        <IonCol size="12" class="ion-text-center ">
          <RevealComp y={20} duration="225ms" threshold={0.2}>
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
              onClick={(e) =>{
                router.push("wallet", 'forward');
                handleSegmentChange({ detail: { value: "wallet" } })
              }}
            >
              Launch App
            </IonButton>
          </RevealComp>
        </IonCol>
      </IonRow>

      {/* Footer Section */}
      <FooterComponent />
    </IonGrid>
  );
}
