
import { loadMoonPay } from '@moonpay/moonpay-js';
// import { MoonPayProvider, MoonPayBuyWidget } from '@moonpay/moonpay-react';
import { ReactNode, useEffect, useState } from 'react';


export default function MoonpayOnramp(props?: { 
  walletAddress?: string;
  children?: ReactNode,
}) {
  // const [visible, setVisible] = useState(false);
  const [moonPaySdk, setMoonPaySdk] = useState(undefined as any);
  const element = props?.children || (<button>Toggle widget</button>);

  useEffect(() => {
    if (moonPaySdk) {
      return;
    }
    loadMoonPay().then((moonPay) => {
      if (!moonPay) {
        return null;
      }
      const moonPaySdk = moonPay({  
          flow: 'buy',
          environment: 'sandbox',
          variant: 'overlay',  
          params: {  
            apiKey: '',
            theme: 'dark',
            baseCurrencyCode: 'usd',
            baseCurrencyAmount: '100',
            defaultCurrencyCode: 'eth'
          }
      });
      setMoonPaySdk(moonPaySdk);
    })
  }, [moonPaySdk]);

  return (
      // <MoonPayProvider 
      //     apiKey="pk_test_pUbHWVd68PykDLVoHAdP5mmLRIBniR2I" 
      //     debug={true}
      // >
      //   <MoonPayBuyWidget
      //       variant="overlay"
      //       baseCurrencyCode="usd"
      //       baseCurrencyAmount="100"
      //       defaultCurrencyCode="eth"
      //       visible={visible}
      //   />
        <div onClick={() => moonPaySdk?.show()}>
            {element}
        </div>
      // </MoonPayProvider>
      
  )
}