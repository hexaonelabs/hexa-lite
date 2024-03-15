import { IAsset } from "@/interfaces/asset.interface";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonChip,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { MobileActionNavButtons } from "../../components/mobile/ActionNavButtons";
import { Suspense, lazy, useEffect, useState } from "react";
import { ethers } from "ethers";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import { CHAIN_AVAILABLES } from "@/constants/chains";
import { airplane, download, paperPlane } from "ionicons/icons";
import { DataItem } from "@/components/ui/LightChart";
import { getTokenHistoryPrice } from "@/utils/getTokenHistoryPrice";
import { TokenInfo, getTokenInfo } from "@/utils/getTokenInfo";

const LightChart = lazy(() => import("@/components/ui/LightChart"));

const getTxsFromAddress = async (address: string) => {
  let provider = new ethers.providers.EtherscanProvider();
  let history = await provider.getHistory(address);
  console.log(history);
};

export const TokenDetailMobileContainer = (props: {
  data: {
    name: string;
    symbol: string;
    priceUsd: number;
    balance: number;
    balanceUsd: number;
    thumbnail: string;
    assets: IAsset[];
  };
  dismiss: () => void;
  setState: (state: any) => void;
  setIsSwapModalOpen: (state: boolean) => void;
}) => {
  const { data, dismiss } = props;
  const { walletAddress } = Store.useState(getWeb3State);
  const [dataChartHistory, setDataChartHistory] = useState<DataItem[]>([]);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | undefined>(undefined);

  useEffect(() => {
    if (!walletAddress) return;
    getTxsFromAddress(walletAddress);
    getTokenHistoryPrice(props.data.symbol).then((prices) => {
      const data: DataItem[] = prices.map(([time, value]: string[]) => {
        const dataItem = {
          time: new Date(time).toISOString().split("T").shift() || "",
          value: Number(value),
        };
        return dataItem;
      });
      setDataChartHistory(() => data.slice(0, data.length - 1));
    });
    getTokenInfo(props.data.symbol).then((tokenInfo) =>
      setTokenInfo(() => tokenInfo)
    );
  }, [walletAddress]);

  return (
    <>
      <IonHeader translucent={true}>
        <IonToolbar
          style={{
            "--background": "transparent",
            minHeight: "85px",
            display: "flex",
          }}
        >
          <IonTitle style={{ fontSize: "1.8rem", padding: "0" }}>
            {data.symbol}
            <small
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: "normal",
              }}
            >
              $ {data.balanceUsd.toFixed(2)}
            </small>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent 
        className="mobileConentModal ion-no-padding"
        fullscreen={true}
        style={{ "--padding-top": "0px" }}
        >
        <IonHeader collapse="condense">
          <IonToolbar style={{ "--background": "transparent" }}>
            <IonGrid class="ion-no-padding">
              <IonRow className="ion-text-center ion-margin-bottom">
                <IonCol
                  size="12"
                  className="ion-no-vertical"
                >
                  <IonAvatar
                    style={{
                      margin: "2rem auto 0",
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
                    <p className="ion-no-margin" style={{ fontSize: "1.2rem" }}>
                      $ {data.balanceUsd.toFixed(2)}
                    </p>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonToolbar>
        </IonHeader>

        <IonGrid style={{ paddingBottom: "200px" }}>
          <IonRow className="ion-margin-top">
            <IonCol size="12" className="ion-text-center">
              <Suspense fallback={<>.....</>}>
                <LightChart data={dataChartHistory} />
                <IonBadge color="primary" >
                    <span style={{ fontSize: "0.8rem", display: "block", padding: '0.2rem' }}>
                      1{' '}{data.symbol} = $ {data.priceUsd.toFixed(2)}
                    </span>
                </IonBadge>
              </Suspense>
            </IonCol>
          </IonRow>

          <IonRow className="ion-margin-top">
            <IonCol size="12">
              <IonList
                style={{
                  background: "transparent",
                }}
              >
                <IonListHeader className="ion-no-padding">
                  <IonLabel>
                    <h2>Networks</h2>
                  </IonLabel>
                </IonListHeader>
                {data.assets
                  .sort((a, b) =>
                    a.chain && b.chain
                      ? a.chain.id - b.chain.id
                      : a.balance + b.balance
                  )
                  .map((token, index) => (
                    <IonItem
                      key={index}
                      style={{
                        "--background": "transparent",
                        "--padding-start": "0",
                      }}
                    >
                      <IonAvatar
                        slot="start"
                        style={{ width: "24px", height: "24px" }}
                      >
                        <img
                          src={
                            CHAIN_AVAILABLES.find(
                              (c) => c.id === token.chain?.id
                            )?.logo
                          }
                          alt={token.symbol}
                          style={{ transform: "scale(1.01)" }}
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
                      <IonNote
                        slot="end"
                        color="gradient"
                        className="ion-text-end ion-padding-vertical"
                      >
                        {token.balance.toFixed(6)} {token.symbol}
                        <br />
                        <IonText color="medium">
                          <small>$ {token.balanceUsd.toFixed(2)}</small>
                        </IonText>
                      </IonNote>
                    </IonItem>
                  ))}
              </IonList>
            </IonCol>
          </IonRow>

          <IonRow>
            {tokenInfo && (
              <IonCol size="12">
                <IonList
                  style={{
                    background: "transparent",
                  }}
                >
                  <IonListHeader className="ion-no-padding">
                    <IonLabel>
                      <h2>Market details</h2>
                    </IonLabel>
                  </IonListHeader>
                  <IonItem
                    style={{
                      "--background": "transparent",
                      "--padding-start": "0",
                    }}
                  >
                    <IonLabel color="medium">Categories</IonLabel>
                    {tokenInfo.categories.map((categorie) => (
                      <IonChip>{categorie}</IonChip>
                    ))}
                  </IonItem>
                  {tokenInfo.market_data.market_cap.usd && (
                    <IonItem
                      style={{
                        "--background": "transparent",
                        "--padding-start": "0",
                      }}
                    >
                      <IonLabel color="medium">Market Cap.</IonLabel>
                      <IonNote
                        slot="end"
                        color="dark"
                        className="ion-text-end ion-padding-vertical"
                      >
                        ${tokenInfo.market_data.market_cap.usd.toFixed(0)}
                      </IonNote>
                    </IonItem>
                  )}
                  { tokenInfo.market_data.fully_diluted_valuation.usd && (
                    <IonItem
                      style={{
                        "--background": "transparent",
                        "--padding-start": "0",
                      }}
                    >
                      <IonLabel color="medium">Fully Diluted Valuation</IonLabel>
                      <IonNote
                        slot="end"
                        color="dark"
                        className="ion-text-end ion-padding-vertical"
                      >
                        $
                        {tokenInfo.market_data.fully_diluted_valuation.usd.toFixed(
                          0
                        )}
                      </IonNote>
                    </IonItem>
                  )}
                  { tokenInfo.market_data.circulating_supply && (
                    <IonItem
                      style={{
                        "--background": "transparent",
                        "--padding-start": "0",
                      }}
                    >
                      <IonLabel color="medium">Circulating supply</IonLabel>
                      <IonNote
                        slot="end"
                        color="dark"
                        className="ion-text-end ion-padding-vertical"
                      >
                        {tokenInfo.market_data.circulating_supply.toFixed(0)}
                      </IonNote>
                    </IonItem>
                  )}
                  { tokenInfo.market_data.total_supply && (
                    <IonItem
                      style={{
                        "--background": "transparent",
                        "--padding-start": "0",
                      }}
                    >
                      <IonLabel color="medium">Total supply</IonLabel>
                      <IonNote
                        slot="end"
                        color="dark"
                        className="ion-text-end ion-padding-vertical"
                      >
                        {tokenInfo.market_data.total_supply.toFixed(0)}
                      </IonNote>
                    </IonItem>
                  )}
                  { tokenInfo.market_data.max_supply && (
                    <IonItem
                      style={{
                        "--background": "transparent",
                        "--padding-start": "0",
                      }}
                    >
                      <IonLabel color="medium">Max supply</IonLabel>
                      <IonNote
                        slot="end"
                        color="dark"
                        className="ion-text-end ion-padding-vertical"
                      >
                        {tokenInfo.market_data.max_supply.toFixed(0)}
                      </IonNote>
                    </IonItem>
                  )}
                  <IonListHeader className="ion-no-padding">
                    <IonLabel>
                      <h2>Historical Price</h2>
                    </IonLabel>
                  </IonListHeader>
                  { tokenInfo.market_data.current_price.usd && (
                    <IonItem
                      style={{
                        "--background": "transparent",
                        "--padding-start": "0",
                      }}
                    >
                      <IonLabel color="medium">Current price</IonLabel>
                      <IonNote
                        slot="end"
                        color="dark"
                        className="ion-text-end ion-padding-vertical"
                      >
                        ${tokenInfo.market_data.current_price.usd}
                        <IonText
                          color={
                            tokenInfo.market_data
                              .price_change_percentage_24h_in_currency.usd < 0
                              ? "danger"
                              : "success"
                          }
                          className="ion-padding-start"
                        >
                          {tokenInfo.market_data.price_change_percentage_24h_in_currency.usd.toFixed(
                            2
                          )}
                          %
                        </IonText>
                        <br />
                      </IonNote>
                    </IonItem>
                  )}
                  { tokenInfo.market_data.ath.usd && (
                    <IonItem
                      style={{
                        "--background": "transparent",
                        "--padding-start": "0",
                      }}
                    >
                      <IonLabel color="medium">All time height</IonLabel>
                      <IonNote
                        slot="end"
                        color="dark"
                        className="ion-text-end ion-padding-vertical"
                      >
                        ${tokenInfo.market_data.ath.usd}
                        <IonText
                          color={
                            tokenInfo.market_data.ath_change_percentage.usd < 0
                              ? "danger"
                              : "success"
                          }
                          className="ion-padding-start"
                        >
                          {tokenInfo.market_data.ath_change_percentage.usd.toFixed(
                            2
                          )}
                          %
                        </IonText>
                        <br />
                        <IonText color="medium">
                          <small>
                            {new Date(
                              tokenInfo.market_data.ath_date.usd
                            ).toLocaleDateString()}
                          </small>
                        </IonText>
                      </IonNote>
                    </IonItem>
                  )}
                  { tokenInfo.market_data.atl.usd&& (
                    <IonItem
                      style={{
                        "--background": "transparent",
                        "--padding-start": "0",
                      }}
                    >
                      <IonLabel color="medium">All time low</IonLabel>
                      <IonNote
                        slot="end"
                        color="dark"
                        className="ion-text-end ion-padding-vertical"
                      >
                        ${tokenInfo.market_data.atl.usd}
                        <IonText
                          color={
                            tokenInfo.market_data.atl_change_percentage.usd < 0
                              ? "danger"
                              : "success"
                          }
                          className="ion-padding-start"
                        >
                          {tokenInfo.market_data.atl_change_percentage.usd.toFixed(
                            2
                          )}
                          %
                        </IonText>
                        <br />
                        <IonText color="medium">
                          <small>
                            {new Date(
                              tokenInfo.market_data.atl_date.usd
                            ).toLocaleDateString()}
                          </small>
                        </IonText>
                      </IonNote>
                    </IonItem>
                  )}
                </IonList>
                <IonText color="medium">
                  <p className="ion-text-center">
                    <small>
                      Datas are coming from Coingeeko API
                    </small>
                  </p>
                </IonText>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
      </IonContent>

      <IonFooter
        style={{
          position: "absolute",
          bottom: "0",
          width: "100%",
        }}
      >
        <IonToolbar style={{ "--background": "var(--ion-background-color)" }}>
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonButton
                  expand="block"
                  color="gradient"
                  onClick={() => {
                    props.setState({ isTransferModalOpen: true });
                  }}
                >
                  <IonIcon icon={paperPlane} slot="start" />
                  Send
                </IonButton>
              </IonCol>
              <IonCol size="6">
                <IonButton
                  expand="block"
                  color="gradient"
                  onClick={() => {
                    props.setState({ isDepositModalOpen: true });
                  }}
                >
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
};
