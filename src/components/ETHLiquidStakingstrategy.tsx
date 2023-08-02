import { IonButton, IonCard, IonCol, IonGrid, IonImg, IonItem, IonLabel, IonRow, IonSkeletonText, IonSpinner, IonText } from "@ionic/react";
import { useUser } from "../context/UserContext";
import ConnectButton from "./ConnectButton";
import { useEffect, useRef, useState } from "react";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { getBaseAPRstETH } from "../servcies/lido.service";

export function ETHLiquidStakingstrategyCard() {
  const { user } = useUser();
  const [baseAPRstETH, setBaseAPRstETH] = useState(-1);

  const strategy = {
    name: "ETH Liquid Staking",
    type: 'staking',
    icon: getAssetIconUrl({symbol: 'ETH'}),
    apys: [baseAPRstETH.toFixed(2)],
    locktime: 0,
    providers: ['lido'],
    assets: ['WETH'],
    isStable: true,
    details:{
      description: `
        This strategy will swap your ETH for wstETH to earn ${baseAPRstETH.toFixed(2)}% APY revard from staking WETH on Lido.
      `
    },
  };
  const modal = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    const {signal, abort} = new AbortController()
    getBaseAPRstETH()
      .then(({apr}) => setBaseAPRstETH(() => apr));
    // return () => abort();
  }, []); 

  // UI Component utils
  const Loader = <IonSpinner name="dots" />;
  const CardButton = !user ? (
    <ConnectButton expand="block" />
  ) : (
    <IonButton
      onClick={() => 
        {
          modal.current?.present();
        }
      }
      expand="block"
      color="primary"
    >
      Start Earning
    </IonButton>
  );

  return (
    <IonCol size="auto">
      <IonCard style={{ maxWidth: 350 }}>
        <IonGrid>
          <IonRow class="ion-text-center ion-padding">
            <IonCol size="12" class="ion-padding">
              <IonImg
                style={{
                  padding: "0 2rem",
                  maxWidth: 200,
                  maxHeight: 200,
                  margin: "1rem auto 0",
                }}
                src={strategy.icon}
              />
            </IonCol>
            <IonCol size="12" class="ion-padding-top">
            <h1 className="ion-no-margin">
                <IonText color="primary">{strategy.name}</IonText>
                <br />
                <small>{strategy.type}</small>
              </h1>
            </IonCol>
          </IonRow>

          <IonRow class="ion-padding">
            <IonCol class="ion-padding">
              <IonItem
                style={{
                  "--background": "transparent",
                  "--inner-padding-end": "none",
                  "--padding-start": "none",
                }}
              >
                <IonLabel>
                  Assets
                </IonLabel>
                <div slot="end" style={{ display: "flex" }}>
                  {strategy.assets.map((symbol, index) => (
                    <IonImg
                      key={index}
                      style={{
                        width: 28,
                        height: 28
                      }}
                      src={getAssetIconUrl({ symbol })}
                      alt={symbol}
                    />
                  ))}
                </div>
              </IonItem>
              <IonItem
                lines="none"
                style={{
                  "--background": "transparent",
                  "--inner-padding-end": "none",
                  "--padding-start": "none",
                }}
              >
                <IonLabel>APY</IonLabel>
                {baseAPRstETH > 0 ? (
                  <IonText slot="end">{strategy.apys.map(a => (`${a}%`)).join(" - ")}</IonText>
                ) : (
                  <IonSkeletonText
                    animated
                    style={{ width: "6rem" }}
                    slot="end"
                  ></IonSkeletonText>
                )}
              </IonItem>
            </IonCol>
          </IonRow>
          
          <IonRow>
            <IonCol size="12" class="ion-padding-horizontal ion-padding-bottom">
              {CardButton}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCard>
    </IonCol>
  );
}