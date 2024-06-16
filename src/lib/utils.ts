export const parseApiKey = (hex: string) => {
	// converte hex string to utf-8 string
	if (!hex || hex.length <= 0) {
		throw new Error('Unexisting API key');
	}
	const json = Buffer.from(hex, 'hex').toString('utf-8');
	const apiKey = JSON.parse(json);
	return apiKey as any;
};

/**
 * Logger function
 */
export const Logger = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	log: (...args: any[]) => {
		if (process.env.NEXT_PUBLIC_APP_IS_PROD === 'true') {
			return;
		}
		console.log(...args);
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error: (...args: any[]) => {
		if (process.env.NEXT_PUBLIC_APP_IS_PROD === 'true') {
			return;
		}
		console.error(...args);
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	warn: (...args: any[]) => {
		if (process.env.NEXT_PUBLIC_APP_IS_PROD === 'true') {
			return;
		}
		console.warn(...args);
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	info: (...args: any[]) => {
		if (process.env.NEXT_PUBLIC_APP_IS_PROD === 'true') {
			return;
		}
		console.info(...args);
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	debug: (...args: any[]) => {
		if (process.env.NEXT_PUBLIC_APP_IS_PROD === 'true') {
			return;
		}
		console.debug(...args);
	}
};
