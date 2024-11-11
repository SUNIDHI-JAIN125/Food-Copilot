import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, remove } from "firebase/database";
const firebaseConfig = {
    apiKey: "AIzaSyCPLLZ_inkqnnF63HDayh7kHudXSdxe00c",

  authDomain: "food-detector-134f5.firebaseapp.com",

  databaseURL: "https://food-detector-134f5-default-rtdb.firebaseio.com",

  projectId: "food-detector-134f5",

  storageBucket: "food-detector-134f5.firebasestorage.app",

  messagingSenderId: "294935776447",

  appId: "1:294935776447:web:03470e32ef90c7befb8a0a",

  measurementId: "G-R82VJTFMCD"
}

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, push, set, remove };


