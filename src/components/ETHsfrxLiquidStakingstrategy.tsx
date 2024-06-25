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
  IonText,
  useIonToast,
} from "@ionic/react";
import { ethers } from "ethers";
import {
  closeSharp,
} from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { getBaseAPRstETH, getETHByWstETH } from "../servcies/lido.service";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useLoader } from "../context/LoaderContext";
import { CHAIN_AVAILABLES, NETWORK } from "../constants/chains";
import { HowItWork } from "./HowItWork";
import { ApyDetail } from "./ApyDetail";
import { HiddenUI, WidgetConfig, WidgetEvent, useWidgetEvents } from "@lifi/widget";
import { LIFI_CONFIG } from '../servcies/lifi.service';
import { LiFiWidgetDynamic } from "./LiFiWidgetDynamic";
import type { Route } from '@lifi/sdk';
import { PointsData, addAddressPoints } from "@/servcies/datas.service";
import { getWeb3State } from "@/store/selectors";
import Store from "@/store";

export interface IStrategyModalProps {
  dismiss?: (
    data?: any,
    role?: string | undefined
  ) => Promise<boolean> | undefined;
}

export function ETHsfrxLiquidStakingstrategyCard(props: { asImage?: boolean }) {  
  const {
    currentNetwork,
    signer,
    switchNetwork,
    connectWallet,
    disconnectWallet,
  } = Store.useState(getWeb3State);
  const [baseAPY, setBaseAPY] = useState(-1);
  const [wstToEthAmount, setWstToEthAmount] = useState(-1);
  const [action, setAction] = useState<"stake" | "unstake">("stake");
  const { display: displayLoader, hide: hideLoader } = useLoader();
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];

  const strategy = {
    name: "ETH",
    type: "Liquid staking",
    icon: getAssetIconUrl({ symbol: "ETH" }),
    apys: [baseAPY.toFixed(2)],
    locktime: 0,
    providers: ["frax"],
    assets: ["ETH", "sfrxETH"],
    isStable: true,
    chainsId: [NETWORK.optimism],
    details: {
      description: `
        This strategy will swap your ETH for sfrxETH to earn ${baseAPY.toFixed(
        2
      )}% APY revard from staking WETH on Frax.
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
          if (!(signer)) {
            throw new Error("signer not found");
          }
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
      signer: signer || undefined
    },
    // set source chain to Polygon
    fromChain: NETWORK.optimism,
    // set destination chain to Optimism
    toChain: NETWORK.optimism,
    // set source token to ETH (Optimism)
    fromToken: action === 'stake' ? "0x0000000000000000000000000000000000000000" : "0x1f32b1c2345538c0c6f582fcb022739c4a194ebb",
    // set source token to sfrxETH (Optimism)
    toToken: action === 'stake' ?  "0x1f32b1c2345538c0c6f582fcb022739c4a194ebb" : "0x0000000000000000000000000000000000000000",
    // fromAmount: 10,
    chains: {
      allow: [NETWORK.optimism],
    },
    tokens: {
      allow:
       [
        {
          chainId: Number(NETWORK.optimism),
          address: "0x4200000000000000000000000000000000000006", // WETH
        },
        {
          chainId: Number(NETWORK.optimism),
          address: "0x0000000000000000000000000000000000000000", // ETH
        },
        // {
        //   chainId: Number(NETWORK.optimism),
        //   address: "0x1f32b1c2345538c0c6f582fcb022739c4a194ebb", // sfrxETH
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
    // getBaseAPRstETH().then(({ apr }) => setBaseAPY(() => apr));
    // return () => abort();
  }, []);

  useEffect(() => {
    if (!signer) {
      return;
    }
    getETHByWstETH(1).then((value) => {
      setWstToEthAmount(() => Number(value));
    });
  }, [signer]);

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
      <IonCard className={props.asImage ? "asImage" : "strategyCard"} >
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
                              Base APY <small>(sfrxETH)</small>
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
                      <h4>Staking ETH with Frax</h4>
                      <p className="ion-no-margin ion-padding-bottom">
                        <small>
                          By swapping your ETH for sfrxETH, you will increase your ETH holdings
                          by {baseAPY.toFixed(2)}% APY using ETH staking with{" "}
                          <a
                            href="https://frax.finance"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Frax finance
                          </a>.
                        </small>
                      </p>
                      <p className="ion-no-margin ion-padding-bottom">
                        <small>
                          The sfrxETH price increases daily with exchange rate reflecting staking rewards.
                        </small>
                      </p>
                      <p className="ion-no-margin ion-padding-bottom">
                        <small>
                          You can also use your sfrxETH to earn more yield on lendings market or swap back to ETH at any time without locking period.
                        </small>
                      </p>
                    </IonText>
                  </div>
                </HowItWork>

                <IonButton
                  onClick={async () => {
                    const chainId = currentNetwork;
                    await displayLoader();
                    if (chainId !== NETWORK.optimism) {
                      await switchNetwork(NETWORK.optimism);
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
                  fontSize: '2.4rem',
                  lineHeight: '1.85rem'
                }}>
                  <IonText className="ion-color-gradient-text">
                    {strategy.name}
                  </IonText>
                  <br />
                  <span style={{
                    marginBottom: '1.5rem',
                    fontSize: '1.4rem',
                    lineHeight: '1.15rem'
                  }}>{strategy.type}</span>
                </h1>
                <IonText color="medium">
                  <p>
                    By exchange ETH to sfrxETH you will incrase your ETH holdings balance by {baseAPY.toFixed(2)}% APY from staking liquidity on Fray finance.
                    Rewards are automated and paid out in ETH through daily exchange rate increases reflecting staking rewards.
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
                {/* <div className="ion-text-center">
                  <IonText color="primary">
                    <p style={{ margin: "0 0 1rem" }}>
                      <small>
                        {`1 sfrxETH = ~${
                          wstToEthAmount > 0 ? wstToEthAmount.toFixed(4) : 0
                        } ETH`}
                      </small>
                    </p>
                  </IonText>
                </div> */}
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
