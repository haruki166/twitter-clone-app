import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBACE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBACE_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBACE_DATABASE,
  projectId: process.env.REACT_APP_FIREBACE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBACE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBACE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBACE_APP_ID,
};

const app = firebase.initializeApp(firebaseConfig);

export const db = app.firestore();
export const auth = app.auth();
export const storage = app.storage();
export const provider = new firebase.auth.GoogleAuthProvider();
