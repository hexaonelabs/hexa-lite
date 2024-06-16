export interface IStorageProvider {
	initialize(apiKey?: string): Promise<void>;
	getItem(key: string): Promise<string | null>;
	setItem(key: string, value: string): Promise<void>;
	removeItem(key: string): Promise<void>;
	clear(): Promise<void>;
	getUniqueID(): string;
}
