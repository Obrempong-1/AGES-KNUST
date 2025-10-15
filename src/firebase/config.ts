// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage"; // Import getStorage

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCo4VLD0stXjqOsmaQhJtqXrcY3A7rJsOM",
    authDomain: "piwc-asokwa-site.firebaseapp.com",
    projectId: "piwc-asokwa-site",
    storageBucket: "piwc-asokwa-site.appspot.com", // Add your storage bucket
    messagingSenderId: "42717543779",
    appId: "1:42717543779:web:def05fe5dac43a33f0a756"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);
const storage = getStorage(app); // Initialize Storage

export { db, auth, functions, storage }; // Export storage
