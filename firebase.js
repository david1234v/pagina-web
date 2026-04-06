// firebase.js - Módulo de inicialización de Firebase para Nápoles Chipiona
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0mX1QdHN_KdvUBJ0f8bOsYzhnSdrr_i0",
  authDomain: "napole-487ef.firebaseapp.com",
  projectId: "napole-487ef",
  storageBucket: "napole-487ef.firebasestorage.app",
  messagingSenderId: "7133087842",
  appId: "1:7133087842:web:1aaae94e30170f0c88e93b",
  measurementId: "G-CW4VM32GBL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp };