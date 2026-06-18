// ── WuWa Portal Firebase Counter Module ──
// Uses Firebase Realtime Database via CDN (no build tools needed)
// Drop this script into every portal page, then call the right track function.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, runTransaction, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBi0R_U_uWxaPEB23wBqmiS5cnqyyJEYs0",
    authDomain: "wuwaconfigcounters.firebaseapp.com",
    databaseURL: "https://wuwaconfigcounters-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wuwaconfigcounters",
    storageBucket: "wuwaconfigcounters.firebasestorage.app",
    messagingSenderId: "1061659189350",
    appId: "1:1061659189350:web:ce92b4000ecf226589cda7",
    measurementId: "G-82R08JGRJX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ── Core increment helper ──
async function increment(counterKey) {
    const counterRef = ref(db, `counters/${counterKey}`);
    await runTransaction(counterRef, (current) => (current || 0) + 1);
}

// ── Core read helper ──
async function getCount(counterKey) {
    const snapshot = await get(ref(db, `counters/${counterKey}`));
    return snapshot.exists() ? snapshot.val() : 0;
}

// ── Unique visitor tracking (once per browser session per page) ──
function trackVisit(pageKey) {
    const sessionKey = `visited_${pageKey}`;
    increment(`visits_${pageKey}`); // always increment total visits
    if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "1");
        increment(`unique_${pageKey}`);
    }
}

// ── Per-tool event trackers (call these on user action) ──

// Call when user successfully decrypts a log
export function trackDecrypt() {
    increment("decrypts");
}

// Call when user selects a device profile in the config selector
export function trackConfigLookup() {
    increment("config_lookups");
}

// Call when user generates/downloads an Engine.ini
export function trackIniGenerate() {
    increment("ini_generates");
}

// ── Auto-runs on import: tracks visit for current page ──
// pageKey is derived from the filename, e.g. "wwdec", "index", "generator"
const pageKey = location.pathname.split("/").pop().replace(".html", "") || "index";
trackVisit(pageKey);

// ── Display helpers ──
// Writes a count into any element by its ID
export async function displayCount(counterKey, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = "...";
    const count = await getCount(counterKey);
    el.textContent = count.toLocaleString();
}

// Loads all stats and populates a stats block at once
// expects elements with IDs: stat-decrypts, stat-config-lookups,
// stat-ini-generates, stat-visits-index, stat-unique-index, etc.
export async function displayAllStats() {
    const keys = [
        ["decrypts",       "stat-decrypts"],
        ["config_lookups", "stat-config-lookups"],
        ["ini_generates",  "stat-ini-generates"],
        ["visits_index",   "stat-visits-index"],
        ["unique_index",   "stat-unique-index"],
        ["visits_wwdec",   "stat-visits-wwdec"],
        ["visits_generator","stat-visits-generator"],
    ];
    await Promise.all(keys.map(([key, id]) => displayCount(key, id)));
}
