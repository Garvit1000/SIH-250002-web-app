import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";

// Initialize once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://tourist-15cbc.firebaseio.com" // optional if you’re not using RTDB
    });
}

export const adminDb = admin.firestore();
