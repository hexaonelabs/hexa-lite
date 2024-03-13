import {
  IonCol,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonRow,
  ModalOptions,
  useIonModal,
} from "@ionic/react";
import { HookOverlayOptions } from "@ionic/react/dist/types/hooks/HookOverlayOptions";
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
  setState: (state: any) => void;
  setIsSwapModalOpen: () => void;
}) => {
  const {
    hideEarnBtn = false,
    setState,
    setIsSwapModalOpen,
  } = props;

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
            onClick={() => setState({ isTransferModalOpen: true })}
          >
            <IonIcon icon={paperPlane} />
          </IonFabButton>
        </IonFab>
      </IonCol>

      <IonCol size="auto">
        <IonFab style={style.fab}>
          <IonFabButton
            color="gradient"
            onClick={() => setState({ isDepositModalOpen: true })}
          >
            <IonIcon icon={download} />
          </IonFabButton>
        </IonFab>
      </IonCol>

      <IonCol size="auto">
        <IonFab style={style.fab}>
          <IonFabButton
            color="gradient"
            onClick={() => setIsSwapModalOpen()}
          >
            <IonIcon icon={repeat} />
          </IonFabButton>
        </IonFab>
      </IonCol>

      {hideEarnBtn !== true && (
        <IonCol size="auto">
          <IonFab style={style.fab}>
            <IonFabButton
              color="gradient"
              onClick={() => {
                setState({ isEarnModalOpen: true });
              }}
            >
              <IonIcon src="./assets/icons/bank.svg" />
            </IonFabButton>
          </IonFab>
        </IonCol>
      )}
    </IonRow>
  );
};
