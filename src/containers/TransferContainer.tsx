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
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "@/constants/chains";
import { getReadableAmount } from "@/utils/getReadableAmount";
import { InputInputEventDetail, IonInputCustomEvent } from "@ionic/core";
import { Html5Qrcode } from "html5-qrcode";

const isNumberKey = (evt: React.KeyboardEvent<HTMLIonInputElement>) => {
  var charCode = evt.which ? evt.which : evt.keyCode;
  return !(charCode > 31 && (charCode < 48 || charCode > 57));
};

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
      cameras.find((c) => c.label.toLowerCase().includes("rear"))?.id || cameras[0].id;
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

const InputAssetWithDropDown = (props: {
  assets: IAsset[];
  inputFromAmount: number;
  setInputFromAmount: Dispatch<SetStateAction<number>>;
  setInputFromAsset: Dispatch<SetStateAction<IAsset | undefined>>;
}) => {
  const { assets, setInputFromAmount, inputFromAmount, setInputFromAsset } =
    props;
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  // const popover = useRef<HTMLIonPopoverElement>(null);

  useEffect(() => {
    if (selectedAsset) {
      setInputFromAsset(selectedAsset);
    }
    return () => {};
  });

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
    <>
      <IonGrid className="ion-no-padding">
        <IonRow         
          className="ion-align-items-center"
          style={{
            background: "#0f1629",
            padding: "0.65rem 0.5rem",
            borderRadius: "24px",
            marginBottom: "0.5rem",
          }}>
          <IonCol size="auto">
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
              onClick={($event) => {
                $event.stopPropagation();
                // set position
                // popover.current!.event = $event;
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
                  assetIconURL={
                    selectedAsset?.symbol === "ETH"
                      ? undefined
                      : selectedAsset.thumbnail
                  }
                  symbol={selectedAsset?.symbol || ""}
                  chainId={selectedAsset?.chain?.id || CHAIN_DEFAULT.id}
                  iconSize="34px"
                />
              </div>

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
                  <small style={{ margin: "0" }}>Max: {maxBalance}</small>
                </IonText>
              </div>
            </div>
          </IonCol>
          <IonCol>
            <div className="ion-text-end">
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
          </IonCol>
        </IonRow>
      </IonGrid>

      <IonModal
        isOpen={popoverOpen}
        onDidDismiss={() => setPopoverOpen(false)}
        className="modalAlert"
      >
        <IonListHeader>
          <IonText>
            <p>Available assets</p>
          </IonText>
        </IonListHeader>
        <IonList
          style={{ background: "transparent" }}
          className="ion-padding-bottom"
        >
          {assets
            .filter((a) => a.balance > 0)
            .map((asset, index) => (
              <IonItem
                button
                detail={false}
                key={index}
                style={{ "--background": "transparent" }}
                onClick={() => {
                  setPopoverOpen(() => false);
                  setSelectedAsset(asset);
                  setInputFromAsset(asset);
                  setInputFromAmount(() => 0);
                  setErrorMessage(() => undefined);
                  // setQuote(() => undefined);
                  console.log({ selectedAsset });
                }}
              >
                <div slot="start" style={{ margin: "0 0.25rem 0 0" }}>
                  <SymbolIcon
                    assetIconURL={
                      asset?.symbol === "ETH" ? undefined : asset.thumbnail
                    }
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
                        CHAIN_AVAILABLES.find((c) => c.id === asset?.chain?.id)
                          ?.name
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
      </IonModal>
    </>
  );
};

export const TransferContainer = (props: { dismiss: () => Promise<void> }) => {
  const {
    walletAddress,
    isMagicWallet,
    assets,
    loadAssets,
    transfer,
    switchNetwork,
    currentNetwork,
  } = Store.useState(getWeb3State);
  const [inputFromAmount, setInputFromAmount] = useState<number>(0);
  const [inputToAddress, setInputToAddress] = useState<string | undefined>(
    undefined
  );
  const [inputFromAsset, setInputFromAsset] = useState<IAsset | undefined>(
    undefined
  );
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValid =
    inputFromAmount > 0 &&
    inputToAddress &&
    inputToAddress.length > 0 &&
    inputFromAsset?.contractAddress;

  const handleSend = async () => {
    console.log("handleSend: ", {
      inputFromAmount,
      inputToAddress,
      inputFromAsset,
    });
    if (inputFromAmount && inputToAddress && inputFromAsset?.contractAddress) {
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
      // finalize with reload asset list
      await loadAssets(true);
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
        <IonGrid className="ion-margin-top ion-padding">
          <IonRow className="ion-text-center">
            <IonCol size="12" className="ion-margin-bottom">
              <IonText color="medium">
                <p className="ion-no-margin">
                  <small>Currently only support native token transfer</small>
                </p>
              </IonText>
            </IonCol>
            <IonCol size="12" className="ion-margin-top ion-text-start">
              <IonLabel
                color="medium"
                style={{ marginBottom: "0.5rem", display: "block" }}
              >
                <h4 className="ion-no-margin">Token</h4>
              </IonLabel>
              <InputAssetWithDropDown
                assets={assets.filter((a) => a.type === "NATIVE")}
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
                <h4 className="ion-no-margin">Destination address</h4>
              </IonLabel>
              <IonGrid className="ion-no-padding">
                <IonRow
                  className="ion-align-items-center"
                  style={{
                    background: "#0f1629",
                    padding: "0.65rem 0 0.65rem 0.5rem",
                    borderRadius: "24px",
                    marginBottom: "0.5rem",
                  }}
                >
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
            <IonCol size="12">
              <IonButton
                expand="block"
                disabled={!isValid || isLoading}
                onClick={async ($event) => {
                  setIsLoading(true);
                  await handleSend().catch((err: any) => err);
                  setIsLoading(false);
                }}
              >
                Send
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </>
  );
};
