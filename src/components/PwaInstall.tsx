import "@khmyznikov/pwa-install";

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
  console.log("PwaInstall");
  return  <pwa-install 
      id="pwa-install" 
      manifest-url="./manifest.webmanifest"></pwa-install>;
};

export default PwaInstall;