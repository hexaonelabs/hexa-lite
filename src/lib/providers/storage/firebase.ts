import { FirebaseApp } from 'firebase/app';
import { Database, getDatabase, ref, set as setData, get as getDoc } from 'firebase/database';

const _params: {
	db: Database | undefined;
	ops: {
		collectionName: string;
	};
} = {
	db: undefined,
	ops: { collectionName: '_logs-users' }
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
	const dbRef = ref(_params.db, `${_params.ops.collectionName}/${refUrl}`);
	return await setData(dbRef, data);
};

export const get = async (refUrl: string) => {
	if (!_params.db) throw new Error('Database not initialized');
	const dbRef = ref(_params.db, `${_params.ops.collectionName}/${refUrl}`);
	// check doc exists
	const snapshot = await getDoc(dbRef);
	return snapshot.exists() ? snapshot.val() : null;
}