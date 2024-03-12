import { IAsset } from "@/interfaces/asset.interface";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import { IonAvatar, IonCol, IonContent, IonGrid, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonRow, IonText } from "@ionic/react"
import { MobileActionNavButtons } from "./ActionNavButtons";
import { useEffect } from "react";
import { ethers } from "ethers";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import { CHAIN_AVAILABLES } from "@/constants/chains";

const getTxsFromAddress = async (address: string) => {
  let provider = new ethers.providers.EtherscanProvider();
  let history = await provider.getHistory(address);
  console.log(history);
}
export const MobileTokenDetailModal = (props: { 
  data: {name: string; symbol: string; priceUsd: number; balance: number; balanceUsd: number; thumbnail: string; assets: IAsset[]};
  dismiss: () => void;
 })=> {
  const { data, dismiss } = props;
  const { walletAddress } = Store.useState(getWeb3State);

  useEffect(() => {
    if (!walletAddress) return;
    getTxsFromAddress(walletAddress);
  }, [walletAddress]);

  return (
    <IonContent className="mobileConentModal">
      <IonGrid>
        <IonRow className="ion-text-center ion-margin-bottom">
          <IonCol size="12" className="ion-margin-vertical ion-padding-top">
            <IonAvatar
              style={{
                margin: '2rem auto 0',
                overflow: "hidden",
                width: "112px",
                height: "112px",
              }}
            >
              <img
                src={getAssetIconUrl({
                  symbol: data.symbol,
                })}
                alt={data.symbol}
                style={{ transform: "scale(1.01)" }}
                onError={(event) => {
                  (
                    event.target as any
                  ).src = `https://images.placeholders.dev/?width=42&height=42&text=${data.symbol}&bgColor=%23000000&textColor=%23182449`;
                }}
              />
            </IonAvatar>
            <IonText>
              <h1>
                {data.balance.toFixed(6)} {data.symbol}
              </h1>
            </IonText>
            <IonText color="medium">
              <p className="ion-no-margin">
                $ {data.balanceUsd.toFixed(2)}
              </p>
            </IonText>
          </IonCol>
        </IonRow>
        <MobileActionNavButtons selectedTokenDetail={data} hideEarnBtn={true} />
        <IonRow className="ion-margin-top">
          <IonCol size="12">
              <IonList style={{
                background: 'transparent'
              }}>
                <IonListHeader className="ion-no-padding">
                  <IonLabel color="medium">
                    <h2>Networks</h2>
                  </IonLabel>
                </IonListHeader>
                {data.assets.map((token, index) => 
                <IonItem key={index} style={{
                  '--background': 'transparent',
                  '--padding-start': '0',
                }}>
                  <IonAvatar slot="start">
                    <img
                      src={CHAIN_AVAILABLES.find((c) => c.id === token.chain?.id)?.logo}
                      alt={token.symbol}
                      style={{ transform: "scale(1.01)"}}
                      onError={(event) => {
                        (
                          event.target as any
                        ).src = `https://images.placeholders.dev/?width=42&height=42&text=${token.symbol}&bgColor=%23000000&textColor=%23182449`;
                      }}
                    />
                  </IonAvatar>
                  <IonLabel>
                    <h2>{token.chain?.name}</h2>
                  </IonLabel>
                  <IonNote slot="end" color="gradient" className="ion-text-end">
                    <p>
                      {token.balance.toFixed(6)} {token.symbol}<br/>
                      <IonText color="medium">
                        <small>$ {token.balanceUsd.toFixed(2)}</small>
                      </IonText>
                    </p>
                  </IonNote>
                </IonItem>
                )}
              </IonList>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
}