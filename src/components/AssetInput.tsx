import { IonImg, IonInput, IonItem, IonText, IonThumbnail } from "@ionic/react";
import { FormattedNumber } from "./FormattedNumber";
import { getAssetIconUrl } from "../utils/getAssetIconUrl";
import { useRef } from "react";

interface IAssetInputPros {
  symbol: string;
  balance: number;
  usdBalance?: string;
  maxBalance?: string;
  textBalance?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export function AssetInput({
  symbol,
  balance,
  maxBalance,
  usdBalance,
  textBalance,
  disabled,
  onChange
}: IAssetInputPros) {
  const inputDepositRef = useRef<HTMLIonInputElement>(null);

  return (
    <IonItem lines="none" style={{'--padding-start': 0, '--inner-padding-end': 0, opacity: disabled ? 1 : null}} disabled={disabled} className="prevent-select">
      <IonThumbnail slot="start" style={{
        width: '48px',
        height: '48px',
        marginTop: '0.5rem',
        marginBottom: '0.5rem',
        marginLeft: '0.5rem', 
      }}>
        <IonImg
          src={getAssetIconUrl({ symbol })}
          alt={symbol}
        ></IonImg>
      </IonThumbnail>
      <div className="ion-hide-md-down">
        <h2 style={{fontSize: '1.2rem'}} className="ion-no-margin">{symbol}</h2>
        {textBalance && (  
          <IonText color="medium" style={{display: 'flex', fontSize: '70%', cursor: 'pointer'}} onClick={() => {
            const value = Number(maxBalance).toString();
            (inputDepositRef.current as any).value = value;
            if (onChange) onChange(value);
          }}>
            {textBalance && (<span style={{paddingRight: '0.25rem'}}>{textBalance}:</span>)}
            {maxBalance && <FormattedNumber value={Number(maxBalance)} />}
          </IonText>
        )}
      </div>
      <IonInput
        ref={inputDepositRef}
        class="ion-text-end"
        type="number"
        debounce={500}
        placeholder="0"
        enterkeyhint="done"
        inputmode="numeric"
        min={0}
        max={maxBalance||balance}
        style={{fontSize: '1.25rem'}}
        onIonInput={(e) => {
          console.log('onIonInput', e);
          if (onChange) {
            const value = (e.target as any).value;
            const amount = Number(value) > Number(maxBalance||balance) ? maxBalance||balance : value
            e.target.value = amount;
            onChange(amount);
          }
        }}
      ></IonInput>
    </IonItem>
  )
}