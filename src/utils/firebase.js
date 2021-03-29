import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_API_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_API_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_API_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_API_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_API_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_API_MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
const firestoreInit = firebase.firestore();
firestoreInit.enablePersistence();
export const db = firestoreInit

export const timeStamp = firebase.firestore.FieldValue.serverTimestamp();
