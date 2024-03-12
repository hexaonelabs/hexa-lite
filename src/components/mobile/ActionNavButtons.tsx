import { IonCol, IonFab, IonFabButton, IonIcon, IonModal, IonRow, ModalOptions, useIonModal } from "@ionic/react";
import { MobileTransferModal } from "./MobileTransferModal";
import { IAsset } from "@/interfaces/asset.interface";
import { MobileDepositModal } from "./MobileDepositModal";
import { MobileSwapModal } from "./MobileSwapModal";
import { MobileTokenDetailModal } from "./MobileTokenDetailModal";
import { HookOverlayOptions } from "@ionic/react/dist/types/hooks/HookOverlayOptions";
import { useState } from "react";
import { MobileEarnModal } from "./MobileEarnModal";
import { paperPlane, download, repeat, card } from "ionicons/icons";

const style = {
  fullHeight: {
    height: "100%",
  },
  fab: {
    display: "contents",
  },
};

export const MobileActionNavButtons = (props: {
  hideEarnBtn?: boolean;
  selectedTokenDetail: {
    name: string;
    symbol: string;
    priceUsd: number;
    balance: number;
    balanceUsd: number;
    thumbnail: string;
    assets: IAsset[];
  }| null;

}) => {
  const { selectedTokenDetail, hideEarnBtn = false } = props;

  const [presentDeposit, dismissDeposit] = useIonModal(MobileDepositModal, {
    ...selectedTokenDetail,
  });
  const [presentSwap, dismissSwap] = useIonModal(MobileSwapModal, {
    ...selectedTokenDetail,
  });
  const [presentTokenDetail, dismissTokenDetail] = useIonModal(
    MobileTokenDetailModal,
    { ...selectedTokenDetail }
  );
  const [isEarnModalOpen, setIsEarnModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const modalOpts: Omit<ModalOptions, "component" | "componentProps"> &
    HookOverlayOptions = {
    initialBreakpoint: 0.98,
    breakpoints: [0, 0.98],
  };

  return (
    <IonRow className="ion-justify-content-evenly ion-padding-horizontal">
    <IonCol size="auto">
      <IonFab style={style.fab}>
        <IonFabButton
          color="gradient"
          onClick={() => setIsTransferModalOpen(true)}
        >
          <IonIcon icon={paperPlane} />
        </IonFabButton>
      </IonFab>
      <IonModal
        isOpen={isTransferModalOpen}
        breakpoints={modalOpts.breakpoints}
        initialBreakpoint={modalOpts.initialBreakpoint}
        onDidDismiss={() => setIsTransferModalOpen(() => false)}
        >
          <MobileTransferModal />
        </IonModal>
    </IonCol>
    <IonCol size="auto">
      <IonFab style={style.fab}>
        <IonFabButton
          color="gradient"
          onClick={() => presentDeposit(modalOpts)}
        >
          <IonIcon icon={download} />
        </IonFabButton>
      </IonFab>
    </IonCol>
    <IonCol size="auto">
      <IonFab style={style.fab}>
        <IonFabButton
          color="gradient"
          onClick={() => presentSwap(modalOpts)}
        >
          <IonIcon icon={repeat} />
        </IonFabButton>
      </IonFab>
    </IonCol>
    { hideEarnBtn !== true && (
      <IonCol size="auto">
        <IonFab style={style.fab}>
          <IonFabButton
            color="gradient"
            onClick={() => {
              setIsEarnModalOpen(() => true);
            }}
          >
            <IonIcon src="./assets/icons/bank.svg" />
          </IonFabButton>
        </IonFab>
        <IonModal
          isOpen={isEarnModalOpen}
          breakpoints={modalOpts.breakpoints}
          initialBreakpoint={modalOpts.initialBreakpoint}
          onDidDismiss={() => setIsEarnModalOpen(() => false)}
        >
          <MobileEarnModal />
        </IonModal>
      </IonCol>

    )}
  </IonRow>
  );
}