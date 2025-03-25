import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toBalanceCurrency',
  standalone: true
})
export class ToBalanceCurrencyPipe implements PipeTransform {

  transform(amount: number | undefined, usdPrice: string): number {
    return amount ? amount * Number(usdPrice) : 0;
  }

}
