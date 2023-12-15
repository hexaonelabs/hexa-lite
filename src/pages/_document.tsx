import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script';
 
export default function Document() {
  return (
    <Html lang="en" style={{background: '#182449'} }>
      <Head />
      <body className='dark'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}