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
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

export default db;
// apiKey: 'AIzaSyCKZfUfRApnhxYSEYdP4ZuQjzHzUeWmWpI',
//   authDomain: 'localstorage-vs-indexdb.firebaseapp.com',
//   projectId: 'localstorage-vs-indexdb',
//   storageBucket: 'localstorage-vs-indexdb.appspot.com',
//   messagingSenderId: '183519024179',
//   appId: '1:183519024179:web:e4eda77d2366541078bf46',
//   measurementId: 'G-DK1FV9Y40D'
