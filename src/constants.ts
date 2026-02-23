export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDY7kZZXeCS2C9Ho-CwQLB3WWAwjiunuVQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nihondaigakukoukascore.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://nihondaigakukoukascore-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nihondaigakukoukascore",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nihondaigakukoukascore.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "891442494014",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:891442494014:web:a8a10f30ede8818a382f6f"
};
