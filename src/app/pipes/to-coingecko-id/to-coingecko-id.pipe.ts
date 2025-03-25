import { Pipe, PipeTransform } from '@angular/core';
import { CoingeckoService } from '@app/services/coingecko/coingecko.service';

@Pipe({
  name: 'toCoingeckoId',
  standalone: true
})
export class ToCoingeckoIdPipe implements PipeTransform {

  constructor(
    private readonly _coingeckoService: CoingeckoService
  ) {}

  async transform(symbol: string): Promise<string> {
    return this._coingeckoService.getAllCoinsId().then((coins) => {
      const coin = coins.find(coin => coin.symbol.toLowerCase() === symbol.toLowerCase());
      return coin ? coin.id : symbol;
    });
  }

}
