import { providers } from 'ethers';

export abstract class Web3Wallet {
	public address!: string;
	public publicKey: string | undefined;
	public provider: providers.JsonRpcProvider | undefined;
	protected _privateKey: string | undefined;
	public abstract chainId: number;

	public abstract getSigner<T>(): Promise<T>;
	abstract sendTransaction(tx: unknown): Promise<unknown>;
	abstract signTransaction(tx: unknown): Promise<string>;
	abstract signMessage(message: string): Promise<string>;
	abstract verifySignature(message: string, signature: string): boolean;
	abstract switchNetwork(chainId: number): Promise<void>;
}
