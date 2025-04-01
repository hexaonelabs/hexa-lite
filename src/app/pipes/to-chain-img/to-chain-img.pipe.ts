import { Pipe, PipeTransform } from '@angular/core';
import { AVAILABLE_CHAINS } from '@app/app.utils';

@Pipe({
  name: 'toChainImg',
  standalone: true
})
export class ToChainImgPipe implements PipeTransform {

  transform(chainId: number): string {
    return AVAILABLE_CHAINS.find(chain => chain.id === chainId)?.imgURL || '';
  }

}
