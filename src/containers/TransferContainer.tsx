import { IAsset } from "@/interfaces/asset.interface";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonPopover,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { chevronDown, close, scan } from "ionicons/icons";
import { SymbolIcon } from "../components/SymbolIcon";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "@/constants/chains";
import { getReadableAmount } from "@/utils/getReadableAmount";
import { InputInputEventDetail, IonInputCustomEvent } from "@ionic/core";
import { Html5Qrcode } from "html5-qrcode";

const isNumberKey = (evt: React.KeyboardEvent<HTMLIonInputElement>) => {
  var charCode = evt.which ? evt.which : evt.keyCode;
  return !(charCode > 31 && (charCode < 48 || charCode > 57));
};

const scanQrCode = async (html5QrcodeScanner: Html5Qrcode): Promise<string|undefined> => {
  try {
    const qrboxFunction = function(viewfinderWidth: number, viewfinderHeight: number) {
      // Square QR Box, with size = 80% of the min edge width.
      const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.8;
      return {
          width: size,
          height: size
      };
    };
    const cameras = await Html5Qrcode.getCameras();
    if (!cameras || cameras.length === 0) {
      throw new Error("No camera found");
    }

    // get prefered back camera if available or load the first one
    const cameraId = cameras.find((c) => c.label.includes("back"))?.id || cameras[0].id;
    console.log('>>', cameraId, cameras)
    // start scanner
    const config = { 
      fps: 10,
      qrbox: qrboxFunction,
      // Important notice: this is experimental feature, use it at your
      // own risk. See documentation in
      // mebjas@/html5-qrcode/src/experimental-features.ts
      experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
      },
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true
    };
    if (!cameraId) {
      throw new Error("No camera found");
    }
    // If you want to prefer front camera
    return new Promise((resolve, reject) => {
      html5QrcodeScanner.start(cameraId, config, (decodedText, decodedResult)=> {
        // stop reader
        html5QrcodeScanner.stop();
        // resolve promise with the decoded text
        resolve(decodedText);
      }, (error) =>{});
    });
  } catch (error: any) {
    throw new Error(error?.message || "BarcodeScanner not available");
  }
};

const ScanModal = (props: { isOpen: boolean, onDismiss: (address?: string) => void }) => {
  const [html5Qrcode, setHtml5Qrcode] = useState<typeof Html5Qrcode>();
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!props.isOpen) {
      return;
    }
    console.log('>>>>', elementRef.current)
    if (!elementRef.current) {
      return;
    }
    if (!html5Qrcode) {
      throw new Error("BarcodeScanner not available");
    }
    const scaner = new html5Qrcode('reader-scan-element')
    if (!scaner) {
      throw new Error("BarcodeScanner not loaded");
    }
    try {
      scanQrCode(scaner).then(
        result => {
          scaner.stop();
          props.onDismiss(result);
        }
      );
    } catch (error: any) {
      console.error(error);
      scaner.stop();
    }
  }, [elementRef.current, html5Qrcode, props.isOpen]);
  
  return (
    <IonModal 
      isOpen={props.isOpen} 
      onDidPresent={async () => {
        import("html5-qrcode").then(
          (m) => setHtml5Qrcode(()=> (m.Html5Qrcode))
        );
      }}
      onDidDismiss={()=> props.onDismiss()}>
      <IonContent className="ion-no-padding" style={{'--background': '#000'}}>

        <IonFab vertical="top" horizontal="end">
          <IonButton fill="clear" color="dark" shape="round" onClick={() => props.onDismiss()}>
            <IonIcon icon={close} />
          </IonButton>
        </IonFab>
        <div ref={elementRef} id="reader-scan-element" style={{ height: '100%', width: '100%'}} ></div>
      </IonContent>
    </IonModal>
  )
};

const InputAssetWithDropDown = (props: {
  assets: IAsset[];
  inputFromAmount: number;
  setInputFromAmount: Dispatch<SetStateAction<number>>;
}) => {
  const { assets, setInputFromAmount, inputFromAmount } = props;
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popover = useRef<HTMLIonPopoverElement>(null);

  const maxBalance = useMemo(() => {
    // round to the lower tenth
    return Math.floor(selectedAsset?.balance * 10000) / 10000;
  }, [selectedAsset]);

  const handleInputChange = async (
    e: IonInputCustomEvent<InputInputEventDetail>
  ) => {
    let value = Number((e.target as any).value || 0);
    if (maxBalance && value > maxBalance) {
      (e.target as any).value = maxBalance;
      value = maxBalance;
    }
    if (value <= 0) {
      setErrorMessage(() => undefined);
      // UI loader control
      setIsLoading(() => false);
      return;
    }
    setInputFromAmount(() => value);
    setErrorMessage(() => undefined);
    // UI loader control
    setIsLoading(() => false);
  };

  return (
    <IonItem
      lines="none"
      style={{
        "--background": "#0f1629",
        "--padding-start": "0.25rem",
        borderRadius: "24px",
        marginBottom: "0.5rem",
      }}
    >
      <div
        slot="start"
        style={{
          display: "flex",
          alignItems: "center",
        }}
        onClick={($event) => {
          $event.stopPropagation();
          // set position
          popover.current!.event = $event;
          // open popover
          setPopoverOpen(() => true);
        }}
      >
        <div
          id="select-from"
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            justifyContent: "flex-start",
            alignItems: "center",
            alignContent: "flex-start",
          }}
        >
          <IonIcon src={chevronDown} style={{ marginRight: "0.25rem" }} />
          <SymbolIcon
            symbol={selectedAsset?.symbol || ""}
            chainId={selectedAsset?.chain?.id || CHAIN_DEFAULT.id}
            iconSize="34px"
          />
        </div>

        <IonPopover
          ref={popover}
          isOpen={popoverOpen}
          onDidDismiss={() => setPopoverOpen(false)}
        >
          <IonContent className="ion-no-padding" style={{ maxHeight: "300px" }}>
            <IonListHeader>
              <IonText>
                <p>Available assets</p>
              </IonText>
            </IonListHeader>
            <IonList>
              {assets
                .filter((a) => a.balance > 0)
                .map((asset, index) => (
                  <IonItem
                    button
                    detail={false}
                    key={index}
                    onClick={() => {
                      setPopoverOpen(false);
                      setSelectedAsset(asset);
                      setInputFromAmount(() => 0);
                      setErrorMessage(() => undefined);
                      // setQuote(() => undefined);
                      console.log({ selectedAsset });
                    }}
                  >
                    <div slot="start" style={{ margin: "0 0.25rem 0 0" }}>
                      <SymbolIcon
                        symbol={asset.symbol}
                        chainId={asset.chain?.id}
                        iconSize="28px"
                      />
                    </div>
                    <IonLabel
                      style={{
                        marginLeft: "0.25rem",
                        lineHeight: "0.8rem",
                      }}
                    >
                      <IonText>{asset.symbol}</IonText>
                      <br />
                      <IonText color="medium">
                        <small>
                          {
                            CHAIN_AVAILABLES.find(
                              (c) => c.id === asset?.chain?.id
                            )?.name
                          }
                        </small>
                      </IonText>
                    </IonLabel>
                    <div slot="end" className="ion-text-end">
                      <IonText>{Number(asset?.balance).toFixed(6)}</IonText>
                      <br />
                      <IonText color="medium">
                        <small>
                          {getReadableAmount(
                            +asset?.balance,
                            Number(asset?.priceUsd),
                            "No deposit"
                          )}
                        </small>
                      </IonText>
                    </div>
                  </IonItem>
                ))}
            </IonList>
          </IonContent>
        </IonPopover>

        <div className="ion-padding" style={{ cursor: "pointer" }}>
          <IonText>
            <h3 style={{ margin: " 0" }}>{selectedAsset?.symbol}</h3>
          </IonText>
          <IonText
            color="medium"
            onClick={($event) => {
              $event.stopPropagation();
              setInputFromAmount(() => selectedAsset?.balance || 0);
            }}
          >
            <small style={{ margin: "0" }}>Max :{maxBalance}</small>
          </IonText>
        </div>
      </div>

      <div slot="end" className="ion-text-end">
        <IonInput
          style={{ fontSize: "1.5rem", minWidth: "100px" }}
          placeholder="0"
          type="number"
          max={maxBalance}
          min={0}
          debounce={1500}
          value={inputFromAmount}
          onKeyUp={(e) => {
            if (isNumberKey(e)) {
              setIsLoading(() => true);
            }
          }}
          onIonInput={(e) => handleInputChange(e)}
        />
      </div>
    </IonItem>
  );
};

export const TransferContainer = (props: {dismiss: () => Promise<void>;}) => {

  const { walletAddress, isMagicWallet, assets, loadAssets } = Store.useState(getWeb3State);
  const [inputFromAmount, setInputFromAmount] = useState<number>(0);
  const [inputToAddress, setInputToAddress] = useState<string|undefined>(undefined);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const isValid = inputFromAmount > 0 && inputToAddress && inputToAddress.length > 0;

  const handleSend = async () => {
    console.log(inputFromAmount, inputToAddress);
    // Todo...
    // finalize with reload asset list
    await loadAssets(true);
  }
  return (
    <>
      <IonHeader className="ion-no-border" translucent={true}>
        <IonToolbar style={{'--background': 'transparent'}}>
          <IonTitle>
            <h1>Send token</h1>
          </IonTitle>
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
      <IonContent className="mobileConentModal">
        <IonGrid className="ion-margin-top ion-padding">
          <IonRow className="ion-text-center">
            <IonCol size="12" className="ion-margin-top">
              <InputAssetWithDropDown
                assets={assets}
                inputFromAmount={inputFromAmount}
                setInputFromAmount={setInputFromAmount}

              />
            </IonCol>
            <IonCol size="12">
              <IonItem
                lines="none"
                style={{
                  "--background": "#0f1629",
                  "--padding-start": "1.5rem",
                  "--padding-bottom": "0.5rem",
                  "--padding-top": "0.25rem",
                  borderRadius: "24px",
                  alignItems: "center",
                  fontSize: "1.3rem",
                  marginBottom: "0.5rem",
                }}
              >
                <IonLabel position="stacked" color="medium">
                  Destination address
                </IonLabel>
                <IonInput 
                  type="text" 
                  clearInput={true} 
                  placeholder="0x..." 
                  value={inputToAddress}
                  onIonInput={($event)=> {
                    console.log($event)
                    setInputToAddress(() => ($event.detail.value|| undefined));
                  }} />
                <IonButton
                  fill="clear"
                  slot="end"
                  onClick={async () => {
                    setIsScanModalOpen(()=> true);
                  }}
                >
                  <IonIcon icon-only={true} icon={scan} />
                </IonButton>
              </IonItem>
              <ScanModal 
                isOpen={isScanModalOpen} 
                onDismiss={(data?: string) => {
                  if (data) {
                    setInputToAddress(() => data);
                  }
                  setIsScanModalOpen(() => false);
                }} />
            </IonCol>
            <IonCol size="12">
              <IonButton 
                expand="block"
                disabled={!isValid}
                onClick={async ($event)=> {
                  $event.currentTarget.disabled = true;
                  await handleSend().catch((err: any) => err);
                  $event.currentTarget.disabled = false;
                }}
                >Send</IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </>
    
  );
};
