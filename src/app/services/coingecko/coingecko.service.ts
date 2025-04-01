import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Coin } from '@app/models/coingecko.interface';

const FAKE_TOP_1000_COINS = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image:
      'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400',
    current_price: 83896,
    market_cap: 1662505062847,
    market_cap_rank: 1,
    fully_diluted_valuation: 1662505062847,
    total_volume: 20653978324,
    high_24h: 84770,
    low_24h: 83239,
    price_change_24h: 135.45,
    price_change_percentage_24h: 0.16171,
    market_cap_change_24h: -2311715059.695801,
    market_cap_change_percentage_24h: -0.13886,
    circulating_supply: 19839928.0,
    total_supply: 19839928.0,
    max_supply: 21000000.0,
    ath: 108786,
    ath_change_percentage: -22.94777,
    ath_date: '2025-01-20T09:11:54.494Z',
    atl: 67.81,
    atl_change_percentage: 123514.37394,
    atl_date: '2013-07-06T00:00:00.000Z',
    roi: null,
    last_updated: '2025-03-21T16:47:56.586Z',
    sparkline_in_7d: {
      price: [
        83285.94816925052, 83412.0919014835, 83596.51735562595,
        83264.95867344199, 84727.83488216766, 84622.75627876476,
        84553.36384711522, 84565.22545311949, 84536.46356442082,
        84131.61719559043, 84207.15781003753, 84346.89648742026,
        83955.00378884435, 84316.41004792161, 84378.94751072212,
        84505.5781189017, 84476.52475723809, 84381.74557966145,
        84314.86749685973, 84170.28914764302, 83863.26278107218,
        83953.64902106512, 83931.86372679561, 83924.71665747926,
        84077.984480905, 84133.58364594172, 84397.93103623143,
        84141.80648875001, 84282.5733553542, 84351.03100749975,
        84450.69621702406, 84173.30840256019, 84295.2224544024,
        84369.37930960456, 84374.89491697127, 84358.9159883021,
        84354.47191448158, 84244.23238441288, 83899.48633774147,
        83955.58636192667, 84323.27268421142, 84418.91164824746,
        84356.03663149933, 84219.52762087784, 84278.08716723607,
        84223.87397209837, 83875.92487677633, 83404.4666080581,
        82420.98968021553, 82904.91793465686, 82891.18824385572,
        83368.7697151249, 83327.41736609103, 83963.75617065372,
        83850.26919968214, 83673.10408191198, 83257.2524364498,
        83054.93850488712, 82743.13181426356, 82077.84518119802,
        82617.7331241566, 83064.70985538384, 83208.95029801303,
        83260.16652548696, 83712.82326596747, 83431.48057163977,
        83272.61714728127, 83393.68086720291, 83528.44238695232,
        83476.89973804823, 83625.88247117506, 83284.93030929644,
        83333.77147533474, 83054.86326244925, 82932.58142558922,
        82888.72671035347, 83583.93818642639, 83415.90071838192,
        84228.23544937836, 84448.92794202417, 84430.83006819447,
        83977.89583491963, 84088.43956648538, 83980.78904995437,
        83920.30721263391, 83877.42295483136, 83130.45397201553,
        83351.13970133282, 83100.42286596482, 82998.59763474177,
        82988.83415321489, 82428.06846517629, 83261.71116076875,
        83276.43582703028, 82922.10615223943, 82787.295493254,
        82545.12487759089, 82384.51632667694, 81259.85862657995,
        81632.93965990763, 81559.34875411353, 81873.62930637106,
        81380.28829871821, 81839.8881631514, 82201.79412495729,
        82051.95957857351, 82001.52920368989, 82500.92476738001,
        82780.03048688271, 83100.88640848425, 82703.69232896074,
        82938.50804446227, 83058.47252533144, 82996.62990102176,
        83177.70738079348, 83171.46725678681, 83182.95823272505,
        83388.41592982221, 83531.79129549615, 83486.04202178019,
        83776.84720807298, 83761.43747882382, 84191.81444671717,
        84218.7779651746, 84620.39023500234, 84590.9687216577,
        84258.56237624737, 85888.99366381548, 85452.54273371371,
        85343.76599188604, 85629.40668023448, 86185.41143785912,
        86815.44109470697, 86023.02793690139, 85865.46977691361,
        86081.32251805106, 85924.85863959961, 85636.4698965906,
        85894.57540910708, 85779.65947424584, 85846.60645541982,
        86229.67963508387, 85882.7039898859, 85222.63297451382,
        85380.33161914661, 85310.96814284839, 85504.94400788672,
        85405.15657351525, 84683.88848622817, 83735.87324881191,
        84006.03482067536, 84040.25543267331, 84134.39141427614,
        84531.19085429756, 84309.65715170768, 84087.18295443771,
        84326.23460828917, 84473.8179802995, 84743.39249862774,
        84634.46695960859, 84474.66633967978, 84630.85046766164,
        84437.76675727686, 84179.23584511163, 83881.93676879247,
        83989.60535436933, 84094.71763124721, 84153.42484945175,
      ],
    },
    price_change_percentage_1h_in_currency: 0.25864609552657847,
    price_change_percentage_24h_in_currency: 0.16171469477350578,
    price_change_percentage_30d_in_currency: -12.559897243326457,
    price_change_percentage_7d_in_currency: -0.9819403601810585,
  },
  {
    id: 'polygon-ecosystem-token',
    symbol: 'pol',
    name: 'Polygon',
    image:
      'https://static.debank.com/image/matic_token/logo_url/matic/6f5a6b6f0732a7a235131bd7804d357c.png',
    current_price: 0.21,
    market_cap: 1662505062847,
    market_cap_rank: 1,
    fully_diluted_valuation: 1662505062847,
    total_volume: 20653978324,
    high_24h: 84770,
    low_24h: 83239,
    price_change_24h: 135.45,
    price_change_percentage_24h: 0.16171,
    market_cap_change_24h: -2311715059.695801,
    market_cap_change_percentage_24h: -0.13886,
    circulating_supply: 19839928.0,
    total_supply: 19839928.0,
    max_supply: 21000000.0,
    ath: 108786,
    ath_change_percentage: -22.94777,
    ath_date: '2025-01-20T09:11:54.494Z',
    atl: 67.81,
    atl_change_percentage: 123514.37394,
    atl_date: '2013-07-06T00:00:00.000Z',
    roi: null,
    last_updated: '2025-03-21T16:47:56.586Z',
    sparkline_in_7d: {
      price: [
        83285.94816925052, 83412.0919014835, 83596.51735562595,
        83264.95867344199, 84727.83488216766, 84622.75627876476,
        84553.36384711522, 84565.22545311949, 84536.46356442082,
        84131.61719559043, 84207.15781003753, 84346.89648742026,
        83955.00378884435, 84316.41004792161, 84378.94751072212,
        84505.5781189017, 84476.52475723809, 84381.74557966145,
        84314.86749685973, 84170.28914764302, 83863.26278107218,
        83953.64902106512, 83931.86372679561, 83924.71665747926,
        84077.984480905, 84133.58364594172, 84397.93103623143,
        84141.80648875001, 84282.5733553542, 84351.03100749975,
        84450.69621702406, 84173.30840256019, 84295.2224544024,
        84369.37930960456, 84374.89491697127, 84358.9159883021,
        84354.47191448158, 84244.23238441288, 83899.48633774147,
        83955.58636192667, 84323.27268421142, 84418.91164824746,
        84356.03663149933, 84219.52762087784, 84278.08716723607,
        84223.87397209837, 83875.92487677633, 83404.4666080581,
        82420.98968021553, 82904.91793465686, 82891.18824385572,
        83368.7697151249, 83327.41736609103, 83963.75617065372,
        83850.26919968214, 83673.10408191198, 83257.2524364498,
        83054.93850488712, 82743.13181426356, 82077.84518119802,
        82617.7331241566, 83064.70985538384, 83208.95029801303,
        83260.16652548696, 83712.82326596747, 83431.48057163977,
        83272.61714728127, 83393.68086720291, 83528.44238695232,
        83476.89973804823, 83625.88247117506, 83284.93030929644,
        83333.77147533474, 83054.86326244925, 82932.58142558922,
        82888.72671035347, 83583.93818642639, 83415.90071838192,
        84228.23544937836, 84448.92794202417, 84430.83006819447,
        83977.89583491963, 84088.43956648538, 83980.78904995437,
        83920.30721263391, 83877.42295483136, 83130.45397201553,
        83351.13970133282, 83100.42286596482, 82998.59763474177,
        82988.83415321489, 82428.06846517629, 83261.71116076875,
        83276.43582703028, 82922.10615223943, 82787.295493254,
        82545.12487759089, 82384.51632667694, 81259.85862657995,
        81632.93965990763, 81559.34875411353, 81873.62930637106,
        81380.28829871821, 81839.8881631514, 82201.79412495729,
        82051.95957857351, 82001.52920368989, 82500.92476738001,
        82780.03048688271, 83100.88640848425, 82703.69232896074,
        82938.50804446227, 83058.47252533144, 82996.62990102176,
        83177.70738079348, 83171.46725678681, 83182.95823272505,
        83388.41592982221, 83531.79129549615, 83486.04202178019,
        83776.84720807298, 83761.43747882382, 84191.81444671717,
        84218.7779651746, 84620.39023500234, 84590.9687216577,
        84258.56237624737, 85888.99366381548, 85452.54273371371,
        85343.76599188604, 85629.40668023448, 86185.41143785912,
        86815.44109470697, 86023.02793690139, 85865.46977691361,
        86081.32251805106, 85924.85863959961, 85636.4698965906,
        85894.57540910708, 85779.65947424584, 85846.60645541982,
        86229.67963508387, 85882.7039898859, 85222.63297451382,
        85380.33161914661, 85310.96814284839, 85504.94400788672,
        85405.15657351525, 84683.88848622817, 83735.87324881191,
        84006.03482067536, 84040.25543267331, 84134.39141427614,
        84531.19085429756, 84309.65715170768, 84087.18295443771,
        84326.23460828917, 84473.8179802995, 84743.39249862774,
        84634.46695960859, 84474.66633967978, 84630.85046766164,
        84437.76675727686, 84179.23584511163, 83881.93676879247,
        83989.60535436933, 84094.71763124721, 84153.42484945175,
      ],
    },
    price_change_percentage_1h_in_currency: 0.25864609552657847,
    price_change_percentage_24h_in_currency: 0.16171469477350578,
    price_change_percentage_30d_in_currency: -12.559897243326457,
    price_change_percentage_7d_in_currency: -0.9819403601810585,
  },
];

@Injectable({
  providedIn: 'root',
})
export class CoingeckoService {
  private readonly _top1000Coins: Map<string, Coin> = new Map();
  private readonly _favoriteCoins$ = new BehaviorSubject<{id: string}[]>([]);

  constructor(private readonly _http: HttpClient) {}

  async getAllCoinsId(): Promise<{id: string; symbol: string;}[]> {
    // check if data is available in local storage
    const coinsList = localStorage.getItem('coins-list');
    if (coinsList) {
      return JSON.parse(coinsList);
    }
    // fetch data from api
    const url = `https://api.coingecko.com/api/v3/coins/list`;
    const response = this._http.get<{id: string; symbol: string;}[]>(url);
    const result = await firstValueFrom(response);
    // save result to local storage
    localStorage.setItem('coins-list', JSON.stringify(result));
    return result;
  }

  async getDataMarket(coinsIdList: string[], force?: boolean) {
    if (!coinsIdList.length) {
      throw new Error('coinsIdList is empty');
    }
    if (force) {
      localStorage.removeItem('coins-market-data');
    }
    // check if data is available in local storage and last updated less than 30 minutes
    const coinsData = localStorage.getItem('coins-market-data');
    if (coinsData) {
      const { timestamp, data } = JSON.parse(coinsData);
      const now = new Date().getTime();
      if (now - timestamp < 30 * 60 * 1000) {
        return data;
      }
    }
    const apiKey = environment.coingecko_apikey;
    // fetch data from api
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=id_asc&sparkline=true&price_change_percentage=1h%2C24h%2C7d%2C30d&locale=en&x_cg_demo_api_key=${apiKey}&ids=${coinsIdList.join(
      ','
    )}`;
    const response = this._http.get(url);
    const result = await firstValueFrom(response);
    // save result to local storage
    localStorage.setItem(
      'coins-market-data',
      JSON.stringify({
        timestamp: new Date().getTime(),
        data: result,
      })
    );
    return result;
  }

  async get7DaysHistoryData$(tickerId: string) {
    return this.getDataMarket([tickerId]).then(([data]) => {
      if (!data) {
        return { prices: [] };
      }
      return data
        .find((c: { id: string }) => c.id === tickerId)
        .sparkline_in_7d.price.map((price: number, index: number) => [
          new Date().getTime() - (7 - index) * 24 * 60 * 60 * 1000,
          price,
        ]);
    });
  }

  async getHistoryData(tickerId: string, days: number) {
    // check if data is available in local storage and last updated less than 30 minutes
    const coinHistory = localStorage.getItem(`coin-history-${tickerId}`);
    if (coinHistory) {
      const { timestamp, data } = JSON.parse(coinHistory);
      const now = new Date().getTime();
      if (now - timestamp < 30 * 60 * 1000) {
        // return observable from local storage
        return new Observable<{ prices: [number, number][] }>((observer) => {
          observer.next(data);
          observer.complete();
        });
      }
    }
    const url = `https://api.coingecko.com/api/v3/coins/${tickerId}/market_chart?vs_currency=usd&days=${days}`;
    const response = this._http.get<{ prices: [number, number][] }>(url);
    // save result to local storage
    firstValueFrom(response).then((result) => {
      localStorage.setItem(
        `coin-history-${tickerId}`,
        JSON.stringify({
          timestamp: new Date().getTime(),
          data: result,
        })
      );
    });
    // returh observable response
    const data = await firstValueFrom(response);
    return data;
  }

  async getTop1000Coins(): Promise<Coin[]> {
    if (!environment.isProd) {
      return FAKE_TOP_1000_COINS;
    }
    const last_updated = localStorage.getItem('top1000-coins-last-updated');
    const isLessThan30Minutes =
      new Date().getTime() -
        (last_updated ? new Date(last_updated) : new Date()).getTime() <
      30 * 60 * 1000;
    if (this._top1000Coins.size && isLessThan30Minutes) {
      return Array.from(this._top1000Coins.values());
    }
    // check if data is available in local storage
    const apiKey = environment.coingecko_apikey;
    // fetch data from api
    const count = 1000;
    const result = await Promise.all(
      Array.from({ length: Math.ceil(count / 250) }).map(async (_, index) => {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${
          index + 1
        }&sparkline=true&price_change_percentage=1h%2C24h%2C7d%2C30d&x_cg_demo_api_key=${apiKey}`;
        const request = this._http.get<Coin[]>(url);
        return firstValueFrom(request);
      })
    );
    const tokens = result.flat();
    tokens.forEach((token) => {
      this._top1000Coins.set(token.id, token);
    });
    localStorage.setItem('top1000-coins-last-updated', new Date().toISOString());
    return tokens;
  }

  async toggleFavorite(id: string) {
    const favsJson = localStorage.getItem('favorite-coins');
    if (favsJson) {
      const favs: {id: string}[] = JSON.parse(favsJson);
      const index = favs.findIndex((fav) => fav.id === id);
      if (index > -1) {
        favs.splice(index, 1);
      } else {
        favs.push({ id });
      }
      localStorage.setItem('favorite-coins', JSON.stringify(favs));
      this._favoriteCoins$.next(favs);
    } else {
      localStorage.setItem('favorite-coins', JSON.stringify([{ id }]));
      this._favoriteCoins$.next([{ id }]);
    }
  }

  async isFavorite(id: string) {
    const favsJson = localStorage.getItem('favorite-coins');
    if (favsJson) {
      const favs: {id: string}[] = JSON.parse(favsJson);
      return favs.some((fav) => fav.id === id);
    }
    return false;
  }

  getAllFavotiteCoins$() {
    const favsJson = localStorage.getItem('favorite-coins');
    if (favsJson) {
      const favs: {id: string}[] = JSON.parse(favsJson);
      this._favoriteCoins$.next(favs);
    } else {
      this._favoriteCoins$.next([]);
    }
    return this._favoriteCoins$.asObservable();
  }
}
