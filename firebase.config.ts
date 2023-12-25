// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database }