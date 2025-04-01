import { Pipe, PipeTransform } from '@angular/core';
import { AVAILABLE_CHAINS } from '@app/app.utils';

@Pipe({
  name: 'toChainName',
  standalone: true
})
export class ToChainNamePipe implements PipeTransform {

  transform(chainId: number): string {
    return AVAILABLE_CHAINS.find(chain => chain.id === chainId)?.name || 'Network';
  }

}
