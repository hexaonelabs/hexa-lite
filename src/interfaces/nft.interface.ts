import { IChain } from "@/constants/chains";
import { IAnkrNTFResponse } from "@/servcies/ankr.service";

export type INFT = (IAnkrNTFResponse & {
  chain: IChain;
});