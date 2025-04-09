import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AVAILABLE_CHAINS, DEFAULT_CHAIN } from '@app/app.utils';
import { environment } from '@env/environment';
import { LoadingController } from '@ionic/angular/standalone';
import Provider, { EthereumProvider } from '@walletconnect/ethereum-provider';
import { BehaviorSubject } from 'rxjs';
import { createWalletClient, custom, WalletClient } from 'viem';

@Injectable({
  providedIn: 'root',
})
export class WalletconnectService {
  private readonly _walletAddress$ = new BehaviorSubject<string | null>(null);
  public readonly walletAddress$ = this._walletAddress$.asObservable();
  private _walletClient: WalletClient | null = null;
  private _web3Provider: Provider | null = null;
  private _loader: HTMLIonLoadingElement | null = null;

  constructor(
    private readonly _router: Router,
  ) {}

  getWalletClient() {
    if (!this._walletClient) {
      throw new Error('No wallet client available');
    }
    return this._walletClient;
  }

  getProvider() {
    if (!this._web3Provider) {
      throw new Error('No provider available');
    }
    return this._web3Provider;
  }

  public async init() {
    if (this._web3Provider) {
      return;
    }
    console.log('Initializing WalletConnect Service');
    const projectId = environment.reown_project_id;
    const optionalChains = AVAILABLE_CHAINS.map((c) => c.id) as any;
    this._web3Provider = await EthereumProvider.init({
      projectId,
      showQrModal: true,
      optionalChains,
    });
    if (this._web3Provider.connected) {
      try {
        console.log('Reconnecting Wallet...');
        await this._addWalletEventListeners();
        await this._initWalletClient();
      } catch (error) {
        await this.disconnect();
      }
    }
  }

  async connect() {
    if (!this._web3Provider) {
      throw new Error('No provider available');
    }
    // display loader during opening connect modal
    this._loader = await new LoadingController().create();
    await this._loader.present();
    this._loader.onDidDismiss().then(() => {
      this._loader = null;
    });
    await this._addWalletEventListeners();
    // call connect method
    try {
      await this._web3Provider.connect({
        chains: [DEFAULT_CHAIN.id],
      });
    } catch (error) {
      await this.disconnect();
      return;
    }
    await this._initWalletClient();
  }
  
  private async _addWalletEventListeners() {
    if (!this._web3Provider) {
      throw new Error('No provider available');
    }
    // chain changed
    // this._web3Provider.on('chainChanged', async (hexChainId) => {});
    // accounts changed
    this._web3Provider.on('accountsChanged', (accounts) => {
      console.log('Accounts Changed', accounts);
    });
    // session established
    this._web3Provider.on('connect', async (event) => {
      console.log('Session Connected', event);
      const { chainId: hexChainId } = event;
    });
    // session event - chainChanged/accountsChanged/custom events
    this._web3Provider.on('session_event', (event) => {
      console.log('Session Event', event);
    });
    // connection uri
    this._web3Provider.on('display_uri', (event) => {
      console.log('Display URI', event);
      // ensure loader is dismissed
      this._loader?.dismiss();
      this._loader = null;
    });
    // session disconnect
    this._web3Provider.on('disconnect', (event) => {
      console.log('Session Disconnected', event);
    });
  }

  private async _initWalletClient() {
    if (!this._web3Provider) {
      throw new Error('No provider available');
    }
    const chain =
      AVAILABLE_CHAINS.find((c) => c.id === this._web3Provider?.chainId) ??
      DEFAULT_CHAIN;
    console.log('Initializing Wallet Client', chain);
    this._walletClient = createWalletClient({
      chain,
      transport: custom(this._web3Provider),
      account: this._web3Provider.accounts[0] as `0x${string}`,
    });
    // get account address & chain id
    const [address] = await this._walletClient.getAddresses();
    this._walletAddress$.next(address);
  }

  async disconnect() {
    if (!this._web3Provider) {
      return;
    }
    this._walletAddress$.next(null);
    await this._web3Provider.disconnect();
    // detach all event listeners
    this._web3Provider.off('chainChanged', () => {});
    this._web3Provider.off('accountsChanged', () => {});
    this._web3Provider.off('connect', () => {});
    this._web3Provider.off('session_event', () => {});
    this._web3Provider.off('display_uri', () => {});
    this._web3Provider.off('disconnect', async () => {
      await this._router.navigateByUrl('/')
    });
    this._walletClient = null;
  }
}
