import Store from "@/store";
import { patchAppSettings } from "@/store/actions";
import { getAppSettings } from "@/store/selectors";
import { IonIcon } from "@ionic/react";
import { eyeOffOutline, eyeOutline } from "ionicons/icons";

export const ToggleHideCurrencyAmount = () => {
  const appSettings = Store.useState(getAppSettings);
  const {
    ui: { hideCurrencieAmount}
  } = appSettings;
  return (
    <>
      <IonIcon
        icon={hideCurrencieAmount ? eyeOffOutline : eyeOutline}
        size="small"
        className="ion-margin-horizontal cursorPointer"
        onClick={() => {
          patchAppSettings({
            ui: {
              hideCurrencieAmount: !hideCurrencieAmount,
            },
          });
          localStorage.setItem('hexa-lite_app_settings', JSON.stringify({
            ...appSettings,
            ui: {
              ...appSettings.ui,
              hideCurrencieAmount: !hideCurrencieAmount,
            }
          }))
        }}
      />
    </>
  );
};
