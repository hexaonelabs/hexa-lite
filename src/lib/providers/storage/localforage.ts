import { IStorageProvider } from '../../interfaces/storage-provider.interface';
import { Storage } from '@ionic/storage';
import Crypto from '../crypto/crypto';

const generateBucketNameUsingWebGlSignature = () => {
	const res = [];
	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl2');
	res.push(gl?.getParameter(gl.RENDERER));
	res.push(gl?.getParameter(gl.VENDOR));
	const dbgRenderInfo = gl?.getExtension('WEBGL_debug_renderer_info');
	res.push(dbgRenderInfo?.UNMASKED_RENDERER_WEBGL);
	res.push(dbgRenderInfo?.UNMASKED_VENDOR_WEBGL);
	const encoded = new TextEncoder().encode(res.join(''));
	return btoa(String.fromCharCode(...Array.from(encoded)));
};

const generateUIDUsingCanvasID = (): string => {
	const canvas = document.createElement('canvas');
	canvas.height = 100;
	canvas.width = 800;
	const ctx = canvas.getContext('2d');
	if (ctx !== null) {
		ctx.font = '30px Arial';
		ctx?.fillText('Hello World', 20, 90);
	}
	return canvas.toDataURL().split(',').pop() as string;
};

const Environment = Object.freeze({
	applyEncryption: () => (process.env.NEXT_PUBLIC_APP_IS_PROD === 'true' ? true : false),
	bucketName: generateBucketNameUsingWebGlSignature()
});

const isStringified = Object.freeze((input: string = '') => {
	try {
		return JSON.parse(input);
	} catch {
		return input;
	}
});

class LocalForageStorage implements IStorageProvider {
  private _uid!: string;
  private _inMemoryDB?: Map<string, string>;
  private _provider?: Storage;
  
  private async _getDatabase() {
    if (!this._inMemoryDB) {
			const values =
				await this._provider?.get(Environment.bucketName) || undefined;
			const data =
				Environment.applyEncryption() && this._uid && values
					? JSON.parse(await Crypto.decrypt(this._uid, values))
					: values;
			const arrayOfData = isStringified(data);
			console.log(arrayOfData);
			this._inMemoryDB = new Map<string, string>(arrayOfData);
		}
		return this._inMemoryDB as Map<string, string>;
  }

  private async _saveDatabase() {
		if (!this._inMemoryDB) {
			throw new Error('Database not initialized');
		}
		const values = Array.from(this._inMemoryDB.entries());
		const data =
			Environment.applyEncryption() && this._uid && values
				? await Crypto.encrypt(this._uid, JSON.stringify(values))
				: values;
		await this._provider?.set(Environment.bucketName, data);
	}

  async initialize(apiKey?: string | undefined): Promise<void> {
		this._uid = generateUIDUsingCanvasID().slice(0, 16);
    const dbKey = Environment.bucketName;
    this._provider = new Storage({
			dbKey
		});
    await this._provider.create();
    await this._getDatabase();
  }

  getUniqueID(): string {
    return this._uid;
  }

  async getItem(key: string): Promise<string | null> {
		const result = await this._getDatabase().then((db) => db.get(key));
		return result || null;
  }

  async setItem(key: string, value: string): Promise<void> {
		if (!this._inMemoryDB) {
			throw new Error('Database not initialized');
		}
		this._inMemoryDB.set(key, value);
		await this._saveDatabase();
  }

  async removeItem(key: string): Promise<void> {
		if (!this._inMemoryDB) {
			throw new Error('Database not initialized');
		}
		this._inMemoryDB.delete(key);
		await this._saveDatabase();
		if (this._inMemoryDB.size === 0) {
			await this._provider?.remove(Environment.bucketName);
		}
  }

  async removesItems(keys: string[]): Promise<void> {
    for (const key of keys) await this.removeItem(key);
  }

  async clear(): Promise<void> {
    this._inMemoryDB = new Map<string, string>();
    await this._provider?.clear();
  }

}

const storageProvider: IStorageProvider = new LocalForageStorage();

export default storageProvider;