import { FirebaseApp } from 'firebase/app';
import { Database, getDatabase, ref, set as setData } from 'firebase/database';

const _params: {
	db: Database | undefined;
	ops: {
		usersCollectionName: string;
	};
} = {
	db: undefined,
	ops: { usersCollectionName: '_fbweb3Connect-users' }
};

export const initialize = (
	app: FirebaseApp,
	ops?: {
		usersCollectionName?: string;
	}
) => {
	_params.db = getDatabase(app);
	if (ops) {
		_params.ops = Object.freeze({
			..._params.ops,
			...ops
		} as const);
	}
	Object.freeze(_params);
	Object.seal(_params);
};

export const set = async (refUrl: string, data: unknown) => {
	if (!_params.db) throw new Error('Database not initialized');
	const dbRef = ref(_params.db, `${_params.ops.usersCollectionName}/${refUrl}`);
	return await setData(dbRef, data);
};
