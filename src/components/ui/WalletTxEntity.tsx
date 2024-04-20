import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonChip,
  IonCol,
  IonGrid,
  IonIcon,
  IonLabel,
  IonRow,
  IonText,
  IonThumbnail,
} from "@ionic/react";
import { Transfer, TxInterface } from "@/interfaces/tx.interface";
import { CHAIN_AVAILABLES } from "@/constants/chains";
import { useStores } from "pullstate";
import Store from "@/store";
import { getWeb3State } from "@/store/selectors";
import { getSplitedAddress } from "@/utils/getSplitedAddress";
import { useMemo } from "react";
import { arrowDown, arrowUp, document, lockOpen, repeat } from "ionicons/icons";
import { currencyFormat } from "@/utils/currencyFormat";

export function WalletTxEntity(props: { tx: TxInterface }) {
  const { tx } = props;
  const { walletAddress } = Store.useState(getWeb3State);
  
  let icon;
  let color = 'primary';
  switch (true) {
    case tx.attributes.operation_type === 'trade':
      icon = repeat;
      break;
    case tx.attributes.operation_type === 'deposit':
    case tx.attributes.operation_type === 'receive':
      color = 'success';
      icon = arrowDown;
      break;
    case tx.attributes.operation_type === 'approve':
      icon = lockOpen; 
      break
    case tx.attributes.operation_type === 'send':
    case tx.attributes.operation_type === 'withdraw':
      color = 'warning';
      icon = arrowUp; 
      break;
    case tx.attributes.operation_type === 'execute':
      icon = document; 
      break;
    case tx.attributes.operation_type === 'mint':
      color = 'success'
      icon = document; 
      break;
    default:
      icon = document;
      color = 'primary';
      break;
  }

  const action1 = tx.attributes.transfers.length > 0
  ? tx.attributes.transfers[0]
  : tx.attributes.approvals[0];
  const action2 = tx.attributes.transfers.length > 0
  ? tx.attributes.transfers[1]
  : undefined;

  return (
    <IonGrid
      class="ion-no-padding"
      onClick={() => {
        // setDisplayTxDetail(asset);
        console.log(tx)
      }}
      style={{
        cursor: "default",
        borderBottom: "solid 1px rgba(var(--ion-color-primary-rgb), 0.2)",
      }}
    >
      <IonRow className="ion-align-items-center ion-justify-content-between ion-padding-vertical">
        <IonCol
          size-xs="2"
          size-sm="2"
          size-md="2"
          size-lg="2"
          size-xl="2"
          className="ion-align-self-center ion-padding-start ion-text-wrap flex ion-align-items-center"
        >
          <div style={{position: 'relative'}}>
            <IonIcon icon={icon} color={color} style={{
              position: 'relative',
              border: `solid 1px var(--ion-color-${color})`,
              borderRadius: '50%',
              padding: '0.6rem'
            }} />
            <IonAvatar
              style={{
                overflow: "hidden",
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: "18px",
                height: "18px",
                minWidth: "18px",
                minHeight: "18px",
              }}
            >
              <img
                src={
                  CHAIN_AVAILABLES.find((c) => c.value === tx.relationships.chain.data.id)?.logo
                }
                alt={tx.relationships.chain.data.id}
                style={{ transform: "scale(1.01)" }}
                onError={(event) => {
                  (
                    event.target as any
                  ).src = `https://images.placeholders.dev/?width=42&height=42&text=${tx.relationships.chain.data.id}&bgColor=%23cccccc&textColor=%23182449`;
                }}
              />
            </IonAvatar>
          </div>
          {/* <IonText className="ion-padding-start ion-hide-md-down">
            <p className="ion-no-margin">
              {tx.attributes.operation_type}
            </p>
          </IonText> */}
          <IonChip className="ion-margin-start ion-hide-md-down" color={color}>
            <small>{tx.attributes.operation_type}</small>
          </IonChip>
          
        </IonCol>

        <IonCol className="flex ion-align-items-center wallet_tx_entity__detail_col">
          <div className="flex ion-align-items-center ion-margin-end">
            <IonAvatar className="ion-margin-horizontal" style={{
                maxWidth: '24px',
                maxHeight: '24px',
              }}>
              <img
                  src={
                    action1?.fungible_info?.icon?.url ||  `https://images.placeholders.dev/?width=42&height=42&text=${action1?.fungible_info?.symbol}&bgColor=%23cccccc&textColor=%23182449`
                  }
                  alt={tx.relationships.chain.data.id}
                  style={{ transform: "scale(1.01)" }}
                  onError={(event) => {
                    (
                      event.target as any
                    ).src = `https://images.placeholders.dev/?width=42&height=42&text=${action1.fungible_info.symbol}&bgColor=%23cccccc&textColor=%23182449`;
                  }}
                />
            </IonAvatar>
            <IonText>
              {(tx.attributes.operation_type === 'trade' || tx.attributes.operation_type === 'receive' || tx.attributes.operation_type === 'approve') && (
                <p className="ion-no-margin">
                  {tx.attributes.operation_type !== 'approve' && (
                    (action1 as Transfer).direction === 'in' ? '+ ' : '- '
                  )}
                  {action1.quantity.float.toFixed(3) + ' '}
                  {action1.fungible_info.symbol}
                  {tx.attributes.operation_type !== 'approve' && (
                    <IonText color="medium">
                      <br/><small>{currencyFormat.format((action1 as Transfer).value)}</small>
                    </IonText>
                  )}
                </p>
              )}
            </IonText>
          </div>
          { tx.attributes.operation_type === 'trade' && action2 && (
            <div className="flex ion-align-items-center ion-margin-start">
              <IonAvatar className="ion-margin-horizontal" style={{
                maxWidth: '24px',
                maxHeight: '24px',
              }}>
                <img
                    src={
                      action2.fungible_info.icon?.url ||  `https://images.placeholders.dev/?width=42&height=42&text=${action2.fungible_info.symbol}&bgColor=%23cccccc&textColor=%23182449`
                    }
                    alt={tx.relationships.chain.data.id}
                    style={{ transform: "scale(1.01)" }}
                    onError={(event) => {
                      (
                        event.target as any
                      ).src = `https://images.placeholders.dev/?width=42&height=42&text=${action2.fungible_info.symbol}&bgColor=%23cccccc&textColor=%23182449`;
                    }}
                  />
              </IonAvatar>
              <IonText>
                <p className="ion-no-margin">
                  {(action2 as Transfer).direction === 'in' ? '+ ' : '- '} 
                  {action2.quantity.float.toFixed(3) + ' '}
                  {action2.fungible_info.symbol}
                  <IonText color="medium">
                    <br/><small>{currencyFormat.format((action2 as Transfer).value)}</small>
                  </IonText>
                </p>
              </IonText>
            </div>
          )}
        </IonCol>

        <IonCol size="2" className="ion-text-end ion-padding-end flex ion-justify-content-start  ion-hide-md-down">
          <div className="flex ion-align-items-center ion-margin-end">
            {tx.attributes.application_metadata?.icon?.url !== undefined && (
              <IonThumbnail style={{
                maxWidth: '24px',
                maxHeight: '24px',
                margin: '0.5rem',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <img src={tx.attributes.application_metadata?.icon?.url} alt={tx.attributes.application_metadata.name} />
              </IonThumbnail>
            )}
            {tx.attributes.application_metadata?.icon?.url === undefined && tx?.attributes?.application_metadata?.contract_address && (
              <IonText color="medium" style={{margin: '0.5rem'}}>
                <small>
                  {getSplitedAddress(tx.attributes.application_metadata.contract_address)}
                </small>
              </IonText>
            )}
            <IonText color="medium">
              <small>{tx.attributes.application_metadata?.name}</small>
            </IonText>
          </div>
        </IonCol>

        <IonCol size="auto" className="ion-text-end ion-padding-end flex ion-justify-content-end">
          <IonText color="dark">
            <p className="ion-no-margin ion-margin-start">
              <small>
                {new Date(tx.attributes.mined_at).toLocaleDateString()}<br/>
                {new Date(tx.attributes.mined_at).toLocaleTimeString()}
              </small>
            </p>
          </IonText>
        </IonCol>

      </IonRow>
    </IonGrid>
  );
}
