import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Cấu hình Firebase mới từ Google Console
const firebaseConfig = {
  apiKey: 'AIzaSyAouLVyFRvanwzSdGfaUONzK1e_-aL6e8Q',
  authDomain: 'healthy-b17a4.firebaseapp.com',
  projectId: 'healthy-b17a4',
  storageBucket: 'healthy-b17a4.firebasestorage.app',
  messagingSenderId: '59454643197',
  appId: '1:59454643197:android:44a72621475d686b6f9794', // Sử dụng appId chính xác
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
