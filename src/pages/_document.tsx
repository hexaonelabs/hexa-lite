import { Html, Head, Main, NextScript } from 'next/document'
import { GoogleAnalytics } from '@next/third-parties/google';

export default function Document() {
  return (
    <Html lang="en" style={{background: '#182449'} }>
      <Head />
      <body className={'dark'}>
        <Main />
        <NextScript />
      </body>
      <GoogleAnalytics gaId="G-70XCWQ9YE2" />
    </Html>
  )
}