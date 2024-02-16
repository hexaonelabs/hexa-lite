import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonModal,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonSpinner,
  IonText,
  useIonToast,
} from "@ionic/react";
import { ethers } from "ethers";
import {
  informationCircleOutline,
  closeSharp,
} from "ionicons/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { getBaseAPRstMATIC, getETHByWstETH } from "../servcies/lido.service";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useLoader } from "../context/LoaderContext";
import { CHAIN_AVAILABLES, NETWORK } from "../constants/chains";
import { HowItWork } from "./HowItWork";
import { ApyDetail } from "./ApyDetail";
import { HiddenUI, LiFiWidget, WidgetConfig, WidgetEvent, useWidgetEvents } from "@lifi/widget";
import { LiFiWidgetDynamic } from "./LiFiWidgetDynamic";
import { LIFI_CONFIG } from '../servcies/lifi.service';
import type { Route } from '@lifi/sdk';
import { PointsData, addAddressPoints } from "@/servcies/datas.service";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";

export interface IStrategyModalProps {
  dismiss?: (
    data?: any,
    role?: string | undefined
  ) => Promise<boolean> | undefined;
}

export function MATICLiquidStakingstrategyCard() { 
  const { web3Provider, switchNetwork, connectWallet, disconnectWallet, currentNetwork } = Store.useState(getWeb3State);
  const [baseAPRst, setBaseAPRst] = useState(-1);
  const [action, setAction] = useState<"stake" | "unstake">("stake");
  const { display: displayLoader, hide: hideLoader } = useLoader();
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];

  const strategy = {
    name: "MATIC",
    type: "Liquid staking",
    icon: getAssetIconUrl({ symbol: "MATIC" }),
    apys: [baseAPRst.toFixed(2)],
    locktime: 0,
    providers: ["lido"],
    assets: ["MATIC", "stMATIC"],
    isStable: true,
    chainsId: [NETWORK.polygon],
    details: {
      description: `
        This strategy will swap your MATIC for stMATIC to earn ${baseAPRst.toFixed(
        2
      )}% APY revard from staking wstMATIC on Lido.
      `,
    },
  };
  const modal = useRef<HTMLIonModalElement>(null);
  // load environment config
  const widgetConfig: WidgetConfig = {
    ...LIFI_CONFIG,
    walletManagement: {
      connect: async () => {
        try {
          await displayLoader();
          await connectWallet();
          if (!(web3Provider instanceof ethers.providers.Web3Provider)) {
            throw new Error("Provider not found");
          }
          const signer = web3Provider?.getSigner();
          console.log("[INFO] signer", signer);
          if (!signer) {
            throw new Error("Signer not found");
          }
          // return signer instance from JsonRpcSigner
          hideLoader();
          return signer;
        } catch (error: any) {
          // Log any errors that occur during the connection process
          hideLoader();
          await presentToast({
            message: `[ERROR] Connect Failed with reason: ${error?.message || error
              }`,
            color: "danger",
            buttons: [
              {
                text: "x",
                role: "cancel",
                handler: () => {
                  dismissToast();
                },
              },
            ],
          });
          throw new Error("handleConnect:" + error?.message);
        }
      },
      disconnect: async () => {
        try {
          displayLoader();
          await disconnectWallet();
          hideLoader();
        } catch (error: any) {
          // Log any errors that occur during the disconnection process
          console.log("handleDisconnect:", error);
          hideLoader();
          await presentToast({
            message: `[ERROR] Disconnect Failed with reason: ${error?.message || error
              }`,
            color: "danger",
            buttons: [
              {
                text: "x",
                role: "cancel",
                handler: () => {
                  dismissToast();
                },
              },
            ],
          });
        }
      },
      signer: web3Provider instanceof ethers.providers.Web3Provider ? web3Provider?.getSigner() : undefined,
    },
    // set source chain to Polygon
    fromChain: NETWORK.polygon,
    // set destination chain to Optimism
    toChain: NETWORK.polygon,
    // set source token to ETH (Ethereum)
    fromToken: action === 'stake' ? "0x0000000000000000000000000000000000000000" : "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
    // set source token to USDC (Optimism)
    toToken: action === 'stake' ? "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4" : "0x0000000000000000000000000000000000000000",
    // fromAmount: 10,
    chains: {
      allow: [NETWORK.polygon],
    },
    tokens: {
      allow: [
        {
          chainId: Number(NETWORK.polygon),
          address: "0x0000000000000000000000000000000000000000", // MATIC
        },
        {
          chainId: Number(NETWORK.polygon),
          address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
        },
        // {
        //   chainId: Number(NETWORK.polygon),
        //   address: "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4", // wstMATIC
        // },
      ],
    },    
    hiddenUI: [
      ...LIFI_CONFIG?.hiddenUI as any,
      HiddenUI.ToAddress
    ],
    disabledUI: action === 'stake'
      ? [ "toToken"]
      : ["fromToken"],
  };

  useEffect(() => {
    const { signal, abort } = new AbortController();
    getBaseAPRstMATIC().then(({ apr }) => setBaseAPRst(() => apr));
    // return () => abort();
  }, []);

  const widgetEvents = useWidgetEvents();
  useEffect(() => {
    const onRouteExecutionCompleted = async (route: Route) => {
      console.log('[INFO] onRouteExecutionCompleted fired.', route);
      const data: PointsData = {
        route,
        actionType: 'liquid-staking'
      };
      if (!route.fromAddress) {
        console.log('[INFO] Add points faild: fromAddress is not defined.')
        return;
      }
      await addAddressPoints(route.fromAddress, data);
    };
    widgetEvents.on(WidgetEvent.RouteExecutionCompleted, onRouteExecutionCompleted);
    return () => widgetEvents.all.clear();
  }, [widgetEvents]);

  return (
    <>
      <IonCard className="strategyCard">
        <IonCardContent>
          <IonGrid class="ion-no-padding">
            <IonRow class="ion-text-center ion-no-padding ion-align-items-center">
              <IonCol size="12" class="ion-padding">
                <IonImg
                  style={{
                    padding: "0 0rem",
                    maxWidth: 114,
                    maxHeight: 114,
                    margin: "0 auto",
                  }}
                  src={strategy.icon}
                />
              </IonCol>
              <IonCol size="12" class="ion-padding">
                <h1 className="ion-no-margin">
                  <IonText className="ion-color-gradient-text">
                    {strategy.name}
                  </IonText>
                  <IonText color="dark">
                    <small>{strategy.type}</small>
                  </IonText>
                </h1>
              </IonCol>
            </IonRow>

            <IonRow class="ion-no-padding">
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
                              Base APY <small>(stMATIC)</small>
                            </h2>
                          </IonLabel>
                          <IonText slot="end">
                            {strategy.apys[0]}%
                          </IonText>
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
                      <IonText className="ion-color-gradient-text" key={index}>
                        <strong>{apy}%</strong>
                      </IonText>
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
                      .map((p) => {
                        // return capitalized string
                        return p.charAt(0).toUpperCase() + p.slice(1);
                      })
                      .join(" + ")}
                  </div>
                </IonItem>
              </IonCol>
            </IonRow>

            <IonRow class="ion-no-padding">
              <IonCol size="12" class="ion-padding-horizontal ion-padding-bottom">
                <HowItWork>
                  <div className="ion-padding-horizontal">
                    <IonText>
                      <h4>Staking MATIC with Lido</h4>
                      <p className="ion-no-margin ion-padding-bottom">
                        <small>
                          By swapping MATIC to stMATIC you will incrase your MATIC
                          holdings by {baseAPRst.toFixed(2)}% APY using MATIC staking with{" "}
                          <a
                            href="https://lido.fi/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Lido finance
                          </a>
                          .
                        </small>
                      </p>
                      <p className="ion-no-margin ion-padding-bottom">
                        <small>
                          The stMATIC is not a rebasable token. Instead, the value of your stMATIC will change relative to MATIC as staking rewards are earned.
                        </small>
                      </p>
                      <p className="ion-no-margin ion-padding-bottom">
                        <small>
                          You can also use your stMATIC to earn more yield on lendings market or swap back to MATIC at any time without locking period.
                        </small>
                      </p>
                    </IonText>
                  </div>
                </HowItWork>

                <IonButton
                  onClick={async () => {
                    await displayLoader();
                    if (currentNetwork !== NETWORK.polygon) {
                      await switchNetwork(NETWORK.polygon);
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
        </IonCardContent>
      </IonCard>

      <IonModal
        ref={modal}
        onWillDismiss={async (ev: CustomEvent<OverlayEventDetail>) => {
          console.log("will dismiss", ev.detail);
        }}
        className="modalPage"
      >
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="12" class="ion-padding">
                <IonButton
                  className="ion-float-end"
                  fill="clear"
                  color="dark"
                  onClick={async () => {
                    modal.current?.dismiss();
                  }}
                >
                  <IonIcon icon={closeSharp} />
                </IonButton>
                <IonImg
                  style={{
                    padding: "0 0rem",
                    maxWidth: 128,
                    maxHeight: 128,
                    margin: "2rem auto 0",
                  }}
                  src={strategy.icon}
                />
              </IonCol>
              <IonCol
                size="12"
                offsetMd="2"
                sizeMd="8"
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
                    By exchange MATIC to stMATIC you will incrase your MATIC holdings balance by {baseAPRst.toFixed(2)}% APY from staking liquidity on Lido finance.
                    Rewards are automated and paid out in MATIC through daily exchange rate increases reflecting staking rewards.
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
                paddingBottom:'3rem'
              }}
            >
              <IonCol>
                {/* <div  className="ion-text-center">
                  <IonText color="primary">
                    <p style={{ margin: "0 0 1rem" }}>
                      <small>
                        {`1 stMATIC = ~${
                          wstToEthAmount > 0 ? wstToEthAmount.toFixed(4) : 0
                        } MATIC`}
                      </small>
                    </p>
                  </IonText>
                </>
                 */}                
                 <div className="ion-padding-bottom" style={{maxWidth:'394px', margin: 'auto'}}>

                  <IonSegment value={action}>
                    <IonSegmentButton value="stake" onClick={() => setAction(() => 'stake')}>
                      <IonLabel>Stake</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="unstake" onClick={() => setAction(() => 'unstake')}>
                      <IonLabel>Unstake</IonLabel>
                    </IonSegmentButton>
                  </IonSegment>
                </div>
                <LiFiWidgetDynamic config={widgetConfig} integrator="hexa-lite" />
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
