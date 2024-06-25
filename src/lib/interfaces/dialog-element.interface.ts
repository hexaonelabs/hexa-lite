import { DialogUIOptions } from './sdk.interface';

export type WalletConnectType =
	| 'browser-extension'
	| 'import-privatekey'
	| 'import-seed';

export type FirebaseWeb3ConnectDialogElement = HTMLElement & {
	ops: DialogUIOptions | undefined;

	/**
	 * Method that reset the dialog element
	 */
	reset(): void;

	/**
	 * Method that display the dialog element to the user
	 */
	showModal(): void;

	/**
	 * Method that hide the dialog element from the user
	 */
	hideModal(): void;

	/**
	 * Method that remove a spinner and display a check icon to the user
	 */
	toggleSpinnerAsCheck(message?: string): Promise<boolean>;

	/**
	 * Method that remove spinner and display a cross icon
	 * with an optional message to the user
	 * @param message
	 */
	toggleSpinnerAsCross(message?: string): Promise<boolean>;

	/**
	 * Methods that display a prompt to the user
	 * and return the user's response as a string.
	 */
	promptPassword(): Promise<string | null>;

	/**
	 * Methods that display a prompt to the user
	 * and return the user's response as Object `{password: string; email: string;}`
	 */
	promptEmailPassword(ops?: {
		hideEmail?: boolean;
		hidePassword?: boolean;
	}): Promise<{ password?: string; email?: string }>;

	/**
	 * Methods that display a prompt to the user to backup their wallet
	 * and return the user's response as Object.
	 */
	promptBackup(): Promise<{
		withEncryption?: boolean | undefined;
		skip?: boolean | undefined;
	}>;

	/**
	 * Method that display prompt to user before signout
	 * to request backup of wallet seed phrase
	 */
	promptSignoutWithBackup(): Promise<{
		withEncryption?: boolean | undefined;
		skip?: boolean | undefined;
		clearStorage?: boolean;
		cancel?: boolean;
	}>;

	/**
	 * Methods that display a prompt to the user to select the wallet type
	 * that they want to connect with.
	 * This method returns the user's response as a string.
	 */
	promptWalletType(): Promise<WalletConnectType>;

	/**
	 * Methods that display a prompt to the user to select the authentication method
	 * that they want to connect with.
	 * @info This method is under development and will be available in future releases.
	 */
	promptAuthMethods(): Promise<void>;
};
