import Crypto from './crypto';
import { KEYS } from '../../constant';
import { storageService } from '../../services/storage.service';

export const passwordValidationOrSignature = (value: string) => ({
	execute: async () => {
		const privateKey = await storageService.isExistingPrivateKeyStored();
		const signature = await storageService.getItem(KEYS.AUTH_SIGNATURE_KEY);
		if (privateKey && signature) {
			const isSignatureValid = await Crypto.verifySignatureFromPassword(
				value,
				KEYS.AUTH_SIGNATURE_VALUE,
				signature
			);
			if (!isSignatureValid) {
				throw new Error('Invalid password');
			}
		} else {
			const signature = await Crypto.signMessageFromPassword(
				value,
				KEYS.AUTH_SIGNATURE_VALUE
			);
			await storageService.setItem(KEYS.AUTH_SIGNATURE_KEY, signature);
		}
	}
});
