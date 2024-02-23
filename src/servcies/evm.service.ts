import { ethers } from "ethers";
import { getTokensBalances } from "./ankr.service";

export const connectWithEVM  = async () => {
  // get current account
  const web3Provider = new ethers.providers.Web3Provider(
    (window as any).ethereum
  );
  const accounts = await web3Provider.send('eth_requestAccounts', []);
  // console.log(accounts);
  try {
    await web3Provider.send('wallet_switchEthereumChain', [{ chainId: '0xA' }]);
  } catch (error: unknown) {
    console.log('[ERROR] {connectWithEVM} wallet_switchEthereumChain: ', error);
  }
  const signer = web3Provider?.getSigner();
  const chainId = await signer.getChainId();
  console.log('[INFO] {connectWithEVM}', { accounts, chainId });
  return {
    publicAddress: accounts[0],
    chainId,
    web3Provider,
    signer,
  };
};

export const isEVMWindowProviderAvailable = (): Boolean => {
  return ('ethereum' in window);
}

export const connectWithExternalWallet = async () => {
  // get current account
  const web3Provider = new ethers.providers.Web3Provider(
    (window as any).ethereum
  );
  const accounts = await web3Provider.send('eth_requestAccounts', []);
  console.log(accounts);
  try {
    await web3Provider.send('wallet_switchEthereumChain', [{ chainId: '0xA' }]);
  } catch (error: unknown) {
    console.log('>>>', error);
  }

  const signer = web3Provider?.getSigner();
  const chainId = await signer.getChainId();
  console.log('accounts', { accounts, chainId });
  //. setPublicAddress(accounts[0] || 'undefined');
  return {
    publicAddress: accounts[0],
    chainId,
    web3Provider,
    signer,
  };
};

export const fetchBalance = async (walletAddress: string) => {
  console.log(`[INFO] fetchBalance()`, walletAddress);
  if (!walletAddress) return null;
  const assets = await getTokensBalances([], walletAddress);
  return assets;
};