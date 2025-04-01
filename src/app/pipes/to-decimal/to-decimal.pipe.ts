import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toDecimal',
  standalone: true
})
export class ToDecimalPipe implements PipeTransform {

  transform(amount: BigInt | string | number | undefined | null, decimals: number): number {
    return Number(amount) / 10 ** decimals;
  }

}
