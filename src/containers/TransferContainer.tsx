import { IAsset } from "@/interfaces/asset.interface";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonModal,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";

import { useEffect, useRef, useState } from "react";

import { Html5Qrcode } from "html5-qrcode";
import { CheckIcon } from "@/components/ui/CheckIcon/CheckIcon";
import { CrossIcon } from "@/components/ui/CrossIcon/CrossIcon";
import { close, scan } from "ionicons/icons";
import { InputAssetWithDropDown } from "@/components/ui/InputAssetWithDropDown/InputAssetWithDropDown";
import { WarningBox } from "@/components/WarningBox";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";

const scanQrCode = async (
  html5QrcodeScanner: Html5Qrcode
): Promise<string | undefined> => {
  try {
    const qrboxFunction = function (
      viewfinderWidth: number,
      viewfinderHeight: number
    ) {
      // Square QR Box, with size = 80% of the min edge width.
      const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.8;
      return {
        width: size,
        height: size,
      };
    };
    const cameras = await Html5Qrcode.getCameras();
    if (!cameras || cameras.length === 0) {
      throw new Error("No camera found");
    }

    // get prefered back camera if available or load the first one
    const cameraId =
      cameras.find((c) => c.label.toLowerCase().includes("rear"))?.id ||
      cameras[0].id;
    console.log(">>", cameraId, cameras);
    // start scanner
    const config = {
      fps: 10,
      qrbox: qrboxFunction,
      // Important notice: this is experimental feature, use it at your
      // own risk. See documentation in
      // mebjas@/html5-qrcode/src/experimental-features.ts
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    };
    if (!cameraId) {
      throw new Error("No camera found");
    }
    // If you want to prefer front camera
    return new Promise((resolve, reject) => {
      html5QrcodeScanner.start(
        cameraId,
        config,
        (decodedText, decodedResult) => {
          // stop reader
          html5QrcodeScanner.stop();
          // resolve promise with the decoded text
          resolve(decodedText);
        },
        (error) => {}
      );
    });
  } catch (error: any) {
    throw new Error(error?.message || "BarcodeScanner not available");
  }
};

const ScanModal = (props: {
  isOpen: boolean;
  onDismiss: (address?: string) => void;
}) => {
  const [html5Qrcode, setHtml5Qrcode] = useState<typeof Html5Qrcode>();
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!props.isOpen) {
      return;
    }
    console.log(">>>>", elementRef.current);
    if (!elementRef.current) {
      return;
    }
    if (!html5Qrcode) {
      throw new Error("BarcodeScanner not available");
    }
    const scaner = new html5Qrcode("reader-scan-element");
    if (!scaner) {
      throw new Error("BarcodeScanner not loaded");
    }
    try {
      scanQrCode(scaner).then((result) => {
        scaner.stop();
        props.onDismiss(result);
      });
    } catch (error: any) {
      console.error(error);
      scaner.stop();
    }
    return () => {
      scaner.stop();
    };
  }, [elementRef.current, html5Qrcode, props.isOpen]);

  return (
    <IonModal
      isOpen={props.isOpen}
      onDidPresent={async () => {
        import("html5-qrcode").then((m) => setHtml5Qrcode(() => m.Html5Qrcode));
      }}
      onDidDismiss={() => props.onDismiss()}
    >
      <IonContent className="ion-no-padding" style={{ "--background": "#000" }}>
        <IonFab vertical="top" horizontal="end">
          <IonButton
            fill="clear"
            color="dark"
            shape="round"
            onClick={() => props.onDismiss()}
          >
            <IonIcon icon={close} />
          </IonButton>
        </IonFab>
        <div
          ref={elementRef}
          id="reader-scan-element"
          style={{ height: "100%", width: "100%" }}
        ></div>
      </IonContent>
    </IonModal>
  );
};

export const TransferContainer = (props: { dismiss: () => Promise<void> }) => {
  const { assets, loadAssets, transfer, switchNetwork, currentNetwork } =
    Store.useState(getWeb3State);
  const [inputFromAmount, setInputFromAmount] = useState<number>(0);
  const [inputToAddress, setInputToAddress] = useState<string | undefined>(
    undefined
  );
  const [inputFromAsset, setInputFromAsset] = useState<IAsset | undefined>(
    undefined
  );
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<undefined | boolean>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [openConfirm, closeConfirm] = useIonAlert()

  const isValid =
    inputFromAmount > 0 && 
    inputFromAmount <= (inputFromAsset?.balance || 0) &&
    inputToAddress &&
    inputToAddress.length > 0 &&
    inputFromAsset?.contractAddress;

  const handleSend = async () => {
    console.log("[INFO] handleSend: ", {
      inputFromAmount,
      inputToAddress,
      inputFromAsset,
    });
    const {detail: {role}}: CustomEvent<OverlayEventDetail<any>> = await new Promise(resolve => {
      openConfirm({
        header: 'Confirm',
        message: `
          You are about to send ${inputFromAmount} ${inputFromAsset?.symbol} to the EVM ${inputFromAsset?.chain?.name} network address ${inputToAddress}. 
        `,
        buttons: [
          {
            text: 'cancel',
            role: 'cancel',
            cssClass: 'danger'
          },
          {
            text: 'OK',
            role: 'ok'
          }
        ],
        onDidDismiss: ($event)=> {
          resolve($event);
        }
      });

    });
    if (role !== 'ok') {
      return;
    }
    if (inputFromAmount && inputToAddress && inputFromAsset?.contractAddress) {
      try {
        if (
          inputFromAsset?.chain?.id &&
          inputFromAsset?.chain?.id !== currentNetwork
        ) {
          await switchNetwork(inputFromAsset?.chain?.id);
        }
        await transfer({
          inputFromAmount,
          inputToAddress,
          inputFromAsset: inputFromAsset.contractAddress,
        });
        // toggle state
        setIsSuccess(true);
        setIsLoading(false);
        setErrorMessage(undefined);
        await Promise.all([
          // ensure waiting to display check animation
          new Promise((resolve) => setTimeout(resolve, 3000)),
          // finalize with reload asset list
          loadAssets(true),
        ]);
        // close modal
        props.dismiss();
      } catch (error: any) {
        // toggle state
        setIsSuccess(false);
        setIsLoading(false);
        setErrorMessage(error?.message || "Error while transfer token");
      }
    }
  };

  return (
    <>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar style={{ "--background": "transparent" }}>
          <IonTitle>
            <h1>Send token</h1>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              size="small"
              onClick={() => {
                props.dismiss();
              }}
            >
              <IonIcon icon={close} size="small" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="mobileConentModal">
        <IonGrid
          className="ion-margin-top ion-padding"
          style={{ height: "100%" }}
        >
          {isSuccess === undefined && (
            <>
              <IonRow className="ion-text-center ion-align-items-center">
                <IonCol size="12" className="ion-margin-top ion-text-start">
                  <IonLabel
                    color="medium"
                    style={{ marginBottom: "0.5rem", display: "block" }}
                  >
                    <h4 className="ion-no-margin">Token</h4>
                  </IonLabel>
                  <InputAssetWithDropDown
                    assets={assets.filter((a) => a.balance > 0)}
                    inputFromAmount={inputFromAmount}
                    setInputFromAmount={setInputFromAmount}
                    setInputFromAsset={setInputFromAsset}
                  />
                </IonCol>
                <IonCol size="12" className="ion-text-start ion-margin-top">
                  <IonLabel
                    color="medium"
                    style={{ marginBottom: "0.5rem", display: "block" }}
                  >
                    <h4 className="ion-no-margin">EVM Destination address</h4>
                  </IonLabel>
                  <IonGrid className="ion-no-padding itemInputContainter">
                    <IonRow className="ion-align-items-center">
                      <IonCol>
                        <IonInput
                          type="text"
                          clearInput={true}
                          placeholder="0x..."
                          value={inputToAddress}
                          onIonInput={($event) => {
                            setInputToAddress(
                              () => $event.detail.value || undefined
                            );
                          }}
                        />
                      </IonCol>
                      <IonCol size="auto" className="ion-text-end">
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={async () => {
                            setIsScanModalOpen(() => true);
                          }}
                        >
                          <IonIcon icon-only={true} icon={scan} />
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                  <ScanModal
                    isOpen={isScanModalOpen}
                    onDismiss={(data?: string) => {
                      if (data) {
                        setInputToAddress(() => data);
                      }
                      setIsScanModalOpen(() => false);
                    }}
                  />
                </IonCol>
              </IonRow>
            </>
          )}

          {isSuccess === true && (
            <>
              <IonRow
                className="ion-text-center ion-align-items-center"
                style={{ height: "100%" }}
              >
                <IonCol size="12" className="ion-margin-vertical">
                  <CheckIcon message="Transaction completed with success" />
                </IonCol>
              </IonRow>
            </>
          )}

          {isSuccess === false && errorMessage && (
            <>
              <IonRow
                className="ion-text-center ion-align-items-center"
                style={{ height: "100%" }}
              >
                <IonCol size="12" className="ion-margin-vertical">
                  <CrossIcon message={errorMessage} />
                </IonCol>
              </IonRow>
            </>
          )}

          {inputFromAmount > (inputFromAsset?.balance || 0) && (
            <>
              <IonRow
                className="ion-text-center ion-align-items-center"
              >
                <IonCol size="12">
                  <WarningBox>
                    <p>
                      You don't have enough funds to complete the transaction.
                    </p>
                  </WarningBox>
                </IonCol>
              </IonRow>
            </>
          )}
        </IonGrid>
      </IonContent>
      <IonFooter>
        <IonToolbar style={{ "--background": "transparent" }}>
          {isSuccess === false && (
            <IonButton
              expand="block"
              onClick={async ($event) => {
                props.dismiss()
              }}
          >Cancel and retry</IonButton>
          )}

          {isSuccess === undefined && (
            <>
              <IonButton
                expand="block"
                disabled={!isValid || isLoading}
                onClick={async ($event) => {
                  setIsLoading(true);
                  await handleSend().catch((err: any) => err);
                  setIsLoading(false);
                }}
              >
                {isLoading === true ? (
                  <>
                    <IonSpinner className="ion-margin-end" /> Waiting
                    confirmation
                  </>
                ) : (
                  "Send"
                )}
              </IonButton>
            </>
          )}
          {isSuccess === true && (
            <>
              <IonButton
                expand="block"
                disabled={!isSuccess}
                onClick={async ($event) => {
                  props.dismiss();
                }}
              >
                OK
              </IonButton>
            </>
          )}
        </IonToolbar>
      </IonFooter>
    </>
  );
};
