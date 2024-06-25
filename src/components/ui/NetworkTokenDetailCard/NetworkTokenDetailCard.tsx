import { CHAIN_AVAILABLES } from "@/constants/chains";
import { IAsset } from "@/interfaces/asset.interface";
import { numberFormat } from "@/utils/numberFormat";
import {
  IonAvatar,
  IonCard,
  IonCardContent,
  IonNote,
  IonText,
} from "@ionic/react";
import { Currency } from "../Currency";
import styles from './NetworkTokenDetailCard.module.scss';

export const NetworkTokenDetailCard = (props: {
  token: IAsset;
  allocationRatioInPercent?: number;
}) => {
  const { token, allocationRatioInPercent } = props;

  return (
    <IonCard
      className={styles.card}
    >
      <IonCardContent
        className={styles.card__content + " ion-no-padding"} 
      >
        <div className={styles.card__content__header}>
          <div className="flex alignItemsCenter">
            <IonAvatar
              style={{
                width: "24px",
                height: "24px",
              }}
            >
              <img
                src={
                  CHAIN_AVAILABLES.find((c) => c.id === token.chain?.id)?.logo
                }
                alt={token.symbol}
                onError={(event) => {
                  (
                    event.target as any
                  ).src = `https://images.placeholders.dev/?width=42&height=42&text=${token.symbol}&bgColor=%23000000&textColor=%23182449`;
                }}
              />
            </IonAvatar>
            <IonText>
              <p>
                {token.chain?.name}
                <br />
                <span>network</span>
              </p>
            </IonText>
          </div>
          {allocationRatioInPercent && (
            <IonNote color="dark">
              <span>
                {allocationRatioInPercent}%
              </span>
            </IonNote>
          )}
        </div>
        <div className={styles.card__content__container + " ion-text-end ion-padding"}>
          <IonText color="dark">
            <h2 className="ion-no-margin">
              <Currency value={token.balanceUsd} />
              <br />
              <IonText color="medium">
                <small>
                  {numberFormat.format(token.balance)} {token.symbol}
                </small>
              </IonText>
            </h2>
          </IonText>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
