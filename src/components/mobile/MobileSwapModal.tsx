import {
  IonCol,
  IonContent,
  IonGrid,
  IonRow,
  IonText,
  useIonToast,
} from "@ionic/react";
import {
  HiddenUI,
  RouteExecutionUpdate,
  WidgetConfig,
  WidgetEvent,
  useWidgetEvents,
} from "@lifi/widget";
import type { Route } from "@lifi/sdk";
import { useEffect } from "react";
import { PointsData, addAddressPoints } from "@/servcies/datas.service";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import { CHAIN_DEFAULT } from "@/constants/chains";
import { ethers } from "ethers";
import { LiFiWidgetDynamic } from "../LiFiWidgetDynamic";
import { useLoader } from "@/context/LoaderContext";
import { LIFI_CONFIG } from "../../servcies/lifi.service";
import { IAsset } from "@/interfaces/asset.interface";

export const MobileSwapModal = (props?: {
  name: string;
  symbol: string;
  priceUsd: number;
  balance: number;
  balanceUsd: number;
  thumbnail: string;
  assets: IAsset[];
}) => {
  const {
    web3Provider,
    currentNetwork,
    walletAddress,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = Store.useState(getWeb3State);
  const widgetEvents = useWidgetEvents();
  const { display: displayLoader, hide: hideLoader } = useLoader();
  const toastContext = useIonToast();
  const presentToast = toastContext[0];
  const dismissToast = toastContext[1];

  useEffect(() => {
    const onRouteExecutionStarted = (route: Route) => {
      console.log("[INFO] onRouteExecutionStarted fired.");
    };
    const onRouteExecutionCompleted = async (route: Route) => {
      console.log("[INFO] onRouteExecutionCompleted fired.", route);
      const data: PointsData = {
        route,
        actionType: "swap",
      };
      if (!walletAddress) {
        return;
      }
      await addAddressPoints(walletAddress, data);
    };
    const onRouteExecutionFailed = (update: RouteExecutionUpdate) => {
      console.log("[INFO] onRouteExecutionFailed fired.", update);
    };

    widgetEvents.on(WidgetEvent.RouteExecutionStarted, onRouteExecutionStarted);
    widgetEvents.on(
      WidgetEvent.RouteExecutionCompleted,
      onRouteExecutionCompleted
    );
    widgetEvents.on(WidgetEvent.RouteExecutionFailed, onRouteExecutionFailed);

    return () => widgetEvents.all.clear();
  }, [widgetEvents]);

  const signer =
    web3Provider instanceof ethers.providers.Web3Provider && walletAddress
      ? web3Provider?.getSigner()
      : undefined;
  // load environment config
  const widgetConfig: WidgetConfig = {
    ...LIFI_CONFIG,
    containerStyle: {
      border: `0px solid rgba(var(--ion-color-primary-rgb), 0.4);`,
    },
    hiddenUI: [
      ...(LIFI_CONFIG?.hiddenUI as any[]),
      HiddenUI.History,
      HiddenUI.WalletMenu,
      // HiddenUI.DrawerButton,
      // HiddenUI.DrawerCloseButton
    ],
    fee: 0, // set fee to 0 for main swap feature
    walletManagement: {
      connect: async () => {
        try {
          await displayLoader();
          await connectWallet();
          if (!(web3Provider instanceof ethers.providers.Web3Provider)) {
            throw new Error(
              "[ERROR] Only support ethers.providers.Web3Provider"
            );
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
    fromChain: props?.assets?.[0]?.chain?.id || CHAIN_DEFAULT.id,
    // set destination chain to Optimism
    toChain: currentNetwork || CHAIN_DEFAULT.id,
    // set source token to ETH (Ethereum)
    fromToken:
      props?.assets?.[0]?.contractAddress ||
      "0x0000000000000000000000000000000000000000",
  };

  return (
    <IonContent className="mobileConentModal ion-no-padding">
      <IonGrid className="ion-no-padding ion-margin-top">
        <IonRow className="ion-no-padding ion-margin-top">
          <IonCol size="12" className="ion-no-padding">
            <LiFiWidgetDynamic config={widgetConfig} integrator="hexa-lite" />
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};
