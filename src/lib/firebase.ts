/* ==================================================================
   FIREBASE
   One lazily created app, shared by the contact channel and the
   clearance system. Nothing here is imported statically by the page:
   callers reach it through dynamic import, so a visitor who never
   writes or signs in never downloads the SDK. Auth lives in the
   clearance module so the contact form never pulls it in.
   ================================================================== */

import { getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** Local test builds point at the emulators instead of production. */
export const useEmulators = import.meta.env.VITE_USE_EMULATORS === '1'

export function firebaseApp() {
  return getApps()[0] ?? initializeApp(config)
}

let db: Firestore | undefined

export function firestore() {
  if (!db) {
    db = getFirestore(firebaseApp())
    if (useEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }
  return db
}
