// Import the functions you need from the SDKs you need
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  browserPopupRedirectResolver,
  indexedDBLocalPersistence,
  initializeAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  connectAuthEmulator,
} from "firebase/auth";
import { Database, connectDatabaseEmulator, getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APP_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_APP_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.APP_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APP_FIREBASE_APPID,
  databaseURL: process.env.NEXT_PUBLIC_APP_FIREBASE_DATABASEURL,
};

let _app!: FirebaseApp;
let _auth!: Auth;
let _database!: Database;

if (!getApps().length) {
  // Initialize Firebase
  _app = initializeApp(firebaseConfig);
  // Initialize Realtime Database and get a reference to the service
  _database = getDatabase(_app);
  // Initialize Auth
  // _auth = initializeAuth(_app, {
  //   persistence: [indexedDBLocalPersistence, browserSessionPersistence],
  //   // popupRedirectResolver: browserPopupRedirectResolver,
  // });
  _auth = getAuth(_app);
  
  if (process.env.NEXT_PUBLIC_APP_IS_LOCAL === 'true') {
    connectDatabaseEmulator(_database, 'localhost', 9000);
    connectAuthEmulator(_auth, 'http://127.0.0.1:9099');
  }
}

export const database = _database;
export const auth = _auth;
