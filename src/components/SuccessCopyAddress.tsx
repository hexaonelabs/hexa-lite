import React from "react";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonText,
  IonIcon,
} from "@ionic/react";
import { closeSharp, checkmarkCircleOutline } from "ionicons/icons";
import { IChain } from "@/constants/chains";

interface SuccessCopyAddressProps {
  walletAddress: string;
  chain: Pick<IChain, "id" | "name" | "type">;
  dismiss: (data?: any, role?: string | undefined) => void;
}

export const SuccessCopyAddress: React.FC<SuccessCopyAddressProps> = ({
  walletAddress,
  chain,
  dismiss,
}) => {
  return (
    <IonGrid>
      <IonRow>
        <IonCol className="ion-text-center ion-padding">
          <IonButton
            size="small"
            fill="clear"
            style={{ position: "absolute", top: "0.25rem", right: "0rem" }}
            onClick={() => dismiss(null, "cancel")}
          >
            <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
          </IonButton>
          <IonText>
            <IonIcon
              color="success"
              style={{
                display: "block",
                fontSize: "5rem",
                margin: "1rem auto",
              }}
              src={checkmarkCircleOutline}
            />
            <h3>Address Copied</h3>
          </IonText>
          <IonText color="medium">
            <p style={{ fontSize: "60%" }}>{walletAddress}</p>
          </IonText>
          <IonText>
            <p>
              Address successfuly copy to clipboard. Be careful, only transfer{" "}
              <b>{chain.name} Network</b> or{" "}
              <b>{chain.type.toLocaleUpperCase()}</b> tokens to this address.
            </p>
          </IonText>
          <IonButton
            color="gradient"
            fill="clear"
            expand="block"
            size="small"
            style={{ margin: "1.5rem auto 0.75rem" }}
            onClick={() => dismiss(null, "selectNetwork")}
          >
            Get address for other networks
          </IonButton>
          <IonButton
            color="gradient"
            fill="solid"
            expand="block"
            style={{ margin: "0rem auto 0" }}
            onClick={() => dismiss(null, "cancel")}
          >
            OK
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};
