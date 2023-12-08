import {
  IonButton,
  IonCard,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonModal,
  IonRow,
  IonSkeletonText,
  IonSpinner,
  IonText,
  useIonToast,
} from "@ionic/react";
import {
  informationCircleOutline,
  closeSharp,
} from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { getBaseAPRstMATIC, getETHByWstETH } from "../servcies/lido.service";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useWeb3Provider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";
import { CHAIN_AVAILABLES, NETWORK } from "../constants/chains";
import { HowItWork } from "./HowItWork";
import { ApyDetail } from "./ApyDetail";
import { SQUID_CONFIG } from '../servcies/squid.service';
import { SquidWidget } from "@0xsquid/widget";

export interface IStrategyModalProps {
  dismiss?: (
    data?: any,
    role?: string | undefined
  ) => Promise<boolean> | undefined;
}

export function ATOMLiquidStakingstrategyCard() {
  const { web3Provider, switchNetwork, connectWallet, disconnectWallet, currentNetwork } = useWeb3Provider();
  const [baseAPRst, setBaseAPRst] = useState(-1);
  const { display: displayLoader, hide: hideLoader } = useLoader();
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];

  const strategy = {
    name: "ATOM",
    type: "Liquid staking",
    icon: getAssetIconUrl({ symbol: "ATOM" }),
    apys: [baseAPRst.toFixed(2)],
    locktime: 0,
    providers: ["stride"],
    assets: ["ATOM", "stATOM"],
    isStable: true,
    chainsId: [NETWORK.cosmos],
    details: {
      description: `
        This strategy will swap your ATOM for stATOM to earn ${baseAPRst.toFixed(
        2
      )}% APY revard from staking stATOM on Lido.
      `,
    },
  };
  const modal = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    const { signal, abort } = new AbortController();
    // getBaseAPRstMATIC().then(({ apr }) => setBaseAPRst(() => apr));
    setBaseAPRst(13.5);
    // return () => abort();
  }, []);

  return (
    <>
      <IonCard className="strategyCard">
        <IonGrid>
          <IonRow class="ion-text-center ion-padding">
            <IonCol size="12" class="ion-padding">
              <IonImg
                style={{
                  padding: "0 2rem",
                  maxWidth: 200,
                  maxHeight: 200,
                  margin: "1rem auto 0",
                }}
                src={strategy.icon}
              />
            </IonCol>
            <IonCol size="12" class="ion-padding-top">
              <h1 className="ion-no-margin">
                <IonText className="ion-color-gradient-text">
                  {strategy.name}
                </IonText>
                <br />
                <IonText color="dark">
                  <small>{strategy.type}</small>
                </IonText>
              </h1>
            </IonCol>
          </IonRow>

          <IonRow class="ion-padding">
            <IonCol class="ion-padding">
              <IonItem
                style={{
                  "--background": "transparent",
                  "--inner-padding-end": "none",
                  "--padding-start": "none",
                }}
              >
                <IonLabel>
                  Assets
                </IonLabel>
                <div slot="end" style={{ display: "flex" }}>
                  {strategy.assets.map((symbol, index) => (
                    <IonImg
                      key={index}
                      style={{
                        width: 28,
                        height: 28,
                        transform: index === 0 ? "translateX(5px)" : "none",
                      }}
                      src={getAssetIconUrl({ symbol })}
                      alt={symbol}
                    />
                  ))}
                </div>
              </IonItem>
              <IonItem
                style={{
                  "--background": "transparent",
                  "--inner-padding-end": "none",
                  "--padding-start": "none",
                }}
              >
                <IonLabel>Network</IonLabel>
                <div slot="end" style={{ display: "flex" }}>
                  {strategy.chainsId
                    .map((id) => CHAIN_AVAILABLES.find((c) => c.id === id))
                    .map((c, index) => {
                      if (!c || !c.nativeSymbol) return null;
                      return (
                        <IonImg
                          key={index}
                          style={{
                            width: 18,
                            height: 18,
                            transform:
                              index === 0 && strategy.chainsId.length > 1
                                ? "translateX(5px)"
                                : "none",
                          }}
                          src={getAssetIconUrl({ symbol: c.nativeSymbol })}
                          alt={c.nativeSymbol}
                        />
                      );
                    })}
                </div>
              </IonItem>
              <IonItem
                style={{
                  "--background": "transparent",
                  "--inner-padding-end": "none",
                  "--padding-start": "none",
                }}
              >
                <IonLabel>
                  APY
                  <ApyDetail>
                    <>
                      <IonItem>
                        <IonLabel color="medium">
                          <h2>
                            Base APY <small>(stATOM)</small>
                          </h2>
                        </IonLabel>
                        <IonText slot="end">{strategy.apys[0]}%</IonText>
                      </IonItem>
                      <IonItem lines="none">
                        <IonLabel>
                          <h2>
                            <b>Total variable APY</b>
                          </h2>
                        </IonLabel>
                        <IonText slot="end">
                          <b>{strategy.apys[0]}%</b>
                        </IonText>
                      </IonItem>
                    </>
                  </ApyDetail>
                </IonLabel>
                <div slot="end" style={{ display: "flex" }}>
                  {strategy.apys.map((apy, index) => (
                    <IonText key={index}>{apy}%</IonText>
                  ))}
                </div>
              </IonItem>
              <IonItem
                style={{
                  "--background": "transparent",
                  "--inner-padding-end": "none",
                  "--padding-start": "none",
                }}
              >
                <IonLabel>Protocols</IonLabel>
                <div slot="end" style={{ display: "flex" }}>
                  {strategy.providers
                    .map((p, index) => p.toLocaleUpperCase())
                    .join(" + ")}
                </div>
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12" class="ion-padding-horizontal ion-padding-bottom">
              <HowItWork>
                <div className="ion-padding-horizontal">
                  <IonText>
                    <h4>Staking ATOM with Lido</h4>
                    <p className="ion-no-margin ion-padding-bottom">
                      <small>
                        By swapping ATOM to stATOM you will incrase your ATOM
                        holdings by {baseAPRst.toFixed(2)}% APY using ATOM staking with{" "}
                        <a
                          href="https://lido.fi/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Stride finance
                        </a>
                        .
                      </small>
                    </p>
                    <p className="ion-no-margin ion-padding-bottom">
                      <small>
                        The stATOM is not a rebasable token. Instead, the value of your stATOM will change relative to ATOM as staking rewards are earned.
                      </small>
                    </p>
                    <p className="ion-no-margin ion-padding-bottom">
                      <small>
                        You can also use your stATOM to earn more yield on lendings market or swap back to ATOM at any time without locking period.
                      </small>
                    </p>
                  </IonText>
                </div>
              </HowItWork>

              <IonButton
                onClick={async () => {
                  await displayLoader();
                  if (currentNetwork !== NETWORK.cosmos) {
                    await switchNetwork(NETWORK.cosmos);
                  }
                  await modal.current?.present();
                  await hideLoader();
                }}
                expand="block"
                color="gradient"
              >
                Start Earning
              </IonButton>
            </IonCol>
          </IonRow>

        </IonGrid>
      </IonCard>

      <IonModal
        ref={modal}
        trigger="open-modal"
        onWillDismiss={async (ev: CustomEvent<OverlayEventDetail>) => {
          console.log("will dismiss", ev.detail);
        }}
        className="modalPage"
      >
        <IonContent>
          <IonGrid
            style={{
              height: "100%",
            }}
          >
            <IonRow>
              <IonCol size="12" className="ion-text-end">
                <IonButton
                  fill="clear"
                  color="dark"
                  onClick={async () => {
                    modal.current?.dismiss();
                  }}
                >
                  <IonIcon icon={closeSharp} />
                </IonButton>
              </IonCol>
              <IonCol
                size="12"
                offsetMd="3"
                sizeMd="6"
                class="ion-padding-start ion-padding-end ion-padding-bottom ion-text-center"
              >
                <h1 className="ion-no-margin" style={{
                  marginBottom: '1.5rem',
                  fontSize: '2.4rem',
                  lineHeight: '1.85rem'
                }}>
                  <IonText className="ion-color-gradient-text">
                    {strategy.name}
                  </IonText>
                  <br />
                  <span style={{
                    fontSize: '1.4rem',
                    lineHeight: '1.15rem'
                  }}>{strategy.type}</span>
                </h1>
                <IonText color="medium">
                  <p>
                    By exchange ATOM to stATOM you will incrase your ATOM holdings balance by {baseAPRst.toFixed(2)}% APY from staking liquidity on Lido finance.
                    Rewards are automated and paid out in ATOM through daily exchange rate increases reflecting staking rewards.
                  </p>
                  <p className="ion-no-margin">
                    <small>You can exchange backward at anytime without locking period.</small>
                  </p>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
              }}
            >
              <IonCol>
                <SquidWidget config={{
                  ...SQUID_CONFIG
                }} />
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
        {/* <EthLiquidStakingStrategyModal
          dismiss={(data?: any, role?: string | undefined) =>
            modal.current?.dismiss(data, role)
          }
        /> */}
      </IonModal>
    </>
  );
}
