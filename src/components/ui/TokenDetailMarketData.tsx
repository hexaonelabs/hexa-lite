import { currencyFormat } from "@/utils/currencyFormat";
import { TokenInfo } from "@/utils/getTokenInfo";
import { numberFormat } from "@/utils/numberFormat";
import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonText,
} from "@ionic/react";

export function TokenDetailMarketDetail(props: {
  tokenInfo: TokenInfo
}) {
  const { tokenInfo } = props;
  return (
    <>
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
            <IonLabel color="medium">Fully Diluted Valuation</IonLabel>
            <IonNote
              slot="end"
              color="dark"
              className="ion-text-end ion-padding-vertical"
            >
              {currencyFormat.format(
                tokenInfo.market_data.fully_diluted_valuation.usd
              )}
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
      <IonList
        style={{
          background: "transparent",
        }}
      >
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
                  tokenInfo.market_data.price_change_percentage_24h_in_currency
                    .usd < 0
                    ? "danger"
                    : "success"
                }
                className="ion-padding-start"
              >
                {numberFormat.format(
                  tokenInfo.market_data.price_change_percentage_24h_in_currency
                    .usd
                )}
                %
              </IonText>
              <IonText color="medium">
                <span style={{ fontSize: "60%", display: "block" }}>
                  (24h change)
                </span>
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
                {numberFormat.format(
                  tokenInfo.market_data.ath_change_percentage.usd
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
                {numberFormat.format(
                  tokenInfo.market_data.atl_change_percentage.usd
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
    </>
  );
}
