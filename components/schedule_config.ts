import admin from 'firebase-admin';
import serviceAccount from "./firebase-key.json";
import { ServiceAccount } from 'firebase-admin';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: "https://food-detector-134f5-default-rtdb.firebaseio.com"
});

const db = admin.database();

module.exports = { db };
