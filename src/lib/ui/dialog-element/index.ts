import { FirebaseWeb3ConnectDialogElement } from '../../interfaces/dialog-element.interface';
import { DialogUIOptions } from '../../interfaces/sdk.interface';
import { HexaSigninDialogElement } from './dialogElement';
import { KEYS, SigninMethod } from '../../constant';
import {
	authByImportPrivateKey,
	authWithGoogle,
	authWithEmailPwd,
	authByImportSeed,
	authWithEmailLink
} from '../../services/auth.servcie';
import { promptImportPrivatekeyElement } from '../prompt-import-privatekey-element/prompt-import-privatekey-element';
import { storageService } from '../../services/storage.service';
import { promptImportSeedElement } from '../prompt-import-seed-element/prompt-import-seed-element';
import { Logger } from '../../utils';
import authProvider from '../../providers/auth/firebase';

const setupSigninDialogElement = async (
	ref: HTMLElement = document.body,
	ops: DialogUIOptions
) => {
	// check if element already defined
	if (!customElements.get('firebase-web3connect-dialog')) {
		customElements.define(
			'firebase-web3connect-dialog',
			HexaSigninDialogElement
		);
	}
	// create dialog element with options as props
	const dialogElement = document.createElement(
		'firebase-web3connect-dialog'
	) as FirebaseWeb3ConnectDialogElement;
	// add `ops` as property
	dialogElement.ops = ops;
	ref.appendChild(dialogElement);
	// remove "Create new Wallet" button if no auth method is enabled
	const authMethod = await storageService.getItem(KEYS.STORAGE_AUTH_METHOD_KEY);
	if (!authMethod) {
		dialogElement.shadowRoot?.querySelector('#create-new-wallet')?.remove();
	}
	return dialogElement;
};

const addAndWaitUIEventsResult = (
	dialogElement: FirebaseWeb3ConnectDialogElement
): Promise<
	| {
			uid?: string;
			isAnonymous?: boolean;
			authMethod: SigninMethod;
	  }
	| undefined
> => {
	return new Promise(
		(
			resolve: (
				value:
					| {
							uid?: string;
							isAnonymous?: boolean;
							authMethod: SigninMethod;
					  }
					| undefined
			) => void,
			reject: (err: Error) => void
		) => {
			// listen to connect event
			dialogElement.addEventListener('connect', async e => {
				const detail = (e as CustomEvent<string>).detail;
				Logger.log(`[INFO] connect event: `, detail);
				// exclude cancel event {
				if (detail === 'cancel') {
					dialogElement.hideModal();
					await new Promise(resolve => setTimeout(resolve, 225));
					dialogElement.remove();
					resolve(undefined);
					return;
				}
				// handle type of connection request
				if (detail === 'connect-google') {
					try {
						(
							dialogElement.shadowRoot?.querySelector(
								'dialog #spinner'
							) as HTMLElement
						).style.display = 'block';
						// use service to request connection with google
						const { uid } = await authWithGoogle();
						// await dialogElement.toggleSpinnerAsCheck();
						resolve({
							uid,
							authMethod: detail as SigninMethod
						});
					} catch (error: unknown) {
						const message =
							(error as Error)?.message ||
							'An error occured. Please try again.';
						reject(new Error(`${message}`));
						return;
					}
				}
				if (detail === 'connect-email') {
					try {
						const { password, email } =
							await dialogElement.promptEmailPassword();
						if (!password || !email) {
							throw new Error('Email and password are required to connect');
						}
						// prompt to download private key if not already stored
						const privateKey = await storageService.getItem(
							KEYS.STORAGE_PRIVATEKEY_KEY
						);
						const { withEncryption, skip } = !privateKey
							? await dialogElement.promptBackup()
							: { withEncryption: false, skip: true };
						// use service to request connection with google
						const { uid } = await authWithEmailPwd({
							email,
							password,
							skip,
							withEncryption
						});
						// await dialogElement.toggleSpinnerAsCheck();

						resolve({
							uid,
							authMethod: detail as SigninMethod
						});
					} catch (error: unknown) {
						const message =
							(error as Error)?.message ||
							'An error occured. Please try again.';
						reject(new Error(`${message}`));
						return;
					}
				}
				if (detail === 'connect-email-link') {
					// check if request coming from `standalone` browser app
					const isStandaloneBrowserApp = window.matchMedia(
						'(display-mode: standalone)'
					).matches;
					// Standalone mode is not supported close the dialog as Cancel mode
					if (isStandaloneBrowserApp) {
						await new Promise(resolve => setTimeout(resolve, 225));
						alert(`Sorry this feature is not yet available in standalone mode. Please use "Connect with Google" or use this signin method from native browser instead.`);
						dialogElement.hideModal();
						await new Promise(resolve => setTimeout(resolve, 225));
						dialogElement.remove();
						resolve(undefined);
						return;
					}
					const { email } = await dialogElement.promptEmailPassword({
						hidePassword: true
					});
					if (!email) {
						reject(new Error('Email is required to connect'));
						return;
					}
					try {
						await authWithEmailLink({
							email,
							url: dialogElement?.ops?.ops?.authProvider?.authEmailUrl
						});
						// display message into DOM conatainer
						// add HTML to explain the user to click on the link that will authenticate him
						const finalStepElement = document.createElement('div');
						finalStepElement.innerHTML = `
							<p>
								Please check your email & click on the link to authenticate.
							</p>
							<p>
								Once authenticated, you will be prompted to provide a password 
								to lock your Wallet account from unauthorized access
							</p>
						`;
						dialogElement.shadowRoot
							?.querySelector('dialog #spinner')
							?.after(finalStepElement);
						// listen to auth state change to manage dialog content
						const unsubscribe = authProvider.getOnAuthStateChanged(
							async user => {
								if (user) {
									finalStepElement.remove();
									unsubscribe();
									resolve({
										uid: user.uid,
										isAnonymous: user.isAnonymous,
										authMethod: detail as SigninMethod
									});
								}
							}
						);
					} catch (error: unknown) {
						dialogElement.hideModal();
						const message =
							(error as Error)?.message ||
							'An error occured. Please try again.';
						reject(
							new Error(`Error while connecting with ${detail}: ${message}`)
						);
					}
					return;
				}
				if (detail === 'connect-wallet') {
					try {
						const walletType = await dialogElement.promptWalletType();
						Logger.log(`[INFO] Wallet type: `, walletType);
						switch (walletType) {
							case 'browser-extension': {
								// const { uid } = await authWithExternalWallet();
								// await dialogElement.toggleSpinnerAsCheck();
								resolve({
									uid: undefined,
									isAnonymous: true,
									authMethod: detail as SigninMethod
								});
								break;
							}
							case 'import-seed': {
								// import seed
								const { seed } = await promptImportSeedElement(
									dialogElement?.shadowRoot?.querySelector(
										'#spinner'
									) as HTMLElement
								);
								Logger.log(`[INFO] Import seed: `, {
									seed
								});
								if (!seed) {
									throw new Error('Seed is required to connect');
								}
								const { uid } = await authByImportSeed({
									seed
								});
								resolve({
									uid,
									authMethod: detail as SigninMethod
								});
								break;
							}
							case 'import-privatekey': {
								// import private key and request password
								const { privateKey, isEncrypted } =
									await promptImportPrivatekeyElement(
										dialogElement?.shadowRoot?.querySelector(
											'#spinner'
										) as HTMLElement
									);
								Logger.log(`[INFO] Import private key: `, {
									privateKey,
									isEncrypted
								});
								if (!privateKey) {
									throw new Error('Private key is required to connect');
								}
								const { uid } = await authByImportPrivateKey({
									privateKey,
									isEncrypted
								});
								resolve({
									uid,
									authMethod: detail as SigninMethod
								});
								break;
							}
							default:
								throw new Error('Invalid wallet type');
						}
					} catch (error: unknown) {
						const message =
							(error as Error)?.message ||
							'An error occured. Please try again.';
						reject(new Error(`Error while connecting: ${message}`));
					}
				}
			});
			dialogElement.addEventListener('reset', async () => {
				await storageService.clear();
				dialogElement.reset();
			});
		}
	);
};

export {
	HexaSigninDialogElement,
	setupSigninDialogElement,
	addAndWaitUIEventsResult
};
