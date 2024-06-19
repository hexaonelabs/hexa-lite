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
  IonModal,
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
import { airplane, chevronDown, close, closeSharp, download, paperPlane } from "ionicons/icons";
import { DataItem, SeriesData, SeriesMarkerData } from "@/components/ui/LightChart";
import { TokenInfo } from '@/servcies/coingecko.service';
import { TokenDetailMarketDetail } from "@/components/ui/TokenDetailMarketData";
import { TokenDetailDescription } from "@/components/ui/TokenDetailDescription";
import { isStableAsset } from "@/utils/isStableAsset";
import { Currency } from "@/components/ui/Currency";
import { NetworkTokenDetailCard } from "@/components/ui/NetworkTokenDetailCard/NetworkTokenDetailCard";
import { getAllocationRatioInPercent } from "@/utils/getAllocationRatioInPercent";
import { formatTxsAsSeriemarker } from "@/servcies/zerion.service";
import { CoingeckoAPI } from "@/servcies/coingecko.service";
import { TxsList } from "@/components/ui/TsxList/TxsList";

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
  const { walletAddress, txs } = Store.useState(getWeb3State);
  const [dataChartHistory, setDataChartHistory] = useState<SeriesData>(new Map());
  const [txsChartHistory, setTxsChartHistory] = useState<SeriesMarkerData>(new Map());
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | undefined>(undefined);
  const [isInfoOpen, setInfoOpen] = useState(false);
  const [isAccOpen, setIsAccOpen] = useState(false);

  const filteredTxs = txs.filter((tx) => {
    return tx.attributes.transfers.some((transfer) => {
      return transfer.fungible_info.symbol === data.symbol;
    });
  });

  useEffect(() => {
    if (!walletAddress) return;
    const TxsSerie = formatTxsAsSeriemarker(filteredTxs);
    setTxsChartHistory(()=> TxsSerie);
    CoingeckoAPI.getTokenHistoryPrice(props.data.symbol).then((prices) => {
      setDataChartHistory(() => prices);
    });
    CoingeckoAPI.getTokenInfo(props.data.symbol).then((tokenInfo) =>
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
              <Currency value={data.balanceUsd} />
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
              <IonRow className="ion-text-center">
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
                    <h1 style={{marginBottom: 0}}>
                      {data.balance.toFixed(6)} {data.symbol}
                    </h1>
                  </IonText>
                  <IonText color="medium">
                    <p className="ion-no-margin" style={{ fontSize: "1.2rem" }}>
                      <Currency value={data.balanceUsd} />
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
                    {isStableAsset(data.symbol) ? (
                      <IonChip
                        onClick={()=> {
                          setInfoOpen(()=> true);
                        }} 
                        style={{marginTop: '0.5rem'}} 
                        color="success">
                        <small>stable</small>
                      </IonChip>
                                    ) : ''}
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
            
            <IonGrid className="ion-no-padding  ion-margin-bottom">
              <IonRow className="ion-no-padding">
                <IonCol size="12" className="ion-padding-top">
                  <IonAccordionGroup>
                    <IonAccordion id="detail-IonAccordion" className="networkList">
                      <div slot="header" className="ion-text-center" onClick={()=> setIsAccOpen(()=> !isAccOpen)}>
                        <IonText color="primary" style={{display: 'block'}}>
                          <small>{isAccOpen ? 'Hide' : 'Display'} Wallet details</small>
                        </IonText>
                        <IonIcon icon={chevronDown} color="primary" />
                      </div>
                      <IonGrid slot="content" className="ion-no-padding ion-padding-top">
                        <IonRow className="ion-justify-content-center ion-align-iems-center">
                          {data.assets
                            .sort((a, b) =>
                              a.chain && b.chain
                                ? a.chain.id - b.chain.id
                                : a.balance + b.balance
                            )
                            .map((token, index) => (
                              <IonCol key={index} size="auto" className="ion-padding">
                                <NetworkTokenDetailCard 
                                  token={token} 
                                  allocationRatioInPercent={getAllocationRatioInPercent(token.balance, data.balance)} />
                              </IonCol>
                            ))}
                        </IonRow>
                      </IonGrid>
                    </IonAccordion>
                  </IonAccordionGroup>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonToolbar>
        </IonHeader>

        <IonGrid style={{ paddingBottom: "200px" }}>
          <IonRow className="ion-margin-vertical">
            <IonCol size="12" className="ion-text-center">
              <Suspense fallback={<>.....</>}>
                <LightChart seriesData={dataChartHistory} markers={txsChartHistory} />
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

          {/* TXs list if existing tx */}
          {filteredTxs.length > 0
            ? (<IonRow>
              <IonCol size="12" className="ion-no-padding">
                <IonListHeader className="">
                  <IonLabel>
                    <h3>Transaction history</h3>
                  </IonLabel>
                </IonListHeader>
                <TxsList filterBy={data.symbol} />
              </IonCol>
            </IonRow>)
            : null}

          {/* Token detail information */}
          <IonRow>
            {tokenInfo ? (
              <>
                <IonCol size="12" className="ion-padding">
                  <TokenDetailMarketDetail tokenInfo={tokenInfo} />
                </IonCol>
                <IonCol size="12" className="ion-padding">
                  <TokenDetailDescription tokenInfo={tokenInfo} />
                </IonCol>
              </>
            ): null}
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

      <IonModal
        className="modalAlert autoSize modalInfo"
        isOpen={isInfoOpen}
        onWillDismiss={() => setInfoOpen(false)}
      >
        <IonGrid className="ion-no-padding ion-padding-horizontal ion-padding-bottom">
          <IonRow className="ion-padding-top">
            <IonCol size="10">
              <IonText>
                <h3>
                  <b>Informations</b>
                </h3>
              </IonText>
            </IonCol>
            <IonCol size="2" class="ion-text-end">
              <IonButton
                size="small"
                fill="clear"
                onClick={() => setInfoOpen(false) }
              >
                <IonIcon slot="icon-only" icon={closeSharp}></IonIcon>
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow class="ion-align-items-top ion-margin-bottom">
            <IonCol size="12">
              <h2>
                What is a stablecoin?
              </h2>
              <IonItem>
                <IonText>
                  <p>
                    Stablecoins are a type of cryptocurrency whose value is pegged to another asset, such as a fiat currency or gold, to maintain a stable price.
                  </p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonText>
                  <p>
                    They strive to provide an alternative to the high volatility of popular cryptocurrencies, making them potentially more suitable for common transactions.
                  </p>
                </IonText>
              </IonItem>
              <IonItem>
                <IonText>
                  <p>
                    Stablecoins can be utilized in various blockchain-based financial services and can even be used to pay for goods and services.
                  </p>
                </IonText>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonModal>
    </>
  );
};
