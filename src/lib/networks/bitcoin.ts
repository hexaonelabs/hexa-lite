import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { BIP32Factory } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import ecc from '@bitcoinerlab/secp256k1';
import { Web3Wallet } from './web3-wallet';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { IWalletProvider } from '../interfaces/walllet-provider.interface';
import { Logger } from '../utils';

const generateDID = (address: string) => {
	return `did:ethr:${address}`;
};

class BTCWallet extends Web3Wallet {
	public chainId: number;
	private _mnemonic!: string;

	constructor(
		mnemonic: string,
		network: bitcoin.Network = bitcoin.networks.bitcoin,
		derivationPath: string = "m/44'/0'/0'/0/0"
	) {
		super();
		if (!mnemonic) {
			throw new Error('Mnemonic is required to generate wallet');
		}
		const bip32 = BIP32Factory(ecc);
		const seed = mnemonicToSeedSync(mnemonic);
		const path = derivationPath;
		// generate key pair
		const { privateKey, publicKey } = bip32.fromSeed(seed).derivePath(path);
		if (!privateKey || !publicKey) {
			throw new Error('Failed to generate key pair');
		}
		// generate address
		const { address } = bitcoin.payments.p2pkh({
			pubkey: publicKey,
			network
		});
		// check if address is generated
		if (!address) {
			throw new Error('Failed to generate wallet');
		}
		// set wallet properties
		this.address = address;
		this.publicKey = publicKey.toString('hex');
		this._privateKey = privateKey.toString('hex');
		this.chainId = network.wif;
		this._mnemonic = mnemonic;
	}

	sendTransaction(tx: unknown): Promise<TransactionResponse> {
		Logger.log('sendTransaction', tx);
		throw new Error('Method not implemented.');
	}

	signTransaction(tx: unknown): Promise<string> {
		Logger.log('signTransaction', tx);
		throw new Error('Method not implemented.');
	}

	async signMessage(message: string): Promise<string> {
		Logger.log('signMessage', message);
		// Sign the message with the private key
		const bufferMsg = Buffer.from(message, 'utf-8');
		const hash = bitcoin.crypto.sha256(bufferMsg);
		// generate KeyPair from private key
		const keyPair = this._generateKeyPair();
		const signature = keyPair.sign(hash);
		Logger.log(`Signature: ${signature.toString('base64')}\n`);
		return signature.toString('base64');
	}

	verifySignature(message: string, signature: string): boolean {
		if (!this.address) {
			throw new Error('Address is required to verify signature');
		}
		const bufferMsg = Buffer.from(message, 'utf-8');
		const hash = bitcoin.crypto.sha256(bufferMsg);
		// generate KeyPair from private key
		const keyPair = this._generateKeyPair();
		const isValid = keyPair.verify(hash, Buffer.from(signature, 'base64'));
		return isValid;
	}

	async switchNetwork(chainId: number): Promise<void> {
		Logger.log('switchNetwork', chainId);
		throw new Error('Method not implemented.');
	}

	async getSigner<T>(): Promise<T> {
		Logger.log('getSigner');
		throw new Error('Method not implemented.');
	}

	private _generateKeyPair() {
		if (!this._mnemonic) {
			throw new Error('Mnemonic  is required to sign message');
		}
		const seed = mnemonicToSeedSync(this._mnemonic);
		const path = "m/44'/0'/0'/0/0";
		// generate key pair
		const bip32 = BIP32Factory(ecc);
		const keyPair = bip32.fromSeed(seed).derivePath(path);
		if (!keyPair) {
			throw new Error('Failed to generate key pair');
		}
		return keyPair;
	}
}

const generateWalletFromMnemonic = async (ops: {
	mnemonic?: string;
	derivationPath?: string;
	network?: bitcoin.Network;
}): Promise<Web3Wallet> => {
	const { mnemonic = generateMnemonic(), derivationPath, network } = ops;
	if (derivationPath) {
		const purpose = derivationPath?.split('/')[1];
		if (purpose !== "44'") {
			throw new Error('Invalid derivation path ');
		}
	}
	const wallet = new BTCWallet(mnemonic, network, derivationPath);
	return wallet;
};

const btcWallet: Readonly<
	IWalletProvider<{
		mnemonic?: string;
		derivationPath?: string;
		network?: bitcoin.Network;
	}>
> = Object.freeze({
	connectWithExternalWallet: async () => {
		throw new Error('Method not implemented.');
	},
	generateWalletFromMnemonic,
	generateDID
});

export default btcWallet;
