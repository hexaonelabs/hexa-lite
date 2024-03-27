import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" style={{background: '#182449'} }>
      <Head />
      <body className={'dark'}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}