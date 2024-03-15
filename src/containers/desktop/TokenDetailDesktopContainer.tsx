import { IAsset } from "@/interfaces/asset.interface";
import { getAssetIconUrl } from "@/utils/getAssetIconUrl";
import {
  IonAccordion,
  IonAccordionGroup,
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
  IonSelect,
  IonSelectOption,
  IonSpinner,
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
import { airplane, chevronDown, close, download, paperPlane, repeat } from "ionicons/icons";
import { DataItem } from "@/components/ui/LightChart";
import { getTokenHistoryPrice } from "@/utils/getTokenHistoryPrice";
import { TokenInfo, getTokenInfo } from "@/utils/getTokenInfo";
import { numberFormat } from "@/utils/numberFormat";
import { currencyFormat } from "@/utils/currencyFormat";

const LightChart = lazy(() => import("@/components/ui/LightChart"));

const getTxsFromAddress = async (address: string) => {
  let provider = new ethers.providers.EtherscanProvider();
  let history = await provider.getHistory(address);
  console.log(history);
};

export const TokenDetailDesktopContainer = (props: {
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
          <IonButton slot="end" onClick={dismiss} fill="clear">
            <IonIcon icon-only icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent
        className="ion-no-padding"
        fullscreen={true}
        style={{ "--padding-top": "0px" }}
      >
        <IonHeader collapse="condense">
          <IonToolbar style={{ "--background": "transparent" }}>
            <IonGrid class="ion-padding" style={{ maxWidth: '1224px' }}>
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
                    <p className="ion-no-margin" style={{ fontSize: "1.3rem" }}>
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
                    <IonRow className="ion-padding">
                      <IonCol size="12">
                        <IonButton 
                          color="gradient" 
                          onClick={() => {
                            props.setState({ isTransferModalOpen: true });
                          }}>
                          <IonIcon slot="start" icon={paperPlane} />
                          Send
                        </IonButton>
                        <IonButton 
                          color="gradient"
                          onClick={() => {
                            props.setState({ isDepositModalOpen: true });
                          }}>
                          <IonIcon slot="start" icon={download} />
                          Deposit
                        </IonButton>
                      </IonCol>
                    </IonRow>
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
                                      { numberFormat.format(token.balance)} {token.symbol}
                                      <br />
                                      <IonText color="medium">
                                        <small>
                                          {currencyFormat.format(token.balanceUsd)}
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

        <IonGrid className="widgetWrapper" style={{ paddingLeft: '0', paddingRight: '0', paddingBottom: "200px", marginBottom: '80px', maxWidth: '1224px' }}>
          <IonRow className="ion-no-padding ion-margin-vertical">
            <IonCol size="12" className="ion-no-padding ion-text-center ion-margin-bottom">
              <Suspense fallback={<><IonSpinner /></>}>
                <IonText color="dark" className="ion-text-start">
                  <h2 style={{fontSize: '1.3rem', margin: '0 1rem 0', opacity: 0.8}}>
                    {props.data.symbol} / USD
                    <span
                      style={{
                        fontSize: "0.8rem",
                        display: "block",
                        padding: "0.2rem",
                      }}
                    >
                      1 {data.symbol} = {currencyFormat.format(tokenInfo?.market_data?.current_price?.usd||data.priceUsd)}
                    </span>
                  </h2>
                </IonText>
                <LightChart data={dataChartHistory} minHeight={400} />
              </Suspense>
            </IonCol>
          </IonRow>

          {tokenInfo && (
            <IonRow className="ion-padding ion-align-items-start">
              <IonCol size-xs="12" size-sm="12" size-md="5" className="ion-padding-horizontal">
                <IonList
                  style={{
                    background: "transparent",
                  }}
                >
                  <IonListHeader className="ion-no-padding">
                    <IonLabel>
                      <h3>Market details</h3>
                    </IonLabel>
                  </IonListHeader>
                  {Boolean(tokenInfo.market_data.market_cap.usd) && (
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
                        {currencyFormat.format(tokenInfo.market_data.market_cap.usd)}
                      </IonNote>
                    </IonItem>
                  )}
                  {Boolean(tokenInfo.market_data.fully_diluted_valuation.usd) && (
                    <IonItem
                      style={{
                        "--background": "transparent",
                        "--padding-start": "0",
                      }}
                    >
                      <IonLabel color="medium">
                        Fully Diluted Valuation
                      </IonLabel>
                      <IonNote
                        slot="end"
                        color="dark"
                        className="ion-text-end ion-padding-vertical"
                      >
                        {currencyFormat.format(tokenInfo.market_data.fully_diluted_valuation.usd)}
                      </IonNote>
                    </IonItem>
                  )}
                  {Boolean(tokenInfo.market_data.circulating_supply) && (
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
                        {numberFormat.format(tokenInfo.market_data.circulating_supply)}
                      </IonNote>
                    </IonItem>
                  )}
                  {Boolean(tokenInfo.market_data.total_supply) && (
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
                        {numberFormat.format(tokenInfo.market_data.total_supply)}
                      </IonNote>
                    </IonItem>
                  )}
                  {Boolean(tokenInfo.market_data.max_supply) && (
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
                        {numberFormat.format(tokenInfo.market_data.max_supply)}
                      </IonNote>
                    </IonItem>
                  )}
                </IonList>
                <IonList style={{
                    background: "transparent",
                  }}>
                  <IonListHeader className="ion-no-padding">
                    <IonLabel>
                      <h3>Historical Price</h3>
                    </IonLabel>
                  </IonListHeader>
                  {Boolean(tokenInfo.market_data.current_price.usd) && (
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
                        {currencyFormat.format(tokenInfo.market_data.current_price.usd)}
                        <IonText
                          color={
                            tokenInfo.market_data
                              .price_change_percentage_24h_in_currency.usd < 0
                              ? "danger"
                              : "success"
                          }
                          className="ion-padding-start"
                        >
                          {numberFormat.format(tokenInfo.market_data.price_change_percentage_24h_in_currency.usd)}
                          %
                        </IonText>
                        <IonText color="medium">
                          <span style={{fontSize: '60%', display: 'block'}}>(24h change)</span>
                        </IonText>
                      </IonNote>
                    </IonItem>
                  )}
                  {Boolean(tokenInfo.market_data.ath.usd) && (
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
                        {currencyFormat.format(tokenInfo.market_data.ath.usd)}
                        <IonText
                          color={
                            tokenInfo.market_data.ath_change_percentage.usd < 0
                              ? "danger"
                              : "success"
                          }
                          className="ion-padding-start"
                        >
                          {numberFormat.format(tokenInfo.market_data.ath_change_percentage.usd)}%
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
                  {Boolean(tokenInfo.market_data.atl.usd) && (
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
                        {currencyFormat.format(tokenInfo.market_data.atl.usd)}
                        <IonText
                          color={
                            tokenInfo.market_data.atl_change_percentage.usd < 0
                              ? "danger"
                              : "success"
                          }
                          className="ion-padding-start"
                        >
                          {numberFormat.format(tokenInfo.market_data.atl_change_percentage.usd)}%
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
              </IonCol>
              <IonCol size-xs="12" size-sm="12" size-md="7" className="ion-padding-horizontal">
                <IonListHeader className="ion-no-padding">
                  <IonLabel>
                    <h3>Description</h3>
                  </IonLabel>
                </IonListHeader>
                <IonText>
                  <p>
                    {tokenInfo.description.en}
                  </p>
                </IonText>
                <div className="ion-padding-vertical">
                  <IonListHeader className="ion-no-padding">
                    <IonLabel>
                      <h3>Categories</h3>
                    </IonLabel>
                  </IonListHeader>
                  <div className="ion-margin-vertical">
                    {tokenInfo.categories.map((categorie, i) => (
                      <IonChip>{categorie}</IonChip>
                    ))}
                  </div>
                </div>
              </IonCol>
            </IonRow>
          )}
          <IonRow>
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
    </>
  );
};
