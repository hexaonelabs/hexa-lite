import evmWallet from '../networks/evm';
import btcWallet from '../networks/bitcoin';
import authProvider from '../providers/auth/firebase';
import { CHAIN_AVAILABLES } from '../constant';
import { Web3Wallet } from '../networks/web3-wallet';
import solanaWallet from '../networks/solana';
import { Logger } from '../utils';

export { generateMnemonic } from 'bip39';

export const initWallet = async (
	user: {
		uid: string;
		isAnonymous: boolean;
	} | null,
	mnemonic?: string,
	chainId?: number
): Promise<Web3Wallet> => {
	Logger.log('[INFO] initWallet:', { user, mnemonic });

	if (!mnemonic && user && !user.isAnonymous) {
		throw new Error('Mnemonic is required to initialize the wallet.');
	}

	// connect with external wallet
	if (!mnemonic && user && user.isAnonymous === true) {
		const wallet = await evmWallet.connectWithExternalWallet({
			chainId
		});
		return wallet;
	}

	// others methods require mnemonic
	// Handle case where mnemonic is not required
	if (!mnemonic) {
		throw new Error(
			'Mnemonic is required to decrypt the private key and initialize the wallet.'
		);
	}
	let wallet!: Web3Wallet;
	// check if is EVM chain
	const chain = CHAIN_AVAILABLES.find(chain => chain.id === chainId);
	// generate wallet from encrypted mnemonic or generate new from random mnemonic
	switch (true) {
		// evm wallet
		case chain?.type === 'evm': {
			wallet = await evmWallet.generateWalletFromMnemonic({
				mnemonic,
				chainId
			});
			break;
		}
		// btc wallet
		case chain?.type === 'bitcoin': {
			wallet = await btcWallet.generateWalletFromMnemonic({
				mnemonic
			});
			break;
		}
		// solana wallet
		case chain?.type === 'solana': {
			wallet = await solanaWallet.generateWalletFromMnemonic({
				mnemonic
			});
			break;
		}
		default:
			throw new Error('Unsupported chain type');
	}
	if (!mnemonic) {
		await authProvider.signOut();
		throw new Error('Secret is required to encrypt the mnemonic.');
	}
	if (!wallet.publicKey) {
		throw new Error('Failed to generate wallet from mnemonic');
	}
	return wallet;
};
