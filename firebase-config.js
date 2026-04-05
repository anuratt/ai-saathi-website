// ═══════════════════════════════════════════════════
// firebase-config.js
// ═══════════════════════════════════════════════════
// STEP 1: Go to https://console.firebase.google.com
// STEP 2: Create a new project called "ai-saathi"
// STEP 3: Click "Add app" → Web → Copy the config
// STEP 4: Paste it here, replacing all values below

const firebaseConfig = {
  apiKey: "AIzaSyCpzNzUaw7Xb8MFCh01JRZBoFRZUIIwE4g",
  authDomain: "ai-saathi-6fba2.firebaseapp.com",
  projectId: "ai-saathi-6fba2",
  storageBucket: "ai-saathi-6fba2.firebasestorage.app",
  messagingSenderId: "530836633811",
  appId: "1:530836633811:web:5377cc547b336d376afc26"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make auth and firestore available globally
window.auth = firebase.auth();
window.db   = firebase.firestore();

// ─────────────────────────────────────────────
// ACCESS GUARD — include in every protected page
// 
// USAGE: Add this to the top of each protected page:
//   <script src="firebase-config.js"></script>
//   <script src="access.js"></script>
//
// Then in your page JS, call:
//   requireLogin();           — for dashboard (login required)
//   requirePayment();         — for player (login + payment required)
//   requireAdmin();           — for admin panel
// ─────────────────────────────────────────────

window.requireLogin = function() {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    // Load user data into localStorage for UI
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
      localStorage.setItem('ai_saathi_user', JSON.stringify(doc.data()));
    }
  });
};

window.requirePayment = function() {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    const doc = await db.collection('users').doc(user.uid).get();
    const data = doc.data();
    if (!data || !data.hasPaid) {
      window.location.href = 'payment.html';
      return;
    }
    localStorage.setItem('ai_saathi_user', JSON.stringify(data));
  });
};

window.requireAdmin = function(adminEmails) {
  auth.onAuthStateChanged((user) => {
    if (!user || !adminEmails.includes(user.email)) {
      window.location.href = 'index.html';
    }
  });
};

window.signOut = function() {
  auth.signOut().then(() => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
};


// ═══════════════════════════════════════════════════
// FIRESTORE RULES
// ═══════════════════════════════════════════════════
// Paste this in Firebase Console → Firestore → Rules
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//
//     // Users can only read/write their OWN document
//     match /users/{userId} {
//       allow read, write: if request.auth != null
//                          && request.auth.uid == userId;
//     }
//
//     // Only logged-in users can CREATE payment requests
//     // No one can read others' payment requests
//     match /payment_requests/{docId} {
//       allow create: if request.auth != null;
//       allow read, update: if false; // Admin uses Firebase Admin SDK
//     }
//   }
// }
