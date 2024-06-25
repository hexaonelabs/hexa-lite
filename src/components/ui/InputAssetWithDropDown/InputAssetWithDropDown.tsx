import { SymbolIcon } from "@/components/SymbolIcon";
import { CHAIN_AVAILABLES, CHAIN_DEFAULT } from "@/constants/chains";
import { IAsset } from "@/interfaces/asset.interface";
import { getReadableAmount } from "@/utils/getReadableAmount";
import { InputInputEventDetail, IonInputCustomEvent } from "@ionic/core";
import { IonCol, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonRow, IonText } from "@ionic/react";
import { chevronDown } from "ionicons/icons";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

const isNumberKey = (evt: React.KeyboardEvent<HTMLIonInputElement>) => {
  var charCode = evt.which ? evt.which : evt.keyCode;
  return !(charCode > 31 && (charCode < 48 || charCode > 57));
};

export const InputAssetWithDropDown = (props: {
  assets: IAsset[];
  inputFromAmount: number;
  setInputFromAmount: Dispatch<SetStateAction<number>>;
  setInputFromAsset: Dispatch<SetStateAction<IAsset | undefined>>;
}) => {
  const { assets, setInputFromAmount, inputFromAmount, setInputFromAsset } =
    props;
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
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
    setInputFromAmount(() => value);
  };

  return (
    <>
      <IonGrid className="ion-no-padding InputAssetWithDropDown">
        <IonRow className="ion-align-items-center">
          <IonCol size="auto">
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
              onClick={($event) => {
                $event.stopPropagation();
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
                debounce={800}
                value={inputFromAmount}
                onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
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
                  console.log('[INFO] selectedAsset: ',{ selectedAsset });
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