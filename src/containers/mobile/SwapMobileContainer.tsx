import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonText,
  IonToolbar,
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
import { LiFiWidgetDynamic } from "../../components/LiFiWidgetDynamic";
import { useLoader } from "@/context/LoaderContext";
import { LIFI_CONFIG } from "../../servcies/lifi.service";
import { IAsset } from "@/interfaces/asset.interface";
import { close } from "ionicons/icons";

export const SwapMobileContainer = (props: {
  token?: {
    name: string;
    symbol: string;
    priceUsd: number;
    balance: number;
    balanceUsd: number;
    thumbnail: string;
    assets: IAsset[];
  },
  dismiss: ()=> void;
}) => {
  const {
    signer,
    currentNetwork,
    walletAddress,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    loadAssets,
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
      await loadAssets(true);
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
          return error;
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
    fromChain: props?.token?.assets?.[0]?.chain?.id || CHAIN_DEFAULT.id,
    // set destination chain to Optimism
    toChain: currentNetwork || CHAIN_DEFAULT.id,
    // set source token to ETH (Ethereum)
    fromToken:
      props?.token?.assets?.[0]?.contractAddress ||
      "0x0000000000000000000000000000000000000000",
  };

  return (
    <>
      <IonHeader translucent={true} class="ion-no-border">
        <IonToolbar style={{ "--background": "transparent" }}>
          <IonButtons slot="end">
            <IonButton 
              fill="clear" 
              size="small"
              onClick={() => {
                props.dismiss();
              }}>
              <IonIcon icon={close} size="small" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="mobileConentModal ion-no-padding">
        <IonGrid className="ion-no-padding ion-margin-top">
          <IonRow className="ion-no-padding ion-margin-top">
            <IonCol size="12" className="ion-no-padding">
              <LiFiWidgetDynamic config={widgetConfig} integrator="hexa-lite" />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </>
  );
};
