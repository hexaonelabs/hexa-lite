import { IonToggle } from "@ionic/react";
import { useEffect, useState } from "react";

export const ToggleLightmode = () => {
  const [isLightmode, setIsLightmode] = useState<boolean>(
    !document.querySelector('body')?.classList.contains('dark')
  );
  
  function handleToggle() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const hasData = localStorage.getItem('hexa-lite_is-lightmode');
      if (hasData) {
        localStorage.removeItem('hexa-lite_is-lightmode');
      } else {
        localStorage.setItem('hexa-lite_is-lightmode', 'true');
      }
      setIsLightmode(!hasData ? true : false);
      document.querySelector('body')?.classList.toggle('dark')
    }
  }
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const isLightmode = localStorage.getItem('hexa-lite_is-lightmode');
      isLightmode 
        ? setIsLightmode(true) 
        : setIsLightmode(false);
      isLightmode
        ? document.querySelector('body')?.classList.remove('dark')
        : undefined;
    }
    return ()=> {};
  }, []);

  return (<>
    <IonToggle 
      checked={!isLightmode} 
      onIonChange={handleToggle}
      labelPlacement="start" />
  </>);
}