import { Pipe, PipeTransform } from "@angular/core";
import { TokenAmount } from "@lifi/sdk";

@Pipe({
  name: "toTokenAmount",
  standalone: true,
})
export class ToTokenAmountPipe implements PipeTransform {
  transform(tokenAddress: string, walletTokens?: TokenAmount[] | null): number {
    if (!walletTokens) {
      return 0;
    }
    // type validation
    if (typeof tokenAddress !== "string" || !Array.isArray(walletTokens)) {
      throw new Error("Invalid input types");
    }
    return walletTokens.reduce((acc, token) => {
      if (token.address.toLowerCase() === tokenAddress.toLowerCase()) {
        const result = acc + Number(token.amount) / 10 ** token.decimals;
        // value validation
        if (isNaN(result)) {
          throw new Error("Invalid token amount");
        }
        return result;
      }
      return acc;
    }, 0);
  }
}
