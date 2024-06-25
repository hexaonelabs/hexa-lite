import { IonToggle } from "@ionic/react";
import { useEffect, useState } from "react";

export const ToggleLightmode = () => {
  const [isLightmode, setIsLightmode] = useState<boolean>(
    !document.querySelector('body')?.classList.contains('dark')
  );
  
  function handleToggle() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const hasData = localStorage.getItem('hexa-lite_is-lightmode');
      if (hasData && hasData === 'true') {
        localStorage.setItem('hexa-lite_is-lightmode', 'false');
      } else {
        localStorage.setItem('hexa-lite_is-lightmode', 'true');
      }
      setIsLightmode(!Boolean(hasData) ? true : false);
      document.querySelector('body')?.classList.toggle('dark')
    }
  }
  
  return (<>
    <IonToggle 
      checked={!isLightmode} 
      onIonChange={handleToggle}
      slot="end"
      labelPlacement="start" />
  </>);
}