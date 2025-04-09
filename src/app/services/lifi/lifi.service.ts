import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
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
} from "@lifi/sdk";
import { WalletconnectService } from "../walletconnect/walletconnect.service";
import { LoadingController } from "@ionic/angular/standalone";
import { AVAILABLE_CHAINS } from "@app/app.utils";
import { BehaviorSubject, combineLatest, firstValueFrom, map, tap } from "rxjs";
import { Chain, createPublicClient, http, parseUnits } from "viem";
import { ToDecimalPipe } from "@app/pipes/to-decimal/to-decimal.pipe";

@Injectable({
  providedIn: "root",
})
export class LIFIService {
  private readonly _hideSmallAmount$ = new BehaviorSubject<boolean>(
    localStorage.getItem("hideSmallAmount")
      ? localStorage.getItem("hideSmallAmount") === "true"
      : false
  );
  public readonly hideSmallAmount$ = this._hideSmallAmount$.asObservable();
  private readonly _walletTokens = new BehaviorSubject<TokenAmount[]>([]);
  public readonly walletTokens$ = combineLatest([
    this._walletTokens.asObservable(),
    this.hideSmallAmount$,
  ]).pipe(
    map(([tokens, hideSmallAmount]) => {
      if (hideSmallAmount) {
        return tokens.filter(
          (t) =>
            new ToDecimalPipe().transform(Number(t.amount), t.decimals) *
              Number(t.priceUSD) >
            1
        );
      }
      return tokens;
    })
  );
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
              throw new Error("No wallet client available");
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
          address: "0x0000000000000000000000000000000000000000",
          amount: 3878139031241991493n,
          blockNumber: 69235034n,
          chainId: 137,
          coinKey: "POL" as any,
          decimals: 18,
          logoURI:
            "https://static.debank.com/image/matic_token/logo_url/matic/6f5a6b6f0732a7a235131bd7804d357c.png",
          name: "Polygon Ecosystem Token",
          priceUSD: "0.212",
          symbol: "POL",
        },
        {
          address: "0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530",
          amount: 15044015341139963n,
          blockNumber: 69616404n,
          chainId: 137,
          coinKey: "aPolLINK",
          decimals: 18,
          logoURI:
            "https://static.debank.com/image/matic_token/logo_url/0x191c10aa4af7c30e871e70c95db0e4eb77237530/048393d32b2941d475463a9f9a9c1596.png",
          name: "Aave Polygon LINK",
          priceUSD: "14.1182904980535",
          symbol: "aPolLINK",
        },
        {
          address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
          amount: 14418513471878085n,
          blockNumber: 69620692n,
          chainId: 137,
          coinKey: "LINK",
          decimals: 18,
          logoURI:
            "https://static.debank.com/image/matic_token/logo_url/0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39/69425617db0ef93a7c21c4f9b81c7ca5.png",
          name: "ChainLink Token",
          priceUSD: "14.283839511834369",
          symbol: "LINK",
        },
      ];
      this._walletTokens.next(mockTokenList);
    }
  }

  async getAvailableTokens(): Promise<{ [chainId: number]: Token[] }> {
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
        throw new Error("Chain not found");
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
      throw new Error("No wallet address available");
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
      fee: environment.app_fees_min,
      slippage: environment.app_slippage_min,
    };
    console.log({ ops });
    const quote = await getQuote(ops);
    return quote;
  }

  async toggleHideSmallAmount() {
    const hideSmallAmount = this._hideSmallAmount$.value;
    localStorage.setItem("hideSmallAmount", String(!hideSmallAmount));
    this._hideSmallAmount$.next(!hideSmallAmount);
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
    for (const [index, step] of route.steps.entries()) {
      if (step.execution?.process) {
        for (const process of step.execution.process) {
          const receipt = await this._processTransaction(
            publicClient,
            process,
            index
          );
          if (receipt) receipts.push(receipt);
        }
      }
    }
    return receipts;
  }

  private async _processTransaction(
    publicClient: ReturnType<typeof createPublicClient>,
    process: any,
    index: number
  ): Promise<`0x${string}` | undefined> {
    if (!process.txHash) return;
    console.log(
      `Transaction Hash for Step ${index + 1}, Process ${process.type}:`,
      process.txHash
    );
    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: process.txHash as `0x${string}`,
      });
      return receipt.transactionHash;
    } catch (error) {
      console.error(
        `Error while waiting for transaction receipt for Step ${
          index + 1
        }, Process ${process.type}:`,
        error
      );
      throw error;
    }
  }

  private async _populateTokensBalanceList() {
    const walletAddress = await this._getWalletAddress();
    const ionLoading = await this._showLoadingIndicator(
      "Loading wallet tokens balance..."
    );
    try {
      const tokenWithAmount = await this._fetchTokenBalances(walletAddress);
      this._walletTokens.next(tokenWithAmount);
    } catch (error) {
      throw error;
    } finally {
      await ionLoading.dismiss();
    }
  }

  private async _getWalletAddress(): Promise<string> {
    const walletAddress = await firstValueFrom(
      this._walletService.walletAddress$
    );
    if (!walletAddress) {
      throw new Error("No wallet address available");
    }
    return walletAddress;
  }

  private async _showLoadingIndicator(message: string) {
    const ionLoading = await new LoadingController().create({ message });
    await ionLoading.present();
    return ionLoading;
  }

  private async _fetchTokenBalances(
    walletAddress: string
  ): Promise<TokenAmount[]> {
    const tokensResponse = await getTokens({ minPriceUSD: 0.05 });
    const chainTokens = this._filterTokensByAvailableChains(
      tokensResponse.tokens
    );
    const balances = await getTokenBalancesByChain(walletAddress, chainTokens);
    return Object.values(balances)
      .flat()
      .filter((t) => Number(t.amount) > 0);
  }

  private _filterTokensByAvailableChains(tokensToFilter: {
    [chainId: number]: Token[];
  }): { [chainId: number]: Token[] } {
    const tokens = Object.keys(tokensToFilter).filter((chainId) =>
      AVAILABLE_CHAINS.find((c) => c.id === Number(chainId))
    );
    return tokens.reduce((acc, chainId) => {
      acc[Number(chainId)] = tokensToFilter[Number(chainId)];
      return acc;
    }, {} as { [chainId: number]: Token[] });
  }
}
