import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, deleteDoc, doc, setDoc, getDoc } from "firebase/firestore";

// Configuration provided by user
// Configuration provided by user
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Logs a puzzle attempt to Firestore.
 */
export const logPuzzleAttempt = async (data) => {
    try {
        await addDoc(collection(db, "puzzle_logs"), {
            ...data,
            timestamp: serverTimestamp()
        });
        console.log("Logged attempt:", data);
    } catch (e) {
        console.error("Error logging attempt:", e);
    }
};

// --- HINT SYSTEM ---

const HINTS = [
    "MacGuffin, I am just testing what this button does, now i know I need to answer you to get the hint",
    "MacGuffin, the thing people often misunderstand about me when they first meet me is",
    "MacGuffin, the weird food combination I swear by is",
    "MacGuffin, a movie or song everyone loves but I secretly can't stand is",
    "MacGuffin, the skill or hobby I’ve always wanted to pick up is",
    "MacGuffin, if I had to teach a class on one obscure subject, it would be",
    "MacGuffin, the 'hill I am willing to die on' is that",
    "MacGuffin, if I could relive one day from my childhood, it would be the day I",
    "MacGuffin, the thing I am most proud of achieving that nobody really knows about is",
    "MacGuffin, my biggest irrational fear as a kid was",
    "MacGuffin, if money wasn't a factor, I would spend my days",
    "MacGuffin, a hard lesson I learned recently that changed how I act is",
    "MacGuffin, the person I go to when I need really good advice is",
    "MacGuffin, the best compliment I ever received that wasn't about my looks was",
    "MacGuffin, the thing that keeps me up at night when I can't sleep is",
    "MacGuffin, if I could change one thing about the way I was raised, it would be"
];

// Seed hints if collection is empty
export const seedHints = async () => {
    try {
        const colRef = collection(db, "hint_messages");
        const snapshot = await getDocs(colRef);
        if (snapshot.empty) {
            console.log("Seeding Hints...");
            for (let i = 0; i < HINTS.length; i++) {
                await addDoc(colRef, {
                    message: HINTS[i],
                    order: i,
                    timestamp: serverTimestamp()
                });
            }
        }
    } catch (e) {
        console.error("Error seeding hints:", e);
    }
};

// Pop the next hint (Read & Delete)
export const popNextHint = async () => {
    try {
        const colRef = collection(db, "hint_messages");
        // Get the first one by order
        const q = query(colRef, orderBy("order", "asc"), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            const msg = docSnap.data().message;
            // Delete it (consumable)
            await deleteDoc(doc(db, "hint_messages", docSnap.id));
            return msg;
        } else {
            // Reload hints if empty
            await seedHints();
            // Try one more time recursively
            return popNextHint();
        }
    } catch (e) {
        console.error("Error popping hint:", e);
        return null;
    }
};

// --- PERSISTENCE (For Jessica) ---

export const saveGameState = async (sessionId, data) => {
    try {
        // Data: { unlockedIndex: number, solvedRows: [index, index...] }
        await setDoc(doc(db, "game_states", sessionId), {
            ...data,
            lastUpdated: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.error("Error saving game:", e);
    }
};

export const loadGameState = async (sessionId) => {
    try {
        const docRef = doc(db, "game_states", sessionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (e) {
        console.error("Error loading game:", e);
        return null;
    }
};
