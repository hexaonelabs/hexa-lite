import { IMarketPool } from "@/interfaces/reserve.interface";
import { MarketPool } from "./Market.pool";


export class SolendPool extends MarketPool  {
  constructor(pool: IMarketPool) {
    super(pool);
  }

  public async deposit(amount: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async withdraw(amount: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async borrow(amount: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async repay(amount: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}