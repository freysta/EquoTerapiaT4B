// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAX-EqeGfLKUjRiFX6s0tFw3qUtYhddzaE",
  authDomain: "questionarios-cliente.firebaseapp.com",
  projectId: "questionarios-cliente",
  storageBucket: "questionarios-cliente.firebasestorage.app",
  messagingSenderId: "489124994951",
  appId: "1:489124994951:web:cb8eae130058c11200bd22",
  measurementId: "G-ZYNPKW1CMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export the database reference to be used in other scripts
export { db };
