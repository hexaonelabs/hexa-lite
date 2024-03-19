import { IAsset } from "@/interfaces/asset.interface";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import {
  IonAccordion,
  IonAccordionGroup,
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
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
  IonSelect,
  IonSelectOption,
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
import { airplane, chevronDown, close, download, paperPlane } from "ionicons/icons";
import { DataItem } from "@/components/ui/LightChart";
import { getTokenHistoryPrice } from "@/utils/getTokenHistoryPrice";
import { TokenInfo, getTokenInfo } from "@/utils/getTokenInfo";
import { TokenDetailMarketDetail } from "@/components/ui/TokenDetailMarketData";
import { TokenDetailDescription } from "@/components/ui/TokenDetailDescription";

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
      <IonContent
        className="mobileConentModal ion-no-padding"
        fullscreen={true}
        style={{ "--padding-top": "0px" }}
      >
        <IonHeader collapse="condense">
          <IonToolbar style={{ "--background": "transparent" }}>
            <IonGrid class="ion-no-padding">
              <IonRow className="ion-text-center ion-margin-bottom">
                <IonCol size="12" className="ion-no-vertical">
                  <IonAvatar
                    style={{
                      margin: "2rem auto 0",
                      overflow: "hidden",
                      width: "112px",
                      height: "112px",
                    }}
                  >
                    <img
                      src={data.symbol === 'ETH' 
                      ? getAssetIconUrl({
                          symbol: data.symbol,
                        })
                      : data.thumbnail||getAssetIconUrl({
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
                      { tokenInfo?.market_data?.price_change_percentage_24h_in_currency?.usd && (
                        <IonText
                          color={
                            tokenInfo.market_data
                              .price_change_percentage_24h_in_currency.usd < 0
                              ? "danger"
                              : "success"
                          }
                          className="ion-padding-start"
                        >
                          <small>
                          ({tokenInfo.market_data.price_change_percentage_24h_in_currency.usd.toFixed(
                            2
                          )}
                          % <span style={{fontSize: '80%'}}>/24h</span>)
                          </small>
                        </IonText>
                      )}
                    </p>
                  </IonText>
                  <IonGrid className="ion-no-padding">
                    <IonRow className="ion-no-padding">
                      <IonCol size="12" className="ion-padding-top">
                        <IonAccordionGroup>
                          <IonAccordion className="networkList">
                            <div slot="header" className="ion-text-center">
                              <IonIcon icon={chevronDown} color="primary" />
                            </div>
                            <IonList
                              slot="content"
                              style={{
                                background: "transparent",
                              }}
                            >
                              <IonListHeader className="ion-no-padding ion-text-start">
                                <IonLabel>
                                  <h3>Networks details</h3>
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
                                        <small>
                                          $ {token.balanceUsd.toFixed(2)}
                                        </small>
                                      </IonText>
                                    </IonNote>
                                  </IonItem>
                                ))}
                            </IonList>
                          </IonAccordion>
                        </IonAccordionGroup>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonToolbar>
        </IonHeader>

        <IonGrid style={{ paddingBottom: "200px" }}>
          <IonRow className="ion-margin-vertical">
            <IonCol size="12" className="ion-text-center">
              <Suspense fallback={<>.....</>}>
                <LightChart data={dataChartHistory} />
                <IonBadge color="primary">
                  <span
                    style={{
                      fontSize: "0.8rem",
                      display: "block",
                      padding: "0.2rem",
                    }}
                  >
                    1 {data.symbol} = $ {(tokenInfo?.market_data?.current_price?.usd||data.priceUsd).toFixed(2)}
                  </span>
                </IonBadge>
              </Suspense>
            </IonCol>
          </IonRow>

          <IonRow>
            {tokenInfo && (
              <>
                <IonCol size="12" className="ion-padding">
                  <TokenDetailMarketDetail tokenInfo={tokenInfo} />
                </IonCol>
                <IonCol size="12" className="ion-padding">
                  <TokenDetailDescription tokenInfo={tokenInfo} />
                </IonCol>
              </>
            )}
            <IonCol size="12">
              <IonText color="medium">
                <p className="ion-text-center">
                  <small>
                    Market datas from Coingeeko API
                  <br/>Last update: {new Date(tokenInfo?.market_data?.last_updated||new Date ().toLocaleDateString()).toLocaleString()}
                  </small>
                </p>
              </IonText>
            </IonCol>
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
