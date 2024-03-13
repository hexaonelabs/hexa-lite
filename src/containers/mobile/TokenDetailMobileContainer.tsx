import { IAsset } from "@/interfaces/asset.interface";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import { IonAvatar, IonButton, IonCol, IonContent, IonFooter, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonRow, IonText, IonToolbar } from "@ionic/react"
import { MobileActionNavButtons } from "../../components/mobile/ActionNavButtons";
import { Suspense, lazy, useEffect } from "react";
import { ethers } from "ethers";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import { CHAIN_AVAILABLES } from "@/constants/chains";
import { airplane, download, paperPlane } from "ionicons/icons";

const LightChart = lazy(() => import("@/components/ui/LightChart"));

const getTxsFromAddress = async (address: string) => {
  let provider = new ethers.providers.EtherscanProvider();
  let history = await provider.getHistory(address);
  console.log(history);
}
export const TokenDetailMobileContainer = (props: { 
  data: {name: string; symbol: string; priceUsd: number; balance: number; balanceUsd: number; thumbnail: string; assets: IAsset[]};
  dismiss: () => void;
  setState: (state: any) => void;
  setIsSwapModalOpen: (state: boolean) => void;
 })=> {
  const { data, dismiss } = props;
  const { walletAddress } = Store.useState(getWeb3State);

  useEffect(() => {
    if (!walletAddress) return;
    getTxsFromAddress(walletAddress);
  }, [walletAddress]);

  return (
    <>
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
                <p className="ion-no-margin" style={{fontSize: '1.2rem'}}>
                  $ {data.balanceUsd.toFixed(2)}
                </p>
              </IonText>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-top">
            <IonCol size="12" className="ion-text-center">
              <Suspense fallback={<>.....</>} >
                <LightChart data={[
                  { time: '2024-03-01', value: 80.01 },
                  { time: '2024-03-02', value: 96.63 },
                  { time: '2024-03-03', value: 76.64 },
                  { time: '2024-03-04', value: 81.89 },
                  { time: '2024-03-05', value: 74.43 },
                  { time: '2024-03-06', value: 80.01 },
                  { time: '2024-03-07', value: 96.63 },
                  { time: '2024-03-08', value: 76.64 },
                  { time: '2024-03-09', value: 81.89 },
                  { time: '2024-03-10', value: 74.43 },
                ]} />
                <IonText color="primary">
                  <p>
                    <span style={{fontSize: '0.8rem', display: 'block'}}>1 {data.symbol} = $ {data.priceUsd}</span>
                  </p>
                </IonText>
              </Suspense>
            </IonCol>
          </IonRow>

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
                  {data.assets
                    .sort((a, b) => a.chain && b.chain 
                      ? a.chain.id - b.chain.id
                      : a.balance + b.balance
                    )
                    .map((token, index) => 
                  <IonItem key={index} style={{
                    '--background': 'transparent',
                    '--padding-start': '0',
                  }}>
                    <IonAvatar slot="start" style={{ width: '24px', height: '24px'}}>
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
                      <p>{token.chain?.name}</p>
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

      <IonFooter style={{
        position: 'absolute',
        bottom: '0',
        width: '100%'
      }}>
        <IonToolbar style={{'--background': 'var(--ion-background-color)'}}>
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonButton 
                  expand="block" 
                  color="gradient" 
                  onClick={()=> {
                    props.setState({ isTransferModalOpen: true });
                  }} >
                    <IonIcon icon={paperPlane} slot="start" />
                    Send
                </IonButton>
              </IonCol>
              <IonCol size="6">
                <IonButton 
                  expand="block" 
                  color="gradient" 
                  onClick={()=> {
                    props.setState({ isDepositModalOpen: true });
                  }} >
                    <IonIcon icon={download} slot="start" />
                    Deposit
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>

        {/* <MobileActionNavButtons 
            setState={(state: any) => props.setState(state)}
            setIsSwapModalOpen={() => props.setIsSwapModalOpen(true)}
            hideEarnBtn={true} /> */}
        </IonToolbar>
      </IonFooter>
    </>
  );
}