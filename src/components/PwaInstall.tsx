import "@khmyznikov/pwa-install";
import { useEffect } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "pwa-install": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

const PwaInstall = (): JSX.Element => {

  const isAddPwaPopover = () => {
    // is Ios device
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    // is in standalone mode
    const isInStandaloneMode = () => "standalone" in window.navigator && window.navigator["standalone"];
    return isIos() && !isInStandaloneMode();
  }
  return (
    <>
      {isAddPwaPopover() && <pwa-install 
        id="pwa-install" 
        manifest-url="./manifest.webmanifest"></pwa-install>}
    </>
  )
};

export default PwaInstall;