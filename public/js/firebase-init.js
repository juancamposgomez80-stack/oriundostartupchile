// Importa las funciones que necesitas
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Tu configuración de Firebase (obtenla de tu consola de Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyALDFhXjPPJrrbUxEQ3QoqANwFYz0cyDII",
  authDomain: "oriundostartup-9d271.firebaseapp.com",
  projectId: "oriundostartup-9d271",
  storageBucket: "oriundostartup-9d271.firebasestorage.app",
  messagingSenderId: "748308119835",
  appId: "1:748308119835:web:c3f934ae132d99171553be",
  measurementId: "G-7WR1GZE394"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Obtiene la instancia de Firestore

// Exporta la instancia de la base de datos para usarla en otros archivos
export { db, collection, addDoc };