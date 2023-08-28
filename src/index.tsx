import React from 'react';
import ReactDOM from 'react-dom/client';

import './theme/vendor';
import './global.scss';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { Web3Provider } from './context/Web3Context';
import { UserProvider } from './context/UserContext';
// import { WalletProvider } from './context/WalletContext';
import { LoaderProvider } from './context/LoaderContext';
import { ErrorBoundary } from './ErrorBoundary';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
<ErrorBoundary fallback={<div>Something went wrong. reload Dapp!</div>}>
  <Web3Provider>
    <UserProvider>
      <LoaderProvider>
        <App />
      </LoaderProvider>
    </UserProvider>
  </Web3Provider>
</ErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
