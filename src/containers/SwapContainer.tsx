import { IonButton, IonCol, IonGrid, IonRow, IonText, useIonToast } from "@ionic/react";
import { HiddenUI, RouteExecutionUpdate, WidgetConfig, WidgetEvent, useWidgetEvents } from "@lifi/widget";
import type { Route } from '@lifi/sdk';
import { useEffect, useMemo } from "react";
import { useWeb3Provider } from "../context/Web3Context";
import { useLoader } from "../context/LoaderContext";
import { CHAIN_AVAILABLES, CHAIN_DEFAULT, NETWORK } from "../constants/chains";
import { ethers } from "ethers";
import { LiFiWidgetDynamic } from "../components/LiFiWidgetDynamic";
import { LIFI_CONFIG } from '../servcies/lifi.service';
// import { SquidWidgetDynamic } from "@/components/SquidWidgetDynamic";
import { SquidWidget } from "@0xsquid/widget";
import { SQUID_CONFIG } from '@/servcies/squid.service';
import { PointsData, addAddressPoints } from "@/servcies/datas.service";

export function SwapContainer() {
  const { web3Provider, currentNetwork, connectWallet, disconnectWallet, walletAddress, switchNetwork } = useWeb3Provider();
  const { display: displayLoader, hide: hideLoader } = useLoader();
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];


  const widgetEvents = useWidgetEvents();

  useEffect(() => {
    const onRouteExecutionStarted = (route: Route) => {
      console.log('[INFO] onRouteExecutionStarted fired.');
    };
    const onRouteExecutionCompleted = async (route: Route) => {
      console.log('[INFO] onRouteExecutionCompleted fired.', route);
      const data: PointsData = {
        route,
        actionType: 'swap'
      };
      if (!walletAddress) {
        return;
      }
      await addAddressPoints(walletAddress, data);
    };
    const onRouteExecutionFailed = (update: RouteExecutionUpdate) => {
      console.log('[INFO] onRouteExecutionFailed fired.', update);
    };
    
    widgetEvents.on(WidgetEvent.RouteExecutionStarted, onRouteExecutionStarted);
    widgetEvents.on(WidgetEvent.RouteExecutionCompleted, onRouteExecutionCompleted);
    widgetEvents.on(WidgetEvent.RouteExecutionFailed, onRouteExecutionFailed);
    
    return () => widgetEvents.all.clear();
  }, [widgetEvents]);

  // useEffect(() => {
  //   const fetchConfig = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://li.quest/v1/integrators/hexa-lite"
  //       );
  //       const {integratorId = null} = await (response.status === 200 ? response.json() : {});
  //       if (integratorId) {
  //         setLifiConfig({
  //           integrator: "hexa-lite",
  //           fee: 0.01,
  //         });
  //       } else {
  //         setLifiConfig({});
  //       }
  //     } catch (error) {
  //       console.error("fetchConfig:", error);
  //       setLifiConfig({});
  //     }
  //   };
  //   fetchConfig();
  // }, []);

  const setNetwort = async () => {
    await displayLoader();
    const isEVM = CHAIN_AVAILABLES.find((chain) => chain.id === currentNetwork)?.type === "evm";
    if (!isEVM) {
      console.log(`[INFO] Switch to ${NETWORK.optimism} network`);
      await switchNetwork(NETWORK.optimism);
    }
    await hideLoader();
  }

  let SwapComponent; 
  const chain = CHAIN_AVAILABLES.find((chain) => chain.id === currentNetwork);
  switch (true) {
    case chain?.type === "evm":{
      const signer = web3Provider instanceof ethers.providers.Web3Provider && walletAddress ? web3Provider?.getSigner() : undefined;
      // load environment config
      const widgetConfig: WidgetConfig = {
        ...LIFI_CONFIG,
        fee: 0, // set fee to 0 for main swap feature
        walletManagement: {
          connect: async () => {
            try {
              await displayLoader();
              await connectWallet();
              if (!(web3Provider instanceof ethers.providers.Web3Provider)) {
                  throw new Error('[ERROR] Only support ethers.providers.Web3Provider');
              } 
              const signer = web3Provider?.getSigner();
              console.log("signer", signer);
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
          signer,
        },
        // set source chain to Polygon
        fromChain: currentNetwork || CHAIN_DEFAULT.id,
        // set destination chain to Optimism
        toChain: currentNetwork || CHAIN_DEFAULT.id,
        // set source token to ETH (Ethereum)
        fromToken: "0x0000000000000000000000000000000000000000",
      };   
      SwapComponent = <LiFiWidgetDynamic config={widgetConfig} integrator="hexa-lite" />;
      break;
    }
    case chain?.type === 'cosmos': {
      SwapComponent = <SquidWidget config={{
        ...SQUID_CONFIG
      }} />;
      break;
    }
    default:
      SwapComponent = (<>
        <div className="ion-text-center">
          <IonText className="ion-text-center">
            <p>
              Exchange with {chain?.name} network is not supported yet.
            </p>
          </IonText>
          <IonButton 
            color="gradient"
            onClick={async()=> {
              await displayLoader();
              await switchNetwork(CHAIN_DEFAULT.id);
              await hideLoader();
            }}>
            Switch to EVM Network
          </IonButton>
        </div>
      </>
      );
      break;
  }

  // useEffect(()=> {
  //   setNetwort();
  // }, [currentNetwork]);

  return (
    <IonGrid class="ion-no-padding" style={{ marginBottom: "5rem" }}>
      <IonRow class="ion-justify-content-center ion-padding">
        <IonCol size="12" class="ion-text-center">
          <IonText>
            <h1>Exchange Assets</h1>
          </IonText>
          <IonText color="medium">
            <p
              style={{
                lineHeight: "1.5rem",
              }}
            >
              <span style={{ maxWidth: "650px", display: "inline-block" }}>
                Crosschain swap assets instantly at the best rates and lowest
                fees using AMM and DEX liquidity.
              </span>
            </p>
          </IonText>
        </IonCol>
      </IonRow>
      <IonRow class=" ion-padding">
        <IonCol size="12">
          <div
            style={{
              paddingTop: "1rem",
              paddingBottom: "10rem"
            }}
          >
            {SwapComponent}
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}
