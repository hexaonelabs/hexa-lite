import Head from 'next/head';

// import 'tailwindcss/tailwind.css';
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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>⚡ Hexa Lite - Onboard to DeFi</title>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/x-icon" href="./favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Censorship-resistant, tamper-proof and privacy-compliant solution for finance."
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Hexa Lite" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Hexa Lite" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* <meta property="twitter:image" content="%PUBLIC_URL%/logo192.png" /> */}
        {/* <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" /> */}

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <style>
          {`
              html {
                background: '#182449';
              }
            
          `}
        </style>
      </Head>
      <Component className="dark" {...pageProps} />
    </>
  );
}

export default MyApp;
