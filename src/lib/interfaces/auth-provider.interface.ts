import { Auth, User } from 'firebase/auth';

type Unsubscribe = () => void;

// type User = { uid: string; isAnonymous: boolean };
type UserCredential = { user: User };

export interface IAuthProvider {
	signinWithGoogle: () => Promise<User>;
	sendLinkToEmail: (email: string, ops?: { url?: string }) => Promise<void>;
	signInWithLink: () => Promise<UserCredential | undefined>;
	signInAsAnonymous: () => Promise<UserCredential>;
	signInWithEmailPwd: (
		email: string,
		password: string,
		privateKey?: string
	) => Promise<User>;
	signOut: () => Promise<void>;
	getOnAuthStateChanged: (cb: (user: User | null) => void) => Unsubscribe;
	getCurrentUserAuth: () => Promise<User | null>;
	updateUserAndTriggerStateChange: () => Promise<void>;
	initialize: (auth: Auth, ops?: string) => void;
}
