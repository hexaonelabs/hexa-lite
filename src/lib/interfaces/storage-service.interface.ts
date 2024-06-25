import { IStorageProvider } from './storage-provider.interface';

export interface IStorageService extends Omit<IStorageProvider, 'initialize'> {
	isExistingPrivateKeyStored(): Promise<boolean>;
	executeBackup(requestBackup: boolean, secret?: string): Promise<void>;
	initialize(storageProvider: IStorageProvider, apiKey?: string): Promise<void>;
}
