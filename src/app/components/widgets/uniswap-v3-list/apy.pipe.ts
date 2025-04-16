import { Pipe } from "@angular/core";

@Pipe({
  name: "apy",
  standalone: true,
})
export class ApyPipe {
  transform(feeUSD: number, liquidityAmount: number): number {
    return 100 * (feeUSD / liquidityAmount)
  }
}