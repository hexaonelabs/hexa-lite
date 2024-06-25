import { FirebaseApp, initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { Logger } from '../utils';

class BackupService {
	private _app!: FirebaseApp;
	constructor(app: FirebaseApp = initializeApp({}, 'firebaseweb3connect')) {
		this._app = app;
	}

	async backupSeed(uid: string, encryptedSeed: string) {
		Logger.log('backupSeed', uid, encryptedSeed);
		const db = getDatabase(this._app);
		await set(ref(db, `users/${uid}/seed`), {
			encryptedSeed,
			timestamp: Date.now()
		});
	}
}

export const backupService = new BackupService();
