
export const getPublications = async (): Promise<{
  url: string;
  title: string;
  imgUrl: string;
  dateTime: number;
  short: string;
}[]> => {
  const publications = [
    {
      url: 'https://medium.com/@hexaonelabs/hexa-lite-transforming-the-landscape-of-decentralized-finance-c5ba5079c021',
      title: 'Hexa Lite: Transforming the Landscape of Decentralized Finance',
      imgUrl: 'https://miro.medium.com/v2/resize:fit:350/format:webp/1*o_hhgfFIZNQcGeQrFZm2rA.png',
      dateTime: Date.parse('01/17/2024'),
      short: 'Welcome to the future of decentralized finance with Hexa Lite, a groundbreaking platform that opens the doors of DeFi to a broader audience. Designed to simplify access to decentralized financial services, Hexa Lite pushes the boundaries to provide a simple and accessible user experience for all.'
    },
    {
      url: 'https://medium.com/@hexaonelabs/demystifying-defi-how-hexa-lite-makes-decentralized-finance-accessible-to-all-dd62dbe06410',
      title: 'Demystifying DeFi: How Hexa Lite Makes Decentralized Finance Accessible to All',
      imgUrl: 'https://miro.medium.com/v2/resize:fit:350/format:webp/1*0fw1ACIj4zvS-FYhwp8TpA.png',
      dateTime: Date.parse('01/24/2024'),
      short: 'Decentralized Finance, or DeFi, is undoubtedly one of the hottest topics in the current financial landscape. However, behind the technical jargon and apparent opportunities, lies a complex and often intimidating world, deterring many potential users.'
    },    
    {
      url: 'https://medium.com/@hexaonelabs/the-benefits-of-liquid-staking-with-hexa-lite-maximize-your-earnings-without-compromise-2e3852ead822',
      title: 'The Benefits of Liquid Staking with Hexa Lite: Maximize Your Earnings Without Compromise',
      imgUrl: 'https://miro.medium.com/v2/resize:fit:350/format:webp/1*ClE8BjpiHl2NYF4Gu69JNg.png',
      dateTime: Date.parse('01/31/2024'),
      short: 'Decentralized Finance (DeFi) is a revolution, but for many, liquid staking may seem like a mountain to climb. In this article, we will explore the complexities of liquid staking in DeFi and discover how Hexa Lite simplifies this experience, giving users the opportunity to maximize their earnings without compromise.'
    },
    {
      url: 'https://medium.com/@hexaonelabs/hexa-lite-your-gateway-to-seamless-authentication-c7f7feff5281',
      title: 'Hexa Lite: Your Gateway to Seamless Authentication',
      imgUrl: 'https://miro.medium.com/v2/resize:fit:350/format:webp/1*P89ZVTGsO0VWWw6jtZdEwA.png',
      dateTime: Date.parse('03/25/2024'),
      short: 'Experience the next level of simplicity and security with Hexa Lite’s one-click login process. Say goodbye to cumbersome account creation steps and hello to effortless access to our platform. With just a few clicks, you can sign up or log in using your email address or preferred social authentication method.'
    },
    {
      url: 'https://medium.com/@hexaonelabs/introducing-our-new-mobile-and-desktop-application-interface-try-it-now-7e0df3c1fdcd',
      title: 'Introducing Our New Mobile and Desktop Application Interface: Try It Now!',
      imgUrl: 'https://miro.medium.com/v2/resize:fit:350/format:webp/1*hTGoxycGxTQO6Iw94Y4iUw.png',
      dateTime: Date.parse('03/26/2024'),
      short: 'We are excited to announce the launch of our new mobile and desktop application interface! Our team has been working tirelessly to create a seamless and intuitive user experience that will make your journey with Hexa Lite even more enjoyable.'
    }
  ];

  return publications
    .sort((a, b) => b.dateTime - a.dateTime)
    .slice(0, 4);
}