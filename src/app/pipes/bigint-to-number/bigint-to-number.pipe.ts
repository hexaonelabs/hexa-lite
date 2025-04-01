import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bigintToNumber',
  standalone: true
})
export class BigintToNumberPipe implements PipeTransform {

  transform(value: BigInt | undefined): number {
    return value ? Number(value) : 0;
  }

}
