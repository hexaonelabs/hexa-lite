import { KEYS } from '../constant';
import { IStorageProvider } from '../interfaces/storage-provider.interface';
import { IStorageService } from '../interfaces/storage-service.interface';
import Crypto from '../providers/crypto/crypto';
import { Environment } from '../providers/storage/local';
import { Logger } from '../utils';

class StorageService implements IStorageService {
	private _storageProvider!: IStorageProvider;

	constructor() {}

	public async initialize(
		_storageProvider: IStorageProvider,
		apiKey?: string
	): Promise<void> {
		this._storageProvider = _storageProvider;
		return this._storageProvider.initialize(apiKey);
	}

	public async getItem(key: string): Promise<string | null> {
		return this._storageProvider.getItem(key);
	}

	public async setItem(key: string, value: string): Promise<void> {
		return this._storageProvider.setItem(key, value);
	}

	public async removeItem(key: string): Promise<void> {
		return this._storageProvider.removeItem(key);
	}

	public async clear(): Promise<void> {
		return this._storageProvider.clear();
	}

	public async isExistingPrivateKeyStored() {
		const encryptedPrivateKey = await this._storageProvider.getItem(
			KEYS.STORAGE_PRIVATEKEY_KEY
		);
		return !!encryptedPrivateKey;
	}

	public async executeBackup(requestBackup: boolean, secret?: string) {
		Logger.log('[INFO] Execute Backup request:', { requestBackup, secret });
		const encriptedPrivateKey = await this._getBackup();
		const withEncryption = requestBackup === true;
		if (!secret && withEncryption) {
			throw new Error('Secret is required to decrypt the private key');
		}
		const data =
			!withEncryption && secret
				? await Crypto.decrypt(secret, encriptedPrivateKey)
				: encriptedPrivateKey;
		Logger.log('[INFO] Backup data:', {
			data,
			withEncryption,
			encriptedPrivateKey
		});
		const blob = new Blob([data], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		// use name formated with current date time like: hexa-backup-2021-08-01_12-00-00.txt
		a.download = `hexa-backup-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.txt`;
		a.click();
		URL.revokeObjectURL(url);
		await new Promise(resolve => setTimeout(resolve, 500));
		localStorage.removeItem(KEYS.STORAGE_BACKUP_KEY);
		await this._storageProvider.removeItem(KEYS.STORAGE_SKIP_BACKUP_KEY);
	}

	public getUniqueID(): string {
		return this._storageProvider.getUniqueID();
	}

	private async _getBackup() {
		// check if the database exist
		const db = window.localStorage.getItem(Environment.bucketName);
		if (!db) {
			throw new Error('Database empty');
		}
		// get privateKey from the database
		const enriptatePrivateKey = await this._storageProvider.getItem(
			KEYS.STORAGE_PRIVATEKEY_KEY
		);
		if (!enriptatePrivateKey) {
			throw new Error('Private key not found');
		}
		return enriptatePrivateKey;
	}
}

export const storageService: IStorageService = new StorageService();
