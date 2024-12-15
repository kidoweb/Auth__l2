


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAYoqL0A8uiMNiV7g2vLASGDJyCNK3WDM4",
  authDomain: "labenroll.firebaseapp.com",
  projectId: "labenroll",
  storageBucket: "labenroll.firebasestorage.app",
  messagingSenderId: "501218345074",
  appId: "1:501218345074:web:00909b87577fa510d0c2eb",
  measurementId: "G-3LQQSEGV49"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


export { auth, db };
