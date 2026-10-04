/* ==================================================================
   CLEARANCE
   Unlocks the restricted records for approved visitors.

   1. You add a document to `clearance/{email}` in the console.
   2. The visitor asks for a sign-in link and opens it from their inbox
      — no password; opening the link proves they own the address.
   3. Firestore rules release `vault/*` only to a verified email that is
      on the list. The records never ship in the public bundle; they
      exist only behind those rules.

   The auth SDK loads only when it is needed: a sign-in request, a
   returning link, or a visitor who was cleared on an earlier visit.
   ================================================================== */

import { useSyncExternalStore } from 'react'
import type { Project } from '@/data/profile'

export type VaultRecord = Project & { order: number }

export type ClearanceState =
  | { status: 'sealed' }
  | { status: 'working' }
  /** Arrived through a link on a device that did not request it. */
  | { status: 'confirm-email' }
  | { status: 'link-sent'; email: string }
  | { status: 'denied'; email: string }
  | { status: 'cleared'; email: string; records: VaultRecord[] }
  | { status: 'error'; message: string }

const EMAIL_KEY = 'dt-clearance-email'
const SESSION_KEY = 'dt-clearance'

// Storage can throw (private windows, blocked site data); none of this
// is essential, so every access degrades to "not remembered".
const store = {
  get(key: string) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* not remembered */
    }
  },
  drop(key: string) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* nothing to drop */
    }
  },
}

/* ---------------------------- store ---------------------------- */

let state: ClearanceState = { status: 'sealed' }
const listeners = new Set<() => void>()

function set(next: ClearanceState) {
  state = next
  listeners.forEach((listener) => listener())
}

export function useClearance() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state,
    () => state,
  )
}

/* ----------------------------- sdk ----------------------------- */

type Sdk = Awaited<ReturnType<typeof loadSdk>>
let sdkPromise: Promise<Sdk> | undefined

async function loadSdk() {
  const [base, auth, fs] = await Promise.all([
    import('./firebase'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ])
  const instance = auth.getAuth(base.firebaseApp())
  if (base.useEmulators) {
    auth.connectAuthEmulator(instance, 'http://127.0.0.1:9099', { disableWarnings: true })
  }
  return { auth, fs, instance, db: base.firestore() }
}

function sdk() {
  sdkPromise ??= loadSdk()
  return sdkPromise
}

/* ---------------------------- flow ----------------------------- */

const MESSAGES: Record<string, string> = {
  'auth/operation-not-allowed': 'Sign-in is not switched on yet. Request access instead.',
  'auth/invalid-email': 'That does not look like an email address.',
  'auth/invalid-action-code': 'This link has expired or was already used. Ask for a new one.',
  'auth/expired-action-code': 'This link has expired. Ask for a new one.',
  'auth/quota-exceeded': 'Too many sign-in emails today. Try again tomorrow.',
  'auth/network-request-failed': 'No connection. Check your network and try again.',
}

function fail(error: unknown) {
  const code = (error as { code?: string })?.code ?? ''
  set({ status: 'error', message: MESSAGES[code] ?? 'Something went wrong. Try again.' })
}

/** The link lands on the bare origin; move the visitor to the section. */
function leaveLinkUrl() {
  history.replaceState(null, '', '/#/projects/restricted')
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

function isLinkUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get('mode') === 'signIn' && params.has('oobCode')
}

async function evaluate(email: string) {
  // Remembered even when denied, so the next visit re-checks — you may
  // have approved them in the meantime.
  store.set(SESSION_KEY, '1')
  const { fs, db } = await sdk()
  const entry = await fs.getDoc(fs.doc(db, 'clearance', email.toLowerCase()))
  if (!entry.exists()) {
    set({ status: 'denied', email })
    return
  }
  const snapshot = await fs.getDocs(fs.collection(db, 'vault'))
  const records = snapshot.docs
    .map((d) => ({ ...(d.data() as Omit<VaultRecord, 'id'>), id: d.id }))
    .sort((a, b) => a.order - b.order)
  set({ status: 'cleared', email, records })
}

let watching = false

async function watch() {
  if (watching) return
  watching = true
  const { auth, instance } = await sdk()
  auth.onAuthStateChanged(instance, (user) => {
    if (user?.email && user.emailVerified) {
      evaluate(user.email).catch(fail)
    } else if (state.status === 'working') {
      store.drop(SESSION_KEY)
      set({ status: 'sealed' })
    }
  })
}

async function complete(email: string) {
  const { auth, instance } = await sdk()
  await auth.signInWithEmailLink(instance, email, window.location.href)
  store.drop(EMAIL_KEY)
  leaveLinkUrl()
  await watch()
}

/**
 * Called once at start-up. Does nothing — and loads nothing — for a
 * visitor who has never signed in and is not arriving through a link.
 */
export function startClearance() {
  if (isLinkUrl()) {
    // Show the restricted section right away — it carries the progress
    // and, on another device, the confirm form. The query string stays
    // until sign-in completes; the SDK reads the code from it.
    history.replaceState(null, '', `${location.pathname}${location.search}#/projects/restricted`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    const email = store.get(EMAIL_KEY)
    if (!email) {
      set({ status: 'confirm-email' })
      return
    }
    set({ status: 'working' })
    complete(email).catch(fail)
    return
  }
  if (store.get(SESSION_KEY)) {
    set({ status: 'working' })
    watch().catch(fail)
  }
}

export async function requestLink(email: string) {
  set({ status: 'working' })
  try {
    const { auth, instance } = await sdk()
    await auth.sendSignInLinkToEmail(instance, email, {
      url: `${window.location.origin}/?clearance=1`,
      handleCodeInApp: true,
    })
    store.set(EMAIL_KEY, email)
    set({ status: 'link-sent', email })
  } catch (error) {
    fail(error)
  }
}

export async function confirmEmail(email: string) {
  set({ status: 'working' })
  await complete(email).catch(fail)
}

export async function signOutClearance() {
  store.drop(SESSION_KEY)
  set({ status: 'sealed' })
  const { auth, instance } = await sdk()
  await auth.signOut(instance)
}

export function resetClearance() {
  set({ status: 'sealed' })
}
