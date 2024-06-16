import authProvider from '../providers/auth/firebase';
import Crypto from '../providers/crypto/crypto';
import { KEYS } from '../constant';
import { storageService } from './storage.service';
import { Logger } from '../utils';

export const authWithGoogle = async () => {
	// const { skip, withEncryption } = ops || {};
	// // if user is requesting to create new privatekey
	// const privateKey = await storageService.getItem(KEYS.STORAGE_PRIVATEKEY_KEY);
	// if (!privateKey && !skip) {
	// 	// store to local storage tag to trigger download of the private key
	// 	// when the user is connected (using listener onConnectStateChanged)
	// 	localStorage.setItem(
	// 		KEYS.STORAGE_BACKUP_KEY,
	// 		withEncryption ? 'true' : 'false'
	// 	);
	// }

	// // store to local storage tag to trigger download of the private key
	// // if user want to skip now and download later on connectWithUI()
	// // use timestamp to trigger download later
	// if (skip === true) {
	// 	await storageService.setItem(KEYS.STORAGE_SKIP_BACKUP_KEY, `${Date.now()}`);
	// }
	// Now we can connect with Google
	const result = await authProvider.signinWithGoogle();
	// .catch(async (error: { code?: string; message?: string }) => {
	// 	const { code = '', message = '' } = error;
	// 	// alert(`DEBUG: ${code} - ${message}`);
	// 	switch (true) {
	// 		case (code === 'auth/google-account-already-in-use' ||
	// 			message === 'auth/google-account-already-in-use') &&
	// 			!privateKey: {
	// 			// do not prevent user to signin if account already in use and return user object
	// 			// this will allow user to signin with same account on multiple devices
	// 			Logger.log(`[ERROR] Signin Step: ${code || message}`);
	// 			const user = await authProvider.getCurrentUserAuth();
	// 			if (!user) {
	// 				throw new Error('User not found');
	// 			}
	// 			return user;

	// 			// TODO: implement this logic to prevent multiple account with same email
	// 			// Logger.log(`[ERROR] Signin Step: ${code || message}`);
	// 			// // if email already in use & no ptivatekey, ask to import Wallet Backup file instead
	// 			// storageService.clear();
	// 			// localStorage.removeItem(KEYS.STORAGE_BACKUP_KEY);
	// 			// throw new Error(
	// 			// 	`This Google Account is already used and connected to other device. Import your private key instead using: "Connect Wallet -> Import Wallet".`
	// 			// );
	// 		}
	// 	}
	// 	throw error;
	// });
	return result;
};

export const authWithEmailPwd = async (ops: {
	email: string;
	password: string;
	skip?: boolean;
	withEncryption?: boolean;
}) => {
	const { password, skip, withEncryption, email } = ops;
	// if user is requesting to create new privatekey
	const privateKey =
		(await storageService.getItem(KEYS.STORAGE_PRIVATEKEY_KEY)) || undefined;
	if (!privateKey && !skip) {
		// store to local storage tag to trigger download of the private key
		// when the user is connected (using listener onConnectStateChanged)
		localStorage.setItem(
			KEYS.STORAGE_BACKUP_KEY,
			withEncryption ? 'true' : 'false'
		);
	}

	// Now we can connect with Google
	const result = await authProvider
		.signInWithEmailPwd(email, password)
		.catch(async (error: { code?: string; message?: string }) => {
			// clean storage if error on creation step
			const { code = '', message = '' } = error;
			switch (true) {
				// case code === 'auth/email-already-in-use' && !privateKey: {
				// 	// if email already in use & no ptivatekey, ask to import Wallet Backup file instead
				// 	storageService.clear();
				// 	localStorage.removeItem(KEYS.STORAGE_BACKUP_KEY);
				// 	await authProvider.signOut();
				// 	throw new Error(
				// 		`This email is already used and connected to other device. Import your private key instead using: "Connect Wallet -> Import Wallet".`
				// 	);
				// }
				case code === 'auth/weak-password':
				case code === 'auth/invalid-email': {
					Logger.error(`[ERROR] Signin Step: ${code}: ${message}`);
					storageService.clear();
					localStorage.removeItem(KEYS.STORAGE_BACKUP_KEY);
					break;
				}
				case code === 'auth/invalid-credential': {
					Logger.error(`[ERROR] Signin Step: ${code}: ${message}`);
					storageService.clear();
					localStorage.removeItem(KEYS.STORAGE_BACKUP_KEY);
					throw new Error(
						`This email is already used and connected to other device. Import your private key instead using: "Connect Wallet -> Import Wallet".`
					);
				}
			}
			throw error;
		});
	return result;
};

/**
 *
 * @param ops
 * @returns
 *
 * 	Example:
 * ```
 * const origin = window.location.origin;
 * const path = '/auth/link';
 * const params = `/?${KEYS.URL_QUERYPARAM_FINISH_SIGNUP}=true`;
 * const url = [origin, path, params].join('');
 * await authWithEmailLink({ email: 'demo@demo.com', url });
 *
 * // this will send a link to the email with the url to finish the signup.
 * // The user have to go to the url with the query param to finish the signup.
 * ```
 */
export const authWithEmailLink = async (ops: {
	email: string;
	url?: string;
}) => {
	const { email, url } = ops;
	await authProvider.sendLinkToEmail(email, { url });
	return;
};

export const authWithExternalWallet = async () => {
	Logger.log('authWithExternalWallet');
	const {
		user: { uid }
	} = await authProvider.signInAsAnonymous();
	return { uid };
};

export const authByImportPrivateKey = async (ops: {
	privateKey: string;
	isEncrypted?: boolean;
}) => {
	const { privateKey, isEncrypted } = ops;
	if (!isEncrypted) {
		// encrypt private key before storing it
		const encryptedPrivateKey = await Crypto.encrypt(
			storageService.getUniqueID(),
			privateKey
		);
		await storageService.setItem(
			KEYS.STORAGE_PRIVATEKEY_KEY,
			`UniqueID-${encryptedPrivateKey}`
		);
	} else {
		await storageService.setItem(KEYS.STORAGE_PRIVATEKEY_KEY, privateKey);
	}
	// trigger Auth with Google
	const { uid } = await authWithGoogle();
	return { uid };
};

export const authByImportSeed = async (ops: { seed: string }) => {
	const { seed } = ops;
	// encrypt seed before storing it
	const encryptedSeed = await Crypto.encrypt(
		storageService.getUniqueID(),
		seed
	);
	await storageService.setItem(
		KEYS.STORAGE_PRIVATEKEY_KEY,
		`UniqueID-${encryptedSeed}`
	);
	// trigger Auth with Google
	const { uid } = await authWithGoogle();
	return { uid };
};
