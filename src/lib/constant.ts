// enum of available signin methods
export enum SigninMethod {
	Google = 'connect-google',
	Email = 'connect-email',
	EmailLink = 'connect-email-link',
	Wallet = 'connect-wallet'
}

export const DEFAULT_SIGNIN_METHODS: SigninMethod[] = [
	SigninMethod.Google,
	SigninMethod.Email,
	SigninMethod.EmailLink,
	SigninMethod.Wallet
];

export enum KEYS {
	AUTH_SIGNATURE_KEY = 'hexa-signature',
	AUTH_SIGNATURE_VALUE = 'hexa-signature-value',
	STORAGE_PRIVATEKEY_KEY = 'hexa-private-key',
	STORAGE_SEED_KEY = 'hexa-seed-key',
	STORAGE_SECRET_KEY = 'hexa-secret',
	STORAGE_BACKUP_KEY = 'hexa-backup',
	STORAGE_SKIP_BACKUP_KEY = 'hexa-skip',
	STORAGE_EMAIL_FOR_SIGNIN_KEY = 'hexa-connect-email-for-sign-in',
	URL_QUERYPARAM_FINISH_SIGNUP = 'finishSignUp',
	STORAGE_AUTH_METHOD_KEY = 'hexa-auth-method'
}

export const MAX_SKIP_BACKUP_TIME = 15 * 60 * 1000; // 15 minutes

export * from '@/constants/chains';