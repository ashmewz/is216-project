// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";            

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjXeplxTWcwMVNDxqv87PsBwOjd26hze4", //put api key here for now but by right have to store in .env for security
  authDomain: "pawsitive-59011.firebaseapp.com",
  projectId: "pawsitive-59011",
  storageBucket: "pawsitive-59011.firebasestorage.app",
  messagingSenderId: "100690618099",
  appId: "1:100690618099:web:9768bc2da2ffe7a5183986",
  measurementId: "G-X7VDRPXRBB"
};




// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);



export { app, db, auth };