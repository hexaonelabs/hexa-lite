import Head from 'next/head';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '../styles/variables.scss';
import '../styles/global.scss';

import { AppProps } from 'next/app';
import { outfit } from '@/styles/fonts';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>Hexa Lite - Onboard to DeFi</title>
        <meta
          name="description"
          content="Buy digitals assets with fiats, exchange at best rate, lend and borrow money on DeFi protocols without any intermediate smart contract or third-party to enforce security and increase earn interest."
        />

        <link rel="icon" type="image/x-icon" href="./favicon.ico" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/.favicon.svg" />
        <link rel="manifest" href="manifest.webmanifest" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#182449" />
        <meta name="color-scheme" content="dark" />

        <meta name="author" content="HexaOneLabs" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Hexa Lite" />
        
        <meta name="apple-mobile-web-app-title" content="Hexa Lite" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <meta name="msapplication-tooltip" content="Hexa Lite" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="msapplication-TileColor" content="#182449" />
        
        <meta property="og:type" content="product" />
        <meta property="og:title" content="Hexa Lite - Onboard to DeFi" />
        <meta property="og:site_name" content="Hexa Lite" />
        <meta property="og:url" content="https://hexa-lite.io/" />
        <meta property="og:image" content="https://hexa-lite.io/assets/app-logo/192.png" />
        <meta property="og:description" content="Buy digitals assets with fiats, exchange at best rate, lend and borrow money on DeFi protocols without any intermediate smart contract or third-party to enforce security and increase earn interest." />
          
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover" />


        {/* <!-- link to all app icon for PWA --> */}
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="./assets/app-logo/72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="96x96"
          href="./assets/app-logo/96.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="128x128"
          href="./assets/app-logo/128.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="./assets/app-logo/144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="assets/app-logo/152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="./assets/app-logo/192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="512x512"
          href="./assets/app-logo/512.png"
        />
        <link
          rel="icon"
          sizes="192x192"
          href="./assets/app-logo/192.png"
          type="image/png"
        />
        <link
          rel="icon"
          sizes="96x96"
          href="./assets/app-logo/96.png"
          type="image/png"
        />
        
        <style>
          {`
              html {
                background: '#182449';
              }
          `}
        </style>
      </Head>
      <style jsx global>{`
        :root {
          --font-outfit: ${outfit.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
