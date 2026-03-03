import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  projectId: "nihondaigakukoukascore",
  appId: "1:891442494014:web:fdecb0d493c8cb0a382f6f",
  databaseURL: "https://nihondaigakukoukascore-default-rtdb.firebaseio.com",
  storageBucket: "nihondaigakukoukascore.firebasestorage.app",
  apiKey: "AIzaSyB5Hv66bWUSqYidR5Dd7_ECMmQYklrT8x4",
  authDomain: "nihondaigakukoukascore.firebaseapp.com",
  messagingSenderId: "891442494014",
  measurementId: "G-2TQ9TZ16L9"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const database = getDatabase(app);
export default app;
