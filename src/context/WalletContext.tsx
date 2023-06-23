import { Token } from '@lifi/sdk';
import {
  LiFiWalletManagement,
  Wallet,
  readActiveWallets,
  supportedWallets,
  
} from '@lifi/wallet-management';
import { Signer } from 'ethers';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { magic } from '../servcies/magic';
import { useEthersProvider } from './Web3Context';



const liFiWalletManagement = new LiFiWalletManagement();

const stub = (): never => {
  throw new Error('You forgot to wrap your component in <WalletProvider>.');
};

type WalletContextType = {
  connect: (wallet: Wallet) => Promise<Signer>;
  disconnect: () => Promise<void>;
  account: WalletAccountType;
}

type WalletAccountType = {
  address?: string;
  isActive?: boolean;
  signer?: Signer;
  chainId?: number;
}

export const initialContext: WalletContextType = {
  connect: stub,
  disconnect: stub,
  // switchChain: stub,
  // addChain: stub,
  // addToken: stub,
  account: {},
};

const WalletContext = createContext<WalletContextType>(initialContext);

export const useWallet = (): WalletContextType =>
React.useContext(WalletContext);

export const WalletProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [account, setAccount] = useState<WalletAccountType>({});
  const [currentWallet, setCurrentWallet] = useState<Wallet | undefined>();
  
  const { initializeWeb3 } = useEthersProvider();

  // autoConnect
  useEffect(() => {
    const autoConnect = async () => {
      const persistedActiveWallets = readActiveWallets();
      const activeWallets = supportedWallets.filter((wallet) =>
        persistedActiveWallets.some(
          (perstistedWallet) => perstistedWallet.name === wallet.name,
        ),
      );
      if (!activeWallets.length) {
        return;
      }
      await liFiWalletManagement.autoConnect(activeWallets);
      activeWallets[0].on('walletAccountChanged', handleWalletUpdate);
      handleWalletUpdate(activeWallets[0]);
    };
    autoConnect();
  }, []);

  const handleWalletUpdate = async (wallet?: Wallet) => {
    setCurrentWallet(wallet);
    const account = await extractAccountFromSigner(wallet?.account?.signer);
    setAccount(account);
  };
  const connect = useCallback(async (wallet: Wallet) => {
    // await liFiWalletManagement.connect(wallet);
    // wallet.on('walletAccountChanged', handleWalletUpdate);

    // handleWalletUpdate(wallet);
    // const signer = wallet?.account?.signer;
    // // handle unexisting signer
    // if (!signer) {
    //   throw new Error('Signer not found');
    // }
    try {
      // Try to connect to the wallet using Magic's user interface
      await magic.wallet.connectWithUI()

      // If connection to the wallet was successful, initialize new Web3 instance
      const provider = await initializeWeb3();
      const signer = provider?.getSigner();
      return signer;
    } catch (error: any) {
      // Log any errors that occur during the connection process
      console.error("handleConnect:", error)
      throw new Error("handleConnect:" + error?.message)
    }
  }, []);

  const disconnect = useCallback(async () => {
    console.log("disconnect");
    
    // if (currentWallet) {
    //   await liFiWalletManagement.disconnect(currentWallet);
    //   currentWallet.removeAllListeners();
    //   handleWalletUpdate(undefined);

      
    //   try {
    //     await magic.user.logout();
    //     // After successful disconnection, re-initialize the Web3 instance
    //     initializeWeb3();
    //   } catch (error: any) {
    //     console.error("handleDisconnect:", error);
    //     throw new Error("handleDisconnect:" + error?.message);
    //   }

    // }
  }, [account, currentWallet]);

  // const switchChain = useCallback(
  //   async (chainId: number) => {
  //     try {
  //       await currentWallet?.switchChain(chainId);
  //       handleWalletUpdate(currentWallet);
  //       return true;
  //     } catch {
  //       return false;
  //     }
  //   },
  //   [currentWallet],
  // );

  // const addChain = useCallback(
  //   async (chainId: number) => {
  //     try {
  //       await currentWallet?.addChain(chainId);
  //       handleWalletUpdate(currentWallet);
  //       return true;
  //     } catch {
  //       return false;
  //     }
  //   },
  //   [currentWallet],
  // );

  // const addToken = useCallback(
  //   async (chainId: number, token: Token) => {
  //     await currentWallet?.addToken(chainId, token);
  //     handleWalletUpdate(currentWallet);

  //     return;
  //   },
  //   [currentWallet],
  // );

  // useEffect(() => {
    
  // }, [
  //   account,
  //   account.signer,
  //   account.address,
  //   account.chainId,
  // ]);

  const value = useMemo(
    () => ({
      connect,
      disconnect,
      // switchChain,
      // addChain,
      // addToken,
      account,
      usedWallet: currentWallet,
    }),
    [
      account,
      // addChain,
      // addToken,
      connect,
      disconnect,
      // switchChain,
      currentWallet,
    ],
  );

  return (
    <WalletContext.Provider value={value}> {children} </WalletContext.Provider>
  );
};

const extractAccountFromSigner = async (signer?: Signer) => {
  try {
    return {
      address: (await signer?.getAddress()) || undefined,
      isActive: (signer && !!(await signer.getAddress()) === null) || !!signer,
      signer,
      chainId: (await signer?.getChainId()) || undefined,
    };
  } catch {
    return {} as WalletAccountType;
  }
};