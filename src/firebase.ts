import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { FIREBASE_CONFIG } from './constants';

const app = initializeApp(FIREBASE_CONFIG);
export const db = getDatabase(app);
