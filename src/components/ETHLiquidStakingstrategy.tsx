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
import { ethers } from "ethers";
import {
  informationCircleOutline,
  closeSharp,
  openOutline,
  warningOutline,
  helpOutline,
} from "ionicons/icons";
import ConnectButton from "./ConnectButton";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { getBaseAPRstETH, getETHByWstETH } from "../servcies/lido.service";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useWeb3Provider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";
import { CHAIN_AVAILABLES, NETWORK } from "../constants/chains";
import { HowItWork } from "./HowItWork";
import { ApyDetail } from "./ApyDetail";
import { HiddenUI, LiFiWidget, WidgetConfig } from "@lifi/widget";

export interface IStrategyModalProps {
  dismiss?: (
    data?: any,
    role?: string | undefined
  ) => Promise<boolean> | undefined;
}

export function ETHLiquidStakingstrategyCard(props: { asImage?: boolean }) {
  const { web3Provider, switchNetwork, connectWallet, disconnectWallet, currentNetwork } = useWeb3Provider();
  const [baseAPRstETH, setBaseAPRstETH] = useState(-1);
  const [wstToEthAmount, setWstToEthAmount] = useState(-1);
  const { display: displayLoader, hide: hideLoader } = useLoader();  
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];

  const strategy = {
    name: "ETH",
    type: "Liquid staking",
    icon: getAssetIconUrl({ symbol: "ETH" }),
    apys: [baseAPRstETH.toFixed(2)],
    locktime: 0,
    providers: ["lido"],
    assets: ["WETH", "wstETH"],
    isStable: true,
    chainsId: [NETWORK.optimism],
    details: {
      description: `
        This strategy will swap your ETH for wstETH to earn ${baseAPRstETH.toFixed(
          2
        )}% APY revard from staking WETH on Lido.
      `,
    },
  };
  const modal = useRef<HTMLIonModalElement>(null);
  // load environment config
  const widgetConfig = useMemo((): WidgetConfig => {
    return {

      integrator: "hexa-lite",
      fee: 0.005,
      variant: "expandable",
      insurance: true,
      containerStyle: {
        border: `1px solid rgba(var(--ion-color-primary-rgb), 0.4);`,
        borderRadius: "32px",
      },
      theme: {
        shape: {
          borderRadius: 12,
          borderRadiusSecondary: 24,
        },
        palette: {
          background: {
            paper: "#1c2b42", //"rgb(39 39 71 / 80%)", // green
            // default: '#272747',
          },
          primary: {
            main: "#428cff",
            contrastText: "#fff",
          },
          secondary: {
            main: "#0cceea",
            contrastText: "#fff",
          },
        },
      },
      languages: {
        default: "en",
      },
      appearance: "dark",
      hiddenUI: [HiddenUI.Appearance, HiddenUI.PoweredBy, HiddenUI.Language],
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
              message: `[ERROR] Connect Failed with reason: ${
                error?.message || error
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
              message: `[ERROR] Disconnect Failed with reason: ${
                error?.message || error
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
        signer: web3Provider instanceof ethers.providers.Web3Provider ?  web3Provider?.getSigner() : undefined,
      },
      // set source chain to Polygon
      fromChain: NETWORK.optimism,
      // set destination chain to Optimism
      toChain: NETWORK.optimism,
      // set source token to ETH (Optimism)
      fromToken: "0x0000000000000000000000000000000000000000",
      // set source token to wstETH (Optimism)
      toToken: "0x1f32b1c2345538c0c6f582fcb022739c4a194ebb",
      // fromAmount: 10,
      chains: {
        allow: [NETWORK.optimism],
      },
      tokens: {
        allow: [
          {
            chainId: Number(NETWORK.optimism),
            address: "0x0000000000000000000000000000000000000000",
          },
          {
            chainId: Number(NETWORK.optimism),
            address: "0x1f32b1c2345538c0c6f582fcb022739c4a194ebb",
          },
        ],
      },
      disabledUI: ["fromToken", "toToken"],
    }
  }
  , [web3Provider instanceof ethers.providers.Web3Provider ? web3Provider.getSigner(): null]);

  useEffect(() => {
    const { signal, abort } = new AbortController();
    getBaseAPRstETH().then(({ apr }) => setBaseAPRstETH(() => apr));
    // return () => abort();
  }, []);
  useEffect(() => {
    if (!web3Provider) {
      return;
    }
    getETHByWstETH(1).then((value) => {
      setWstToEthAmount(() => Number(value));
    });
  }, [web3Provider]);

  return (
    <>
      <IonCard 
         className={props.asImage ? "asImage" : "strategyCard"} 
         style={{ width: 300 }}>
        <IonGrid style={{ width: "100%" }}>
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
                            Base APY <small>(stETH)</small>
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
                    <h4>Staking ETH with Lido</h4>
                    <p className="ion-no-margin ion-padding-bottom">
                      <small>
                        By swapping your ETH for wstETH, you will increase your ETH holdings 
                        by {baseAPRstETH.toFixed(2)}% APY using ETH staking with{" "}
                        <a
                          href="https://lido.fi/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lido finance
                        </a>.
                      </small>
                    </p>
                    <p className="ion-no-margin ion-padding-bottom">
                      <small>
                        The wstETH price increases daily with exchange rate reflecting staking rewards.
                      </small>
                    </p>
                    <p className="ion-no-margin ion-padding-bottom">
                      <small>
                        You can also use your wstETH to earn more yield on lendings market or swap back to ETH at any time without locking period.
                      </small>
                    </p>
                  </IonText>
                </div>
              </HowItWork>

              <IonButton
                onClick={async () => {
                  const chainId = currentNetwork;
                  if (chainId !== NETWORK.optimism) {
                    await switchNetwork(NETWORK.optimism);
                  }
                  modal.current?.present();
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
                  fontSize: '2.4rem',
                  lineHeight: '1.85rem'}}>
                  <IonText className="ion-color-gradient-text">
                    {strategy.name}
                  </IonText>
                  <br />
                  <span style={{
                  marginBottom: '1.5rem',
                  fontSize: '1.4rem',
                  lineHeight: '1.15rem'}}>{strategy.type}</span>
                </h1>
                <IonText color="medium">
                  <p>
                    By exchange ETH to wstETH you will incrase your ETH holdings balance by {baseAPRstETH.toFixed(2)}% APY from staking liquidity on Lido finance. 
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
              }}
            >
              <IonCol>
                {/* <div className="ion-text-center">
                  <IonText color="primary">
                    <p style={{ margin: "0 0 1rem" }}>
                      <small>
                        {`1 wstETH = ~${
                          wstToEthAmount > 0 ? wstToEthAmount.toFixed(4) : 0
                        } ETH`}
                      </small>
                    </p>
                  </IonText>
                </div> */}
                <LiFiWidget config={widgetConfig} integrator="hexa-lite" />
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
