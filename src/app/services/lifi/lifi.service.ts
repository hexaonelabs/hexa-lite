import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  createConfig as createLiFiConfig,
  EVM,
  Token,
  getTokens,
  getTokenBalancesByChain,
  TokenAmount,
  LiFiStep,
  getToken,
  QuoteRequest,
  getQuote,
  convertQuoteToRoute,
  executeRoute,
  RouteExtended,
} from '@lifi/sdk';
import { WalletconnectService } from '../walletconnect/walletconnect.service';
import { LoadingController } from '@ionic/angular/standalone';
import { AVAILABLE_CHAINS, calculateAmountOfFormToken } from '@app/app.utils';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { Chain, createPublicClient, http, parseUnits } from 'viem';

@Injectable({
  providedIn: 'root',
})
export class LIFIService {
  private readonly _walletTokens = new BehaviorSubject<TokenAmount[]>([]);
  public readonly walletTokens$ = this._walletTokens.asObservable();
  public readonly walletBalance$ = this._walletTokens.pipe(
    map((tokens) =>
      tokens.reduce((acc, token) => {
        const amount = Number(token.amount) * 10 ** -token.decimals;
        const balanceUSD = amount ? amount * Number(token.priceUSD) : 0;
        return acc + balanceUSD;
      }, 0)
    )
  );

  constructor(private readonly _walletService: WalletconnectService) {}

  async init() {
    createLiFiConfig({
      integrator: environment.lifi_integrator,
      providers: [
        EVM({
          getWalletClient: async () => this._walletService.getWalletClient(),
          switchChain: async (chainId) => {
            if (!this._walletService.getWalletClient()) {
              throw new Error('No wallet client available');
            }
            await this._walletService.getWalletClient().switchChain({
              id: chainId,
            });
            return this._walletService.getWalletClient();
          },
        }),
      ],
    });
    if (environment.isProd) {
      await this._populateTokensBalanceList();
    } else {
      const mockTokenList = [
        {
          address: '0x0000000000000000000000000000000000000000',
          amount: 3878139031241991493n,
          blockNumber: 69235034n,
          chainId: 137,
          coinKey: 'POL' as any,
          decimals: 18,
          logoURI:
            'https://static.debank.com/image/matic_token/logo_url/matic/6f5a6b6f0732a7a235131bd7804d357c.png',
          name: 'Polygon Ecosystem Token',
          priceUSD: '0.212',
          symbol: 'POL',
        },
      ];
      this._walletTokens.next(mockTokenList);
    }
  }

  async getAvailableTokens(): Promise<{[chainId: number]: Token[]}> {
    const tokensResponse = await getTokens({
      minPriceUSD: 0.01,
    });
    const tokens = Object.keys(tokensResponse.tokens).filter((chainId) =>
      AVAILABLE_CHAINS.find((c) => c.id === Number(chainId))
    );
    const chainTokens = tokens.reduce((acc, chainId) => {
      acc[Number(chainId)] = tokensResponse.tokens[Number(chainId)];
      return acc;
    }, {} as { [chainId: number]: Token[] });
    return chainTokens;
  }

  async executeSwap(quote: LiFiStep) {
    // check if executionDuration is above 120 seconds
    if (quote.estimate.executionDuration > 120) {
      throw new Error(
        `Execution Duration too long: ${quote.estimate.executionDuration} seconds`
      );
    }
    // check slippage as percentage by comparing the quote `fromAmountUSD` and the `toAmountUSD`
    const slippage =
      ((Number(quote.estimate?.fromAmountUSD || 0) -
        Number(quote?.estimate?.toAmountUSD || 0)) /
        Number(quote.estimate.fromAmountUSD || 0)) *
      100;
    if (slippage >= 3.5) {
      throw new Error(
        `Slippage too high: ${slippage}% difference between ${quote.estimate?.fromAmountUSD} and ${quote?.estimate?.toAmountUSD}`
      );
    }
    console.log(`Slippage: ${slippage}`);
    // 3) Execute payment from quote
    try {
      const executedRte = await this._executeLiFiQuote(quote);
      const chain = AVAILABLE_CHAINS.find(
        (c) => c.id === executedRte.fromChainId
      );
      if (!chain) {
        throw new Error('Chain not found');
      }
      // 4) Wait for payment receipt
      const receipts = await this._waitForReceipt(executedRte, chain);
      console.log({ receipts });
      // 5) return receipts
      return receipts;
    } catch (error) {
      throw error;
    }
  }

  async requestLiFiQuote(value: {
    from?: `0x${string}`;
    fromAmount: number;
    fromTokenAddress: `0x${string}`;
    fromChainId: number;
    toTokenAddress: `0x${string}`;
    toChainId: number;
  }): Promise<LiFiStep> {
    const {
      from = await firstValueFrom(this._walletService.walletAddress$),
      fromAmount,
      fromTokenAddress,
      fromChainId,
      toTokenAddress,
      toChainId,
    } = value;
    if (!from) {
      throw new Error('No wallet address available');
    }
    const fromToken = await getToken(Number(fromChainId), fromTokenAddress);
    const toToken = await getToken(Number(toChainId), toTokenAddress);
    const ops: QuoteRequest = {
      fromAddress: from,
      fromChain: fromChainId,
      fromToken: fromToken.address,
      fromAmount: parseUnits(String(fromAmount), fromToken.decimals).toString(),
      toChain: toChainId,
      toToken: toToken.address,
      fee: 0.0175, // 1.75%
      slippage: 0.005, // = 0.5%
    };
    console.log({ ops });
    const quote = await getQuote(ops);
    return quote;
  }

  private async _executeLiFiQuote(quote: LiFiStep) {
    const route = convertQuoteToRoute(quote);
    console.log({ route });
    const executedRoute = await executeRoute(route, {
      // Gets called once the route object gets new updates
      updateRouteHook(route) {
        console.log({ updateRouteHook: route });
      },
    });
    return executedRoute;
  }

  private async _waitForReceipt(route: RouteExtended, chain: Chain) {
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });
    const receipts: `0x${string}`[] = [];
    route.steps.forEach((step, index) => {
      step.execution?.process.forEach(async (process) => {
        if (process.txHash) {
          console.log(
            `Transaction Hash for Step ${index + 1}, Process ${process.type}:`,
            process.txHash
          );
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: process.txHash as `0x${string}`,
          });
          receipts.push(receipt.transactionHash);
        }
      });
    });
    return receipts;
  }

  private async _populateTokensBalanceList() {
    const walletAddress = await firstValueFrom(
      this._walletService.walletAddress$
    );
    if (!walletAddress) {
      throw new Error('No wallet address available');
    }
    const ionLoading = await new LoadingController().create({
      message: `Loading wallet tokens balance...`,
    });
    await ionLoading.present();
    // get available account tokens from chain
    try {
      const tokensResponse = await getTokens({
        minPriceUSD: 0.05,
      });
      console.log({ tokensResponse });
      const tokenWithAmount: TokenAmount[] = [];
      // filter tokensResponse.tokens with AVAILABLE_CHAINS
      const tokens = Object.keys(tokensResponse.tokens).filter((chainId) =>
        AVAILABLE_CHAINS.find((c) => c.id === Number(chainId))
      );
      const chainTokens = tokens.reduce((acc, chainId) => {
        acc[Number(chainId)] = tokensResponse.tokens[Number(chainId)];
        return acc;
      }, {} as { [chainId: number]: Token[] });
      const balances = await getTokenBalancesByChain(
        walletAddress,
        chainTokens
      );
      // add all token with amount > 0
      const withAmount = Object.values(balances)
        .flat()
        .filter((t) => Number(t.amount) > 0);
      console.log(balances);
      tokenWithAmount.push(...withAmount);
      console.log({ tokenWithAmount });
      this._walletTokens.next(tokenWithAmount);
    } catch (error) {
      console.error(error);
    }
    // dismiss loader
    await ionLoading.dismiss();
  }
}
