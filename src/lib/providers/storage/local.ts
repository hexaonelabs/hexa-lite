import { IStorageProvider } from '../../interfaces/storage-provider.interface';
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

export const Environment = Object.freeze({
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

class LocalStorage implements IStorageProvider {
	private _uid!: string;
	private _inMemoryDB?: Map<string, string>;

	public async initialize() {
		const uid = generateUIDUsingCanvasID().slice(0, 16);
		this._uid = uid;
		await this._getDatabase();
	}

	private async _getDatabase() {
		if (!this._inMemoryDB) {
			const jsonString =
				window.localStorage.getItem(Environment.bucketName) || undefined;
			const data =
				Environment.applyEncryption() && this._uid && jsonString
					? await Crypto.decrypt(this._uid, jsonString)
					: jsonString;
			const arrayOfData = isStringified(data);
			this._inMemoryDB = new Map<string, string>(arrayOfData);
		}
		return this._inMemoryDB as Map<string, string>;
	}

	private async _saveDatabase() {
		if (!this._inMemoryDB) {
			throw new Error('Database not initialized');
		}
		const jsonString = JSON.stringify(Array.from(this._inMemoryDB.entries()));
		const data =
			Environment.applyEncryption() && this._uid && jsonString
				? await Crypto.encrypt(this._uid, jsonString)
				: jsonString;
		window.localStorage.setItem(Environment.bucketName, data);
	}

	public getUniqueID(): string {
		return this._uid;
	}

	/**
	 *
	 * @param key
	 * @returns
	 */
	public async getItem(key: string): Promise<string | null> {
		const result = await this._getDatabase().then(db => db.get(key));
		return result || null;
	}

	/**
	 *
	 * @param key
	 * @param value
	 */
	public async setItem(key: string, value: string): Promise<void> {
		if (!this._inMemoryDB) {
			throw new Error('Database not initialized');
		}
		this._inMemoryDB.set(key, value);
		await this._saveDatabase();
	}

	/**
	 *
	 * @param key
	 */
	public async removeItem(key: string) {
		if (!this._inMemoryDB) {
			throw new Error('Database not initialized');
		}
		this._inMemoryDB.delete(key);
		await this._saveDatabase();
		if (this._inMemoryDB.size === 0) {
			window.localStorage.removeItem(Environment.bucketName);
		}
	}

	/**
	 *
	 * @param keys
	 */
	public async removeItems(keys: string[]) {
		for (const key of keys) await this.removeItem(key);
	}

	/**
	 *
	 */
	public async clear() {
		this._inMemoryDB = new Map<string, string>();
		window.localStorage.clear();
	}
}

const storageProvider: IStorageProvider = new LocalStorage();

export default storageProvider;
