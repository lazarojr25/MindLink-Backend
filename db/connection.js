import admin from "firebase-admin";
import serviceAccountKey from "./service-account-credentials.json" with { type: "json" }

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });

export default admin