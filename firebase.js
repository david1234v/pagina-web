// firebase.js - Módulo de inicialización de Firebase para Nápoles Chipiona
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKM2Tp1sosbdAeB6qK8P73cShQ0WP76S4",
  authDomain: "basededatos-dd6b3.firebaseapp.com",
  databaseURL: "https://basededatos-dd6b3-default-rtdb.firebaseio.com",
  projectId: "basededatos-dd6b3",
  storageBucket: "basededatos-dd6b3.firebasestorage.app",
  messagingSenderId: "452860965959",
  appId: "1:452860965959:web:42ecb1c31f17e55daa6d62",
  measurementId: "G-HF8LLPE2SL"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, get, onValue, push, update, remove };