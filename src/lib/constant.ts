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

// Define Network enum that represents supported networks
export enum NETWORK {
	bitcoin = 128,
	mainnet = 1,
	polygon = 137,
	avalanche = 43114,
	binancesmartchain = 56,
	arbitrum = 42161,
	optimism = 10,
	cosmos = 118,
	polkadot = 111,
	solana = 1399811149,
	base = 8453,
	scroll = 534352
}

export type chainType = 'evm' | 'cosmos' | 'bitcoin' | 'solana' | 'polkadot';

export interface IChain {
	id: number;
	value: string;
	name: string;
	rpcUrl: string;
	nativeSymbol?: string;
	logo?: string;
	testnet?: boolean;
	type: chainType;
}

const CHAINS_DISABLED = [
	NETWORK.cosmos,
	NETWORK.avalanche,
	NETWORK.polkadot
	// NETWORK.solana
	// NETWORK.bitcoin
];

export const CHAIN_AVAILABLES: IChain[] = [
	{
		id: NETWORK.mainnet,
		value: 'eth',
		name: 'Ethereum',
		nativeSymbol: 'ETH',
		logo: '/assets/cryptocurrency-icons/eth.svg',
		rpcUrl:
			[
				{ primary: false, url: 'https://eth-mainnet-public.unifra.io' },
				{ primary: true, url: 'https://rpc.ankr.com/eth' }
			].find(rpc => rpc.primary)?.url || '',
		type: 'evm'
	},
	{
		id: NETWORK.binancesmartchain,
		value: 'bsc',
		name: 'Binance smart chain',
		nativeSymbol: 'BNB',
		logo: '/assets/cryptocurrency-icons/bnb.svg',
		rpcUrl:
			[
				{ primary: false, url: 'https://rpc.ankr.com/bsc' },
				{ primary: true, url: 'https://binance.llamarpc.com' }
			].find(rpc => rpc.primary)?.url || '',
		type: 'evm'
	},
	// {
	//   id: 250,
	//   value: 'fantom',
	//   name: 'Fantom',
	//   nativeSymbol: 'FTM',
	//   logo: '/assets/cryptocurrency-icons/eth.svg'
	// },
	// {
	//   id: 43114,
	//   value: 'avalanche',
	//   name: 'Avalanche',
	//   nativeSymbol: 'AVAX'
	// },
	{
		id: NETWORK.polygon,
		value: 'polygon',
		name: 'Polygon',
		nativeSymbol: 'MATIC',
		logo: '/assets/cryptocurrency-icons/matic.svg',
		rpcUrl:
			[
				{ primary: false, url: 'https://polygon-rpc.com' },
				{ primary: true, url: 'https://rpc.ankr.com/polygon' }
			].find(rpc => rpc.primary)?.url || '',
		type: 'evm'
	},
	{
		id: NETWORK.arbitrum,
		value: 'arbitrum',
		name: 'Arbitrum',
		nativeSymbol: 'ARB',
		logo: '/assets/icons/arb.svg',
		rpcUrl:
			[
				{ primary: true, url: 'https://arbitrum.llamarpc.com' },
				{ primary: false, url: 'https://rpc.ankr.com/arbitrum_one' }
			].find(rpc => rpc.primary)?.url || '',
		type: 'evm'
	},
	{
		id: NETWORK.optimism,
		value: 'optimism',
		name: 'Optimism',
		nativeSymbol: 'OP',
		logo: '/assets/icons/op.svg',
		rpcUrl:
			[
				{ primary: false, url: 'https://mainnet.optimism.io' },
				{ primary: true, url: 'https://rpc.ankr.com/optimism' }
			].find(rpc => rpc.primary)?.url || '',
		type: 'evm'
	},
	{
		id: NETWORK.base,
		value: 'base',
		name: 'Base',
		nativeSymbol: 'ETH',
		logo: '/assets/icons/base.svg',
		rpcUrl:
			[
				{
					primary: false,
					url: 'https://endpoints.omniatech.io/v1/base/mainnet/public'
				},
				{ primary: true, url: 'https://base.llamarpc.com' }
			].find(rpc => rpc.primary)?.url || '',
		type: 'evm'
	},
	{
		id: NETWORK.scroll,
		value: 'scroll',
		name: 'Scroll',
		nativeSymbol: 'ETH',
		logo: '/assets/icons/scroll.svg',
		rpcUrl:
			[
				{ primary: false, url: 'https://scroll-mainnet.public.blastapi.io' },
				{ primary: true, url: 'https://1rpc.io/scroll' }
			].find(rpc => rpc.primary)?.url || '',
		type: 'evm'
	},
	{
		id: NETWORK.cosmos,
		value: 'cosmos',
		name: 'Cosmos',
		nativeSymbol: 'ATOM',
		logo: '/assets/cryptocurrency-icons/atom.svg',
		rpcUrl:
			[
				{ primary: true, url: 'https://rpc.cosmos.network:26657' },
				{ primary: false, url: 'https://cosmos-rpc.publicnode.com:443' }
			].find(rpc => rpc.primary)?.url || '',
		type: 'cosmos'
	},
	// {
	//   id: NETWORK.avalanche,
	//   value: 'avalanche',
	//   name: 'Avalanche',
	//   nativeSymbol: 'AVAX',
	//   logo: '/assets/cryptocurrency-icons/avax.svg',
	//   rpcUrl: [
	//     {primary: false, url:'https://avalanche-c-chain.publicnode.com'},
	//     {primary: true, url: "https://rpc.ankr.com/avalanche"}
	//   ]
	//   .find(
	//     (rpc) => rpc.primary
	//   )?.url||'',
	// },
	// testnets
	{
		id: 11155111,
		value: 'sepolia',
		name: 'Sepolia',
		testnet: true,
		rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
		type: 'evm'
	},
	// {
	//   id: 80001,
	//   value: 'polygon_mumbai',
	//   name: 'mumbai',
	//   testnet: true,
	//   rpcUrl: "https://rpc.ankr.com/polygon_mumbai",
	// },
	// {
	//   id: 43113,
	//   value: 'avalanche_fuji',
	//   name: 'Fuji',
	// },
	{
		id: NETWORK.bitcoin,
		name: 'Bitcoin',
		value: 'bitcoin',
		nativeSymbol: 'BTC',
		rpcUrl:
			[
				{ url: '84-30-190-204.cable.dynamic.v4.ziggo.nl', primary: false },
				{ url: 'https://rpc.coinsdo.net/btc', primary: true }
			].find(rpc => rpc.primary)?.url || '',
		type: 'bitcoin',
		logo: '/assets/cryptocurrency-icons/btc.svg'
	},
	{
		id: NETWORK.solana,
		value: 'solana',
		name: 'Solana',
		nativeSymbol: 'SOL',
		logo: '/assets/cryptocurrency-icons/sol.svg',
		rpcUrl:
			[{ primary: true, url: 'https://api.devnet.solana.com' }].find(
				rpc => rpc.primary
			)?.url || '',
		type: 'solana'
	}
].filter(c => !CHAINS_DISABLED.includes(c.id)) as IChain[];

const NETWORK_DEFAULT = NETWORK.optimism;
export const CHAIN_DEFAULT = CHAIN_AVAILABLES.find(
	c => c.id === NETWORK_DEFAULT
) || {
	id: NETWORK_DEFAULT,
	name: 'default',
	value: 'default',
	rpcUrl: '',
	type: 'evm'
};

export const TESTNET_CHAIN_DEFAULT = CHAIN_AVAILABLES.find(c => c.id === 80001);

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
