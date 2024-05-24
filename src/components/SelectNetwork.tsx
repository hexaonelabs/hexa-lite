import React from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonText,
} from "@ionic/react";
import { closeSharp } from "ionicons/icons";
import { IChain } from "@/constants/chains";

interface SelectNetworkProps {
  chains: Pick<IChain, "id" | "name" | "type" | "logo">[];
  isExternalWallet: boolean;
  dismiss: (data?: any, role?: string | undefined) => void;
}

export const SelectNetwork: React.FC<SelectNetworkProps> = ({
  chains,
  isExternalWallet,
  dismiss,
}) => {
  return (
    <IonGrid className="ion-no-padding">
      <IonRow>
        <IonCol size="10" className="ion-padding-start">
          <h3 className="ion-padding-horizontal ion-padding-top">
            <b>Select network</b>
          </h3>
          {isExternalWallet && (
            <IonText color="medium">
              <p
                className="ion-no-margin ion-padding-horizontal ion-padding-bottom"
                style={{ marginTop: "-0.5rem" }}
              >
                <small>Use e-mail or social login to enable all chains</small>
              </p>
            </IonText>
          )}
        </IonCol>
        <IonCol size="2" class="ion-text-end">
          <IonButton
            size="small"
            fill="clear"
            style={{ position: "absolute", top: "0.5rem", right: "0rem" }}
            onClick={() => dismiss(null, "cancel")}
          >
            <IonIcon slot="icon-only" icon={closeSharp} />
          </IonButton>
        </IonCol>
        <IonCol size="12" class="ion-no-padding">
          <IonList
            style={{
              maxHeight: "200px",
              overflow: "scroll",
              background: "transparent",
            }}
          >
            {chains
              .sort((a, b) => (a.name > b.name ? 1 : -1))
              .map((chain, index) => (
                <IonItem
                  key={index}
                  lines="none"
                  button={true}
                  detail={false}
                  disabled={
                    isExternalWallet ? false : chain.type === "evm" ? false : true
                  }
                  style={{ "--background": "transparent" }}
                  onClick={() => dismiss(chain.id, "getAddressFromNetwork")}
                >
                  <IonAvatar slot="start">
                    <IonIcon
                      className="ion-padding-start"
                      style={{ fontSize: "1.5rem" }}
                      src={chain.logo}
                    ></IonIcon>
                  </IonAvatar>
                  <IonLabel>
                    <h2>{chain.name}</h2>
                  </IonLabel>
                </IonItem>
              ))}
          </IonList>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
