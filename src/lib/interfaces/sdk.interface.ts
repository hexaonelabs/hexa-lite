import { SigninMethod } from '../constant';
import { IStorageProvider } from './storage-provider.interface';

export type SDKApiKey = string;

export type DialogUIOptions = {
	integrator?: string;
	logoUrl?: string;
	template?: {
		primaryColor?: string;
		secondaryColor?: string;
		backgroundColor?: string;
	};
	isLightMode?: boolean;
	enabledSigninMethods?: SigninMethod[];
	ops?: {
		authProvider?: {
			authEmailUrl?: string;
		};
	};
};

export type SDKOptions = {
	dialogUI?: Omit<DialogUIOptions, 'enabledSigninMethods' | 'isLightMode'>;
	chainId?: number;
	rpcUrl?: string;
	enabledSigninMethods?: SigninMethod[];
	storageService?: IStorageProvider;
};
