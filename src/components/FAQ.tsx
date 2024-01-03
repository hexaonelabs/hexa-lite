import {
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonText
} from "@ionic/react";
export const FAQ: React.FC = () => {
  // list of faq
  const data: {
    q: string;
    a: string;
  }[] = [
    {
      q: "What is Hexa Lite?",
      a: "Hexa Lite allow you to create or connect existing digital wallets and provide solution to buy digital assets with fiats, exchange at best rate, lend and borrow money on blockchain with DeFi protocols.",
    },
    {
      q: "What is a digital wallet?",
      a: "A digital wallet is a wallet that allows you to interact with digital assets like cryptocurrencies across DeFi protocols.",
    },
    {
      q: "What is DeFi?",
      a: "DeFi is an abbreviation of the phrase decentralized finance which generally refers to the digital assets and financial smart contracts, protocols, and decentralized applications built on chain.",
    },
    {
      q: "What is a DeFi protocol?",
      a: "A DeFi protocol is a smart contract or a set of smart contracts that can interact with each other to perform a set of actions.",
    },
    {
      q: "What is a smart contract?",
      a: "A smart contract is a computer program or a transaction protocol that is intended to automatically execute, control, or document legally relevant events and actions according to the terms of a contract or an agreement.",
    },
    {
      q: "Why should I use DeFi?",
      a: "DeFi is a permissionless and censorship resistant financial system that is available to anyone with an internet connection. It is a financial system that is built on the blockchain and is not controlled by any central authority.",
    },
    {
      q: "Why should I use Hexa Lite?",
      a: "Hexa Lite allow you to onboard to DeFi in a few click to earn interest on your assets, borrow money, exchange at best rate and more wihout any technical knowledge from blockchain or finance world and without any restriction or censorship.",
    },
    {
      q: "Can I export my private key from a wallet created with Hexa Lite?",
      a: "Of course! Wallets on Hexa Lite are created through Magic, which enables you to export your private key at any time. You can retrieve it her <a href='https://magic.link/' target='_blank'>https://magic.link/</a>.",
    },
    {
      q: "Can I deposit FIAT money (USD, EUR, CHF) to Hexa Lite?",
      a: "No. You cannot deposit and keep fiat at Hexa Lite because Hexa Lite is not a bank and does not provide any banking services. However, you can buy digital assets with FIAT money from our partners.",
    },
    {
      q: "Can I deposit digital assets to Hexa Lite?",
      a: "No. Hexa Lite is not a custodian wallet and does not provide any custodian services. Hexa Lite only provides a interface to interact with DeFi protocols and your wallet from the blockchain.",
    },
    {
      q: "Can I use my wallet created with Hexa Lite on other platforms?",
      a: "Yes. When you create a wallet with Hexa Lite, you are creating a wallet on the blockchain. You can use this wallet on any other platform that supports the same blockchain.",
    },
    {
      q: "Which networks are supported?",
      a: "Hexa Lite currently supports all majors EVM network, Solana and Bitcoin. You can get your wallet address for each networks by clicking on the authenticate badge on the top right corner of the screen.",
    },
    {
      q: "What are the fees for swapping?",
      a: "Hexa Lite does not charge any fees for swapping. However, the protocols that we integrate with may charge a fee for swapping and on-chain gas fees are applicable according to each network. That's why you have to get some ETH to pay for gas fees on Ethereum network and majors EVM network.",
    },
    {
      q: "How pay on-chain transaction fees?",
      a: "On-chain transactions fees are paid in the native currency of the network. For example, on Ethereum network, you have to pay gas fees in ETH. On Solana network, you have to pay gas fees in SOL. On Bitcoin network, you have to pay gas fees in BTC. Keep in mind that you have to get some native token to pay for gas fees on each network that you use. <br/>By default, Hexa Lite set network to Optimism which is a layer 2 solution on Ethereum network that use ETH to pay fees. You can change network by clicking on the authenticate badge on the top right corner of the screen.",
    },
    {
      q: "Who is behind Hexa Lite?",
      a: "Hexa Lite is an open-source software developed by HexaOneLabs, a swiss based developpers organization that work on blockchain and DeFi technologies. You can learn more about HexaOneLabs here <a href='https://hexaonelabs.com' target='_blank'>https://hexaonelabs.com</a>.",
    }
  ];
  // Generate IonAccordion for each faq
  return (
    <>
      <IonAccordionGroup>
        {data.map((faq, index) => (
          <IonAccordion className="faq" key={index}>
            <IonItem slot="header">
              <IonLabel className="ion-padding-vertical">
                <h4 style={{fontSize: '1.2rem'}}>{faq.q}</h4>
              </IonLabel>
            </IonItem>
            <div slot="content">
              <IonText>
                <p 
                  className="ion-padding-horizontal" 
                  style={{fontSize: '0.8rem'}}
                  dangerouslySetInnerHTML={{__html: faq.a}}></p>
              </IonText>
            </div>
          </IonAccordion>
        ))}
      </IonAccordionGroup>
    </>
  );
};
