// import * as firebase from 'firebase/app';
import firebase from 'firebase/app';
// import * as firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCKZfUfRApnhxYSEYdP4ZuQjzHzUeWmWpI',
  authDomain: 'localstorage-vs-indexdb.firebaseapp.com',
  projectId: 'localstorage-vs-indexdb',
  storageBucket: 'localstorage-vs-indexdb.appspot.com',
  messagingSenderId: '183519024179',
  appId: '1:183519024179:web:e4eda77d2366541078bf46',
  measurementId: 'G-DK1FV9Y40D'
};
//
//   firebaseConfig = {
//   apiKey: '',
//   authDomain: '',
//   databaseURL: '',
//   projectId: '',
//   storageBucket: '',
//   messagingSenderId: '',
//   appId: ''
// };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

export default db;
