import { Injectable } from "@angular/core";
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
  ReserveDataHumanized,
} from "@aave/contract-helpers";
import * as markets from "@bgd-labs/aave-address-book";
import { providers } from "ethers";
import Provider from "@walletconnect/ethereum-provider";
import { AVAILABLE_CHAINS } from "@app/app.utils";
import dayjs from "dayjs";
import {
  formatReserves,
  FormatReserveUSDResponse,
  formatUserSummary,
  FormatUserSummaryResponse,
} from "@aave/math-utils";
import { BehaviorSubject, filter, firstValueFrom, map, mergeMap, Observable } from "rxjs";
import { MarketPool } from "@app/models/market-pool.interface";
import { getToken, Token } from "@lifi/sdk";
import { LIFIService } from "../lifi/lifi.service";
import { WalletconnectService } from "../walletconnect/walletconnect.service";

@Injectable({
  providedIn: "root",
})
export class AAVEV3Service {
  private readonly _userSummaries$ = new BehaviorSubject<null | Map<
    number,
    (FormatUserSummaryResponse<ReserveDataHumanized & FormatReserveUSDResponse>)
  >>(null);
  public readonly marketPools$: Observable<null | MarketPool[]> = this._userSummaries$.asObservable().pipe(
    map((userSummaries) => {
      if (!userSummaries) {
        return [] as any[];
      }
      const userReservesData = [...userSummaries.values()].flatMap(
        (userSummary) => {
          return userSummary.userReservesData;
        }
      );
      return userReservesData.flatMap((userReserve) => userReserve.reserve);
    }),
    map((userReservesData) => {
      return userReservesData.filter((reserve) => {
        return (
          reserve.isActive === true &&
          reserve.isFrozen === false &&
          reserve.isPaused === false
        );
      })
      .map((reserve) => {
        return {
          ...reserve,
          supplyAPYpercent: Number(reserve.supplyAPY) * 100,
          borrowAPYpercent: Number(reserve.variableBorrowAPY) * 100,
        };
      });
    }),
  );

  constructor(
    private readonly _lifiService: LIFIService,
    private readonly _walletService: WalletconnectService,
  ) {}

  async init(account: string, force?: boolean) {
    if (this._userSummaries$.value && !force) {
      return;
    }
    for (const chain of AVAILABLE_CHAINS) {
      await this.loadUserSummary({
        chainId: chain.id,
        account,
      });
    }
  }

  async getMarkets(wcProvider: Provider) {
    const provider = new providers.JsonRpcProvider(
      AVAILABLE_CHAINS.find(
        (chain) => chain.id === wcProvider.chainId
      )?.rpcUrls.default.http[0]
    );
    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: markets.AaveV3Polygon.UI_POOL_DATA_PROVIDER,
      provider,
      chainId: wcProvider.chainId,
    });
    const reserves = await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider: markets.AaveV3Polygon.POOL_ADDRESSES_PROVIDER,
    });
    const reservesArray = reserves.reservesData;
    const baseCurrencyData = reserves.baseCurrencyData;
    const currentTimestamp = dayjs().unix();
    const formattedPoolReserves = formatReserves({
      reserves: reservesArray,
      currentTimestamp,
      marketReferenceCurrencyDecimals:
        baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd:
        baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    });
    return formattedPoolReserves;
  }

  getUserSummaries$() {
    return this._userSummaries$.asObservable();
  }

  async loadUserSummary(ops: { chainId: number; account: string }) {
    const market = [
      markets.AaveV3Arbitrum,
      markets.AaveV3ArbitrumSepolia,
      markets.AaveV3Avalanche,
      markets.AaveV3BNB,
      markets.AaveV3Ethereum,
      markets.AaveV3Base,
      markets.AaveV3BaseSepolia,
      markets.AaveV3Polygon,
      markets.AaveV3Gnosis,
      markets.AaveV3Optimism,
      markets.AaveV3Scroll,
      markets.AaveV3Sonic,
      markets.AaveV3ZkSync,
    ].find((market) => market.CHAIN_ID === ops.chainId);
    if (!market) {
      throw new Error("Market not found");
    }
    const currentAccount = ops.account;
    const provider = new providers.JsonRpcProvider(
      AVAILABLE_CHAINS.find(
        (chain) => chain.id === ops.chainId
      )?.rpcUrls.default.http[0]
    );
    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: market.UI_POOL_DATA_PROVIDER,
      provider,
      chainId: ops.chainId,
    });
    const userReserves =
      await poolDataProviderContract.getUserReservesHumanized({
        lendingPoolAddressProvider: market.POOL_ADDRESSES_PROVIDER,
        user: currentAccount,
      });
    const reserves = await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider: market.POOL_ADDRESSES_PROVIDER,
    });
    const reservesArray = reserves.reservesData;
    const baseCurrencyData = reserves.baseCurrencyData;
    const userReservesArray = userReserves.userReserves;
    const currentTimestamp = dayjs().unix();
    const formattedReserves = formatReserves({
      reserves: reservesArray,
      currentTimestamp,
      marketReferenceCurrencyDecimals:
        baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd:
        baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    });
    const userSummary = formatUserSummary({
      currentTimestamp,
      marketReferencePriceInUsd:
        baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      marketReferenceCurrencyDecimals:
        baseCurrencyData.marketReferenceCurrencyDecimals,
      userReserves: userReservesArray,
      formattedReserves,
      userEmodeCategoryId: userReserves.userEmodeCategoryId,
    });
    // add to user summaries
    const userSummaries = this._userSummaries$.value
      ? this._userSummaries$.value
      : new Map<number, FormatUserSummaryResponse<ReserveDataHumanized & FormatReserveUSDResponse>>();
    userSummaries.set(ops.chainId, userSummary);
    this._userSummaries$.next(userSummaries);
    return userSummary;
  }

  async actions(role: string, payload: {
    pool: MarketPool;
    amount: number;
  }) {
    console.log('process done: ', {
      role,
      payload,
    }); 
    const walletAddress = await firstValueFrom(this._walletService.walletAddress$)
    if (!walletAddress) {
      throw new Error("No wallet address available");
    }
    const { pool, amount } = payload;
    const { id } = pool;   
    const chainId = id.split('-')[0];
    switch (true) {
      case role === "supply": {
        const fromToken = await getToken(Number(chainId), pool.underlyingAsset);
        const toToken = await getToken(Number(chainId), pool.aTokenAddress);
        const ops = {
          from: walletAddress as `0x${string}`,
          fromAmount: amount,
          fromTokenAddress: fromToken.address as `0x${string}`,
          fromChainId: Number(chainId),
          toTokenAddress: toToken.address as `0x${string}`,
          toChainId: Number(chainId),
        };
        const quote = await this._lifiService.requestLiFiQuote(ops);
        console.log({ quote });
        const result = await this._lifiService.executeSwap(quote);
        console.log({ result });
        break;
      }
    }
  }
}
